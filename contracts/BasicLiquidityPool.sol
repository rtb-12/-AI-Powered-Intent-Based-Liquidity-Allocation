// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC1155 {
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

interface IMockOracle {
    function getData() external view returns (uint256, uint256);
}

contract ERC1155LiquidityPool is Ownable(msg.sender), ReentrancyGuard {
    IERC1155 public token; 
    uint256 public totalLiquidity; // Total liquidity in the pool
    uint256 public tokenId; 

    mapping(address => uint256) public userLiquidity; 
    mapping(string => uint256) public assetAllocations;
    mapping(address => uint256) public userRewards; // Rewards earned by users
    mapping(string => uint256) public intents; // User-defined intents (e.g., staking, low-risk)

    uint256 public feeBasisPoints;
    uint256 public rewardRate; // Reward rate for staking
    uint256 public lastRewardUpdate; // Timestamp of last reward calculation

    IMockOracle public oracle; 

    event Deposited(address indexed user, uint256 amount, uint256 fee);
    event Withdrawn(address indexed user, uint256 amount);
    event LiquidityRebalanced(string intent, uint256 stakingAllocation, uint256 rwaAllocation);
    event FeeUpdated(uint256 newFee);
    event OracleUpdated(address newOracle);
    event IntentUpdated(address indexed user, string intent);
    event RewardsClaimed(address indexed user, uint256 rewards);

    constructor(address _token, uint256 _tokenId, uint256 _feeBasisPoints, uint256 _rewardRate, address _oracle) {
        token = IERC1155(_token);
        tokenId = _tokenId;
        feeBasisPoints = _feeBasisPoints;
        rewardRate = _rewardRate;
        oracle = IMockOracle(_oracle); 
        lastRewardUpdate = block.timestamp;
    }

    // Deposit ERC-1155 tokens into the liquidity pool
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Deposit amount must be greater than 0");

        updateRewards(msg.sender); // Update rewards for the user

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

        updateRewards(msg.sender); // Update rewards for the user

        totalLiquidity -= amount;
        userLiquidity[msg.sender] -= amount;

        token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
        emit Withdrawn(msg.sender, amount);
    }

    // Claim staking rewards
    function claimRewards() external nonReentrant {
        updateRewards(msg.sender); // Update rewards for the user

        uint256 rewards = userRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");

        userRewards[msg.sender] = 0;

        // Transfer rewards (use a stablecoin or native token mechanism)
        payable(msg.sender).transfer(rewards);

        emit RewardsClaimed(msg.sender, rewards);
    }

    // Update user intent for liquidity allocation
    function updateIntent(string memory intent) external {
        require(bytes(intent).length > 0, "Intent cannot be empty");

        intents[intent] += userLiquidity[msg.sender]; // Aggregate intent
        emit IntentUpdated(msg.sender, intent);
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

    // Internal function to update rewards for a user
    function updateRewards(address user) internal {
        uint256 timeElapsed = block.timestamp - lastRewardUpdate;
        uint256 reward = (userLiquidity[user] * rewardRate * timeElapsed) / 1e18;
        userRewards[user] += reward;
        lastRewardUpdate = block.timestamp;
    }
}
