pragma solidity 0.4.24;


contract ThrowProxy {
    address public target;
    bytes private data;

    constructor (address _target) public {
        target = _target;
    }
    // solhint-disable-next-line
    function() public {
        data = msg.data;
    }

    function execute() public returns (bool) {
        // solhint-disable-next-line
        return target.call(data);
    }
}