import { expect } from "chai";
import { ethers } from "hardhat";

describe("Mock Oracle Integration", function () {
  let mockOracle: any;
  let liquidityPool: any;
  let owner: any;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    // Deploy Mock Oracle
    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();
    await mockOracle.deployed();

    // Deploy Liquidity Pool with Oracle
    const LiquidityPool = await ethers.getContractFactory(
      "ERC1155LiquidityPool"
    );
    liquidityPool = await LiquidityPool.deploy(mockOracle.address);
    await liquidityPool.deployed();
  });

  it("Should fetch data from the oracle and rebalance liquidity", async () => {
    // Update oracle data
    await mockOracle.updateData(70, 30);

    // Call rebalance function in liquidity pool
    const tx = await liquidityPool.rebalanceLiquidity("Maximize Yield");
    await tx.wait();

    // Validate emitted event
    const receipt = await tx.wait();
    const event = receipt.events.find(
      (e: any) => e.event === "LiquidityRebalanced"
    );
    expect(event.args.stakingAllocation).to.equal(70);
    expect(event.args.rwaAllocation).to.equal(30);
  });
});
