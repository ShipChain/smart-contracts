pragma solidity 0.4.24;


import {MintableToken} from "./MintableToken.sol";
import {StandardToken} from "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import {PausableToken} from "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import {CanReclaimToken} from "openzeppelin-solidity/contracts/ownership/CanReclaimToken.sol";
import {HasNoTokens} from "openzeppelin-solidity/contracts/ownership/HasNoTokens.sol";


// ----------------------------------------------------------------------------
// Contracts that can have tokens approved, and then a function executed
// ----------------------------------------------------------------------------
contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 tokens, address token, bytes data) public;
}


/**
 * @title SHIPToken
 */
//CanReclaimToken
contract SHIPToken is StandardToken, PausableToken, MintableToken, HasNoTokens {
    string public constant NAME = "ShipChain SHIP";
    string public constant SYMBOL = "SHIP";
    uint8 public constant DECIMALS = 18;

    uint256 public constant INITIAL_SUPPLY = 0 * (10 ** uint256(DECIMALS));

    /**
    * @dev Constructor that gives msg.sender all of existing tokens.
    */
    constructor() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        maxSupply = 500000000 * (10 ** uint256(DECIMALS));
        //Max 500 M Tokens

        emit Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }

    function approveAndCall(address spender, uint _value, bytes data) public returns (bool success) {
        approve(spender, _value);
        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, _value, address(this), data);
        return true;
    }
}
