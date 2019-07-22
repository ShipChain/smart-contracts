pragma solidity 0.5.0;


import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {SingleNotary} from "./lib/SingleNotary.sol";


contract VaultNotary is Ownable {

    mapping(bytes16 => SingleNotary.Data) private notaryMapping;
    mapping(bytes16 => address[]) private aclMapping;


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

    modifier whitelistedOnly(bytes16 vaultId) {
        require(findIndex(msg.sender, aclMapping[vaultId]) != aclMapping[vaultId].length);
        _;
    }

    function registerVault(bytes16 vaultId, string calldata vaultURI, string calldata vaultHash)
    external {
        aclMapping[vaultId].push(address(msg.sender));
        setVaultURI(vaultId, vaultURI);
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

    function setVaultURI(bytes16 vaultId, string memory vaultURI)
    public
    whitelistedOnly(vaultId) {
        notaryMapping[vaultId].vaultURI = vaultURI;
    }

    function setVaultHash(bytes16 vaultId, string memory vaultHash)
    public
    whitelistedOnly(vaultId) {
        notaryMapping[vaultId].vaultHash = vaultHash;
    }

}

