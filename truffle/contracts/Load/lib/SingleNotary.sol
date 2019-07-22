pragma solidity 0.5.0;

library SingleNotary {

    mapping(address => bool) private aclMapping;
    address private vaultOwner;

    struct Data {
        string vaultHash;
        string vaultUri;
    }

}