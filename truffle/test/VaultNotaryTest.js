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

    async function registerVault() {
        const vaultId = uuidToHex(uuidv4(), true);
        const vaultUri = "uri";
        const vaultHash = "hash";
        await contract.registerVault(vaultId, vaultUri, vaultHash, {from: SHIPPER});
        return vaultId;
    }

    //***************testing registerVault**************************************

    it("should create a vault notary", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        const vaultUri = "uri";
        const vaultHash = "hash";
        const newVaultTx = await contract.registerVault(vaultId, vaultUri, vaultHash, {from: SHIPPER});

        await truffleAssert.eventEmitted(newVaultTx, "VaultRegistered", ev => {
            return ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === SHIPPER;
        });

        await truffleAssert.eventEmitted(newVaultTx, "VaultUri", ev => {
            return ev.vaultUri === "uri" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === SHIPPER;
        });

        await truffleAssert.eventEmitted(newVaultTx, "VaultHash", ev => {
            return ev.vaultHash === "hash" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === SHIPPER;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);

        //since the setVaultHash and Uri works in the registerVault, it has
        // tested the aclMapping set to true in the registerVault works as expected
        assert.equal(data.vaultHash, "hash");
        assert.equal(data.vaultUri, "uri");
    });

    //this checks the vaultOwner assignment and the modifier vaultOwnerOnly works
    it("should revert the transaction if a vault notary exists", async () => {
        const vaultId = await registerVault()
        const vaultUri = "uri";
        const vaultHash = "hash";
        await truffleAssert.reverts(contract.registerVault(vaultId, vaultUri, vaultHash, {from: SHIPPER}));

    });

    //****************partially testing grantUpdatePermission***********************

    it("should revert the grantUpdatePermission transaction if vaultId is not registered", async () => {
        //first create a vault
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.grantUpdatePermission(vaultId, CARRIER, {from: SHIPPER}));
    });

    it("should revert the grantUpdatePermission not called from the vaultOwner", async () => {
        //first create a vault
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.grantUpdatePermission(vaultId, CARRIER, {from: ATTACKER}));
    });


    //*******************partially testing revokeUpdatePermission************************
    it("should revert the revokeUpdatePermission transaction if vaultId is not registered", async () => {
        //first create a vault
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.revokeUpdatePermission(vaultId, CARRIER, {from: SHIPPER}));
    });

    it("should revert the revokeUpdatePermission not called from the vaultOwner", async () => {
        //first create a vault
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.revokeUpdatePermission(vaultId, CARRIER, {from: ATTACKER}));
    });


    //**************Uri: testing setVaultUri and grantUpdatePermission**************

    it("should set the uri, if the address is the SHIPPER, after registerVault", async () => {
        const vaultId = await registerVault();
        const setUriTx = await contract.setVaultUri(vaultId, "new_uri",  {from: SHIPPER});
        await truffleAssert.eventEmitted(setUriTx, "VaultUri", ev => {
            return ev.vaultUri === "new_uri" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === SHIPPER;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultUri, "new_uri");

    });


    it("should set the uri if we grant the permission to another address", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(grantTx, "UpdatePermissionGranted", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        const setUriTx = await contract.setVaultUri(vaultId, "carrier_uri",  {from: CARRIER});
        await truffleAssert.eventEmitted(setUriTx, "VaultUri", ev => {
            return ev.vaultUri === "carrier_uri" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === CARRIER;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultUri, "carrier_uri");

    });

    it("should revert the setVaultUri transaction when permission not granted yet", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.setVaultUri(vaultId, "carrier_uri",  {from: CARRIER}));

    });

    it("should revert the setVaultUri transaction if we revoke the permission to another address granted permission before", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(grantTx, "UpdatePermissionGranted", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(revokeTx, "UpdatePermissionRevoked", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        await truffleAssert.reverts(contract.setVaultUri(vaultId, "carrier_uri",  {from: CARRIER}));

    });

    it("should still revert the setVaultUri transaction if we revoke the permission to an address that did not have permission", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(revokeTx, "UpdatePermissionRevoked", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        await truffleAssert.reverts(contract.setVaultUri(vaultId, "carrier_uri",  {from: CARRIER}));

    });


    //**************Hash: testing setVaultHash and grantUpdatePermission**************

    it("should set the hash, if the address is the SHIPPER, after registerVault", async () => {
        const vaultId = await registerVault();
        const setHashTx = await contract.setVaultHash(vaultId, "new_hash",  {from: SHIPPER});
        await truffleAssert.eventEmitted(setHashTx, "VaultHash", ev => {
            return ev.vaultHash === "new_hash" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === SHIPPER;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultHash, "new_hash");

    });


    it("should set the hash if we grant the permission to another address", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(grantTx, "UpdatePermissionGranted", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        const setHashTx = await contract.setVaultHash(vaultId, "carrier_hash",  {from: CARRIER});
        await truffleAssert.eventEmitted(setHashTx, "VaultHash", ev => {
            return ev.vaultHash === "carrier_hash" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === CARRIER;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultHash, "carrier_hash");

    });

    it("should revert the setVaultHash transaction when permission not granted yet", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.setVaultHash(vaultId, "carrier_hash",  {from: CARRIER}));

    });

    it("should revert the setVaultHash transaction if we revoke the permission to another address granted permission before", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(grantTx, "UpdatePermissionGranted", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(revokeTx, "UpdatePermissionRevoked", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        await truffleAssert.reverts(contract.setVaultHash(vaultId, "carrier_hash",  {from: CARRIER}));

    });

    it("should still revert the setVaultHash transaction if we revoke the permission to an address that did not have permission", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdatePermission(vaultId, CARRIER, {from: SHIPPER});
        await truffleAssert.eventEmitted(revokeTx, "UpdatePermissionRevoked", ev => {
            return ev.anotherAddress === CARRIER && ev.msgSender === SHIPPER;
        });

        await truffleAssert.reverts(contract.setVaultHash(vaultId, "carrier_hash",  {from: CARRIER}));

    });

    //**********************testing the setDeprecated************************
    it("should not allow users other than OWNER to setDeprecated", async () => {
        await truffleAssert.reverts(contract.setDeprecated(true, {from: SHIPPER}));
        await truffleAssert.reverts(contract.setDeprecated(true, {from: CARRIER}));
        await truffleAssert.reverts(contract.setDeprecated(true, {from: MODERATOR}));
        await truffleAssert.reverts(contract.setDeprecated(true, {from: ATTACKER}));
    });

    it("should disable the registerVault function after setting deprecated, and enable it if called again", async () => {

        let deprecationTx = await contract.setDeprecated(true, {from: OWNER});
        await truffleAssert.eventEmitted(deprecationTx, "ContractDeprecatedSet", ev => {
            return ev.msgSender === OWNER && ev.isDeprecated == true;
        });
        await truffleAssert.reverts(registerVault(), "This version of the VaultNotary contract has been deprecated");

        //call again to enable it
        deprecationTx = await contract.setDeprecated(false, {from: OWNER});
        await truffleAssert.eventEmitted(deprecationTx, "ContractDeprecatedSet", ev => {
            return ev.msgSender === OWNER && ev.isDeprecated == false;
        });
        await (registerVault());
    });


});