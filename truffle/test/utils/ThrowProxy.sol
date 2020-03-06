pragma solidity 0.5.12;


contract ThrowProxy {
    address public target;
    bytes private data;

    constructor (address _target) public {
        target = _target;
    }
    // solhint-disable-next-line
    function() external {
        data = msg.data;
    }

    function execute() public returns (bool) {
        // solhint-disable-next-line
        (bool success, ) = target.call(data);
        return success;
    }
}