pragma solidity 0.4.24;


import {Shipment} from "./Shipment.sol";


library Vault {
    event VaultUrl(bytes16 shipmentUuid, string vaultUrl);
    event VaultHash(bytes16 shipmentUuid, string vaultHash);

    function setVaultUrl(Shipment.Data storage self, bytes16 _shipmentUuid, string _vaultUrl)
        internal
    {
        require(msg.sender == self.shipper, "Only Shipper allowed to set VaultUrl");
        emit VaultUrl(_shipmentUuid, _vaultUrl);
    }

    function setVaultHash(Shipment.Data storage self, bytes16 _shipmentUuid, string _vaultHash)
        internal
    {
        require(msg.sender == self.shipper || msg.sender == self.carrier,
                "Only Shipper or Carrier allowed to set VaultHash");
        emit VaultHash(_shipmentUuid, _vaultHash);
    }
}
