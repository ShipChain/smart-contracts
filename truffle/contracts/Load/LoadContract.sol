pragma solidity 0.4.24;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

import {Shipment} from "./lib/Shipment.sol";
import {Vault} from "./lib/Vault.sol";
import {Escrow} from "./lib/Escrow.sol";
import {Converter} from "./lib/Converter.sol";


/** @title Load Contract */
contract LoadContract is Ownable {

    // Library namespaces
    using Converter for bytes;
    using Shipment for Shipment.Data;
    using Vault for Shipment.Data;
    using Escrow for Escrow.Data;

    // Registry Events
    event TokenContractAddressSet(address tokenContractAddress);

    // Shipment Events
    event ShipmentCreated(bytes16 shipmentUuid);

    // Vault Events
    event VaultUrl(bytes16 shipmentUuid, string vaultUrl);
    event VaultHash(bytes16 shipmentUuid, string vaultHash);

    // Escrow Events
    event EscrowCreated(bytes16 shipmentUuid, Escrow.FundingType fundingType, uint256 contractedAmount);
    event EscrowFunded(uint256 amount, uint256 total);
    event EscrowReleased(uint256 amount);
    event EscrowWithdrawn(uint256 amount);

    // Library data storage
    mapping (bytes16 => Shipment.Data) private allShipmentData;
    mapping (bytes16 => Escrow.Data) private allEscrowData;

    address private shipTokenContractAddress;

    /** @dev Revert if shipment has an escrow and escrow state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _state Escrow.State required state if escrow exists.
      * @param _message string Revert message.
      */
    modifier escrowHasState(bytes16 _shipmentUuid, Escrow.State _state, string _message) {
        requireEscrowHasState(_shipmentUuid, _state, _message);
        _;
    }

    /** @dev Revert if shipment has an escrow and escrow state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _fundingType Escrow.FundingType required funding type if escrow exists.
      * @param _message string Revert message.
      */
    modifier escrowHasType(bytes16 _shipmentUuid, Escrow.FundingType _fundingType, string _message) {
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

    /** @notice Does not accept Ether.
      * @dev Prevent fallthrough method from accepting ETH
      */
    function () public payable {revert();}

    /** @notice Sets the SHIPToken Contract address.  Only tokens from this address will be accepted.
      * @dev Only Owner
      */
    function setShipTokenContractAddress(address _shipTokenAddress)
        external
        onlyOwner
    {
        require(shipTokenContractAddress == address(0x0), "Token address already set");

        shipTokenContractAddress = _shipTokenAddress;

        emit TokenContractAddressSet(shipTokenContractAddress);
    }

    /** @notice Creates a new Shipment and stores it in the Load Registry.
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _fundingType Escrow.FundingType Type of funding for the escrow.  Can be NO_FUNDING for no escrow.
      * @param _contractedAmount uint256 Escrow token/ether amount if escrow is defined.
      * @dev Emits ShipmentCreated on success.
      */
    function createNewShipment(bytes16 _shipmentUuid, Escrow.FundingType _fundingType,
        uint256 _contractedAmount)
        external
    {
        if (_fundingType != Escrow.FundingType.NO_FUNDING) {
            require(_fundingType == Escrow.FundingType.SHIP ||
                    _fundingType == Escrow.FundingType.ETHER, "Invalid Funding Type");
            require(_contractedAmount > 0, "Escrow must have an amount");

            Escrow.Data storage escrow = allEscrowData[_shipmentUuid];
            require(escrow.state == Escrow.State.NOT_CREATED, "Escrow already exists");
        }

        Shipment.Data storage shipment = allShipmentData[_shipmentUuid];
        require(shipment.shipper == address(0x0), "Shipment already exists");

        shipment.shipper = msg.sender;

        emit ShipmentCreated(_shipmentUuid);

        if (_fundingType != Escrow.FundingType.NO_FUNDING) {
            escrow.state = Escrow.State.CREATED;
            escrow.fundingType = _fundingType;
            escrow.contractedAmount = _contractedAmount;

            emit EscrowCreated(_shipmentUuid, _fundingType, _contractedAmount);
        }
    }

    /** @notice Associates a Vault URL with this Shipment.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      * @param _vaultUrl string URL of the external vault.
      * @dev Emits VaultUrl on success
      */
    function setVaultUrl(bytes16 _shipmentUuid, string _vaultUrl)
        external
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setVaultUrl(_shipmentUuid, _vaultUrl);
    }

    /** @notice Associates a Vault Hash with this Shipment.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      * @param _vaultHash string Hash of the external vault.
      * @dev Emits VaultHash on success.
      */
    function setVaultHash(bytes16 _shipmentUuid, string _vaultHash)
        external
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setVaultHash(_shipmentUuid, _vaultHash);
    }

    /** @notice Defines the Carrier for this Shipment.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      * @param _carrier address Wallet of the Carrier.
      */
    function setCarrier(bytes16 _shipmentUuid, address _carrier)
        public
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setCarrier(_carrier);
    }

    /** @notice Defines the Moderator for this Shipment.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      * @param _moderator address Wallet of the Moderator.
      */
    function setModerator(bytes16 _shipmentUuid, address _moderator)
        public
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setModerator(_moderator);
    }

    /** @notice Updates the Shipment state to "In Progress".
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function setInProgress(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
        escrowHasState(_shipmentUuid, Escrow.State.FUNDED, "Escrow must be Funded")
    {
        allShipmentData[_shipmentUuid].setInProgress();
    }

    /** @notice Updates the Shipment state to "Complete".
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function setComplete(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
    {
        allShipmentData[_shipmentUuid].setComplete();
    }

    /** @notice Returns the Shipment Shipper.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function getShipper(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        returns(address shipper)
    {
        return allShipmentData[_shipmentUuid].shipper;
    }

    /** @notice Returns the Shipment Carrier.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function getCarrier(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        returns(address carrier)
    {
        return allShipmentData[_shipmentUuid].carrier;
    }

    /** @notice Returns the Shipment Moderator.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function getModerator(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        returns(address moderator)
    {
        return allShipmentData[_shipmentUuid].moderator;
    }

    /** @notice Returns the Shipment state.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function getShipmentState(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        returns(Shipment.State shipmentState)
    {
        return allShipmentData[_shipmentUuid].state;
    }

    /** @notice Returns the Escrow state.
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function getEscrowState(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        returns(Escrow.State escrowState)
    {
        return allEscrowData[_shipmentUuid].state;
    }

    /** @notice Returns the Escrow funding type.
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function getEscrowFundingType(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        returns(Escrow.FundingType escrowFundingType)
    {
        return allEscrowData[_shipmentUuid].fundingType;
    }

    /** @notice Returns the Escrow funding type.
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function fundEscrowEther(bytes16 _shipmentUuid)
        public
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
        escrowHasState(_shipmentUuid, Escrow.State.CREATED, "Escrow must be created")
        escrowHasType(_shipmentUuid, Escrow.FundingType.ETHER, "Escrow funding type must be Ether")
        payable
    {
        allEscrowData[_shipmentUuid].trackFunding(msg.value);
    }

    /** @notice Called from ERC20 SHIPToken after approveAndCall.
      * @param from address Sender of the tokens
      * @param amount uint256 amount of tokens sent to escrow
      * @param token address SHIPToken address
      * @param data bytes Extra data containing the bytes16 shipmentUuid
      */
    function receiveApproval(address from, uint256 amount, address token, bytes data)
        public
    {
        bytes16 _shipmentUuid = data.toBytes16();
        require(msg.sender == shipTokenContractAddress, "Ship Token address does not match");
        requireShipmentExists(_shipmentUuid);
        requireHasEscrow(_shipmentUuid);
        requireEscrowHasState(_shipmentUuid, Escrow.State.CREATED, "Escrow must be created");
        requireEscrowHasType(_shipmentUuid, Escrow.FundingType.SHIP, "Escrow funding type must be SHIP");

        allEscrowData[_shipmentUuid].trackFunding(amount);

        if (!ERC20(token).transferFrom(from, address(this), amount)) {
            revert();
        }

    }

    /** @dev Revert if shipment has an escrow and escrow state is not correct
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
      * @param _state Escrow.State required state if escrow exists.
      * @param _message string Revert message.
      */
    function requireEscrowHasState(bytes16 _shipmentUuid, Escrow.State _state, string _message)
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
    function requireEscrowHasType(bytes16 _shipmentUuid, Escrow.FundingType _fundingType, string _message)
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
        require(allShipmentData[_shipmentUuid].shipper != address(0x0), "Shipment does not exist");
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
}
