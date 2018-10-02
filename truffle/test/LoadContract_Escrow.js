const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const LoadContract = artifacts.require("LoadContract");
const SHIPToken = artifacts.require("./utils/SHIPToken.sol");

const ShipmentState = {INITIATED: 0, IN_PROGRESS: 1, COMPLETE: 2, CANCELED: 3};
const EscrowState = {NOT_CREATED: 0, CREATED: 1, FUNDED: 2, RELEASED: 3, WITHDRAWN: 4};
const EscrowFundingType = {NO_FUNDING: 0, SHIP: 1, ETHER: 2};

async function createShipment(shipmentUuid, shipper, fundingType = EscrowFundingType.SHIP, fundingAmount = web3.toWei(1, "ether")) {
    let options = {};
    if (shipper) {
        options.from = shipper;
    }

    const registry = await LoadContract.deployed();
    await registry.createNewShipment(shipmentUuid, fundingType, fundingAmount, options);
    return registry;
}

async function createShipToken(accounts){
    const shipToken = await SHIPToken.new();
    await shipToken.mint(accounts[0], web3.toWei(1000, "ether"));
    await shipToken.mint(accounts[1], web3.toWei(1000, "ether"));
    await shipToken.mint(accounts[2], web3.toWei(1000, "ether"));
    await shipToken.mint(accounts[3], web3.toWei(1000, "ether"));
    return shipToken;
}

contract('LoadContract with Escrow', async (accounts) => {
    const SHIPPER = accounts[1];
    const CARRIER = accounts[2];
    const MODERATOR = accounts[3];
    const INVALID = accounts[9];
    let shipToken;

    before(async () => {
        shipToken = await createShipToken(accounts);
        const registry = await LoadContract.deployed();
        await registry.setShipTokenContractAddress(shipToken.address);
    });

    it("should create a LoadShipment", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await LoadContract.deployed();
        const newShipmentTx = await registry.createNewShipment(shipmentUuid, EscrowFundingType.SHIP, web3.toWei(1, "ether"), {from: SHIPPER});

        await truffleAssert.eventEmitted(newShipmentTx, "ShipmentCreated", ev => {
            return ev.shipmentUuid === shipmentUuid;
        });
        assert.equal(await registry.getShipper(shipmentUuid), SHIPPER);
    });

    it("should set inProgress", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        await registry.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});

        await truffleAssert.reverts(registry.setInProgress(shipmentUuid, {from: CARRIER}), "Escrow must be Funded");

        assert.equal(await registry.getShipmentState(shipmentUuid), ShipmentState.INITIATED);
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.CREATED);
        assert.equal(await registry.getEscrowFundingType(shipmentUuid), EscrowFundingType.SHIP);
    });

    //#region SHIP
    it("should only allow token address to be set once", async () => {
        const registry = await LoadContract.deployed();
        await truffleAssert.reverts(registry.setShipTokenContractAddress(0), "Token address already set");
    });

    it("should not fund SHIP Escrow with Ether", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER, EscrowFundingType.SHIP);

        await truffleAssert.reverts(registry.fundEscrowEther(shipmentUuid, {from: SHIPPER}), "Escrow funding type must be Ether");
    });

    it("should fund SHIP Escrow with SHIP", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        await shipToken.approveAndCall(registry.address, web3.toWei(1, "ether"), shipmentUuid);
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.FUNDED);
    });

    it("should handle partial SHIP funding", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);

        await shipToken.approveAndCall(registry.address, web3.toWei(0.5, "ether"), shipmentUuid);
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.CREATED);

        await shipToken.approveAndCall(registry.address, web3.toWei(0.49, "ether"), shipmentUuid);
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.CREATED);

        await shipToken.approveAndCall(registry.address, web3.toWei(0.01, "ether"), shipmentUuid);
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.FUNDED);
    });

    it("should revert with invalid SHIP funding parameters", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);

        await truffleAssert.reverts(shipToken.approveAndCall(registry.address, -1, shipmentUuid));
        await truffleAssert.reverts(shipToken.approveAndCall(registry.address, web3.toWei(1, "ether"), 0), "Shipment does not exist");
        await truffleAssert.reverts(shipToken.approveAndCall(0, web3.toWei(1, "ether"), shipmentUuid));
    });

    it("should be able to release SHIP escrow", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        await registry.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});

        await truffleAssert.reverts(registry.releaseEscrow(shipmentUuid), "Only the shipper or moderator can release escrow");
        await truffleAssert.reverts(registry.releaseEscrow(shipmentUuid, {from: MODERATOR}), "Escrow state invalid for action");

        await shipToken.approveAndCall(registry.address, web3.toWei(1, "ether"), shipmentUuid);

        await registry.releaseEscrow(shipmentUuid, {from: MODERATOR});
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.RELEASED);
    });

    it("should be able to withdraw SHIP escrow", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        await registry.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});
        await registry.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        await shipToken.approveAndCall(registry.address, web3.toWei(1, "ether"), shipmentUuid);
        await registry.releaseEscrow(shipmentUuid, {from: MODERATOR});

        let carrierBalance = await shipToken.balanceOf(CARRIER);
        await registry.withdrawEscrow(shipmentUuid, {from: CARRIER});
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.WITHDRAWN);
        assert.deepEqual(await shipToken.balanceOf(CARRIER), carrierBalance.plus(web3.toBigNumber(web3.toWei(1, "ether"))));
    });
    //#endregion

    //#region ETH
    it("should prevent accepting Eth via fallback function", async () => {
        const registry = await LoadContract.deployed();
        const sender = SHIPPER;
        const receiver = registry.address;
        const amount = web3.toWei(1, "ether");

        // truffleAssert does not work for sendTransaction.  Catch manually
        try {
            web3.eth.sendTransaction({from: sender, to: receiver, value: amount});
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`);
        }
    });

    it("should not fund Ether Escrow with SHIP", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER, EscrowFundingType.ETHER);

        await truffleAssert.reverts(shipToken.approveAndCall(registry.address, web3.toWei(1, "ether"), shipmentUuid), "Escrow funding type must be SHIP");
    });

    it("should fund Ether Escrow with ETH", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER, EscrowFundingType.ETHER);

        const amount = web3.toWei(1, "ether");
        await registry.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: amount});

        assert.equal(await registry.getShipmentState(shipmentUuid), ShipmentState.INITIATED);
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.FUNDED);
    });

    it("should handle partial ETH funding", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER, EscrowFundingType.ETHER);

        await registry.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.toWei(0.5, "ether")});
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.CREATED);

        await registry.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.toWei(0.49, "ether")});
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.CREATED);

        await registry.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.toWei(0.01, "ether")});
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.FUNDED);
    });

    it("should be able to release ETH escrow", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER, EscrowFundingType.ETHER);
        await registry.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});

        await truffleAssert.reverts(registry.releaseEscrow(shipmentUuid), "Only the shipper or moderator can release escrow");
        await truffleAssert.reverts(registry.releaseEscrow(shipmentUuid, {from: MODERATOR}), "Escrow state invalid for action");

        await registry.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.toWei(1, "ether")});

        await registry.releaseEscrow(shipmentUuid, {from: MODERATOR});
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.RELEASED);
    });

    it("should be able to withdraw ETH escrow", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER, EscrowFundingType.ETHER);
        await registry.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});
        await registry.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        await registry.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.toWei(1, "ether")});
        await registry.releaseEscrow(shipmentUuid, {from: MODERATOR});

        let carrierBalance = await web3.eth.getBalance(CARRIER);
        let withdrawTxReceipt = await registry.withdrawEscrow(shipmentUuid, {from: CARRIER});
        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = withdrawTx.gasPrice.mul(withdrawTxReceipt.receipt.gasUsed);
        assert.equal(await registry.getEscrowState(shipmentUuid), EscrowState.WITHDRAWN);
        assert.deepEqual(await web3.eth.getBalance(CARRIER), carrierBalance.plus(web3.toBigNumber(web3.toWei(1, "ether"))).minus(gasCost));
    });
    //#endregion
});