// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStamper
 * @dev This contract moves from unstructured transaction data fields 
 * to a structured Smart Contract interaction for the Bonus Challenge.
 */
contract SimpleStamper {
    
    // Event emitted when data is stamped
    // This allows the UI to easily listen and verify data
    event DataStamped(address indexed stamper, string data, uint256 timestamp);

    /**
     * @dev Stamps a string onto the blockchain via a contract call.
     * Use this function to satisfy the "Bonus" requirement of HW04.
     * @param _data The string data to be stamped (e.g. "Property #1234")
     */
    function stamp(string memory _data) public {
        emit DataStamped(msg.sender, _data, block.timestamp);
    }

    /**
     * @dev Simple helper to verify that the contract is live.
     */
    function verify() public pure returns (string memory) {
        return "SimpleStamper is Active";
    }
}
