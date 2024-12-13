import { ethers } from "hardhat";

async function main() {
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");

  const [owner] = await ethers.getSigners();

  const realEstateToken = await RealEstateToken.deploy(owner.address);

  await realEstateToken.waitForDeployment();

  console.log("Contract deployed to:", realEstateToken.target);
  console.log("Contract deployed by:", owner.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
