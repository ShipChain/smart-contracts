pragma solidity 0.5.0;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract VaultNotary is Ownable {

    struct Data {
        //the address of the Vault owner
        address vaultOwner;

        string vaultHash;
        string vaultUri;

        //the access control mapping to record whether an address can update the Uri and Hash of a Vault
        mapping(address => bool) aclMapping;
    }

    bool internal isDeprecated;

    //each Vault has its own struct Data
    mapping(bytes16 => VaultNotary.Data) internal notaryMapping;

    // Notary Events
    event VaultUri(address indexed msgSender, bytes16 indexed vaultId, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed vaultId, string vaultHash);
    event VaultRegistered(address indexed msgSender, bytes16 indexed vaultId);
    event UpdatePermissionGranted(address indexed msgSender, address indexed anotherAddress);
    event UpdatePermissionRevoked(address indexed msgSender, address indexed anotherAddress);

    // Contract Events
    event ContractDeprecatedSet(address indexed msgSender, bool isDeprecated);

    // Modifier for limit the access to vaultUri and vaultHash update
    modifier whitelistedOnly(bytes16 vaultId) {
        require(notaryMapping[vaultId].aclMapping[msg.sender]);
        _;
    }

    // Modifier for limit the access to grant and revoke permissions
    // Only the owner of a Vault can do that
    modifier vaultOwnerOnly(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner);
        _;
    }

    // If we upgrade the version of the contract, the old contract will not be allowed to register new Vault anymore
    // However, the existing Vaults registered in that contract should still be able to be updated
    modifier notDeprecated() {
        require(!isDeprecated, "This version of the VaultNotary contract has been deprecated");
        _;
    }

    /** @notice Sets the contract isDeprecated flag. Vault registration will be disabled if isDeprecated == True
      * @dev Only contract owner can set this
      */
    function setDeprecated(bool _isDeprecated)
        external
        onlyOwner
    {
        isDeprecated = _isDeprecated;
        emit ContractDeprecatedSet(msg.sender, isDeprecated);
    }

    function grantUpdatePermission(bytes16 vaultId, address anotherAddress)
        external
        vaultOwnerOnly(vaultId)
    {
        require(!isNotRegistered(vaultId));
        notaryMapping[vaultId].aclMapping[anotherAddress] = true;
        emit UpdatePermissionGranted(msg.sender, anotherAddress);
    }

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
      */
    function getVaultNotaryDetails(bytes16 vaultId)
        external
        view
        returns(string memory vaultUri, string memory vaultHash)
    {
        return (notaryMapping[vaultId].vaultUri, notaryMapping[vaultId].vaultHash);
    }

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

    function setVaultUri(bytes16 vaultId, string memory vaultUri)
        public
        whitelistedOnly(vaultId)
    {
        notaryMapping[vaultId].vaultUri = vaultUri;
        emit VaultUri(msg.sender, vaultId, vaultUri);
    }

    function setVaultHash(bytes16 vaultId, string memory vaultHash)
        public
        whitelistedOnly(vaultId)
    {
        notaryMapping[vaultId].vaultHash = vaultHash;
        emit VaultHash(msg.sender, vaultId, vaultHash);
    }

    /**@notice: This function is only used for testing whether a Vault has been registered yet
      */
    function isNotRegistered(bytes16 vaultId)
        internal
        view
        returns(bool)
    {
        return notaryMapping[vaultId].vaultOwner == address(0x0);
    }

}

