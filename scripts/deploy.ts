import { ethers, run, network } from "hardhat";
import fs from "fs";

async function main() {
  // Check if network supports verification
  const supportedNetworks = ["mainnet", "sepolia", "polygon"];
  const shouldVerify = supportedNetworks.includes(network.name);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Deploy MockOracle
  console.log("\nDeploying MockOracle...");
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const mockOracle = await MockOracle.deploy();
  await mockOracle.waitForDeployment();
  console.log("MockOracle deployed to:", await mockOracle.getAddress());

  // Initialize oracle with 60-40 split
  const initTx = await mockOracle.updateData(60, 40);
  await initTx.wait();
  console.log("Oracle initialized with 60-40 split");

  // Deploy RealEstateToken
  console.log("\nDeploying RealEstateToken...");
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(deployer.address);
  await realEstateToken.waitForDeployment();
  console.log(
    "RealEstateToken deployed to:",
    await realEstateToken.getAddress()
  );

  // Deploy LiquidityPool
  console.log("\nDeploying ERC1155LiquidityPool...");
  const LiquidityPool = await ethers.getContractFactory("ERC1155LiquidityPool");

  const tokenId = 1;
  const feeBasisPoints = 100;
  const rewardRate = ethers.parseUnits("0.1", 18);

  const liquidityPool = await LiquidityPool.deploy(
    await realEstateToken.getAddress(),
    tokenId,
    feeBasisPoints,
    rewardRate,
    await mockOracle.getAddress()
  );
  await liquidityPool.waitForDeployment();
  console.log("LiquidityPool deployed to:", await liquidityPool.getAddress());

  // Save deployment addresses
  const deployment = {
    network: network.name,
    MockOracle: await mockOracle.getAddress(),
    RealEstateToken: await realEstateToken.getAddress(),
    LiquidityPool: await liquidityPool.getAddress(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
  };

  const deploymentPath = `deployments.${network.name}.json`;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment addresses saved to ${deploymentPath}`);

  if (shouldVerify) {
    console.log("\nVerifying contracts...");
    try {
      await run("verify:verify", {
        address: await mockOracle.getAddress(),
        constructorArguments: [],
      });

      await run("verify:verify", {
        address: await realEstateToken.getAddress(),
        constructorArguments: [deployer.address],
      });

      await run("verify:verify", {
        address: await liquidityPool.getAddress(),
        constructorArguments: [
          await realEstateToken.getAddress(),
          tokenId,
          feeBasisPoints,
          rewardRate,
          await mockOracle.getAddress(),
        ],
      });
      console.log("Contract verification completed");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
