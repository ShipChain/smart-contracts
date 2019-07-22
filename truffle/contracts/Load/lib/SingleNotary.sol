pragma solidity 0.5.0;

library SingleNotary {
    //event VaultUri(address indexed msgSender, bytes16 indexed shipmentUuid, string vaultUri);
    //event VaultHash(address indexed msgSender, bytes16 indexed shipmentUuid, string vaultHash);

    struct Data {
        string vaultHash;
        string vaultUri;
    }

}