pragma solidity 0.4.24;

import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";


library Escrow {
    using SafeMath for uint256;

    event EscrowFunded(uint256 amount);
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

    // TODO: function receiveApproval(address from, uint256 amount, address token, bytes data) public {}
    function trackFunding(Data storage self, uint256 amount)
        internal
        requiredState(self, State.CREATED)
    {
        require(amount > 0);
        self.fundedAmount.add(amount);

        if (self.fundedAmount >= self.contractedAmount) {
            self.state = State.FUNDED;
        }

        emit EscrowFunded(amount);
    }

    function releaseFunds(Data storage self)
        internal
        requiredState(self, State.FUNDED)
    {
        self.state = State.RELEASED;
        emit EscrowReleased(self.fundedAmount);
    }

    function withdrawn(Data storage self)
        internal
        requiredState(self, State.RELEASED)
    {
        self.state = State.WITHDRAWN;
        emit EscrowWithdrawn(self.fundedAmount);
    }
}