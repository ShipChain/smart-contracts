const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const LoadContract = artifacts.require("LoadContract");

const ShipmentState = {INITIATED: 0, IN_PROGRESS: 1, COMPLETE: 2, CANCELED: 3 };
const EscrowState = {NOT_CREATED: 0, CREATED: 1, FUNDED: 2, RELEASED: 3, WITHDRAWN:4};
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

        const setVaultTx = await registry.setVaultUrl(shipmentUuid, vaultUrl, {from: accounts[1]});

        await truffleAssert.eventEmitted(setVaultTx, "VaultUrl", ev => {
            return ev.vaultUrl === vaultUrl;
        });
    });

    it("should emit VaultHash", async () => {
        const vaultHash = "0x1234567890";
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);

        await truffleAssert.reverts(registry.setVaultHash(shipmentUuid, vaultHash), "Only Shipper allowed to set VaultHash");

        const setVaultTx = await registry.setVaultHash(shipmentUuid, vaultHash, {from: accounts[1]});

        await truffleAssert.eventEmitted(setVaultTx, "VaultHash", ev => {
            return ev.vaultHash === vaultHash;
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

    it("should not fund NO_FUNDING Escrow with Ether", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await createShipment(shipmentUuid, SHIPPER);

        await truffleAssert.reverts(registry.fundEscrowEther(shipmentUuid, {from: SHIPPER}), "Shipment has no escrow");
    });

});