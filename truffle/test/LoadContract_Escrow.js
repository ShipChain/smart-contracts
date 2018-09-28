const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const LoadContract = artifacts.require("LoadContract");

const ShipmentState = {INITIATED: 0, IN_PROGRESS: 1, COMPLETE: 2, CANCELED: 3 };
const EscrowState = {NOT_CREATED: 0, CREATED: 1, FUNDED: 2, RELEASED: 3, WITHDRAWN:4};
const EscrowFundingType = {NO_FUNDING: 0, SHIP: 1, ETHER: 2 };

async function createShipment(shipmentUuid, shipper, fundingType=EscrowFundingType.SHIP, fundingAmount=500){
    let options = {};
    if(shipper){
        options.from = shipper;
    }

    const registry = await LoadContract.deployed();
    await registry.createNewShipment(shipmentUuid, fundingType, fundingAmount, options);
    return registry;
}

contract('LoadContract with Escrow', async (accounts) => {
    const SHIPPER = accounts[1];
    const CARRIER = accounts[2];
    const MODERATOR = accounts[3];
    const INVALID = accounts[9];

    it("should create a LoadShipment", async () => {
        const shipmentUuid = uuidToHex(uuidv4(), true);

        const registry = await LoadContract.deployed();
        const newShipmentTx = await registry.createNewShipment(shipmentUuid, EscrowFundingType.SHIP, 500, {from: SHIPPER});

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

});