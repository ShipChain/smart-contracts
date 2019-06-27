pragma solidity 0.5.0;


import {Shipment} from "./Shipment.sol";


library Vault {
    event VaultUri(address indexed msgSender, bytes16 indexed shipmentUuid, string vaultUri);
    event VaultHash(address indexed msgSender, bytes16 indexed shipmentUuid, string vaultHash);

    function setVaultUri(Shipment.Data storage self, bytes16 _shipmentUuid, string memory _vaultUri)
        internal
    {
        require(msg.sender == self.shipper, "Only Shipper allowed to set VaultUri");
        self.vaultUri = _vaultUri;
        emit VaultUri(msg.sender, _shipmentUuid, _vaultUri);
    }

    function setVaultHash(Shipment.Data storage self, bytes16 _shipmentUuid, string memory _vaultHash)
        internal
    {
        require(msg.sender == self.shipper || msg.sender == self.carrier,
                "Only Shipper or Carrier allowed to set VaultHash");
        self.vaultHash = _vaultHash;
        emit VaultHash(msg.sender, _shipmentUuid, _vaultHash);
    }
}
