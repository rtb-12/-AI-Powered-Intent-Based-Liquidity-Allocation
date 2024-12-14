// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC1155 {
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

interface IMockOracle {
    function getData() external view returns (uint256, uint256);
}

contract ERC1155LiquidityPool is Ownable, ReentrancyGuard {
    IERC1155 public token; // The ERC-1155 token used in the pool
    uint256 public totalLiquidity; // Total liquidity in the pool
    uint256 public tokenId; // The token ID representing the asset in the pool

    mapping(address => uint256) public userLiquidity; // Track user liquidity
    mapping(string => uint256) public assetAllocations; // Allocation for different asset types

    uint256 public feeBasisPoints; // Fee in basis points (e.g., 100 = 1%)
    
    IMockOracle public oracle; // Reference to the MockOracle contract

    event Deposited(address indexed user, uint256 amount, uint256 fee);
    event Withdrawn(address indexed user, uint256 amount);
    event LiquidityRebalanced(string intent, uint256 stakingAllocation, uint256 rwaAllocation);
    event FeeUpdated(uint256 newFee);
    event OracleUpdated(address newOracle);

    constructor(address _token, uint256 _tokenId, uint256 _feeBasisPoints, address _oracle) {
        token = IERC1155(_token);
        tokenId = _tokenId;
        feeBasisPoints = _feeBasisPoints;
        oracle = IMockOracle(_oracle); // Set the oracle address
    }

    // Deposit ERC-1155 tokens into the liquidity pool
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Deposit amount must be greater than 0");

        uint256 fee = (amount * feeBasisPoints) / 10000;
        uint256 netAmount = amount - fee;

        token.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        totalLiquidity += netAmount;
        userLiquidity[msg.sender] += netAmount;

        emit Deposited(msg.sender, netAmount, fee);
    }

    // Withdraw ERC-1155 tokens from the liquidity pool
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdraw amount must be greater than 0");
        require(userLiquidity[msg.sender] >= amount, "Insufficient balance");

        totalLiquidity -= amount;
        userLiquidity[msg.sender] -= amount;

        token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
        emit Withdrawn(msg.sender, amount);
    }

    // Update fee (only owner)
    function updateFee(uint256 _feeBasisPoints) external onlyOwner {
        require(_feeBasisPoints <= 1000, "Fee too high"); // Max 10%
        feeBasisPoints = _feeBasisPoints;
        emit FeeUpdated(_feeBasisPoints);
    }

    // Admin function to rebalance the pool based on AI suggestions from the oracle
    function rebalanceLiquidity(string memory intent) external onlyOwner {
        (uint256 stakingAllocation, uint256 rwaAllocation) = oracle.getData();

        require(stakingAllocation + rwaAllocation <= totalLiquidity, "Allocations exceed total liquidity");

        assetAllocations["staking"] = stakingAllocation;
        assetAllocations["rwa"] = rwaAllocation;

        emit LiquidityRebalanced(intent, stakingAllocation, rwaAllocation);
    }

    // Emergency withdraw (only owner)
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= totalLiquidity, "Insufficient liquidity");
        totalLiquidity -= amount;
        token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
    }

    // Update the oracle address (only owner)
    function updateOracle(address _newOracle) external onlyOwner {
        oracle = IMockOracle(_newOracle);
        emit OracleUpdated(_newOracle);
    }
}
