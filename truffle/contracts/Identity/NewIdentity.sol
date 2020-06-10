pragma solidity 0.5.12;
pragma experimental ABIEncoderV2;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract NewIdentity is Ownable {

    enum ClaimStatus {VALID, INVALID, EXPIRED}

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

    mapping(bytes32 => address) public owners;
    //the first bytes32 is the hashed onchain ID from keccak256(idTypeString+
    //physicalIdCardString

    mapping(address => bytes32) public idMap;
    //if we only allow the contract owner to reset the wallet address, no need to
    //add recovery wallet here.
    //we will allow the contract owner and other with role "Account Recovery Service"
    //to recover the account
   // mapping(bytes32 => address) public recoveryOwners;

    struct PublicClaim {
        uint16 scheme; //the algorithm used when generating the signature
        bytes signature; // issuer address + claimType + data
        bytes32 dataHash;
        uint256 claimTemplateId;//the template ID
        uint256 nextClaimId; //the claim ID of the next claim which updates the current claim
        ClaimStatus status; //0 valid, 1 expired, 2 invalid
    }

    struct PrivateClaim {
        uint16 scheme; //the algorithm used when generating the signature
        //I think we should not put issuer address here for privacy
        bytes privateClaimHash;
        uint256 nextClaimId;
        ClaimStatus status; //0 valid, 1 expired, 2 invalid
    }

    PrivateClaim[] internal privateClaims;
    PublicClaim[] internal publicClaims;

    /**@notice Mapping to facilitate claim queries
      * first bytes32 - claim owner's onchain ID
      * first uint256 - claim template ID
      * second bytes32 - claim issuer's onchain ID
      * second uint256 - the claim ID of the first claim issued by a specific
      *                  template for a specific claim holder
      */
    mapping(bytes32 => mapping(uint256 => mapping(bytes32 => uint256))) public publicClaimView;

    /**@notice Mapping to facilitate claim queries
      * first bytes32 - claim owner's onchain ID
      * first uint256 - claim template ID
      * second bytes32 - claim issuer's onchain ID
      * second uint256 - the claim ID of the first claim issued by a specific
      *                  template for a specific claim holder
      */
    //for privacy reason, we should not define this view, should implement it in middleware
    //mapping(bytes32 => mapping(uint256 => mapping(bytes32 => uint256))) public privateClaimView;

    /**@notice Mapping for claim permissions
      * first bytes32 - claim holder's onchain ID
      * second bytes32 - claim issuer's onchain ID
      * first uint256 - the claim set ID
      * bool - represents whether the permission is given
      */
    mapping(bytes32 => mapping(bytes32 => mapping(uint256 => bool))) publicClaimPermission;

    /**@notice Mapping for claim permissions
      * first bytes32 - claim holder's onchain ID
      * second bytes32 - claim issuer's onchain ID
      * first uint256 - the claim set ID
      * bool - represents whether the permission is given
      */
    mapping(bytes32 => mapping(bytes32 => mapping(uint256 => bool))) privateClaimPermission;

    /**@dev Revert if the caller does not have the permission to add
      *@param id bytes32 representation of the onchain ID.
      *
      */
    modifier onlyIdentityOwner(bytes32 id)
    {
        require(getIdentityOwner(id) == msg.sender,
                "Only the identity owner can access this function");
        _;
    }

    function getRecoveredAddress(bytes memory sig, bytes32 dataHash)
        public
        pure
        returns (address addr)
    {
        bytes32 ra;
        bytes32 sa;
        uint8 va;

        // Check the signature length
        if (sig.length != 65) {
         return address(0);
        }

        // Divide the signature in r, s and v variables
        assembly {
            ra := mload(add(sig, 32))
            sa := mload(add(sig, 64))
            va := byte(0, mload(add(sig, 96)))
        }

        if (va < 27) {
            va += 27;
        }

        address recoveredAddress = ecrecover(dataHash, va, ra, sa);
        return (recoveredAddress);
    }

    function getIdentityOwner(bytes32 id)
        public
        view
        returns(address ownerAddress)
    {
        ownerAddress = owners[id];
    }

    function getIdentity(address addressToCheck)
        public
        view
        returns(bytes32 id)
    {
        id = idMap[addressToCheck];
    }

    //need to add a modifier to allow only identities with a role "Claim Template #0 Issuer"
    //to access this function after updating openzeppelin
    function setIdentityOwner(bytes32 id, address owner)
        public
        onlyOwner
    {
        owners[id] = owner;
        idMap[owner] = id;
    }

    function getPublicClaim(uint256 _claimId)
        public
        view
        returns(PublicClaim memory publicClaim)
    {
        publicClaim = publicClaims[_claimId];
    }

    function getPrivateClaim(uint256 _claimId)
        public
        view
        returns(PrivateClaim memory privateClaim)
    {
        privateClaim = privateClaims[_claimId];
    }

    //@dev should change the function argument PublicClaim to non-struct types before real deployment
    function addPublicClaim(bytes32 id, PublicClaim memory _publicClaim)
        public
        onlyIdentityOwner(id)
        returns (uint256 newPublicClaimID)
    {
        newPublicClaimID = publicClaims.length + 1;
        publicClaims[newPublicClaimID] = _publicClaim;
        address issuerAddress = getRecoveredAddress(_publicClaim.signature, _publicClaim.dataHash);
        publicClaimView[id][_publicClaim.claimTemplateId][getIdentity(issuerAddress)] = newPublicClaimID;
    }

    function addPrivateClaim(bytes32 id, PrivateClaim memory _privateClaim)
        public
        onlyIdentityOwner(id)
        returns (uint256 newPrivateClaimID)
    {
        newPrivateClaimID = privateClaims.length + 1;
        privateClaims[newPrivateClaimID] = _privateClaim;
    }

    function removePublicClaim(bytes32 id, uint256 _claimId)
        public
        onlyIdentityOwner(id)
    {
        publicClaims[_claimId].status = ClaimStatus.INVALID;
    }

    function removePrivateClaim(bytes32 id, uint256 _claimId)
        public
        onlyIdentityOwner(id)
    {

        privateClaims[_claimId].status = ClaimStatus.INVALID;
    }
}