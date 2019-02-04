pragma solidity 0.5.0;


import {ERC20Mintable} from "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import {Ownable} from "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation and update of max supply
 */
contract MintableToken is ERC20Mintable, Ownable {
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
     * @param to The address that will receive the minted tokens.
     * @param value The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 value) public onlyOwner canMint returns (bool) {
        if (maxSupply < totalSupply().add(value)) {
            revert();
            //Hard cap of 500M mintable tokens
        }

        _mint(to, value);
        emit Mint(to, value);
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