const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const LoadContract = artifacts.require("LoadContract");

const ShipmentState = {INITIATED: 0, IN_PROGRESS: 1, COMPLETE: 2, CANCELED: 3 };
const EscrowState = {NOT_CREATED: 0, CREATED: 1, FUNDED: 2, RELEASED: 3, REFUNDED: 4, WITHDRAWN: 5};
const EscrowFundingType = {NO_FUNDING: 0, SHIP: 1, ETHER: 2 };

async function createShipment(shipmentUuid, shipper){
    let options = {};
    if(shipper){
        options.from = shipper;
    }

    const registry = await LoadContract.deployed();
    await registry.createNewShipment(shipmentUuid, 0, 0, options);
    return registry;
}

contract('LoadContract', async (accounts) => {
    const SHIPPER = accounts[1];
    const CARRIER = accounts[2];
    const MODERATOR = accounts[3];
    const INVALID = accounts[9];

    it("should create a LoadShipment", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await LoadContract.deployed();
        const newShipmentTx = await registry.createNewShipment(shipmentUuid, EscrowFundingType.NO_FUNDING, 0, {from: SHIPPER});

        await truffleAssert.eventEmitted(newShipmentTx, "ShipmentCreated", ev => {
            return ev.shipmentUuid === shipmentUuid;
        });
        assert.equal(await registry.getShipper(shipmentUuid), SHIPPER);
    });

    it("should only allow Shipper to set Carrier", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        assert.equal(await registry.getShipper(shipmentUuid), SHIPPER);

        await truffleAssert.reverts(registry.setCarrier(shipmentUuid, CARRIER, {from: MODERATOR}), "Only Shipper allowed to set Carrier");

        await registry.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});
        assert.equal(await registry.getCarrier(shipmentUuid), CARRIER);
    });

    it("should only allow Shipper to set Moderator", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        assert.equal(await registry.getShipper(shipmentUuid), SHIPPER);

        await truffleAssert.reverts(registry.setModerator(shipmentUuid, MODERATOR, {from: CARRIER}), "Only Shipper allowed to set Moderator");

        await registry.setModerator(shipmentUuid, MODERATOR, {from: SHIPPER});
        assert.equal(await registry.getModerator(shipmentUuid), MODERATOR);
    });

    it("should emit VaultUrl", async () => {
        const vaultUrl = "vault.example.com/meta.json";
        const shipmentUuid = uuidToHex(uuidv4(), true);
        const invalidShipment = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);

        await truffleAssert.reverts(registry.setVaultUrl(invalidShipment, vaultUrl), "Shipment does not exist");

        await truffleAssert.reverts(registry.setVaultUrl(shipmentUuid, vaultUrl), "Only Shipper allowed to set VaultUrl");

        const setVaultTx = await registry.setVaultUrl(shipmentUuid, vaultUrl, {from: SHIPPER});

        await truffleAssert.eventEmitted(setVaultTx, "VaultUrl", ev => {
            return ev.vaultUrl === vaultUrl;
        });
    });

    it("should emit VaultHash", async () => {
        const vaultHash_shipper = "0x1234567890";
        const vaultHash_carrier = "0x1234567890";
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        await registry.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});

        await truffleAssert.reverts(registry.setVaultHash(shipmentUuid, vaultHash_shipper), "Only Shipper or Carrier allowed to set VaultHash");

        const setVaultTx_shipper = await registry.setVaultHash(shipmentUuid, vaultHash_shipper, {from: SHIPPER});

        await truffleAssert.eventEmitted(setVaultTx_shipper, "VaultHash", ev => {
            return ev.vaultHash === vaultHash_shipper;
        });

        const setVaultTx_carrier = await registry.setVaultHash(shipmentUuid, vaultHash_carrier, {from: CARRIER});

        await truffleAssert.eventEmitted(setVaultTx_carrier, "VaultHash", ev => {
            return ev.vaultHash === vaultHash_carrier;
        });

    });

    it("should set inProgress", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        await registry.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});

        await truffleAssert.reverts(registry.setInProgress(shipmentUuid, {from: SHIPPER}), "Only Carrier or Moderator allowed to set In Progress");

        assert.equal(await registry.getShipmentState(shipmentUuid), ShipmentState.INITIATED);

        await registry.setInProgress(shipmentUuid, {from: CARRIER});

        assert.equal(await registry.getShipmentState(shipmentUuid), ShipmentState.IN_PROGRESS);
    });

    it("should set Complete", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);
        await registry.setCarrier(shipmentUuid, CARRIER, {from: SHIPPER});

        await truffleAssert.reverts(registry.setComplete(shipmentUuid, {from: CARRIER}), "Only Shipper or Moderator allowed to set Complete");
        await truffleAssert.reverts(registry.setComplete(shipmentUuid, {from: SHIPPER}), "Only In Progress shipments can be marked Complete");

        await registry.setInProgress(shipmentUuid, {from: CARRIER});

        await registry.setComplete(shipmentUuid, {from: SHIPPER});

        assert.equal(await registry.getShipmentState(shipmentUuid), ShipmentState.COMPLETE);
    });

    it("should not fund NO_FUNDING Escrow with Ether", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);

        await truffleAssert.reverts(registry.fundEscrowEther(shipmentUuid, {from: SHIPPER}), "Shipment has no escrow");
    });

});