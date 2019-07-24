pragma solidity 0.5.0;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract VaultNotary is Ownable {

    struct Data {
        address vaultOwner;
        string vaultHash;
        string vaultUri;
        mapping(address => bool) aclMapping;
    }

    bool private isDeprecated;

    mapping(bytes16 => VaultNotary.Data) private notaryMapping;

    // Notary Events
    event VaultUri(address indexed msgSender, bytes16 indexed vaultId, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed vaultId, string vaultHash);
    event ContractDeprecatedSet(address indexed msgSender, bool isDeprecated);
    event VaultRegistered(address indexed msgSender, bytes16 indexed vaultId);
    event UpdatePermissionGranted(address indexed msgSender, address indexed anotherAddress);
    event UpdatePermissionRevoked(address indexed msgSender, address indexed anotherAddress);

    modifier whitelistedOnly(bytes16 vaultId) {
        require(notaryMapping[vaultId].aclMapping[msg.sender]);
        _;
    }

    modifier vaultOwnerOnly(bytes16 vaultId) {
        require(msg.sender == notaryMapping[vaultId].vaultOwner);
        _;
    }

    modifier notDeprecated() {
        require(!isDeprecated, "This version of the VaultNotary contract has been deprecated");
        _;
    }

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

    function getVaultNotaryDetails(bytes16 vaultId)
        external
        view
        returns(string memory vaultUri, string memory vaultHash)
    {
        return (notaryMapping[vaultId].vaultUri, notaryMapping[vaultId].vaultHash);
    }

    function registerVault(bytes16 vaultId, string memory vaultUri, string memory vaultHash)
        public
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

    function isNotRegistered(bytes16 vaultId)
        internal
        view
        returns(bool)
    {
        return notaryMapping[vaultId].vaultOwner == address(0x0);
    }

}

