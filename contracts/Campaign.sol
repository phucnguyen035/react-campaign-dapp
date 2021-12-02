// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address recipient;
        string status;
    }

    address public manager;
    uint256 public minContribution;
    address[] public approvers;
    Request[] public requests;

    constructor(uint256 min) {
        manager = msg.sender;
        minContribution = min;
    }

    modifier isManager() {
        require(msg.sender == manager, 'Only manager is allowed');
        _;
    }

    function contribute() public payable {
        require(msg.value > minContribution, 'Insufficient funds');

        approvers.push(msg.sender);
    }

    function createRequest(
        string memory description,
        uint256 value,
        address recipient
    ) public payable isManager {
        Request memory req = Request({
            description: description,
            value: value,
            recipient: recipient,
            status: 'pending'
        });

        requests.push(req);
    }
}
