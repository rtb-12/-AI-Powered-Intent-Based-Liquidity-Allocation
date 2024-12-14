// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract MockOracle {
    address public owner; // Address of the contract owner
    uint256 public stakingAllocation; // Simulated staking allocation (in percentage)
    uint256 public rwaAllocation; // Simulated RWA allocation (in percentage)

    event DataUpdated(
        uint256 stakingAllocation,
        uint256 rwaAllocation,
        address updatedBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender; // Set the deployer as the owner
    }

    // Function to update the data (simulating external input)
    function updateData(uint256 _stakingAllocation, uint256 _rwaAllocation)
        external
        onlyOwner
    {
        require(
            _stakingAllocation + _rwaAllocation == 100,
            "Allocations must sum to 100%"
        );

        stakingAllocation = _stakingAllocation;
        rwaAllocation = _rwaAllocation;

        emit DataUpdated(_stakingAllocation, _rwaAllocation, msg.sender);
    }

    // Function to get the current data (simulates fetching external data)
    function getData() external view returns (uint256, uint256) {
        return (stakingAllocation, rwaAllocation);
    }
}
