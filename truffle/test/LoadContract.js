const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const LoadContract = artifacts.require("LoadContract");
const VaultNotary = artifacts.require("VaultNotary");

const ShipmentState = {NOT_CREATED: 0, CREATED: 1, IN_PROGRESS: 2, COMPLETE: 3, CANCELED: 4};
const EscrowState = {NOT_CREATED: 0, CREATED: 1, FUNDED: 2, RELEASED: 3, REFUNDED: 4, WITHDRAWN: 5};
const EscrowFundingType = {NO_FUNDING: 0, SHIP: 1, ETHER: 2 };

function uuidToHex32(uuid) {
    return uuid + '00000000000000000000000000000000'
}


contract('LoadContract', async (accounts) => {
    const OWNER = accounts[0];
    const SHIPPER = accounts[1];
    const CARRIER = accounts[2];
    const MODERATOR = accounts[3];
    const ATTACKER = accounts[9];

    async function createNotary() {
        const notaryContract = await VaultNotary.new();
        return notaryContract;
    }

    let contract;
    let notary;



    async function createShipment(){

        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});
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

    before(async () =>{
        notary = await createNotary();
        contract = await LoadContract.deployed();
    });

    it("should only be able to set notary address by owner", async () => {
        await truffleAssert.reverts(contract.setVaultNotaryContractAddress(notary.address, {from: SHIPPER}));
        await truffleAssert.reverts(contract.setVaultNotaryContractAddress(notary.address, {from: CARRIER}));
        await truffleAssert.reverts(contract.setVaultNotaryContractAddress(notary.address, {from: MODERATOR}));
        await truffleAssert.reverts(contract.setVaultNotaryContractAddress(notary.address, {from: ATTACKER}));
        let notaryAddressTx = await contract.setVaultNotaryContractAddress(notary.address, {from: OWNER});
        await truffleAssert.eventEmitted(notaryAddressTx, "VaultNotaryContractAddressSet", ev => {
            return ev.msgSender === OWNER && ev.vaultNotaryContractAddress === notary.address;
        });
    });

    it("should only allow notary address to be set once", async () => {
        await truffleAssert.reverts(contract.setVaultNotaryContractAddress(notary.address, {from: OWNER}), "VaultNotary contract address already set");
    });

    it("should revert if the notary address set is 0x0", async () => {
        await truffleAssert.reverts(contract.setVaultNotaryContractAddress('0x0000000000000000000000000000000000000000', {from: OWNER}), "Must provide a valid notary address");
    });

    it("should create a LoadShipment without Uri, Hash and carrier address", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        const newShipmentTx = await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});

        await truffleAssert.eventEmitted(newShipmentTx, "ShipmentCreated", ev => {
            return ev.shipmentUuid === uuidToHex32(shipmentUuid);
        });

        const data = await getShipmentEscrowData(shipmentUuid);

        assert.equal(data.shipment.shipper, SHIPPER);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.shipment.carrier, 0x0);
        assert.equal(data.escrow.state, EscrowState.NOT_CREATED);
    });

    it("should create a LoadShipment with Uri, Hash and carrier address", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        const newShipmentTx = await contract.createNewShipment2(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, "uri", "hash", CARRIER, {from: SHIPPER});

        await truffleAssert.eventEmitted(newShipmentTx, "ShipmentCreated", ev => {
            return ev.shipmentUuid === uuidToHex32(shipmentUuid);
        });
        await truffleAssert.eventEmitted(newShipmentTx, "ShipmentCarrierSet", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.carrier === CARRIER;
        });

        const data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.shipper, SHIPPER);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
        assert.equal(data.shipment.carrier, CARRIER);
        assert.equal(data.escrow.state, EscrowState.NOT_CREATED);

        const notaryData = await notary.getVaultNotaryDetails(shipmentUuid);
        assert.equal(notaryData.vaultHash, "hash");
        assert.equal(notaryData.vaultUri, "uri");

    });

    it("should not allow a shipment to be created with a contractedAmount", async() => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 1, {from: SHIPPER}), "Cannot specify a contracted amount for a shipment with no escrow");
    });

    it("should fail if shipment does not exist", async() => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        const data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.NOT_CREATED);
        assert.equal(data.escrow.state, EscrowState.NOT_CREATED);
    });

    it("should only allow Shipper to set Carrier", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.shipper, SHIPPER);

        await truffleAssert.reverts(contract.setCarrier(shipmentUuid, CARRIER, {from: MODERATOR}), "Only Shipper allowed to set Carrier");

        let setCarrierTx = await contract.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(setCarrierTx, "ShipmentCarrierSet", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.carrier === CARRIER;
        });

        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.carrier, CARRIER);
    });

    it("should only allow Shipper to set Moderator", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.shipper, SHIPPER);

        await truffleAssert.reverts(contract.setModerator(shipmentUuid, MODERATOR, {from: CARRIER}), "Only Shipper allowed to set Moderator");

        let setModeratorTx = await contract.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        await truffleAssert.eventEmitted(setModeratorTx, "ShipmentModeratorSet", ev => {
            return ev.msgSender === SHIPPER && ev.shipmentUuid === uuidToHex32(shipmentUuid) && ev.moderator === MODERATOR;
        });

        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.moderator, MODERATOR);
    });


    it("should have a getShipmentData function, and return the correct shipment attributes", async () => {
        const shipmentUuid = await createShipment();
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.shipper, SHIPPER);
        assert.equal(data.shipment.carrier, CARRIER);
        assert.equal(data.shipment.moderator, MODERATOR);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
    });

    it("should have a getShipmentData function, and work with createNewShipment2", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment2(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, "uri", "hash", CARRIER, {from: SHIPPER});
        await contract.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.shipper, SHIPPER);
        assert.equal(data.shipment.carrier, CARRIER);
        assert.equal(data.shipment.moderator, MODERATOR);
        assert.equal(data.shipment.state, ShipmentState.CREATED);
    })



    it("should set inProgress", async () => {
        let shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});
        await truffleAssert.reverts(contract.setInProgress(shipmentUuid, {from: MODERATOR}), "Carrier must exist before marking a shipment In Progress");

        shipmentUuid = await createShipment();

        await truffleAssert.reverts(contract.setInProgress(shipmentUuid, {from: SHIPPER}), "Only Carrier or Moderator allowed to set In Progress");

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CREATED);

        let inProgressTx = await contract.setInProgress(shipmentUuid, {from: CARRIER});
        await truffleAssert.eventEmitted(inProgressTx, "ShipmentInProgress", ev => {
            return ev.msgSender === CARRIER && ev.shipmentUuid === uuidToHex32(shipmentUuid);
        });

        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.IN_PROGRESS);
    });

    it("should set Complete", async () => {
        const shipmentUuid = await createShipment();

        await truffleAssert.reverts(contract.setComplete(shipmentUuid, {from: SHIPPER}), "Only Carrier or Moderator allowed to set Complete");
        await truffleAssert.reverts(contract.setComplete(shipmentUuid, {from: CARRIER}), "Only In Progress shipments can be marked Complete");

        await contract.setInProgress(shipmentUuid, {from: CARRIER});

        let completeTx = await contract.setComplete(shipmentUuid, {from: CARRIER});
        await truffleAssert.eventEmitted(completeTx, "ShipmentComplete", ev => {
            return ev.msgSender === CARRIER && ev.shipmentUuid === uuidToHex32(shipmentUuid);
        });

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.COMPLETE);
    });

    it("should set Canceled", async () => {
        let shipmentUuid = await createShipment();

        // No one else can cancel
        await truffleAssert.reverts(contract.setCanceled(shipmentUuid, {from: ATTACKER}), "Only shipper, carrier, or moderator can cancel an Created shipment");

        //Shipper can cancel an Created shipment
        await contract.setCanceled(shipmentUuid, {from: SHIPPER});

        let data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CANCELED);

        //Can't cancel a canceled shipment
        await truffleAssert.reverts(contract.setCanceled(shipmentUuid, {from: SHIPPER}), "Already canceled");

        //Carrier and moderator can cancel an Created shipment
        await contract.setCanceled(await createShipment(), {from: MODERATOR});
        await contract.setCanceled(await createShipment(), {from: CARRIER});

        //Shipper can't cancel an in progress shipment
        shipmentUuid = await createShipment();
        await contract.setInProgress(shipmentUuid, {from: MODERATOR});
        await truffleAssert.reverts(contract.setCanceled(shipmentUuid, {from: SHIPPER}), "Only carrier or moderator can cancel an In Progress shipment");

        //Carrier and moderator can cancel an in progress shipment
        await contract.setCanceled(shipmentUuid, {from: CARRIER});
        shipmentUuid = await createShipment();
        await contract.setInProgress(shipmentUuid, {from: MODERATOR});
        await contract.setCanceled(shipmentUuid, {from: MODERATOR});

        //Neither shipper nor carrier can cancel a complete shipment
        shipmentUuid = await createShipment();
        await contract.setInProgress(shipmentUuid, {from: MODERATOR});
        await contract.setComplete(shipmentUuid, {from: MODERATOR});
        await truffleAssert.reverts(contract.setCanceled(shipmentUuid, {from: SHIPPER}), "Only moderator can cancel a Completed shipment");
        await truffleAssert.reverts(contract.setCanceled(shipmentUuid, {from: CARRIER}), "Only moderator can cancel a Completed shipment");

        //Moderator can cancel a completed shipment
        let canceledTx = await contract.setCanceled(shipmentUuid, {from: MODERATOR});

        data = await getShipmentEscrowData(shipmentUuid);
        assert.equal(data.shipment.state, ShipmentState.CANCELED);
        await truffleAssert.eventEmitted(canceledTx, "ShipmentCanceled", ev => {
            return ev.msgSender === MODERATOR && ev.shipmentUuid === uuidToHex32(shipmentUuid);
        });
    });

    it("should not fund NO_FUNDING Escrow with Ether", async () => {
        const shipmentUuid = await createShipment();

        await truffleAssert.reverts(contract.fundEscrowEther(shipmentUuid, {from: SHIPPER}), "Shipment has no escrow");
    });

    it("should not create new shipments if the contract is deprecated", async () => {
        await truffleAssert.reverts(contract.setDeprecated(true, {from: SHIPPER}));
        await truffleAssert.reverts(contract.setDeprecated(true, {from: CARRIER}));
        await truffleAssert.reverts(contract.setDeprecated(true, {from: MODERATOR}));
        await truffleAssert.reverts(contract.setDeprecated(true, {from: ATTACKER}));
        let deprecationTx = await contract.setDeprecated(true, {from: OWNER});
        await truffleAssert.eventEmitted(deprecationTx, "ContractDeprecatedSet", ev => {
            return ev.msgSender === OWNER && ev.isDeprecated === true;
        });
        await truffleAssert.reverts(createShipment(), "This version of the LOAD contract has been deprecated");
        deprecationTx = await contract.setDeprecated(false, {from: OWNER});
        await truffleAssert.eventEmitted(deprecationTx, "ContractDeprecatedSet", ev => {
            return ev.msgSender === OWNER && ev.isDeprecated === false;
        });
        await createShipment();
    });
});