import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ERC1155LiquidityPool, MockERC1155 } from "../typechain-types";
import { Contract } from "ethers";

describe("ERC1155LiquidityPool", function () {
  let liquidityPool: ERC1155LiquidityPool;
  let mockERC1155: MockERC1155;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const tokenId = 1n;
  const initialSupply = ethers.parseUnits("1000", 18);
  const feeBasisPoints = 100n; // 1% fee

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC1155 token
    const MockERC1155Factory = await ethers.getContractFactory("MockERC1155");
    mockERC1155 = await MockERC1155Factory.deploy();
    await mockERC1155.waitForDeployment();

    // Mint tokens to users
    await mockERC1155.mint(user1.address, tokenId, initialSupply, "0x");
    await mockERC1155.mint(user2.address, tokenId, initialSupply, "0x");

    // Deploy liquidity pool contract
    const LiquidityPoolFactory = await ethers.getContractFactory(
      "ERC1155LiquidityPool"
    );
    liquidityPool = await LiquidityPoolFactory.deploy(
      await mockERC1155.getAddress(),
      tokenId,
      feeBasisPoints
    );
    await liquidityPool.waitForDeployment();
  });

  describe("Deposit", function () {
    it("should allow users to deposit tokens", async function () {
      const depositAmount = ethers.parseUnits("100", 18);
      await mockERC1155
        .connect(user1)
        .setApprovalForAll(await liquidityPool.getAddress(), true);

      await expect(liquidityPool.connect(user1).deposit(depositAmount))
        .to.emit(liquidityPool, "Deposited")
        .withArgs(
          user1.address,
          depositAmount - depositAmount / 100n,
          depositAmount / 100n
        );

      const userBalance = await liquidityPool.userLiquidity(user1.address);
      const totalLiquidity = await liquidityPool.totalLiquidity();

      expect(userBalance).to.equal(depositAmount - depositAmount / 100n);
      expect(totalLiquidity).to.equal(depositAmount - depositAmount / 100n);
    });

    it("should revert if deposit amount is zero", async function () {
      await expect(liquidityPool.connect(user1).deposit(0)).to.be.revertedWith(
        "Deposit amount must be greater than 0"
      );
    });
  });

  describe("Withdraw", function () {
    it("should allow users to withdraw tokens", async function () {
      const depositAmount = ethers.parseUnits("100", 18);
      const withdrawAmount = ethers.parseUnits("50", 18);

      await mockERC1155
        .connect(user1)
        .setApprovalForAll(await liquidityPool.getAddress(), true);
      await liquidityPool.connect(user1).deposit(depositAmount);

      await expect(liquidityPool.connect(user1).withdraw(withdrawAmount))
        .to.emit(liquidityPool, "Withdrawn")
        .withArgs(user1.address, withdrawAmount);

      const userBalance = await liquidityPool.userLiquidity(user1.address);
      const totalLiquidity = await liquidityPool.totalLiquidity();

      const expectedBalance =
        depositAmount - depositAmount / 100n - withdrawAmount;
      expect(userBalance).to.equal(expectedBalance);
      expect(totalLiquidity).to.equal(expectedBalance);
    });

    it("should revert if withdraw amount exceeds user balance", async function () {
      const depositAmount = ethers.parseUnits("100", 18);
      const withdrawAmount = ethers.parseUnits("200", 18);

      await mockERC1155
        .connect(user1)
        .setApprovalForAll(await liquidityPool.getAddress(), true);
      await liquidityPool.connect(user1).deposit(depositAmount);

      await expect(
        liquidityPool.connect(user1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Rebalance Liquidity", function () {
    it("should allow the owner to rebalance liquidity", async function () {
      const stakingAllocation = ethers.parseUnits("60", 18);
      const rwaAllocation = ethers.parseUnits("40", 18);

      await expect(
        liquidityPool
          .connect(owner)
          .rebalanceLiquidity(
            "Maximize Yield",
            stakingAllocation,
            rwaAllocation
          )
      )
        .to.emit(liquidityPool, "LiquidityRebalanced")
        .withArgs("Maximize Yield", stakingAllocation, rwaAllocation);

      const staking = await liquidityPool.assetAllocations("staking");
      const rwa = await liquidityPool.assetAllocations("rwa");

      expect(staking).to.equal(stakingAllocation);
      expect(rwa).to.equal(rwaAllocation);
    });

    it("should revert if called by non-owner", async function () {
      await expect(
        liquidityPool
          .connect(user1)
          .rebalanceLiquidity("Minimize Risk", 50n, 50n)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Emergency Withdraw", function () {
    it("should allow the owner to perform emergency withdrawal", async function () {
      const depositAmount = ethers.parseUnits("100", 18);

      await mockERC1155
        .connect(user1)
        .setApprovalForAll(await liquidityPool.getAddress(), true);
      await liquidityPool.connect(user1).deposit(depositAmount);

      await expect(
        liquidityPool.connect(owner).emergencyWithdraw(depositAmount)
      )
        .to.emit(mockERC1155, "TransferSingle")
        .withArgs(
          owner.address,
          await liquidityPool.getAddress(),
          owner.address,
          tokenId,
          depositAmount
        );

      const totalLiquidity = await liquidityPool.totalLiquidity();
      expect(totalLiquidity).to.equal(0);
    });

    it("should revert if amount exceeds total liquidity", async function () {
      const depositAmount = ethers.parseUnits("100", 18);
      const withdrawAmount = ethers.parseUnits("200", 18);

      await mockERC1155
        .connect(user1)
        .setApprovalForAll(await liquidityPool.getAddress(), true);
      await liquidityPool.connect(user1).deposit(depositAmount);

      await expect(
        liquidityPool.connect(owner).emergencyWithdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient liquidity");
    });
  });
});
