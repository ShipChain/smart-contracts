pragma solidity 0.4.24;


library Converter {
    function toBytes16(bytes self) internal pure returns (bytes16 output) {
        require(self.length <= 32, "It should have a length == 32");

        assembly {
            let freememPointer := mload(0x40)
            let tempBytes32 := mload(add(self, 32))
            mstore(freememPointer, tempBytes32)
            output := mload(freememPointer)
        }
    }
}