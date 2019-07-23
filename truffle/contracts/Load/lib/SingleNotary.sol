pragma solidity 0.5.0;

library SingleNotary {

    struct Data {
        address vaultOwner;
        string vaultHash;
        string vaultUri;
        mapping(address => bool) aclMapping;
    }

}