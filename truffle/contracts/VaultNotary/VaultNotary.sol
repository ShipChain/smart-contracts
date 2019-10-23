/// @author Jianwei Liu jliu@shipchain.io
pragma solidity 0.5.11;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/** @notice The VaultNotary contract is the contract for reading/writing the
  * vault uri and hash, and controlling the permissions to those operations by vault
  * owner.
  */
contract VaultNotary is Ownable {

    struct Data {
        /* Struct Slot 0 */
        // The access control mapping to record whether an address can update the Hash of a Vault
        mapping(address => bool) hashAcl;

        /* Struct Slot 1 */
        // The access control mapping to record whether an address can update the Uri of a Vault
        mapping(address => bool) uriAcl;

        /* Struct Slot 2 */
        // The address of the Vault owner, 20 bytes
        address vaultOwner;

        /* Struct Slot 3 */
        string vaultHash;

        /* Struct  Slot 4 */
        string vaultUri;

    }

    /* Slot 0, data part at keccak256(key . uint256(0)), where . is concatenation*/
    // Each Vault has its own Data
    mapping(bytes16 => VaultNotary.Data) internal notaryMapping;

    /* Slot 1 */
    // Boolean that controls whether this contract is deprecated or not, 1 byte
    bool internal isDeprecated;

    // Notary Events
    event VaultUri(address indexed msgSender, bytes16 indexed vaultId, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed vaultId, string vaultHash);
    event VaultRegistered(address indexed msgSender, bytes16 indexed vaultId);

    event UpdateHashPermissionGranted(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed addressToGrant);

    event UpdateHashPermissionRevoked(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed addressToRevoke);

    event UpdateUriPermissionGranted(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed addressToGrant);

    event UpdateUriPermissionRevoked(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed addressToRevoke);

    // Contract Events
    event ContractDeprecatedSet(address indexed msgSender, bool isDeprecated);

    /** @dev Modifier for limiting the access to vaultUri update
      * only whitelisted user can do the decorated operation
      */
    modifier canUpdateUri(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner || notaryMapping[vaultId].uriAcl[msg.sender],
            "Only the vault owner or whitelisted users can update vault URI");
        _;
    }

    /** @dev Modifier for limiting the access to vaultHash update
      * only whitelisted user can do the decorated operation
      */
    modifier canUpdateHash(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner || notaryMapping[vaultId].hashAcl[msg.sender],
            "Only the vault owner or whitelisted users can update vault hash");
        _;
    }

    /** @dev Modifier for limiting the access to grant and revoke permissions
      * Will check the message sender, only the owner of a vault can do the operation decorated
      * @param vaultId bytes16 ID of the vault to check
      */
    modifier vaultOwnerOnly(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner, "Method only accessible to vault owner");
        _;
    }

    /** @notice This modifier is for testing whether a Vault has been registered yet
      * @param vaultId bytes16 The ID of the vault to check
      */
    modifier isNotRegistered(bytes16 vaultId) {
        require(notaryMapping[vaultId].vaultOwner == address(0x0), "Vault ID already exists");
        _;
    }

    /** @notice This modifier is for testing whether a Vault has been registered yet
      * @param vaultId bytes16 The ID of the vault to check
      */
    modifier isRegistered(bytes16 vaultId) {
        require(notaryMapping[vaultId].vaultOwner != address(0x0), "Vault ID does not exist");
        _;
    }

    /** @notice If we upgrade the version of the contract, the old contract
      *  will not be allowed to register new Vault anymore. However, the existing
      *  Vaults registered in that contract should still be able to be updated
      */
    modifier notDeprecated() {
        require(!isDeprecated, "This version of the VaultNotary contract has been deprecated");
        _;
    }

    /** @notice This is function to register a vault, will only do the registration if a vaultId has not
                been registered before
      * @dev It sets the msg.sender to the vault owner, and calls the setVaultUri and setVaultHash to
      * initialize the uri and hash of a vault. It emits VaultRegistered on success.
      * @param vaultId bytes16 VaultID to create, is the same as shipment ID in our system
      * @param vaultUri string Vault URI to set
      * @param vaultHash string  Vault hash to set
      */
    function registerVault(bytes16 vaultId, string calldata vaultUri, string calldata vaultHash)
        external
        notDeprecated
        isNotRegistered(vaultId)
    {
        notaryMapping[vaultId].vaultOwner = msg.sender;

        //work around for if (vaultUri != "")
        if (bytes(vaultUri).length != 0)
            setVaultUri(vaultId, vaultUri);

        if (bytes(vaultHash).length != 0)
            setVaultHash(vaultId, vaultHash);

        emit VaultRegistered(msg.sender, vaultId);
    }

    /** @notice Sets the contract isDeprecated flag. Vault registration will be disabled if isDeprecated == True
      * Only contract owner can set this
      * @dev It emits ContractDeprecatedSet on success
      * @param _isDeprecated bool Boolean control variable
      */
    function setDeprecated(bool _isDeprecated)
        external
        onlyOwner
    {
        isDeprecated = _isDeprecated;
        emit ContractDeprecatedSet(msg.sender, isDeprecated);
    }

    /** @notice Function to grant update permission to the hash field in a vault
      * @dev It emits UpdateHashPermissionGranted on success
      * @param vaultId bytes16 The ID of Vault to grant permission
      * @param addressToGrant address The address to grant permission
      */
    function grantUpdateHashPermission(bytes16 vaultId, address addressToGrant)
        external
        isRegistered(vaultId)
        vaultOwnerOnly(vaultId)
    {
        notaryMapping[vaultId].hashAcl[addressToGrant] = true;
        emit UpdateHashPermissionGranted(msg.sender, vaultId, addressToGrant);
    }

    /** @notice Function to revoke update permission to the hash field in a vault
      * @dev It emits UpdateHashPermissionRevoked on success
      * @param vaultId The ID of Vault to revoke permission
      * @param addressToRevoke address The address to revoke permission
      */
    function revokeUpdateHashPermission(bytes16 vaultId, address addressToRevoke)
        external
        isRegistered(vaultId)
        vaultOwnerOnly(vaultId)
    {
        notaryMapping[vaultId].hashAcl[addressToRevoke] = false;
        emit UpdateHashPermissionRevoked(msg.sender, vaultId, addressToRevoke);
    }

    /** @notice Function to grant update permission to the Uri field in a vault
      * @dev It emits UpdateUriPermissionGranted on success
      * @param vaultId bytes16 The ID of Vault to grant permission
      * @param addressToGrant address The address to grant permission
      */
    function grantUpdateUriPermission(bytes16 vaultId, address addressToGrant)
        external
        isRegistered(vaultId)
        vaultOwnerOnly(vaultId)
    {
        notaryMapping[vaultId].uriAcl[addressToGrant] = true;
        emit UpdateUriPermissionGranted(msg.sender, vaultId, addressToGrant);
    }

    /** @notice Function to revoke update permission to the Uri field in a vault
      * @dev It emits UpdateUriPermissionRevoked on success
      * @param vaultId The ID of Vault to revoke permission
      * @param addressToRevoke address The address to revoke permission
      */
    function revokeUpdateUriPermission(bytes16 vaultId, address addressToRevoke)
        external
        isRegistered(vaultId)
        vaultOwnerOnly(vaultId)
    {
        notaryMapping[vaultId].uriAcl[addressToRevoke] = false;
        emit UpdateUriPermissionRevoked(msg.sender, vaultId, addressToRevoke);
    }

    /** @notice This function can read the vaultUri, vaultHash and vaultOwner given a
      * vaultId. It can be used in unit tests to verify the values are correct
      * after calling registerVault or using the setters. It can also be used
      * by outside users to read the details of a vault. If vaultID is not
      * registered, the vaultOwner returned will be 0x0. Otherwise, vaultOwner will
      * not be 0x0. Therefore, the returned vaultOwner can be used to test whether
      * the queried vault is registered. When vault not registered, the returned
      * vaultUri and vaultHash will both be empty strings.
      * @param vaultId bytes16 The ID of the Vault to query
      * @return vaultUri string The uri of the vault
      * @return vaultHash string The hash of the vault
      * @return vaultOwner address
      */
    function getVaultNotaryDetails(bytes16 vaultId)
        external
        view
        returns(string memory vaultUri, string memory vaultHash, address vaultOwner)
    {
        vaultUri = notaryMapping[vaultId].vaultUri;
        vaultHash = notaryMapping[vaultId].vaultHash;
        vaultOwner = notaryMapping[vaultId].vaultOwner;
    }

    /** @notice Function to set the vault URI
      * @dev It emits VaultUri on success
      * @param vaultId bytes16 ID of the vault to set
      * @param vaultUri string The vault URI to set
      */
    function setVaultUri(bytes16 vaultId, string memory vaultUri)
        public
        isRegistered(vaultId)
        canUpdateUri(vaultId)
    {
        notaryMapping[vaultId].vaultUri = vaultUri;
        emit VaultUri(msg.sender, vaultId, vaultUri);
    }

    /** @notice Function to set the vault hash
      * @dev It emits VaultHash on success
      * @param vaultId bytes16 ID of the vault to set
      * @param vaultHash string The vault hash to set
      */
    function setVaultHash(bytes16 vaultId, string memory vaultHash)
        public
        isRegistered(vaultId)
        canUpdateHash(vaultId)
    {
        notaryMapping[vaultId].vaultHash = vaultHash;
        emit VaultHash(msg.sender, vaultId, vaultHash);
    }

}

