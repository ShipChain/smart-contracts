const truffleAssert = require('truffle-assertions');
const uuidv4 = require('uuid/v4');
const uuidToHex = require('uuid-to-hex');

const NotaryContract = artifacts.require("VaultNotary");



function uuidToHex32(uuid) {
    return uuid + '00000000000000000000000000000000'
}


contract('VaultNotary', async (accounts) => {
    const OWNER = accounts[0];
    const ALICE = accounts[1];
    const BOB = accounts[2];
    const ATTACKER = accounts[9];

    const vaultUri = "engine://b955b4a3-c317-43b5-8215-8987c8f322a1/4b38973b-da4a-423c-ade7-e8a409b5ff1b/meta.json";
    const vaultHash = "0x9f01c8657936adf4b03d2a90f59319737fe3ef784828c04dd5eee810d791fedb";

    const vaultUriToUpdate = "engine://a955b4a3-c317-43b5-8215-8987c8f322a1/4b38973b-da4a-423c-ade7-e8a409b5ff1b/meta.json";
    const vaultHashToUpdate = "0x8f01c8657936adf4b03d2a90f59319737fe3ef784828c04dd5eee810d791fedb";

    let contract;
    before(async () =>{
        contract = await NotaryContract.deployed();
    });

    async function registerVault() {
        const vaultId = uuidToHex(uuidv4(), true);
        await contract.registerVault(vaultId, vaultUri, vaultHash, {from: ALICE});
        return vaultId;
    }

    //***************testing registerVault**************************************

    it("should create a vault notary", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        const newVaultTx = await contract.registerVault(vaultId, vaultUri, vaultHash, {from: ALICE});

        await truffleAssert.eventEmitted(newVaultTx, "VaultRegistered", ev => {
            return ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventEmitted(newVaultTx, "VaultUri", ev => {
            return ev.vaultUri === vaultUri && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventEmitted(newVaultTx, "VaultHash", ev => {
            return ev.vaultHash === vaultHash && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);

        //since the setVaultHash and Uri works in the registerVault, it has
        // tested the aclMapping set to true in the registerVault works as expected
        assert.equal(data.vaultHash, vaultHash);
        assert.equal(data.vaultUri, vaultUri);
    });

    it("should not emit VaultUri if uri is empty string", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        const vaultUri = "";
        const newVaultTx = await contract.registerVault(vaultId, vaultUri, vaultHash, {from: ALICE});

        await truffleAssert.eventEmitted(newVaultTx, "VaultRegistered", ev => {
            return ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventNotEmitted(newVaultTx, "VaultUri", ev => {
            return ev.vaultUri === "" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventEmitted(newVaultTx, "VaultHash", ev => {
            return ev.vaultHash === vaultHash && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);

        //since the setVaultHash and Uri works in the registerVault, it has
        // tested the aclMapping set to true in the registerVault works as expected
        assert.equal(data.vaultHash, vaultHash);
        assert.equal(data.vaultUri, "");
    });

    it("should not emit VaultHash if hash is empty string", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        const vaultHash = "";
        const newVaultTx = await contract.registerVault(vaultId, vaultUri, vaultHash, {from: ALICE});

        await truffleAssert.eventEmitted(newVaultTx, "VaultRegistered", ev => {
            return ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventEmitted(newVaultTx, "VaultUri", ev => {
            return ev.vaultUri === vaultUri && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventNotEmitted(newVaultTx, "VaultHash", ev => {
            return ev.vaultHash === "" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);

        //since the setVaultHash and Uri works in the registerVault, it has
        // tested the aclMapping set to true in the registerVault works as expected
        assert.equal(data.vaultHash, "");
        assert.equal(data.vaultUri, vaultUri);
    });

    it("should not emit VaultHash and VaultUri if both empty strings", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        const vaultUri = "";
        const vaultHash = "";
        const newVaultTx = await contract.registerVault(vaultId, vaultUri, vaultHash, {from: ALICE});

        await truffleAssert.eventEmitted(newVaultTx, "VaultRegistered", ev => {
            return ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventNotEmitted(newVaultTx, "VaultUri", ev => {
            return ev.vaultUri === "" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        await truffleAssert.eventNotEmitted(newVaultTx, "VaultHash", ev => {
            return ev.vaultHash === "" && ev.vaultId == uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);

        assert.equal(data.vaultHash, "");
        assert.equal(data.vaultUri, "");
    });

    //this checks the vaultOwner assignment and the modifier vaultOwnerOnly works
    it("should revert the transaction if a vault notary exists", async () => {
        const vaultId = await registerVault()
        await truffleAssert.reverts(contract.registerVault(vaultId, vaultUri, vaultHash, {from: ALICE}), "Vault ID already exists");

    });

    //****************partially testing grantUpdateHashPermission***********************

    it("should revert the grantUpdateHashPermission transaction if vaultId is not registered", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.grantUpdateHashPermission(vaultId, BOB, {from: ALICE}), "Vault ID does not exist");
    });

    it("should revert the grantUpdateHashPermission, if not called from the vaultOwner", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.grantUpdateHashPermission(vaultId, BOB, {from: ATTACKER}),"Method only accessible to vault owner");
    });


    //*******************partially testing revokeUpdateHashPermission************************
    it("should revert the revokeUpdateHashPermission transaction if vaultId is not registered", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.revokeUpdateHashPermission(vaultId, BOB, {from: ALICE}), "Vault ID does not exist");
    });

    it("should revert the revokeUpdateHashPermission not called from the vaultOwner", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.revokeUpdateHashPermission(vaultId, BOB, {from: ATTACKER}), "Method only accessible to vault owner");
    });

    //****************partially testing grantUpdateUriPermission***********************

    it("should revert the grantUpdateUriPermission transaction if vaultId is not registered", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.grantUpdateUriPermission(vaultId, BOB, {from: ALICE}), "Vault ID does not exist");
    });

    it("should revert the grantUpdateUriPermission, if not called from the vaultOwner", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.grantUpdateUriPermission(vaultId, BOB, {from: ATTACKER}), "Method only accessible to vault owner");
    });


    //*******************partially testing revokeUpdateUriPermission************************
    it("should revert the revokeUpdateUriPermission transaction if vaultId is not registered", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.revokeUpdateUriPermission(vaultId, BOB, {from: ALICE}), "Vault ID does not exist");
    });

    it("should revert the revokeUpdateUriPermission not called from the vaultOwner", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.revokeUpdateUriPermission(vaultId, BOB, {from: ATTACKER}), "Method only accessible to vault owner");
    });


    //**********Uri: testing setVaultUri and grantUpdateUriPermission and revokeUpdateUriPermission********

    it("should set the uri if the address is the vault owner, after registerVault", async () => {
        const vaultId = await registerVault();
        const setUriTx = await contract.setVaultUri(vaultId, vaultUriToUpdate,  {from: ALICE});
        await truffleAssert.eventEmitted(setUriTx, "VaultUri", ev => {
            return ev.vaultUri === vaultUriToUpdate && ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultUri, vaultUriToUpdate);

    });


    it("should set the uri if we grant the permission to another address", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdateUriPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(grantTx, "UpdateUriPermissionGranted", ev => {
            return ev.addressToGrant === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        const setUriTx = await contract.setVaultUri(vaultId, vaultUriToUpdate,  {from: BOB});
        await truffleAssert.eventEmitted(setUriTx, "VaultUri", ev => {
            return ev.vaultUri === vaultUriToUpdate && ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === BOB;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultUri, vaultUriToUpdate);

    });

    it("should revert the setVaultUri transaction when vaultId does not exist", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.setVaultUri(vaultId, vaultUriToUpdate,  {from: BOB}), "Vault ID does not exist"); 

    });

    it("should revert the setVaultUri transaction when permission not granted yet", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.setVaultUri(vaultId, vaultUriToUpdate,  {from: BOB}), "Only the vault owner or whitelisted users can update vault URI");

    });

    it("should revert the setVaultUri transaction if we revoke the permission to another address granted permission before", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdateUriPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(grantTx, "UpdateUriPermissionGranted", ev => {
            return ev.addressToGrant === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdateUriPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(revokeTx, "UpdateUriPermissionRevoked", ev => {
            return ev.addressToRevoke === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        await truffleAssert.reverts(contract.setVaultUri(vaultId, vaultUriToUpdate,  {from: BOB}), "Only the vault owner or whitelisted users can update vault URI" );

    });

    it("should still revert the setVaultUri transaction if we revoke the permission to an address that did not have permission", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdateUriPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(revokeTx, "UpdateUriPermissionRevoked", ev => {
            return ev.addressToRevoke === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        await truffleAssert.reverts(contract.setVaultUri(vaultId, vaultUriToUpdate,  {from: BOB}), "Only the vault owner or whitelisted users can update vault URI");

    });


    //**************Hash: testing setVaultHash and grantUpdateHashPermission**************

    it("should set the hash, if the address is the shipper, after registerVault", async () => {
        const vaultId = await registerVault();

        //ALICE is the shipper used in the registerVault function above
        const setHashTx = await contract.setVaultHash(vaultId, vaultHashToUpdate,  {from: ALICE});
        await truffleAssert.eventEmitted(setHashTx, "VaultHash", ev => {
            return ev.vaultHash === vaultHashToUpdate && ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === ALICE;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultHash, vaultHashToUpdate);

    });


    it("should set the hash if we grant the permission to another address", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdateHashPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(grantTx, "UpdateHashPermissionGranted", ev => {
            return ev.addressToGrant === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        const setHashTx = await contract.setVaultHash(vaultId, vaultHashToUpdate,  {from: BOB});
        await truffleAssert.eventEmitted(setHashTx, "VaultHash", ev => {
            return ev.vaultHash === vaultHashToUpdate && ev.vaultId === uuidToHex32(vaultId) && ev.msgSender === BOB;
        });

        const data = await contract.getVaultNotaryDetails(vaultId);
        assert.equal(data.vaultHash, vaultHashToUpdate);

    });

    it("should revert the setVaultHash transaction when vaultId does not exist", async () => {
        const vaultId = uuidToHex(uuidv4(), true);
        await truffleAssert.reverts(contract.setVaultHash(vaultId, vaultHashToUpdate,  {from: BOB}), "Vault ID does not exist"); 

    });

    it("should revert the setVaultHash transaction when permission not granted yet", async () => {
        //first create a vault
        const vaultId = await registerVault();
        await truffleAssert.reverts(contract.setVaultHash(vaultId, vaultHashToUpdate,  {from: BOB}), "Only the vault owner or whitelisted users can update vault hash");

    });

    it("should revert the setVaultHash transaction if we revoke the permission to another address granted permission before", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const grantTx = await contract.grantUpdateHashPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(grantTx, "UpdateHashPermissionGranted", ev => {
            return ev.addressToGrant === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdateHashPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(revokeTx, "UpdateHashPermissionRevoked", ev => {
            return ev.addressToRevoke === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        await truffleAssert.reverts(contract.setVaultHash(vaultId, vaultHashToUpdate,  {from: BOB}), "Only the vault owner or whitelisted users can update vault hash");

    });

    it("should still revert the setVaultHash transaction if we revoke the permission to an address that did not have permission", async () => {
        //first create a vault
        const vaultId = await registerVault();

        //grant the permission from the vault owner
        const revokeTx = await contract.revokeUpdateHashPermission(vaultId, BOB, {from: ALICE});
        await truffleAssert.eventEmitted(revokeTx, "UpdateHashPermissionRevoked", ev => {
            return ev.addressToRevoke === BOB && ev.msgSender === ALICE && ev.vaultId === uuidToHex32(vaultId);
        });

        await truffleAssert.reverts(contract.setVaultHash(vaultId, vaultHashToUpdate,  {from: BOB}), "Only the vault owner or whitelisted users can update vault hash");

    });

    //**********************testing the setDeprecated************************
    it("should not allow users other than OWNER to setDeprecated", async () => {
        await truffleAssert.reverts(contract.setDeprecated(true, {from: ALICE}), "Ownable: caller is not the owner");
        await truffleAssert.reverts(contract.setDeprecated(true, {from: BOB}), "Ownable: caller is not the owner");
        await truffleAssert.reverts(contract.setDeprecated(true, {from: ATTACKER}), "Ownable: caller is not the owner");
    });

    it("should disable the registerVault function after setting deprecated, and enable it if called again", async () => {

        let deprecationTx = await contract.setDeprecated(true, {from: OWNER});
        await truffleAssert.eventEmitted(deprecationTx, "ContractDeprecatedSet", ev => {
            return ev.msgSender === OWNER && ev.isDeprecated === true;
        });
        await truffleAssert.reverts(registerVault(), "This version of the VaultNotary contract has been deprecated");

        //call again to enable it
        deprecationTx = await contract.setDeprecated(false, {from: OWNER});
        await truffleAssert.eventEmitted(deprecationTx, "ContractDeprecatedSet", ev => {
            return ev.msgSender === OWNER && ev.isDeprecated === false;
        });
        await (registerVault());
    });


});