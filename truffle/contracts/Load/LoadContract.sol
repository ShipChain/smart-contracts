pragma solidity 0.4.24;

import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import {Shipment} from "./lib/Shipment.sol";
import {Vault} from "./lib/Vault.sol";
import {Escrow} from "./lib/Escrow.sol";


/** @title Load Registry */
contract LoadContract is Ownable {
    using Shipment for Shipment.Data;
    using Vault for Shipment.Data;
    using Escrow for Escrow.Data;

    event ShipmentCreated(bytes16 shipmentUuid);

    event VaultUrl(bytes16 shipmentUuid, string vaultUrl);
    event VaultHash(bytes16 shipmentUuid, string vaultHash);

    event EscrowCreated(bytes16 shipmentUuid, Escrow.FundingType fundingType, uint256 contractedAmount);
    event EscrowFunded(uint256 amount);
    event EscrowReleased(uint256 amount);
    event EscrowWithdrawn(uint256 amount);

    mapping (bytes16 => Shipment.Data) private allShipmentData;
    mapping (bytes16 => Escrow.Data) private allEscrowData;

    modifier escrowHasState(bytes16 _shipmentUuid, Escrow.State _state, string message) {
        Escrow.Data storage escrow = allEscrowData[_shipmentUuid];
        require(escrow.state == Escrow.State.NOT_CREATED || escrow.state == _state, message);
        _;
    }

    modifier shipmentExists(bytes16 _shipmentUuid) {
        require(allShipmentData[_shipmentUuid].shipper != address(0x0), "Shipment does not exist");
        _;
    }

    modifier hasEscrow(bytes16 _shipmentUuid) {
        require(allEscrowData[_shipmentUuid].state != Escrow.State.NOT_CREATED, "Shipment has no escrow");
        _;
    }

    /** @notice Creates a new Shipment and stores it in the Load Registry.
      * @param _shipmentUuid bytes16 representation of the shipment's UUID.
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
    function shipper(bytes16 _shipmentUuid) public view shipmentExists(_shipmentUuid) returns(address) {
        return allShipmentData[_shipmentUuid].shipper;
    }

    /** @notice Returns the Shipment Carrier.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function carrier(bytes16 _shipmentUuid) public view shipmentExists(_shipmentUuid) returns(address) {
        return allShipmentData[_shipmentUuid].carrier;
    }

    /** @notice Returns the Shipment Moderator.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function moderator(bytes16 _shipmentUuid) public view shipmentExists(_shipmentUuid) returns(address) {
        return allShipmentData[_shipmentUuid].moderator;
    }

    /** @notice Returns the Shipment state.
      * @param _shipmentUuid bytes16 Shipment's UUID.
      */
    function shipmentState(bytes16 _shipmentUuid) public view shipmentExists(_shipmentUuid) returns(Shipment.State) {
        return allShipmentData[_shipmentUuid].state;
    }

    /** @notice Returns the Escrow state.
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function escrowState(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
        returns(Escrow.State)
    {
        return allEscrowData[_shipmentUuid].state;
    }

    /** @notice Returns the Escrow state.
      * @param _shipmentUuid bytes16 Shipment's UUID
      */
    function escrowType(bytes16 _shipmentUuid)
        public
        view
        shipmentExists(_shipmentUuid)
        hasEscrow(_shipmentUuid)
        returns(Escrow.FundingType)
    {
        return allEscrowData[_shipmentUuid].fundingType;
    }
}
