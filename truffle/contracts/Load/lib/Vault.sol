pragma solidity 0.4.24;


import {Shipment} from "./Shipment.sol";


library Vault {
    event VaultUri(bytes16 shipmentUuid, string vaultUri);
    event VaultHash(bytes16 shipmentUuid, string vaultHash);

    function setVaultUri(Shipment.Data storage self, bytes16 _shipmentUuid, string _vaultUri)
        internal
    {
        require(msg.sender == self.shipper, "Only Shipper allowed to set VaultUri");
        emit VaultUri(_shipmentUuid, _vaultUri);
    }

    function setVaultHash(Shipment.Data storage self, bytes16 _shipmentUuid, string _vaultHash)
        internal
    {
        require(msg.sender == self.shipper || msg.sender == self.carrier,
                "Only Shipper or Carrier allowed to set VaultHash");
        emit VaultHash(_shipmentUuid, _vaultHash);
    }
}
