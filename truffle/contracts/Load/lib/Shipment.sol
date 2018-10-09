pragma solidity 0.4.24;


library Shipment {
    event ShipmentCarrierSet(bytes16 indexed shipmentUuid, address carrier);
    event ShipmentModeratorSet(bytes16 indexed shipmentUuid, address moderator);
    event ShipmentInProgress(bytes16 indexed shipmentUuid);
    event ShipmentComplete(bytes16 indexed shipmentUuid);
    event ShipmentCanceled(bytes16 indexed shipmentUuid);

    enum State {INITIATED, IN_PROGRESS, COMPLETE, CANCELED}

    struct Data {
        /* Slot 0 */
        address shipper; //20 bytes
        /* Slot 1 */
        address carrier; //20 bytes
        /* Slot 2 */
        address moderator; //20 bytes
        State state; //1 byte
    }

    modifier isShipper(Data storage self, string message) {
        require(msg.sender == self.shipper, message);
        _;
    }

    function setCarrier(Data storage self, bytes16 _shipmentUuid, address _carrier)
        internal
        isShipper(self, "Only Shipper allowed to set Carrier")
    {
        require(self.state == State.INITIATED, "Carrier can only be modified in Initiated state");
        self.carrier = _carrier;
        emit ShipmentCarrierSet(_shipmentUuid, _carrier);
    }

    function setModerator(Data storage self, bytes16 _shipmentUuid, address _moderator)
        internal
        isShipper(self, "Only Shipper allowed to set Moderator")
    {
        require(self.state == State.INITIATED, "Moderator can only be modified in Initiated state");
        self.moderator = _moderator;
        emit ShipmentModeratorSet(_shipmentUuid, _moderator);
    }

    function setInProgress(Data storage self, bytes16 _shipmentUuid)
        internal
    {
        require(self.carrier != address(0), "Carrier must exist before marking a shipment In Progress");
        require(msg.sender == self.carrier || msg.sender == self.moderator,
            "Only Carrier or Moderator allowed to set In Progress");
        require(self.state == State.INITIATED, "Only Initiated shipments can be marked In Progress");
        self.state = State.IN_PROGRESS;
        emit ShipmentInProgress(_shipmentUuid);
    }

    function setComplete(Data storage self, bytes16 _shipmentUuid)
        internal
    {
        require(msg.sender == self.shipper || msg.sender == self.moderator,
            "Only Shipper or Moderator allowed to set Complete");
        require(self.state == State.IN_PROGRESS,
            "Only In Progress shipments can be marked Complete");
        self.state = State.COMPLETE;
        emit ShipmentComplete(_shipmentUuid);
    }

    function setCanceled(Data storage self, bytes16 _shipmentUuid)
        internal
    {
        require(self.state != State.CANCELED, "Already canceled");
        require(self.state != State.INITIATED ||
                msg.sender == self.shipper || msg.sender == self.carrier || msg.sender == self.moderator,
                "Only shipper, carrier, or moderator can cancel an Initiated shipment");
        require(self.state != State.IN_PROGRESS || msg.sender == self.carrier || msg.sender == self.moderator,
                "Only carrier or moderator can cancel an In Progress shipment");
        require(self.state != State.COMPLETE || msg.sender == self.moderator,
                "Only moderator can cancel a Completed shipment");
        self.state = State.CANCELED;
        emit ShipmentCanceled(_shipmentUuid);
    }
}