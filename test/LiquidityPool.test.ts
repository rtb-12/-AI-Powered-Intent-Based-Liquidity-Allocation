import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  ERC1155LiquidityPool,
  RealEstateToken,
  MockOracle,
} from "../typechain-types";

describe("LiquidityPool with RealEstateToken", function () {
  let liquidityPool: ERC1155LiquidityPool;
  let realEstateToken: RealEstateToken;
  let mockOracle: MockOracle;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const initialSupply = ethers.parseUnits("1000", 18);
  const feeBasisPoints = 100n; // 1% fee
  const rewardRate = ethers.parseUnits("0.1", 18);

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy RealEstateToken
    const RealEstateTokenFactory = await ethers.getContractFactory(
      "RealEstateToken"
    );
    realEstateToken = await RealEstateTokenFactory.deploy(owner.address);
    await realEstateToken.waitForDeployment();

    // Deploy MockOracle
    const MockOracleFactory = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracleFactory.deploy();
    await mockOracle.waitForDeployment();

    // Initialize oracle
    await mockOracle.updateData(60, 40);

    // Get tokenId from mint
    const mintTx = await realEstateToken.mintToken(
      initialSupply,
      "tokenURI",
      user1.address
    );
    const receipt = await mintTx.wait();
    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }
    const tokenId = receipt.events?.[0].args?.id || 0;

    // Deploy LiquidityPool with correct tokenId
    const LiquidityPoolFactory = await ethers.getContractFactory(
      "ERC1155LiquidityPool"
    );
    liquidityPool = await LiquidityPoolFactory.deploy(
      await realEstateToken.getAddress(),
      tokenId,
      feeBasisPoints,
      rewardRate,
      await mockOracle.getAddress()
    );
    await liquidityPool.waitForDeployment();

    // Mint additional tokens for user2
    await realEstateToken.mintToken(initialSupply, "tokenURI", user2.address);
  });

  describe("Integration Tests", function () {
    it("should allow deposits and interact with oracle", async function () {
      const depositAmount = ethers.parseUnits("100", 18);

      // Verify initial balance
      const initialBalance = await realEstateToken.balanceOf(user1.address, 0);
      expect(initialBalance).to.equal(initialSupply);

      // Approve and deposit
      await realEstateToken
        .connect(user1)
        .setApprovalForAll(await liquidityPool.getAddress(), true);
      await liquidityPool.connect(user1).deposit(depositAmount);

      // Verify deposit and oracle interaction
      const [staking, rwa] = await mockOracle.getData();
      expect(staking).to.equal(60);
      expect(rwa).to.equal(40);
    });
  });
});
