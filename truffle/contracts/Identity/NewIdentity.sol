pragma solidity ^0.5.12;
pragma experimental ABIEncoderV2;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// **Warning!** This file is a protoype version of our work around ERC 725.
// This file is now out of date and **should not be used**.
// Our current identity contracts are here:
// https://github.com/OriginProtocol/origin/tree/master/origin-contracts/contracts/identity

contract NewIdentity is Ownable {

    // event ClaimRequested(uint256 indexed claimRequestId, uint256 indexed claimType, uint256 scheme,
    //                          address indexed issuer, bytes signature, bytes data, string uri);

    // event ClaimAdded(bytes32 indexed claimId, uint256 indexed claimType, address indexed issuer,
    //                          uint256 signatureType, bytes32 signature, bytes claim, string uri);

    // event ClaimAdded(bytes32 indexed claimId, uint256 indexed claimType, uint256 scheme,
    //                          address indexed issuer, bytes signature, bytes data, string uri);

    // event ClaimRemoved(bytes32 indexed claimId, uint256 indexed claimType, uint256 scheme,
    //                          address indexed issuer, bytes signature, bytes data, string uri);

    // event ClaimChanged(bytes32 indexed claimId, uint256 indexed claimType, uint256 scheme,
    //                          address indexed issuer, bytes signature, bytes
    //                          data, string uri);
                        
    mapping(bytes16 => address) public owners;//the first bytes16 is the hashed
                                              //onchain ID
    mapping(bytes16 => address) public recoveryOwners;

    struct PublicClaim {
        uint16 scheme; //the algorithm used when generating the signature
        bytes signature; // issuer address + claimType + data
        uint256 claimTemplateId;//the template ID
        uint256 nextClaimId; //the claim ID of the next claim which updates the current claim
        uint8 status; //0 valid, 1 expired, 2 invalid
    }

    struct PrivateClaim {
        uint16 scheme; //the algorithm used when generating the signature
        bytes privateClaimHash;
        uint256 nextClaimId;
        uint8 status; //0 valid, 1 expired, 2 invalid
    }

    PrivateClaim[] internal privateClaims;
    PublicClaim[] internal publicClaims;


    mapping(bytes16 => mapping(uint256 => mapping(bytes16 => uint256))) public publicClaimView;
       //first bytes16 - claim owner's onchain ID
       //second uint256 - claim template ID
       //third bytes16 - claim issuer's onchain ID
       //fourth uint256 - the claim ID of the first claim issued by a specific
       //claim template for a specific claim holder

    mapping(bytes16 => mapping(uint256 => mapping(bytes16 => uint256))) public privateClaimView;
       //first bytes16 - claim owner's onchain ID
       //second uint256 - claim template ID
       //third bytes16 - claim issuer's onchain ID
       //fourth uint256 - the claim ID of the first claim issued by a specific
       //claim template for a specific claim holder

    function setIdentityOwner(bytes16 ID, address owner)
      public
      onlyOwner
    {
        owners[ID] = owner;
    }


    function getPublicClaim(uint256 _claimId) public view returns(PublicClaim memory publicClaim);

    function getPrivateClaim(uint256 _claimId) public view returns(PrivateClaim memory privateClaim);

    function addPublicClaim(PublicClaim memory _publicClaim) public returns (uint32 newPublicClaimID);

    function addPrivateClaim(PrivateClaim memory _privateClaim) public returns (uint32 newPrivateClaimID);

    function removePublicClaim(bytes32 _claimId) public returns (bool success);

    function removePrivateClaim(bytes32 _claimId) public returns (bool success);
}
