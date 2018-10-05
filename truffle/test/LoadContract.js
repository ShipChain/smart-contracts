const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const LoadContract = artifacts.require("LoadContract");

const ShipmentState = {INITIATED: 0, IN_PROGRESS: 1, COMPLETE: 2, CANCELED: 3 };
const EscrowState = {NOT_CREATED: 0, CREATED: 1, FUNDED: 2, RELEASED: 3, REFUNDED: 4, WITHDRAWN: 5};
const EscrowFundingType = {NO_FUNDING: 0, SHIP: 1, ETHER: 2 };


contract('LoadContract', async (accounts) => {
    const SHIPPER = accounts[1];
    const CARRIER = accounts[2];
    const MODERATOR = accounts[3];
    const INVALID = accounts[9];

    let contract;
    before(async () =>{
        contract = await LoadContract.deployed();
    });

    async function createShipment(){
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});
        await contract.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});
        await contract.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        return shipmentUuid;
    }

    it("should create a LoadShipment", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        const newShipmentTx = await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});

        await truffleAssert.eventEmitted(newShipmentTx, "ShipmentCreated", ev => {
            return ev.shipmentUuid === shipmentUuid;
        });
        assert.equal(await contract.getShipper(shipmentUuid), SHIPPER);
        assert.equal(await contract.getShipmentState(shipmentUuid), ShipmentState.INITIATED);
        assert.equal(await contract.getEscrowState(shipmentUuid), EscrowState.NOT_CREATED);
    });

    it("should only allow Shipper to set Carrier", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});

        assert.equal(await contract.getShipper(shipmentUuid), SHIPPER);

        await truffleAssert.reverts(contract.setCarrier(shipmentUuid, CARRIER, {from: MODERATOR}), "Only Shipper allowed to set Carrier");

        await contract.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});
        assert.equal(await contract.getCarrier(shipmentUuid), CARRIER);
    });

    it("should only allow Shipper to set Moderator", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});

        assert.equal(await contract.getShipper(shipmentUuid), SHIPPER);

        await truffleAssert.reverts(contract.setModerator(shipmentUuid, MODERATOR, {from: CARRIER}), "Only Shipper allowed to set Moderator");

        await contract.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        assert.equal(await contract.getModerator(shipmentUuid), MODERATOR);
    });

    it("should emit VaultUri", async () => {
        const vaultUri = "vault.example.com/meta.json";
        const shipmentUuid = await createShipment();
        const invalidShipment = uuidToHex(uuidv4(), true);

        await truffleAssert.reverts(contract.setVaultUri(invalidShipment, vaultUri), "Shipment does not exist");

        await truffleAssert.reverts(contract.setVaultUri(shipmentUuid, vaultUri), "Only Shipper allowed to set VaultUri");

        const setVaultTx = await contract.setVaultUri(shipmentUuid, vaultUri, {from: SHIPPER});

        await truffleAssert.eventEmitted(setVaultTx, "VaultUri", ev => {
            return ev.vaultUri === vaultUri && ev.shipmentUuid === shipmentUuid;
        });
    });

    it("should emit VaultHash", async () => {
        const vaultHash_shipper = "0x1234567890";
        const vaultHash_carrier = "0x1234567890";
        const shipmentUuid = await createShipment();

        await truffleAssert.reverts(contract.setVaultHash(shipmentUuid, vaultHash_shipper), "Only Shipper or Carrier allowed to set VaultHash");

        const setVaultTx_shipper = await contract.setVaultHash(shipmentUuid, vaultHash_shipper, {from: SHIPPER});

        await truffleAssert.eventEmitted(setVaultTx_shipper, "VaultHash", ev => {
            return ev.vaultHash === vaultHash_shipper;
        });

        const setVaultTx_carrier = await contract.setVaultHash(shipmentUuid, vaultHash_carrier, {from: CARRIER});

        await truffleAssert.eventEmitted(setVaultTx_carrier, "VaultHash", ev => {
            return ev.vaultHash === vaultHash_carrier;
        });

    });

    it("should set inProgress", async () => {
        let shipmentUuid = uuidToHex(uuidv4(), true);
        await contract.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});
        await truffleAssert.reverts(contract.setInProgress(shipmentUuid, {from: MODERATOR}), "Carrier must exist before marking a shipment In Progress");

        shipmentUuid = await createShipment();

        await truffleAssert.reverts(contract.setInProgress(shipmentUuid, {from: SHIPPER}), "Only Carrier or Moderator allowed to set In Progress");

        assert.equal(await contract.getShipmentState(shipmentUuid), ShipmentState.INITIATED);

        await contract.setInProgress(shipmentUuid, {from: CARRIER});

        assert.equal(await contract.getShipmentState(shipmentUuid), ShipmentState.IN_PROGRESS);
    });

    it("should set Complete", async () => {
        const shipmentUuid = await createShipment();

        await truffleAssert.reverts(contract.setComplete(shipmentUuid, {from: CARRIER}), "Only Shipper or Moderator allowed to set Complete");
        await truffleAssert.reverts(contract.setComplete(shipmentUuid, {from: SHIPPER}), "Only In Progress shipments can be marked Complete");

        await contract.setInProgress(shipmentUuid, {from: CARRIER});

        await contract.setComplete(shipmentUuid, {from: SHIPPER});

        assert.equal(await contract.getShipmentState(shipmentUuid), ShipmentState.COMPLETE);
    });

    it("should set Canceled", async () => {
        let shipmentUuid = await createShipment();

        // No one else can cancel
        await truffleAssert.reverts(contract.setCanceled(shipmentUuid, {from: INVALID}), "Only shipper, carrier, or moderator can cancel an Initiated shipment");

        //Shipper can cancel an initiated shipment
        await contract.setCanceled(shipmentUuid, {from: SHIPPER});
        assert.equal(await contract.getShipmentState(shipmentUuid), ShipmentState.CANCELED);

        //Can't cancel a canceled shipment
        await truffleAssert.reverts(contract.setCanceled(shipmentUuid, {from: SHIPPER}), "Already canceled");

        //Carrier and moderator can cancel an initiated shipment
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
        await contract.setCanceled(shipmentUuid, {from: MODERATOR});
        assert.equal(await contract.getShipmentState(shipmentUuid), ShipmentState.CANCELED);
    });

    it("should not fund NO_FUNDING Escrow with Ether", async () => {
        const shipmentUuid = await createShipment();

        await truffleAssert.reverts(contract.fundEscrowEther(shipmentUuid, {from: SHIPPER}), "Shipment has no escrow");
    });
});