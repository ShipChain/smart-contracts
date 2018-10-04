pragma solidity 0.4.24;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";


library Escrow {
    using SafeMath for uint256;

    event EscrowFunded(bytes16 _shipmentUuid, uint256 amount, uint256 total);
    event EscrowReleased(bytes16 _shipmentUuid, uint256 amount);
    event EscrowRefunded(bytes16 _shipmentUuid, uint256 amount);
    event EscrowWithdrawn(bytes16 _shipmentUuid, uint256 amount);

    enum FundingType {NO_FUNDING, SHIP, ETHER}
    enum State {NOT_CREATED, CREATED, FUNDED, RELEASED, REFUNDED, WITHDRAWN}

    struct Data {
        /* Slot 0 */
        uint256 contractedAmount; //32 bytes
        /* Slot 1 */
        uint256 fundedAmount; //32 bytes
        /* Slot 2 */
        FundingType fundingType; //1 byte
        State state; //1 byte
    }

    function trackFunding(Data storage self, bytes16 _shipmentUuid, uint256 amount)
        internal
    {
        require(self.state == State.CREATED, "Escrow must be Created");
        require(amount > 0, "Funded amount must be non-zero");

        self.fundedAmount = self.fundedAmount.add(amount);

        if (self.fundedAmount >= self.contractedAmount) {
            self.state = State.FUNDED;
        }

        emit EscrowFunded(_shipmentUuid, amount, self.fundedAmount);
    }

    function releaseFunds(Data storage self, bytes16 _shipmentUuid)
        internal
    {
        require(self.state == State.FUNDED, "Escrow must be Funded");

        self.state = State.RELEASED;
        emit EscrowReleased(_shipmentUuid, self.fundedAmount);
    }

    function withdraw(Data storage self, bytes16 _shipmentUuid)
        internal
        returns(uint amount)
    {
        require(self.state == State.RELEASED || self.state == State.REFUNDED, "Escrow must be Released or Refunded");

        amount = self.fundedAmount;
        self.fundedAmount = 0;
        self.state = State.WITHDRAWN;
        emit EscrowWithdrawn(_shipmentUuid, amount);
    }

    function refund(Data storage self, bytes16 _shipmentUuid)
        internal
    {
        require(self.state == State.CREATED || self.state == State.FUNDED, "Escrow must be Created or Funded");

        self.state = State.REFUNDED;
        emit EscrowRefunded(_shipmentUuid, self.fundedAmount);
    }
}