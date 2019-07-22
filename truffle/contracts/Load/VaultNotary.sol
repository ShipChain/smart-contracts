pragma solidity 0.5.0;


import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {SingleNotary} from "./lib/SingleNotary.sol";


contract VaultNotary is Ownable {

    mapping(bytes16 => SingleNotary.Data) private notaryMapping;
    mapping(bytes16 => address[]) private aclMapping;

        // Vault Events
    event VaultUri(address indexed msgSender, bytes16 indexed vaultId, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed vaultId, string vaultHash);

    modifier whitelistedOnly(bytes16 vaultId) {
        require(findIndex(msg.sender, aclMapping[vaultId]) != aclMapping[vaultId].length);
        _;
    }

    function registerVault(bytes16 vaultId, string calldata vaultUri, string calldata vaultHash)
    external {
        aclMapping[vaultId].push(address(msg.sender));
        setVaultUri(vaultId, vaultUri);
        setVaultHash(vaultId, vaultHash);
    }

    function grantUpdatePermission(bytes16 vaultId, address anotherAddress)
    external
    onlyOwner {
        aclMapping[vaultId].push(anotherAddress);

    }

    function revokeUpdatePermission(bytes16 vaultId, address anotherAddress)
    external
    onlyOwner {
        deleteByValue(anotherAddress, aclMapping[vaultId]);
    }

    function setVaultUri(bytes16 vaultId, string memory vaultUri)
    public
    whitelistedOnly(vaultId) {
        notaryMapping[vaultId].vaultUri = vaultUri;
        emit VaultUri(msg.sender, vaultId, vaultUri);
    }

    function setVaultHash(bytes16 vaultId, string memory vaultHash)
    public
    whitelistedOnly(vaultId) {
        notaryMapping[vaultId].vaultHash = vaultHash;
        emit VaultHash(msg.sender, vaultId, vaultHash);
    }

    //if found return the index in the range of [0, addressList.length-1]
    //if not found, return addressList.length
    function findIndex(address toCheck, address[] memory addressList)
    internal
    pure
    returns (uint256) {
        uint256 i;
        for (i = 0; i < addressList.length; i++) {
            if (toCheck == addressList[i])
                return i;
        }
        return i;
    }

    function deleteByValue(address toCheck, address[] storage addressList)
    internal {
        require(addressList.length > 0);
        uint256 index = findIndex(toCheck, addressList);
        if (index != addressList.length) {
            addressList[index] = addressList[addressList.length - 1];
            delete addressList[addressList.length - 1];
        }
    }
}

