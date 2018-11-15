pragma solidity 0.4.24;


import {Shipment} from "./Shipment.sol";


library Vault {
    event VaultUri(address indexed msgSender, bytes16 indexed shipmentUuid, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed shipmentUuid, string vaultHash);

    function setVaultUri(Shipment.Data storage self, bytes16 _shipmentUuid, string _vaultUri)
        internal
    {
        require(msg.sender == self.shipper, "Only Shipper allowed to set VaultUri");
        emit VaultUri(msg.sender, _shipmentUuid, _vaultUri);
    }

    function setVaultHash(Shipment.Data storage self, bytes16 _shipmentUuid, string _vaultHash)
        internal
    {
        require(msg.sender == self.shipper || msg.sender == self.carrier,
                "Only Shipper or Carrier allowed to set VaultHash");
        emit VaultHash(msg.sender, _shipmentUuid, _vaultHash);
    }
}
