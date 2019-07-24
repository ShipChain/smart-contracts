const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const NotaryContract = artifacts.require("VaultNotary");



function uuidToHex32(uuid) {
    return uuid + '00000000000000000000000000000000'
}


contract('VaultNotary', async (accounts) => {
    const OWNER = accounts[0];
    const SHIPPER = accounts[1];
    const CARRIER = accounts[2];
    const MODERATOR = accounts[3];
    const ATTACKER = accounts[9];

    let contract;
    before(async () =>{
        contract = await NotaryContract.deployed();
    });


    it("should create a vault notary", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        const vaultUri = "uri";
        const vaultHash = "hash";
        const newVaultTx = await contract.registerVault(vaultId, vaultUri, vaultHash, {from: SHIPPER});

        await truffleAssert.eventEmitted(newVaultTx, "VaultRegistered", ev => {
            return ev.vaultId === uuidToHex32(vaultId);
        });

        const data = await contract.getVaultNotaryDetails(vaultId);

        //since the setVaultHash and Uri works in the registerVault, it has
        // tested the aclMapping set to true in the registerVault works as expected
        assert.equal(data.vaultHash, "hash");
        assert.equal(data.vaultUri, "uri");
    });


    //this checks the vaultOwner assignment and the modifier vaultOwnerOnly works
    it("should revert the transaction if a vault notary exists", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        const vaultUri = "uri";
        const vaultHash = "hash";
        await contract.registerVault(vaultId, vaultUri, vaultHash, {from: SHIPPER});

        truffleAssert.reverts(contract.registerVault(vaultId, vaultUri, vaultHash, {from: SHIPPER}));

    });





});