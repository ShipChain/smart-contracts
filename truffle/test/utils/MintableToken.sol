pragma solidity 0.4.24;


import {StandardToken} from "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import {Claimable} from "openzeppelin-solidity/contracts/ownership/Claimable.sol";


/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation and update of max supply
 */
contract MintableToken is StandardToken, Ownable, Claimable {
    event Mint(address indexed to, uint256 amount);
    event MintFinished();


    bool public mintingFinished = false;
    uint public maxSupply = 500000000 * (10 ** 18);//Max 500 M Tokens

    modifier canMint() {
        require(!mintingFinished);
        _;
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _to, uint256 _amount) public onlyOwner canMint returns (bool) {
        if (maxSupply < totalSupply_.add(_amount)) {
            revert();
            //Hard cap of 500M mintable tokens
        }

        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    /**
     * @dev Function to stop minting new tokens.
     * @return True if the operation was successful.
     */
    function finishMinting() public onlyOwner canMint returns (bool) {
        mintingFinished = true;
        emit MintFinished();

        return true;
    }

}