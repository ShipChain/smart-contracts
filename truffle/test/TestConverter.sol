pragma solidity 0.5.12;

import "truffle/Assert.sol";
import { Converter } from "../contracts/Load/lib/Converter.sol";
import { ThrowProxy } from "./utils/ThrowProxy.sol";


contract TestContract {
    using Converter for bytes;

    event BytesEvent(bytes value);
    event Bytes16Event(bytes16 value);

    bytes16 public value;

    function setBytes16(bytes16 _value) external {
        value = _value;
        emit Bytes16Event(value);
    }

    function setBytes(bytes calldata _value) external {
        emit BytesEvent(_value);
        value = _value.toBytes16();
        emit Bytes16Event(value);
    }
}


contract TestConverter {
    TestContract public byteConverter;
    ThrowProxy public throwProxy;

    function beforeEach() public {
        byteConverter = new TestContract();
        throwProxy = new ThrowProxy(address(byteConverter));
    }

    function testDefaultBytesComparison() public {
        // 0x776174 == "wat"
        Assert.equal(byteConverter.value(), bytes16(0), "It should have a default value of 0");
        byteConverter.setBytes16(hex"776174");
        Assert.notEqual(byteConverter.value(), bytes16(0), "It should not have a value of 0 after setting");
        Assert.equal(byteConverter.value(), hex"776174", "It should have a value of 'wat'");
    }

    // Now do the same thing, except converting bytes to bytes16
    function testBytesConversion() public {
        // 0x776174 == "wat"
        Assert.equal(byteConverter.value(), bytes16(0), "It should have a default value of 0");
        byteConverter.setBytes(hex"776174");
        Assert.notEqual(byteConverter.value(), bytes16(0), "It should not have a value of 0 after setting");
        Assert.equal(byteConverter.value(), hex"776174", "It should have a value of 'wat'");

        byteConverter.setBytes(hex"0123456789ABCDEF0123456789ABCDEF1111");
        Assert.equal(byteConverter.value(), hex"0123456789ABCDEF0123456789ABCDEF", "It should truncate bytes > 16");

        TestContract proxyContract = TestContract(address(throwProxy));
        proxyContract.setBytes(hex"0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF99");
        bool success = throwProxy.execute.gas(200000)();
        Assert.isFalse(success, "It should not accept bytes > len 32");
    }
}
