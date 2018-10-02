pragma solidity 0.4.24;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";


library Escrow {
    using SafeMath for uint256;

    event EscrowFunded(uint256 amount, uint256 total);
    event EscrowReleased(uint256 amount);
    event EscrowWithdrawn(uint256 amount);

    enum FundingType {NO_FUNDING, SHIP, ETHER}
    enum State {NOT_CREATED, CREATED, FUNDED, RELEASED, WITHDRAWN}

    struct Data {
        // TODO: PACK PLS
        FundingType fundingType;
        State state;
        uint256 contractedAmount;
        uint256 fundedAmount;
    }

    modifier requiredState(Data storage self, State _requiredState) {
        require(self.state == _requiredState, "Escrow state invalid for action");
        _;
    }

    function trackFunding(Data storage self, uint256 amount)
        internal
        requiredState(self, State.CREATED)
    {
        require(amount > 0);
        self.fundedAmount = self.fundedAmount.add(amount);

        if (self.fundedAmount >= self.contractedAmount) {
            self.state = State.FUNDED;
        }

        emit EscrowFunded(amount, self.fundedAmount);
    }

    function releaseFunds(Data storage self)
        internal
        requiredState(self, State.FUNDED)
    {
        self.state = State.RELEASED;
        emit EscrowReleased(self.fundedAmount);
    }

    function withdraw(Data storage self)
        internal
        requiredState(self, State.RELEASED)
        returns(uint amount)
    {
        amount = self.fundedAmount;
        self.fundedAmount = 0;
        self.state = State.WITHDRAWN;
        emit EscrowWithdrawn(amount);
    }
}