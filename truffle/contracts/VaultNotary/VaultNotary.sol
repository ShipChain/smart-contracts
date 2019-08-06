/// @author Jianwei Liu ljw725@gmail.com
pragma solidity 0.5.0;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/** @notice The VaultNotary contract is the contract for reading/writing the
  * vault uri and hash, and controlling the permissions to those operations by vault
  * owner.
  */
contract VaultNotary is Ownable {
    struct Data {
        // The address of the Vault owner
        address vaultOwner;
        string vaultHash;
        string vaultUri;

        // The access control mapping to record whether an address can update the Uri of a Vault
        mapping(address => bool) aclUriMapping;

        // The access control mapping to record whether an address can update the Hash of a Vault
        mapping(address => bool) aclHashMapping;
    }

    // Boolean that controls whether this contract is deprecated or not
    bool internal isDeprecated;

    // Each Vault has its own Data
    mapping(bytes16 => VaultNotary.Data) internal notaryMapping;

    // Notary Events
    event VaultUri(address indexed msgSender, bytes16 indexed vaultId, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed vaultId, string vaultHash);
    event VaultRegistered(address indexed msgSender, bytes16 indexed vaultId);

    event UpdateHashPermissionGranted(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed anotherAddress);

    event UpdateHashPermissionRevoked(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed anotherAddress);

    event UpdateUriPermissionGranted(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed anotherAddress);

    event UpdateUriPermissionRevoked(address indexed msgSender, bytes16 indexed vaultId,
                                                                    address indexed anotherAddress);
    //better to add this event when vaultOwner can be different from msgSender, do not need currently
    //event VaultOwnerSet(address indexed msgSender, bytes16 indexed vaultId, address indexed vaultOwner);

    // Contract Events
    event ContractDeprecatedSet(address indexed msgSender, bool isDeprecated);

    /** @dev Modifier for limiting the access to vaultUri update
      * only whitelisted user can do the decorated operation
      */
    modifier whitelistedOnlyForUri(bytes16 vaultId) {
        //emit inside_whitelistedOnlyForUri(vaultId, msg.sender, msg.sender, notaryMapping[vaultId].vaultOwner);
        //require(true);
        require(msg.sender == notaryMapping[vaultId].vaultOwner || notaryMapping[vaultId].aclUriMapping[msg.sender],
            "whitelistedOnlyForUri, only allow vault owner or the whitelisted users to access");
        _;
    }

    /** @dev Modifier for limiting the access to vaultHash update
      * only whitelisted user can do the decorated operation
      */
    modifier whitelistedOnlyForHash(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner || notaryMapping[vaultId].aclHashMapping[msg.sender],
            "whitelistedOnlyForHash, only allow vault owner or the whitelisted users to access");
        _;
    }

    /** @dev Modifier for limiting the access to grant and revoke permissions
      * Will check the message sender, only the owner of a vault can do the operation decorated
      * @param vaultId bytes16 ID of the vault to check
      */
    modifier vaultOwnerOnly(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner, "can only access by vault owner");
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

    /** @notice This is function to register a vault, will only do the registration if a vaultId is not
                registered before
      * @dev It sets the msg.sender to the vault owner and set the update permission of the owner to true
      * It calls the setVaultUir and setVaultHash to initialize those two records
      * @param vaultId bytes16 VaultID to create, is the same as shipment ID in our system
      * @param vaultUri string Vault URI to set
      * @param vaultHash string  Vault hash to set
      */
    function registerVault(bytes16 vaultId, string calldata vaultUri, string calldata vaultHash)
        external
        notDeprecated
    {
        require(isNotRegistered(vaultId), "vault should not be registered, in registerVault");
        notaryMapping[vaultId].vaultOwner = msg.sender;

        //work around for if (vaultUri != "")
        bytes memory tempStringBytes = bytes(vaultUri);
        if (tempStringBytes.length != 0)
            setVaultUri(vaultId, vaultUri);

        tempStringBytes = bytes(vaultHash);
        if (tempStringBytes.length != 0)
            setVaultHash(vaultId, vaultHash);

        emit VaultRegistered(msg.sender, vaultId);
    }

    /** @notice Sets the contract isDeprecated flag. Vault registration will be disabled if isDeprecated == True
      * Only contract owner can set this
      * @param _isDeprecated bool Boolean control variable
      */
    function setDeprecated(bool _isDeprecated)
        external
        onlyOwner
    {
        isDeprecated = _isDeprecated;
        emit ContractDeprecatedSet(msg.sender, isDeprecated);
    }

    /** @notice Function to grant update permission to both Hash field in one vault
      * @param vaultId bytes16 The ID of Vault to grant permission
      * @param anotherAddress address The address to grant permission
      */
    function grantUpdateHashPermission(bytes16 vaultId, address anotherAddress)
        external
        vaultOwnerOnly(vaultId)
    {
        require(!isNotRegistered(vaultId), "vaultId should be registered before grantUpdateHashPermission");
        notaryMapping[vaultId].aclHashMapping[anotherAddress] = true;
        emit UpdateHashPermissionGranted(msg.sender, vaultId, anotherAddress);
    }

    /** @notice Function to revoke update permission to both the Hash field in one vault
      * @param vaultId The ID of Vault to revoke permission
      * @param anotherAddress address The address to revoke permission
      */
    function revokeUpdateHashPermission(bytes16 vaultId, address anotherAddress)
        external
        vaultOwnerOnly(vaultId)
    {
        require(!isNotRegistered(vaultId), "vaultId should be registered before revokeUpdateHashPermission");
        notaryMapping[vaultId].aclHashMapping[anotherAddress] = false;
        emit UpdateHashPermissionRevoked(msg.sender, vaultId, anotherAddress);
    }

    /** @notice Function to grant update permission to both Uri field in one vault
      * @param vaultId bytes16 The ID of Vault to grant permission
      * @param anotherAddress address The address to grant permission
      */
    function grantUpdateUriPermission(bytes16 vaultId, address anotherAddress)
        external
        vaultOwnerOnly(vaultId)
    {
        require(!isNotRegistered(vaultId), "vaultId should be registered before grantUpdateUriPermission");
        notaryMapping[vaultId].aclUriMapping[anotherAddress] = true;
        emit UpdateUriPermissionGranted(msg.sender, vaultId, anotherAddress);
    }

    /** @notice Function to revoke update permission to both the Uri field in one vault
      * @param vaultId The ID of Vault to revoke permission
      * @param anotherAddress address The address to revoke permission
      */
    function revokeUpdateUriPermission(bytes16 vaultId, address anotherAddress)
        external
        vaultOwnerOnly(vaultId)
    {
        require(!isNotRegistered(vaultId), "vaultId should be registered before revokeUpdateUriPermission");
        notaryMapping[vaultId].aclUriMapping[anotherAddress] = false;
        emit UpdateUriPermissionRevoked(msg.sender, vaultId, anotherAddress);
    }

    /** @notice This is used in unit tests to verify the values are correct after using the setters
      * Can also be used for outside users to read the vaultUri and vaultHash
      * @param vaultId bytes16 The ID of the Vault to query
      * @return vaultUri string The uri of the vault
      * @return vaultHash string The hash of the vault
      */
    function getVaultNotaryDetails(bytes16 vaultId)
        external
        view
        returns(string memory vaultUri, string memory vaultHash)
    {
        return (notaryMapping[vaultId].vaultUri, notaryMapping[vaultId].vaultHash);
    }

    /** @notice Function to set the vault URI
      * @param vaultId bytes16 ID of the vault to set
      * @param vaultUri string The vault URI to set
      */
    function setVaultUri(bytes16 vaultId, string memory vaultUri)
        public
        whitelistedOnlyForUri(vaultId)
    {
        notaryMapping[vaultId].vaultUri = vaultUri;
        emit VaultUri(msg.sender, vaultId, vaultUri);
    }

    /** @notice Function to set the vault hash
      * @param vaultId bytes16 ID of the vault to set
      * @param vaultHash string The vault hash to set
      */
    function setVaultHash(bytes16 vaultId, string memory vaultHash)
        public
        whitelistedOnlyForHash(vaultId)
    {
        notaryMapping[vaultId].vaultHash = vaultHash;
        emit VaultHash(msg.sender, vaultId, vaultHash);
    }

    /** @notice This function is only used for testing whether a Vault has been registered yet
      * @param vaultId bytes16 The ID of the vault to check
      * @return isRegistered A boolean, true - not registered; false - registered
      */
    function isNotRegistered(bytes16 vaultId)
        internal
        view
        returns(bool isRegistered)
    {
        return notaryMapping[vaultId].vaultOwner == address(0x0);
    }

}

