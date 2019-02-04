pragma solidity 0.5.0;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";


library Escrow {
    using SafeMath for uint256;
    using Escrow for Data;

    event EscrowDeposited(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 amount, uint256 funded);
    event EscrowFunded(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded, uint256 contracted);
    event EscrowReleased(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded);
    event EscrowRefunded(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded);
    event EscrowWithdrawn(address indexed msgSender, bytes16 indexed shipmentUuid, uint256 funded);

    enum FundingType {NO_FUNDING, SHIP, ETHER}
    enum State {NOT_CREATED, CREATED, FUNDED, RELEASED, REFUNDED, WITHDRAWN}

    uint256 public constant TIMEOUT = 90 days;

    struct Data {
        /* Slot 0 */
        uint256 contractedAmount; //32 bytes
        /* Slot 1 */
        uint256 fundedAmount; //32 bytes
        /* Slot 2 */
        uint256 createdAt; //32 bytes
        /* Slot 3 */
        FundingType fundingType; //1 byte
        State state; //1 byte
        address refundAddress; //20 bytes
    }

    function getTimeoutDate(Data storage self)
        internal
        view
        returns(uint256 timeoutDate)
    {
        timeoutDate = self.createdAt.add(TIMEOUT);
    }

    function trackFunding(Data storage self, bytes16 _shipmentUuid, uint256 amount)
        internal
    {
        require(self.state == State.CREATED, "Escrow must be Created");
        require(amount > 0, "Funded amount must be non-zero");

        self.fundedAmount = self.fundedAmount.add(amount);

        emit EscrowDeposited(msg.sender, _shipmentUuid, amount, self.fundedAmount);

        if (self.fundedAmount >= self.contractedAmount) {
            self.state = State.FUNDED;
            emit EscrowFunded(msg.sender, _shipmentUuid, self.fundedAmount, self.contractedAmount);
        }
    }

    function releaseFunds(Data storage self, bytes16 _shipmentUuid)
        internal
    {
        require(self.state == State.FUNDED, "Escrow must be Funded");

        self.state = State.RELEASED;
        emit EscrowReleased(msg.sender, _shipmentUuid, self.fundedAmount);
    }

    function withdraw(Data storage self, bytes16 _shipmentUuid)
        internal
        returns(uint amount)
    {
        require(self.state == State.RELEASED || self.state == State.REFUNDED, "Escrow must be Released or Refunded");

        amount = self.fundedAmount;
        self.fundedAmount = 0;
        self.state = State.WITHDRAWN;
        emit EscrowWithdrawn(msg.sender, _shipmentUuid, amount);
    }

    function refund(Data storage self, bytes16 _shipmentUuid)
        internal
    {
        require(self.state == State.CREATED || self.state == State.FUNDED, "Escrow must be Created or Funded");

        self.state = State.REFUNDED;
        emit EscrowRefunded(msg.sender, _shipmentUuid, self.fundedAmount);
    }
}