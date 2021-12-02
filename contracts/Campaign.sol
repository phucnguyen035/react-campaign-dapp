// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Campaign {
    address public manager;
    uint256 public minContribution;
    address[] public approvers;

    constructor(uint256 min) {
        manager = msg.sender;
        minContribution = min;
    }

    function contribute() public payable {
        require(msg.value > minContribution, 'Insufficient funds');

        approvers.push(msg.sender);
    }
}
