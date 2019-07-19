pragma solidity 0.5.0;

import {WhitelistAdminRole} from "openzeppelin-solidity/contracts/access/roles/WhitelistAdminRole.sol";
import {WhitelistedRole} from "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";
import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract SingleNotary is WhitelistedRole {
    struct Data {
        string vaultHash;
        string vaultURI;
    }

    function revokeUpdatePermissionForOneVault(address anotherAddress) onlyWhitelistAdmin external {

    }

    function grantUpdatePermissionForOneVault(address anotherAddress) onlyWhitelistAdmin external {

    }

    function setVaultURIForOneVault(string calldata vaultURI) onlyWhitelisted external {
        self.vaultURI = vaultURI;
    }

}


contract VaultNotary {
    SingleNotary[] notaryArray;
    uint256 count =0;

    mapping (bytes16 => uint256) private addressToArrayIndex;
    function getNotary(bytes16 vaultId) {
        return notaryArray[addressToArrayIndex[vaultId]];
    }


    function registerVault(bytes16 vaultId, string calldata vaultURI, string calldata vaultHash) external {
        newNotary = new SingleNotary();
        count = count + 1;
        notaryArray.push(newNotary);
        addressToArrayIndex[vaultId] = count;

        getNotary(vaultId).addWhitelistAdmin(msg.sender);
        emit allNotaryData[vaultId].WhitelistAdminAdded(msg.sender);
    }

    function grantUpdatePermission(bytes16 vaultId, address anotherAddress) external {
        allNotaryData[vaultId].grantUpdatePermissionForOneVault(anotherAddress);

    }

    function revokeUpdatePermission(bytes16 vaultId, address anotherAddress) external {
        allNotaryData[vaultId].invokeUpdatePermissionForOneVault(anotherAddress);
    }

    function setVaultURI(bytes16 vaultId, string calldata vaultURI) external {
        setVaultURIForOneVault(vaultURI);
    }

    function setVaultHash(bytes16 vaultId, string calldata vaultHash) external {

    }

}

