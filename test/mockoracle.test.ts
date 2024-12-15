import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  MockOracle,
  ERC1155LiquidityPool,
  RealEstateToken,
} from "../typechain-types";

describe("Mock Oracle Integration", function () {
  let mockOracle: MockOracle;
  let liquidityPool: ERC1155LiquidityPool;
  let realEstateToken: RealEstateToken;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy RealEstateToken
    const RealEstateTokenFactory = await ethers.getContractFactory(
      "RealEstateToken"
    );
    realEstateToken = await RealEstateTokenFactory.deploy(owner.address);
    await realEstateToken.waitForDeployment();

    // Deploy Mock Oracle
    const MockOracleFactory = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracleFactory.deploy();
    await mockOracle.waitForDeployment();

    // Initialize oracle with 60-40 split
    await mockOracle.updateData(60, 40);

    // Deploy Liquidity Pool
    const LiquidityPoolFactory = await ethers.getContractFactory(
      "ERC1155LiquidityPool"
    );
    liquidityPool = await LiquidityPoolFactory.deploy(
      await realEstateToken.getAddress(),
      1, // tokenId
      100, // 1% fee
      ethers.parseUnits("0.1", 18), // reward rate
      await mockOracle.getAddress()
    );
    await liquidityPool.waitForDeployment();

    // Mint tokens to user
    await realEstateToken.mintToken(
      ethers.parseUnits("1000", 18),
      "tokenURI",
      user.address
    );
  });

  it("Should fetch data from oracle and rebalance liquidity", async () => {
    const depositAmount = ethers.parseUnits("100", 18);
    await realEstateToken
      .connect(user)
      .setApprovalForAll(await liquidityPool.getAddress(), true);
    await liquidityPool.connect(user).deposit(depositAmount);

    await mockOracle.updateData(70, 30);
    await liquidityPool.connect(owner).rebalanceLiquidity("Maximize Yield");

    expect(await liquidityPool.assetAllocations("staking")).to.equal(70);
    expect(await liquidityPool.assetAllocations("rwa")).to.equal(30);
  });
});
