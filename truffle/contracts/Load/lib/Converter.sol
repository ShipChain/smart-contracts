pragma solidity 0.5.12;


library Converter {
    function toBytes16(bytes memory self) internal pure returns (bytes16 output) {
        require(self.length <= 32, "It should have a length == 32");

        assembly {
            // add(self, 32) gets the pointer to the second position in the `bytes` array (first position is the header)
            // dereference that bytes32 element and assign it to our bytes16 output
            output := mload(add(self, 32))
        }
    }
}