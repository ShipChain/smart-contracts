pragma solidity 0.4.24;


library Shipment {
    enum State {INITIATED, IN_PROGRESS, COMPLETE, CANCELED }

    struct Data {
        // TODO: PACK PLS
        address shipper;
        address carrier;
        address moderator;
        State state;
    }

    modifier isShipper(Data storage self, string message) {
        require(msg.sender == self.shipper, message);
        _;
    }

    function setCarrier(Data storage self, address _carrier)
        internal
        isShipper(self, "Only Shipper allowed to set Carrier")
    {
        require(self.state == State.INITIATED, "Carrier can only be modified in Initiated state");
        self.carrier = _carrier;
    }

    function setModerator(Data storage self, address _moderator)
        internal
        isShipper(self, "Only Shipper allowed to set Moderator")
    {
        require(self.state == State.INITIATED, "Moderator can only be modified in Initiated state");
        self.moderator = _moderator;
    }

    function setInProgress(Data storage self)
        internal
    {
        require(msg.sender == self.carrier || msg.sender == self.moderator,
            "Only Carrier or Moderator allowed to set In Progress");
        require(self.state == State.INITIATED, "Only Initiated shipments can be marked In Progress");
        self.state = State.IN_PROGRESS;
    }

    function setComplete(Data storage self)
        internal
    {
        require(msg.sender == self.shipper || msg.sender == self.moderator,
            "Only Shipper or Moderator allowed to set Complete");
        require(self.state == State.IN_PROGRESS,
            "Only In Progress shipments can be marked Complete");
        self.state = State.COMPLETE;
    }
}