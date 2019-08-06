const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');


const chai = require('chai');
const expect = chai.expect;
const BN = web3.utils.BN;
const bnChai = require('bn-chai');
chai.use(bnChai(BN));

const LoadContract = artifacts.require("LoadContract");
const SHIPToken = artifacts.require("./utils/SHIPToken.sol");
const VaultNotary = artifacts.require("VaultNotary");

const ShipmentState = {NOT_CREATED: 0, CREATED: 1, IN_PROGRESS: 2, COMPLETE: 3, CANCELED: 4};
const EscrowState = {NOT_CREATED: 0, CREATED: 1, FUNDED: 2, RELEASED: 3, REFUNDED: 4, WITHDRAWN: 5};
const EscrowFundingType = {NO_FUNDING: 0, SHIP: 1, ETHER: 2};

const SECONDS_IN_A_DAY = 86400;

function uuidToHex32(uuid) {
    return uuid + '00000000000000000000000000000000'
}

const send = (method, params = []) =>
  web3.currentProvider.send({ id: 0, jsonrpc: '2.0', method, params }, (err, res) => { });

const timeTravel = async seconds => {
  await send('evm_increaseTime', [seconds]);
  await send('evm_mine');
};



async function createShipToken(accounts){
    const shipToken = await SHIPToken.new();
    await shipToken.mint(accounts[0], web3.utils.toWei("1000", "ether"));
    await shipToken.mint(accounts[1], web3.utils.toWei("1000", "ether"));
    await shipToken.mint(accounts[2], web3.utils.toWei("1000", "ether"));
    await shipToken.mint(accounts[3], web3.utils.toWei("1000", "ether"));
    return shipToken;
}

contract('LoadContract with Escrow', async (accounts) => {
    const OWNER = accounts[0];
    const SHIPPER = accounts[1];
    const CARRIER = accounts[2];
    const MODERATOR = accounts[3];
    const ATTACKER = accounts[9];

    let shipToken;
    let contract;

    async function createShipment(fundingType = EscrowFundingType.SHIP, fundingAmount = web3.utils.toWei("1", "ether")){
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, fundingType, fundingAmount, {from: SHIPPER});
        await contract.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});
        await contract.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        return shipmentUuid;
    }

    async function getShipmentEscrowData(shipmentUuid){
        const shipmentData = await contract.getShipmentData(shipmentUuid);
        const escrowData = await contract.getEscrowData(shipmentUuid);
        return {
            shipment: shipmentData,
            escrow: escrowData,
        };
    }



    before(async () => {
        shipToken = await createShipToken(accounts);
        contract = await LoadContract.deployed();
    });


    it("should create a LoadShipment", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        const newShipmentTx = await contract.createNewShipment(shipmentUuid, EscrowFundingType.ETHER, web3.utils.toWei("1", "ether"), {from: SHIPPER});

        await truffleAssert.eventEmitted(newShipmentTx, "ShipmentCreated", ev => {
            return ev.shipmentUuid === uuidToHex32(shipmentUuid);
        });

        let block = await web3.eth.getBlock(newShipmentTx.receipt.blockHash);
        await truffleAssert.eventEmitted(newShipmentTx, "EscrowCreated", ev => {
            return ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.createdAt == block.timestamp;
        });

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.shipper, SHIPPER);
    });

    it("should not set inProgress until funded", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);

        await truffleAssert.reverts(contract.setInProgress(shipmentUuid, {from: CARRIER}), "Escrow must be Funded");

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.CREATED);
        assert.equal(data.escrow.fundingType, EscrowFundingType.ETHER);
    });

    it("should have a getEscrowData function", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.contractedAmount, web3.utils.toWei("1", "ether"));
        assert.equal(data.escrow.fundedAmount, web3.utils.toWei("0", "ether"));
        assert.equal(data.escrow.state, EscrowState.CREATED);
        assert.equal(data.escrow.fundingType, EscrowFundingType.ETHER);
        assert.equal(data.escrow.refundAddress, SHIPPER);
        assert.isAbove(data.escrow.createdAt * 1000, 0);
    });

    //#region ETH
    it("should not create a ETHER Escrow with contractedAmount greater than the max supply", async () => {
        await truffleAssert.reverts(contract.createNewShipment(uuidToHex(uuidv4(), true), EscrowFundingType.ETHER, web3.utils.toWei("100000001", "ether"), {from: SHIPPER}));
    });

    it("should prevent accepting Eth via fallback function", async () => {
        const sender = SHIPPER;
        const receiver = contract.address;
        const amount = web3.utils.toWei("1", "ether");

        await truffleAssert.reverts(web3.eth.sendTransaction({from: sender, to: receiver, value: amount}));
    });

    it("should fund Ether Escrow with ETH", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        const amount = web3.utils.toWei("1", "ether");
        let ethTx = await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: amount});
        await truffleAssert.eventEmitted(ethTx, "EscrowFunded", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == amount && ev.contracted == amount;
        });

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.FUNDED);
    });

    it("should handle partial ETH funding", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);

        let fundTx = await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("0.5", "ether")});
        await truffleAssert.eventEmitted(fundTx, "EscrowDeposited", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.amount == web3.utils.toWei("0.5", "ether") && ev.funded == web3.utils.toWei("0.5", "ether");
        });

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.CREATED);

        fundTx = await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("0.49", "ether")});
        await truffleAssert.eventEmitted(fundTx, "EscrowDeposited", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.amount == web3.utils.toWei("0.49", "ether") && ev.funded == web3.utils.toWei("0.99", "ether");
        });
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.CREATED);

        fundTx = await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("0.01", "ether")});
        await truffleAssert.eventEmitted(fundTx, "EscrowDeposited", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.amount == web3.utils.toWei("0.01", "ether") && ev.funded == web3.utils.toWei("1", "ether");
        });
        await truffleAssert.eventEmitted(fundTx, "EscrowFunded", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == web3.utils.toWei("1", "ether") && ev.contracted == web3.utils.toWei("1", "ether");
        });
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.FUNDED);
    });

    it("should be able to release ETH escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);

        await truffleAssert.reverts(contract.releaseEscrow(shipmentUuid), "Only the shipper or moderator can release escrow");
        await truffleAssert.reverts(contract.releaseEscrow(shipmentUuid, {from: MODERATOR}), "Escrow must be Funded");

        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1", "ether")});

        await truffleAssert.reverts(contract.releaseEscrow(shipmentUuid, {from: MODERATOR}), "Shipment must be Complete");

        await contract.setInProgress(shipmentUuid, {from: CARRIER});
        await contract.setComplete(shipmentUuid, {from: CARRIER});

        let releaseTx = await contract.releaseEscrow(shipmentUuid, {from: MODERATOR});
        await truffleAssert.eventEmitted(releaseTx, "EscrowReleased", ev => {
            return ev.msgSender === MODERATOR && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == web3.utils.toWei("1", "ether");
        });

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.RELEASED);
    });

    it("should be able to withdraw ETH escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1", "ether")});
        await contract.setInProgress(shipmentUuid, {from: CARRIER});
        await contract.setComplete(shipmentUuid, {from: CARRIER});

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: CARRIER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: SHIPPER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");

        await contract.releaseEscrow(shipmentUuid, {from: MODERATOR});

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: MODERATOR}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: SHIPPER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");

        let carrierBalance = web3.utils.toBN(await web3.eth.getBalance(CARRIER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: CARRIER});
        await truffleAssert.eventEmitted(withdrawTxReceipt, "EscrowWithdrawn", ev => {
            return ev.msgSender === CARRIER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == web3.utils.toWei("1", "ether");
        });

        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(CARRIER))).to.eq.BN(carrierBalance.add(web3.utils.toBN(web3.utils.toWei("1", "ether"))).sub(gasCost));

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: MODERATOR}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
    });

    it("should be able to withdraw all from overfunded ETH escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("2", "ether")});
        await contract.setInProgress(shipmentUuid, {from: CARRIER});
        await contract.setComplete(shipmentUuid, {from: CARRIER});
        await contract.releaseEscrow(shipmentUuid, {from: MODERATOR});

        let carrierBalance = web3.utils.toBN(await web3.eth.getBalance(CARRIER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: CARRIER});
        await truffleAssert.eventEmitted(withdrawTxReceipt, "EscrowWithdrawn", ev => {
            return ev.msgSender === CARRIER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == web3.utils.toWei("2", "ether");
        });

        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(CARRIER))).to.eq.BN(carrierBalance.add(web3.utils.toBN(web3.utils.toWei("2", "ether"))).sub(gasCost));
    });

    it("should be able to refund ETH escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1", "ether")});

        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: MODERATOR}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await contract.setCanceled(shipmentUuid, {from: CARRIER});

        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: CARRIER}), "Refunds can only be issued to Canceled shipments by the Moderator");

        let refundTx = await contract.refundEscrow(shipmentUuid, {from: MODERATOR});
        await truffleAssert.eventEmitted(refundTx, "EscrowRefunded", ev => {
            return ev.msgSender === MODERATOR && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == web3.utils.toWei("1", "ether");
        });

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: MODERATOR}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: CARRIER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");

        let shipperBalance = web3.utils.toBN(await web3.eth.getBalance(SHIPPER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: SHIPPER});
        await truffleAssert.eventEmitted(withdrawTxReceipt, "EscrowWithdrawn", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == web3.utils.toWei("1", "ether");
        });

        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(SHIPPER))).to.eq.BN(shipperBalance.add(web3.utils.toBN(web3.utils.toWei("1", "ether"))).sub(gasCost));

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: SHIPPER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
    });

    it("should only be able to set refund address by owner", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await truffleAssert.reverts(contract.setEscrowRefundAddress(shipmentUuid, MODERATOR, {from: SHIPPER}));
        await truffleAssert.reverts(contract.setEscrowRefundAddress(shipmentUuid, MODERATOR, {from: CARRIER}));
        await truffleAssert.reverts(contract.setEscrowRefundAddress(shipmentUuid, MODERATOR, {from: MODERATOR}));
        await truffleAssert.reverts(contract.setEscrowRefundAddress(shipmentUuid, MODERATOR, {from: ATTACKER}));
        let refundAddressTx = await contract.setEscrowRefundAddress(shipmentUuid, MODERATOR, {from: OWNER});
        await truffleAssert.eventEmitted(refundAddressTx, "EscrowRefundAddressSet", ev => {
            return ev.msgSender === OWNER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.refundAddress === MODERATOR;
        });
    });

    it("owner should be able to rescue partially funded ETH escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("0.5", "ether")});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.CREATED);

        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: SHIPPER}), "Refunds can only be issued to Canceled shipments by the Moderator");
        await contract.refundEscrow(shipmentUuid, {from: OWNER});

        let shipperBalance = web3.utils.toBN(await web3.eth.getBalance(SHIPPER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: SHIPPER});
        await truffleAssert.eventEmitted(withdrawTxReceipt, "EscrowWithdrawn", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.funded == web3.utils.toWei("0.5", "ether");
        });

        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(SHIPPER))).to.eq.BN(shipperBalance.add(web3.utils.toBN(web3.utils.toWei("0.5", "ether"))).sub(gasCost));
    });

    it("owner should be able to rescue funded ETH escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1.0", "ether")});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.FUNDED);

        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: SHIPPER}), "Refunds can only be issued to Canceled shipments by the Moderator");
        await contract.refundEscrow(shipmentUuid, {from: OWNER});

        let shipperBalance = web3.utils.toBN(await web3.eth.getBalance(SHIPPER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: SHIPPER});
        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(SHIPPER))).to.eq.BN(shipperBalance.add(web3.utils.toBN(web3.utils.toWei("1.0", "ether"))).sub(gasCost));
    });

    it("owner should be able to rescue to a different address", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1.0", "ether")});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.FUNDED);

        await contract.setEscrowRefundAddress(shipmentUuid, ATTACKER, {from: OWNER});

        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: SHIPPER}), "Refunds can only be issued to Canceled shipments by the Moderator");
        await contract.refundEscrow(shipmentUuid, {from: OWNER});

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: SHIPPER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");

        let invalidBalance = web3.utils.toBN(await web3.eth.getBalance(ATTACKER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: ATTACKER});
        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(ATTACKER))).to.eq.BN(invalidBalance.add(web3.utils.toBN(web3.utils.toWei("1.0", "ether"))).sub(gasCost));
    });

    it("shipper should be able to issue refunds after 90 days", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1.0", "ether")});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.FUNDED);
        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: SHIPPER}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await timeTravel(SECONDS_IN_A_DAY * 89);
        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: SHIPPER}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await timeTravel(SECONDS_IN_A_DAY);
        await contract.refundEscrow(shipmentUuid, {from: SHIPPER});
        let shipperBalance = web3.utils.toBN(await web3.eth.getBalance(SHIPPER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: SHIPPER});
        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(SHIPPER))).to.eq.BN(shipperBalance.add(web3.utils.toBN(web3.utils.toWei("1.0", "ether"))).sub(gasCost));
    });

    it("carrier should be able to issue refunds after 90 days", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1.0", "ether")});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.FUNDED);
        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: CARRIER}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await timeTravel(SECONDS_IN_A_DAY * 89);
        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: CARRIER}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await timeTravel(SECONDS_IN_A_DAY);
        await contract.refundEscrow(shipmentUuid, {from: CARRIER});

        let shipperBalance = web3.utils.toBN(await web3.eth.getBalance(SHIPPER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: SHIPPER});
        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(SHIPPER))).to.eq.BN(shipperBalance.add(web3.utils.toBN(web3.utils.toWei("1.0", "ether"))).sub(gasCost));
    });

    it("moderator should be able to issue refunds after 90 days", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);
        await contract.fundEscrowEther(shipmentUuid, {from: SHIPPER, value: web3.utils.toWei("1.0", "ether")});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.escrow.state, EscrowState.FUNDED);
        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: MODERATOR}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await timeTravel(SECONDS_IN_A_DAY * 89);
        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: MODERATOR}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await timeTravel(SECONDS_IN_A_DAY);
        await contract.refundEscrow(shipmentUuid, {from: MODERATOR});

        let shipperBalance = web3.utils.toBN(await web3.eth.getBalance(SHIPPER));
        let withdrawTxReceipt = await contract.withdrawEscrow(shipmentUuid, {from: SHIPPER});
        const withdrawTx = await web3.eth.getTransaction(withdrawTxReceipt.tx);
        const gasCost = web3.utils.toBN(withdrawTx.gasPrice).mul(web3.utils.toBN(withdrawTxReceipt.receipt.gasUsed));
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await web3.eth.getBalance(SHIPPER))).to.eq.BN(shipperBalance.add(web3.utils.toBN(web3.utils.toWei("1.0", "ether"))).sub(gasCost));
    });
    //#endregion

    //#region SHIP
    it("should not allow SHIP shipments to be created before token address is set", async() => {
        await truffleAssert.reverts(contract.createNewShipment(uuidToHex(uuidv4(), true), EscrowFundingType.SHIP, web3.utils.toWei("1", "ether"), {from: SHIPPER}), "Token address must be set");
    });

    it("should set the shipTokenContractAddress", async () => {
        await truffleAssert.reverts(contract.setShipTokenContractAddress(shipToken.address, {from: SHIPPER}));
        await truffleAssert.reverts(contract.setShipTokenContractAddress(shipToken.address, {from: CARRIER}));
        await truffleAssert.reverts(contract.setShipTokenContractAddress(shipToken.address, {from: MODERATOR}));
        await truffleAssert.reverts(contract.setShipTokenContractAddress(shipToken.address, {from: ATTACKER}));
        await truffleAssert.reverts(contract.setShipTokenContractAddress('0x0000000000000000000000000000000000000000', {from: OWNER}), "Must provide a token address");
        let tokenContractTx = await contract.setShipTokenContractAddress(shipToken.address, {from: OWNER});
        await truffleAssert.eventEmitted(tokenContractTx, "TokenContractAddressSet", ev => {
            return ev.tokenContractAddress === shipToken.address;
        });
    });

    it("should not fund Ether Escrow with SHIP", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.ETHER);

        await truffleAssert.reverts(shipToken.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), shipmentUuid, {from: SHIPPER}), "Escrow funding type must be SHIP");
    });

    it("should not fund SHIP with a different token", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);
        let shipToken2 = await createShipToken(accounts);
        await truffleAssert.reverts(shipToken2.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), shipmentUuid, {from: SHIPPER}), "SHIP token address does not match");
    });

    it("should not create a SHIP Escrow with contractedAmount greater than the max supply", async () => {
        await truffleAssert.reverts(contract.createNewShipment(uuidToHex(uuidv4(), true), EscrowFundingType.SHIP, web3.utils.toWei("500000001", "ether"), {from: SHIPPER}));
    });

    it("should only allow token address to be set once", async () => {
        await truffleAssert.reverts(contract.setShipTokenContractAddress(shipToken.address), "Token address already set");
    });

    it("should not fund SHIP Escrow with Ether", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);

        await truffleAssert.reverts(contract.fundEscrowEther(shipmentUuid, {from: SHIPPER}), "Escrow funding type must be Ether");
    });

    it("should fund SHIP Escrow with SHIP", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);

        await truffleAssert.reverts(shipToken.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), shipmentUuid), "Only the shipper can fund escrow");

        await shipToken.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), shipmentUuid, {from: SHIPPER});

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.FUNDED);
    });

    it("should handle partial SHIP funding", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);

        await shipToken.approveAndCall(contract.address, web3.utils.toWei("0.5", "ether"), shipmentUuid, {from: SHIPPER});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.CREATED);

        await shipToken.approveAndCall(contract.address, web3.utils.toWei("0.49", "ether"), shipmentUuid, {from: SHIPPER});
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.CREATED);

        await shipToken.approveAndCall(contract.address, web3.utils.toWei("0.01", "ether"), shipmentUuid, {from: SHIPPER});
        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.FUNDED);
    });

    it("should revert with invalid SHIP funding parameters", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);

        await truffleAssert.reverts(shipToken.approveAndCall(contract.address, -1, shipmentUuid, {from: SHIPPER}));
        await truffleAssert.reverts(shipToken.approveAndCall(contract.address, web3.utils.toWei("9999", "ether"), shipmentUuid, {from: SHIPPER}));
        await truffleAssert.reverts(shipToken.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), "0x0", {from: SHIPPER}), "Shipment does not exist");
        await truffleAssert.reverts(shipToken.approveAndCall('0x0000000000000000000000000000000000000000', web3.utils.toWei("1", "ether"), shipmentUuid, {from: SHIPPER}));
    });

    it("should be able to release SHIP escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);

        await truffleAssert.reverts(contract.releaseEscrow(shipmentUuid), "Only the shipper or moderator can release escrow");
        await truffleAssert.reverts(contract.releaseEscrow(shipmentUuid, {from: MODERATOR}), "Escrow must be Funded");

        await shipToken.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), shipmentUuid, {from: SHIPPER});

        await truffleAssert.reverts(contract.releaseEscrow(shipmentUuid, {from: MODERATOR}), "Shipment must be Complete");

        await contract.setInProgress(shipmentUuid, {from: CARRIER});
        await contract.setComplete(shipmentUuid, {from: CARRIER});

        await contract.releaseEscrow(shipmentUuid, {from: MODERATOR});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.RELEASED);
    });

    it("should be able to withdraw SHIP escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);
        await shipToken.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), shipmentUuid, {from: SHIPPER});
        await contract.setInProgress(shipmentUuid, {from: CARRIER});
        await contract.setComplete(shipmentUuid, {from: CARRIER});

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: CARRIER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");

        await contract.releaseEscrow(shipmentUuid, {from: MODERATOR});


        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: SHIPPER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: MODERATOR}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");

        let carrierBalance = await shipToken.balanceOf(CARRIER);
        await contract.withdrawEscrow(shipmentUuid, {from: CARRIER});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await shipToken.balanceOf(CARRIER))).to.eq.BN(carrierBalance.add(web3.utils.toBN(web3.utils.toWei("1", "ether"))));

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: MODERATOR}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
    });

    it("should be able to withdraw all from overfunded SHIP escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);
        await shipToken.approveAndCall(contract.address, web3.utils.toWei("2", "ether"), shipmentUuid, {from: SHIPPER});
        await contract.setInProgress(shipmentUuid, {from: CARRIER});
        await contract.setComplete(shipmentUuid, {from: CARRIER});
        await contract.releaseEscrow(shipmentUuid, {from: MODERATOR});
        let carrierBalance = await shipToken.balanceOf(CARRIER);
        await contract.withdrawEscrow(shipmentUuid, {from: CARRIER});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await shipToken.balanceOf(CARRIER))).to.eq.BN(carrierBalance.add(web3.utils.toBN(web3.utils.toWei("2", "ether"))));

    });

    it("should be able to refund SHIP escrow", async () => {
        const shipmentUuid = await createShipment(EscrowFundingType.SHIP);
        await shipToken.approveAndCall(contract.address, web3.utils.toWei("1", "ether"), shipmentUuid, {from: SHIPPER});

        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: MODERATOR}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await contract.setCanceled(shipmentUuid, {from: CARRIER});

        await truffleAssert.reverts(contract.refundEscrow(shipmentUuid, {from: CARRIER}), "Refunds can only be issued to Canceled shipments by the Moderator");

        await contract.refundEscrow(shipmentUuid, {from: MODERATOR});

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: MODERATOR}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: CARRIER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");

        let shipperBalance = await shipToken.balanceOf(SHIPPER);
        await contract.withdrawEscrow(shipmentUuid, {from: SHIPPER});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.escrow.state, EscrowState.WITHDRAWN);
        expect(web3.utils.toBN(await shipToken.balanceOf(SHIPPER))).to.eq.BN(shipperBalance.add(web3.utils.toBN(web3.utils.toWei("1", "ether"))));

        await truffleAssert.reverts(contract.withdrawEscrow(shipmentUuid, {from: SHIPPER}), "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
    });
    //#endregion
});