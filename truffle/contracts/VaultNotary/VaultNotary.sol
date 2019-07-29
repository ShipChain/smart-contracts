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

        // The access control mapping to record whether an address can update the Uri and Hash of a Vault
        mapping(address => bool) aclMapping;
    }

    // Boolean that controls whether this contract is deprecated or not
    bool internal isDeprecated;

    // Each Vault has its own Data
    mapping(bytes16 => VaultNotary.Data) internal notaryMapping;

    // Notary Events
    event VaultUri(address indexed msgSender, bytes16 indexed vaultId, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed vaultId, string vaultHash);
    event VaultRegistered(address indexed msgSender, bytes16 indexed vaultId);
    event UpdatePermissionGranted(address indexed msgSender, address indexed anotherAddress);
    event UpdatePermissionRevoked(address indexed msgSender, address indexed anotherAddress);

    // Contract Events
    event ContractDeprecatedSet(address indexed msgSender, bool isDeprecated);

    /** @dev Modifier for limiting the access to vaultUri and vaultHash update
      * only whitelisted user can do the decorated operation
      */
    modifier whitelistedOnly(bytes16 vaultId) {
        require(notaryMapping[vaultId].aclMapping[msg.sender]);
        _;
    }

    /** @dev Modifier for limit the access to grant and revoke permissions
      * Only the owner of a Vault can do the operation decorated
      */
    modifier vaultOwnerOnly(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner);
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

    /** @notice Sets the contract isDeprecated flag. Vault registration will be disabled if isDeprecated == True
      * Only contract owner can set this
      * @param _isDeprecated Boolean control variable
      */
    function setDeprecated(bool _isDeprecated)
        external
        onlyOwner
    {
        isDeprecated = _isDeprecated;
        emit ContractDeprecatedSet(msg.sender, isDeprecated);
    }

    /** @notice Function to grant update permission to both the uri and hash fields in one vault
      * @param vaultId The ID of Vault to grant permission
      */
    function grantUpdatePermission(bytes16 vaultId, address anotherAddress)
        external
        vaultOwnerOnly(vaultId)
    {
        require(!isNotRegistered(vaultId));
        notaryMapping[vaultId].aclMapping[anotherAddress] = true;
        emit UpdatePermissionGranted(msg.sender, anotherAddress);
    }

    /** @notice Function to revoke update permission to both the uri and hash fields in one vault
      * @param vaultId The ID of Vault to revoke permission
      */
    function revokeUpdatePermission(bytes16 vaultId, address anotherAddress)
        external
        vaultOwnerOnly(vaultId)
    {
        require(!isNotRegistered(vaultId));
        notaryMapping[vaultId].aclMapping[anotherAddress] = false;
        emit UpdatePermissionRevoked(msg.sender, anotherAddress);
    }

    /** @notice This is used in unit tests to verify the values are correct after using the setters
      * Can also be used for outside users to read the vaultUri and vaultHash
      * @param vaultId The ID of the Vault to query
      * @return vaultUri The uri of the vault
      * @return vaultHash The hash of the vault
      */
    function getVaultNotaryDetails(bytes16 vaultId)
        external
        view
        returns(string memory vaultUri, string memory vaultHash)
    {
        return (notaryMapping[vaultId].vaultUri, notaryMapping[vaultId].vaultHash);
    }

    /** @notice This is function to register a vault, will only do the registration if a vaultId is not
                registered before
      * @dev It sets the msg.sender to the vault owner and set the update permission of the owner to true
      * It calls the setVaultUir and setVaultHash to initialize those two records
      * @param vaultId VaultID to create, is the same as shipment ID in our system
      * @param vaultUri Vault URI to set
      * @param vaultHash Vault hash to set
      */
    function registerVault(bytes16 vaultId, string memory vaultUri, string memory vaultHash)
        public
        notDeprecated
    {
        require(isNotRegistered(vaultId));
        notaryMapping[vaultId].vaultOwner = msg.sender;
        notaryMapping[vaultId].aclMapping[msg.sender] = true;
        setVaultUri(vaultId, vaultUri);
        setVaultHash(vaultId, vaultHash);
        emit VaultRegistered(msg.sender, vaultId);
    }

    /** @notice Function to set the vault URI
      * @param vaultId ID of the vault to set
      * @param vaultUri The vault URI to set
      */
    function setVaultUri(bytes16 vaultId, string memory vaultUri)
        public
        whitelistedOnly(vaultId)
    {
        notaryMapping[vaultId].vaultUri = vaultUri;
        emit VaultUri(msg.sender, vaultId, vaultUri);
    }

    /** @notice Function to set the vault hash
      * @param vaultId ID of the vault to set
      * @param vaultHash The vault hash to set
      */
    function setVaultHash(bytes16 vaultId, string memory vaultHash)
        public
        whitelistedOnly(vaultId)
    {
        notaryMapping[vaultId].vaultHash = vaultHash;
        emit VaultHash(msg.sender, vaultId, vaultHash);
    }

    /** @notice This function is only used for testing whether a Vault has been registered yet
      * @param vaultId The ID of the vault to check
      * @return A boolean, true - not registered; false - registered
      */
    function isNotRegistered(bytes16 vaultId)
        internal
        view
        returns(bool)
    {
        return notaryMapping[vaultId].vaultOwner == address(0x0);
    }

}

