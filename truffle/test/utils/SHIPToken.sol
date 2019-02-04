pragma solidity 0.5.0;


import {MintableToken} from "./MintableToken.sol";
import {ERC20} from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";


// ----------------------------------------------------------------------------
// Contracts that can have tokens approved, and then a function executed
// ----------------------------------------------------------------------------
contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 tokens, address token, bytes memory data) public;
}


/**
 * @title SHIPToken
 */
contract SHIPToken is ERC20, ERC20Pausable, MintableToken {
    string public constant NAME = "ShipChain SHIP";
    string public constant SYMBOL = "SHIP";
    uint8 public constant DECIMALS = 18;

    uint256 public constant INITIAL_SUPPLY = 0 * (10 ** uint256(DECIMALS));

    /**
    * @dev Constructor that gives msg.sender all of existing tokens.
    */
    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
        //Max 500 M Tokens

        emit Transfer(address(0x0), msg.sender, INITIAL_SUPPLY);
    }

    function approveAndCall(address spender, uint _value, bytes memory data) public returns (bool success) {
        approve(spender, _value);
        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, _value, address(this), data);
        return true;
    }
}
