pragma solidity 0.5.11;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

import {Shipment} from "./lib/Shipment.sol";
import {Escrow} from "./lib/Escrow.sol";
import {Converter} from "./lib/Converter.sol";


/** @title Load Contract */
contract LoadContract is Ownable {
    // Constants
    uint private constant MAX_SHIP_SUPPLY = 500000000 * (10 ** 18);
    uint private constant MAX_ETH_SUPPLY = 100000000 * (10 ** 18); // Approximation of 100M maximum Ether

    // Library namespaces
    using Converter for bytes;
    using Shipment for Shipment.Data;
    using Escrow for Escrow.Data;

    // Registry Events
    event ContractDeprecatedSet(address indexed msgSender, bool isDeprecated);
    event TokenContractAddressSet(address indexed msgSender, address tokenContractAddress);
    event EscrowRefundAddressSet(address indexed msgSender, bytes16 indexed shipmentUuid, address refundAddress);

    // Shipment Events
    event ShipmentCreated(address indexed msgSender, bytes16 indexed shipmentUuid);
    event ShipmentCarrierSet(address indexed msgSender, bytes16 indexed shipmentUuid, address carrier);
    event ShipmentModeratorSet(address indexed msgSender, bytes16 indexed shipmentUuid, address moderator);
    event ShipmentInProgress(address indexed msgSender, bytes16 indexed shipmentUuid);
    event ShipmentComplete(address indexed msgSender, bytes16 indexed shipmentUuid);
    event ShipmentCanceled(address indexed msgSender, bytes16 indexed shipmentUuid);


    // Escrow Events
    event EscrowDeposited(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 amount, uint256 funded);
    event EscrowFunded(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded, uint256 contracted);
    event EscrowReleased(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded);
    event EscrowRefunded(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded);
    event EscrowWithdrawn(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded);

    event EscrowCreated(address indexed msgSender, bytes16 indexed shipmentUuid, Escrow.FundingType fundingType,
                        uint256 contractedAmount, uint256 createdAt);

    /* Slot 0 */
    address private shipTokenContractAddress; // 20 bytes
    bool private isDeprecated; //1 byte

    // Library data storage
    /* Slot 1 */
    mapping (bytes16 => Shipment.Data) private allShipmentData;
    /* Slot 2 */
    mapping (bytes16 => Escrow.Data) private allEscrowData;

    /** @dev Revert if the contract has been deprecated */
    modifier notDeprecated() {
        require(!isDeprecated, "This version of the LOAD contract has been deprecated");
        _;
    }

    /** @dev Revert if shipment state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _state Shipment.State required state.
      * @param _message string Revert message.
      */
    modifier shipmentHasState(bytes16 _shipmentUuid, Shipment.State _state, string memory _message) {
        require(allShipmentData[_shipmentUuid].state == _state, _message);
        _;
    }

    /** @dev Revert if shipment has an escrow and escrow state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _state Escrow.State required state if escrow exists.
      * @param _message string Revert message.
      */
    modifier escrowHasState(bytes16 _shipmentUuid, Escrow.State _state, string memory _message) {
        requireEscrowHasState(_shipmentUuid, _state, _message);
        _;
    }

    /** @dev Revert if shipment has an escrow and escrow state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _fundingType Escrow.FundingType required funding type if escrow exists.
      * @param _message string Revert message.
      */
    modifier escrowHasType(bytes16 _shipmentUuid, Escrow.FundingType _fundingType, string memory _message) {
        requireEscrowHasType(_shipmentUuid, _fundingType, _message);
        _;
    }

    /** @dev Revert if shipment does not exist
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      */
    modifier shipmentExists(bytes16 _shipmentUuid) {
        requireShipmentExists(_shipmentUuid);
        _;
    }

    /** @dev Revert if shipment does not have escrow
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      */
    modifier hasEscrow(bytes16 _shipmentUuid) {
        requireHasEscrow(_shipmentUuid);
        _;
    }

    /** @dev Revert if Shipper is not the Escrow funder
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param from address Wallet of the Escrow funder
      */
    modifier canFund(bytes16 _shipmentUuid, address from) {
        requireCanFund(_shipmentUuid, from);
        _;
    }

    /** @dev Revert if msg.sender is not the shipment moderator or shipper
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      */
    modifier canRelease(bytes16 _shipmentUuid) {
        require(msg.sender == allShipmentData[_shipmentUuid].moderator ||
                msg.sender == allShipmentData[_shipmentUuid].shipper,
                "Only the shipper or moderator can release escrow");
        _;
    }

    /** @dev Revert if msg.sender is not the shipment moderator or shipper
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      */
    modifier canRefund(bytes16 _shipmentUuid) {
        if (now < allEscrowData[_shipmentUuid].getTimeoutDate()) {
            require(msg.sender == owner() || (msg.sender == allShipmentData[_shipmentUuid].moderator &&
                                            allShipmentData[_shipmentUuid].state == Shipment.State.CANCELED),
                    "Refunds can only be issued to Canceled shipments by the Moderator");
        } else {
            require(msg.sender == owner() || msg.sender == allShipmentData[_shipmentUuid].shipper ||
                    msg.sender == allShipmentData[_shipmentUuid].carrier ||
                    msg.sender == allShipmentData[_shipmentUuid].moderator,
                    "Only the members of the shipment can refund escrow");
        }
        _;
    }

    /** @dev Revert if msg.sender is not the shipment carrier
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      */
    modifier canWithdraw(bytes16 _shipmentUuid) {
        require((msg.sender == allShipmentData[_shipmentUuid].carrier &&
                allEscrowData[_shipmentUuid].state == Escrow.State.RELEASED) ||
                (msg.sender == allEscrowData[_shipmentUuid].refundAddress &&
                allEscrowData[_shipmentUuid].state == Escrow.State.REFUNDED),
                "Escrow can only be withdrawn by carrier if released or by shipper if refunded");
        _;
    }

    /** @notice Sets the contract isDeprecated flag. Shipment creation will be disabled if isDeprecated == True
      * @dev Only Owner
      */
    function setDeprecated(bool _isDeprecated)
        external
        onlyOwner
    {
        isDeprecated = _isDeprecated;
        emit ContractDeprecatedSet(msg.sender, isDeprecated);
    }

    /** @notice Sets the SHIPToken Contract address.  Only tokens from this address will be accepted.
      * @dev Only Owner
      */
    function setShipTokenContractAddress(address _shipTokenAddress)
        external
        onlyOwner
    {
        require(_shipTokenAddress != address(0x0), "Must provide a token address");
        require(shipTokenContractAddress == address(0x0), "Token address already set");

        shipTokenContractAddress = _shipTokenAddress;

        emit TokenContractAddressSet(msg.sender, shipTokenContractAddress);
    }

    /** @notice Sets the shipment escrow refund address.  Refunds will be paid out to this address.
      * @dev Only Owner
      */
    function setEscrowRefundAddress(bytes16 _shipmentUuid, address _refundAddress)
        external
        onlyOwner
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
    {
        require(_refundAddress != address(0x0), "Must provide a refund address");

        allEscrowData[_shipmentUuid].refundAddress = _refundAddress;

        emit EscrowRefundAddressSet(msg.sender, _shipmentUuid, _refundAddress);
    }

    /** @notice Creates a new Shipment and stores it in the Load Registry.
                This one will set the carrier address.
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _fundingType Escrow.FundingType Type of funding for the escrow.  Can be NO_FUNDING for no escrow.
      * @param _contractedAmount uint256 Escrow token/ether amount if escrow is
      defined.
      * @param _carrierAddress address The address of the carrier for this shipment
      * @dev Emits ShipmentCreated on success.
      */
    function createNewShipment(bytes16 _shipmentUuid, Escrow.FundingType
    _fundingType, uint256 _contractedAmount, address _carrierAddress)
        public 
        notDeprecated
    {
        Escrow.Data storage escrow = allEscrowData[_shipmentUuid];
        if (_fundingType != Escrow.FundingType.NO_FUNDING) {
            require(_fundingType == Escrow.FundingType.SHIP ||
                    _fundingType == Escrow.FundingType.ETHER, "Invalid Funding Type");
            require(_contractedAmount > 0, "Escrow must have an amount");
            require(_fundingType == Escrow.FundingType.SHIP && _contractedAmount < MAX_SHIP_SUPPLY ||
                    _fundingType == Escrow.FundingType.ETHER && _contractedAmount < MAX_ETH_SUPPLY,
                    "Escrow amount must be less than max supply");
            require(_fundingType != Escrow.FundingType.SHIP || shipTokenContractAddress != address(0x0),
                    "Token address must be set");
            require(escrow.state == Escrow.State.NOT_CREATED, "Escrow already exists");
        } else {
            require(_contractedAmount == 0x0, "Cannot specify a contracted amount for a shipment with no escrow");
        }

        Shipment.Data storage shipment = allShipmentData[_shipmentUuid];
        require(shipment.state == Shipment.State.NOT_CREATED, "Shipment already exists");

        shipment.state = Shipment.State.CREATED;
        shipment.shipper = msg.sender;

        emit ShipmentCreated(msg.sender, _shipmentUuid);

        if (_carrierAddress != address(0x0))
            setCarrier(_shipmentUuid, _carrierAddress);


        if (_fundingType != Escrow.FundingType.NO_FUNDING) {
            escrow.state = Escrow.State.CREATED;
            escrow.fundingType = _fundingType;
            escrow.contractedAmount = _contractedAmount;
            escrow.createdAt = now;
            escrow.refundAddress = shipment.shipper;

            emit EscrowCreated(msg.sender, _shipmentUuid, _fundingType, _contractedAmount, escrow.createdAt);
        }
    }
 
    /** @notice Defines the Carrier for this Shipment.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      * @param _carrier address Wallet of the Carrier.
      */
    function setCarrier(bytes16 _shipmentUuid, address _carrier)
        public
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setCarrier(_shipmentUuid, _carrier);
    }

    /** @notice Defines the Moderator for this Shipment.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      * @param _moderator address Wallet of the Moderator.
      */
    function setModerator(bytes16 _shipmentUuid, address _moderator)
        public
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setModerator(_shipmentUuid, _moderator);
    }

    /** @notice Updates the Shipment state to "In Progress".
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function setInProgress(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
        escrowHasState(_shipmentUuid, Escrow.State.FUNDED, "Escrow must be Funded")
    {
        allShipmentData[_shipmentUuid].setInProgress(_shipmentUuid);
    }

    /** @notice Updates the Shipment state to "Complete".
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function setComplete(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setComplete(_shipmentUuid);
    }

    /** @notice Updates the Shipment state to "Canceled".
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function setCanceled(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setCanceled(_shipmentUuid);
    }

    /** @notice Returns the Shipment data.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function getShipmentData(bytes16 _shipmentUuid)
        public
        view
        returns(address shipper, address carrier, address moderator,
        Shipment.State state)
    {
        shipper = allShipmentData[_shipmentUuid].shipper;
        carrier = allShipmentData[_shipmentUuid].carrier;
        moderator = allShipmentData[_shipmentUuid].moderator;
        state = allShipmentData[_shipmentUuid].state;
    }

    /** @notice Returns the Escrow state.
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function getEscrowData(bytes16 _shipmentUuid)
        public
        view
        returns(uint256 contractedAmount, uint256 fundedAmount, uint256 createdAt, Escrow.FundingType fundingType,
                Escrow.State state, address refundAddress)
    {
        contractedAmount = allEscrowData[_shipmentUuid].contractedAmount;
        fundedAmount = allEscrowData[_shipmentUuid].fundedAmount;
        createdAt = allEscrowData[_shipmentUuid].createdAt;
        fundingType = allEscrowData[_shipmentUuid].fundingType;
        state = allEscrowData[_shipmentUuid].state;
        refundAddress = allEscrowData[_shipmentUuid].refundAddress;
    }

    /** @notice Returns the Escrow funding type.
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function fundEscrowEther(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
        canFund(_shipmentUuid, msg.sender)
        escrowHasState(_shipmentUuid, Escrow.State.CREATED, "Escrow must be created")
        escrowHasType(_shipmentUuid, Escrow.FundingType.ETHER, "Escrow funding type must be Ether")
        payable
    {
        allEscrowData[_shipmentUuid].trackFunding(_shipmentUuid, msg.value);
    }

    /** @notice Called from ERC20 SHIPToken after approveAndCall.
      * @param from address Sender of the tokens
      * @param amount uint256 amount of tokens sent to escrow
      * @param token address SHIPToken address
      * @param data bytes Extra data containing the bytes16 shipmentUuid
      */
    function receiveApproval(address from, uint256 amount, address token, bytes memory data)
        public
    {
        bytes16 _shipmentUuid = data.toBytes16();
        require(msg.sender == shipTokenContractAddress && token == shipTokenContractAddress,
                "SHIP token address does not match");
        // Following require functions should match the modifiers on fundEscrowEther above
        requireShipmentExists(_shipmentUuid);
        requireHasEscrow(_shipmentUuid);
        requireCanFund(_shipmentUuid, from);
        requireEscrowHasState(_shipmentUuid, Escrow.State.CREATED, "Escrow must be created");
        requireEscrowHasType(_shipmentUuid, Escrow.FundingType.SHIP, "Escrow funding type must be SHIP");

        allEscrowData[_shipmentUuid].trackFunding(_shipmentUuid, amount);

        ERC20(token).transferFrom(from, address(this), amount);
    }

    /** @notice Releases the escrow to the carrier
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function releaseEscrow(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
        canRelease(_shipmentUuid)
        escrowHasState(_shipmentUuid, Escrow.State.FUNDED, "Escrow must be Funded")
        shipmentHasState(_shipmentUuid, Shipment.State.COMPLETE, "Shipment must be Complete")
    {
        allEscrowData[_shipmentUuid].releaseFunds(_shipmentUuid);
    }

    /** @notice Withdraws the escrow to the sender's account
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function withdrawEscrow(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
        canWithdraw(_shipmentUuid)
    {
        require(allEscrowData[_shipmentUuid].fundingType != Escrow.FundingType.SHIP ||
                shipTokenContractAddress != address(0x0), "Token address must be set");

        uint amount = allEscrowData[_shipmentUuid].withdraw(_shipmentUuid);
        if (allEscrowData[_shipmentUuid].fundingType == Escrow.FundingType.ETHER) {
            msg.sender.transfer(amount);
        } else if (allEscrowData[_shipmentUuid].fundingType == Escrow.FundingType.SHIP) {
            ERC20(shipTokenContractAddress).transfer(msg.sender, amount);
        }
    }

    /** @notice Allows shipper to retrieve escrow
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function refundEscrow(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
        canRefund(_shipmentUuid)
    {
        allEscrowData[_shipmentUuid].refund(_shipmentUuid);
    }

    /** @dev Revert if shipment has an escrow and escrow state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _state Escrow.State required state if escrow exists.
      * @param _message string Revert message.
      */
    function requireEscrowHasState(bytes16 _shipmentUuid, Escrow.State _state, string memory _message)
        private
        view
    {
        require(allEscrowData[_shipmentUuid].state == Escrow.State.NOT_CREATED ||
                allEscrowData[_shipmentUuid].state == _state, _message);
    }

    /** @dev Revert if shipment has an escrow and escrow state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _fundingType Escrow.FundingType required funding type if escrow exists.
      * @param _message string Revert message.
      */
    function requireEscrowHasType(bytes16 _shipmentUuid, Escrow.FundingType _fundingType, string memory _message)
        private
        view
    {
        require(allEscrowData[_shipmentUuid].state == Escrow.State.NOT_CREATED ||
                allEscrowData[_shipmentUuid].fundingType == _fundingType, _message);
    }

    /** @dev Revert if shipment does not exist
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      */
    function requireShipmentExists(bytes16 _shipmentUuid)
        private
        view
    {
        require(allShipmentData[_shipmentUuid].state != Shipment.State.NOT_CREATED, "Shipment does not exist");
    }

    /** @dev Revert if shipment does not have escrow
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      */
    function requireHasEscrow(bytes16 _shipmentUuid)
        private
        view
    {
        require(allEscrowData[_shipmentUuid].state != Escrow.State.NOT_CREATED, "Shipment has no escrow");
    }

    /** @dev Revert if Shipper is not the Escrow funder
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param from address Wallet of the Escrow funder
      */
    function requireCanFund(bytes16 _shipmentUuid, address from)
        private
        view
    {
        require(allShipmentData[_shipmentUuid].shipper == from, "Only the shipper can fund escrow");
    }
}
