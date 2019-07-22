pragma solidity 0.5.0;


import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {SingleNotary} from "./lib/SingleNotary.sol";


contract VaultNotary is Ownable {
   // using SingleNotary for SingleNotary.Data;
    //using SingleNotary for SingleNotary.singleAclMapping;

    mapping(bytes16 => SingleNotary) private notaryMapping;
//    mapping(bytes16 => SingleNotary.singleAclMapping) private aclMapping;

    bool private isDeprecated; //1 byte



    // Notary Events
    event VaultUri(address indexed msgSender, bytes16 indexed vaultId, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed vaultId, string vaultHash);
    event ContractDeprecatedSet(address indexed msgSender, bool isDeprecated);

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

    function registerVault(bytes16 vaultId, string calldata vaultUri, string calldata vaultHash)
    external {
        notaryMapping[vaultId].vaultOwner = msg.sender;
        notaryMapping[vaultId].aclMapping[msg.sender] = true;
        setVaultUri(vaultId, vaultUri);
        setVaultHash(vaultId, vaultHash);
    }

    function grantUpdatePermission(bytes16 vaultId, address anotherAddress)
    external
    vaultOwnerOnly(vaultId) {
        notaryMapping[vaultId].aclMapping[msg.sender] = true;
    }

    function revokeUpdatePermission(bytes16 vaultId, address anotherAddress)
    external
    vaultOwnerOnly(vaultId) {
        notaryMapping[vaultId].aclMapping[msg.sender] = false;
    }

    function setVaultUri(bytes16 vaultId, string memory vaultUri)
    public
    whitelistedOnly(vaultId) {
        notaryMapping[vaultId].Data.vaultUri = vaultUri;
        emit VaultUri(msg.sender, vaultId, vaultUri);
    }

    function setVaultHash(bytes16 vaultId, string memory vaultHash)
    public
    whitelistedOnly(vaultId) {
        notaryMapping[vaultId].Data.vaultHash = vaultHash;
        emit VaultHash(msg.sender, vaultId, vaultHash);
    }

}

