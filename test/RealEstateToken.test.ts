import { expect } from "chai";
import { ethers } from "hardhat";
import { RealEstateToken } from "../typechain-types";

describe("RealEstateToken Contract", function () {
  let realEstateToken: RealEstateToken;
  let owner: any;
  let otherAccount: any;

  beforeEach(async () => {
    [owner, otherAccount] = await ethers.getSigners();

    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    realEstateToken = (await RealEstateToken.deploy(
      owner.address
    )) as RealEstateToken;
    await realEstateToken.waitForDeployment();
  });

  it("Should deploy with the correct owner", async () => {
    expect(await realEstateToken.owner()).to.equal(owner.address);
  });

  it("Should mint a new token", async () => {
    const tokenId = 0;
    const amount = 100;
    const uri = "https://example.com/token/0";

    const mintTx = await realEstateToken.mintToken(
      amount,
      uri,
      otherAccount.address
    );
    await mintTx.wait();

    expect(
      await realEstateToken.balanceOf(otherAccount.address, tokenId)
    ).to.equal(amount);
    expect(await realEstateToken.uri(tokenId)).to.equal(uri);
  });

  it("Should update the URI of an existing token", async () => {
    const tokenId = 0;
    const newUri = "https://example.com/token/0-updated";

    const updateTx = await realEstateToken.updateTokenURI(tokenId, newUri);
    await updateTx.wait();

    expect(await realEstateToken.uri(tokenId)).to.equal(newUri);
  });

  it("Should burn tokens", async () => {
    const tokenId = 0;
    const initialAmount = 100;
    const burnAmount = 100;

    // Mint tokens
    const mintTx = await realEstateToken.mintToken(
      initialAmount,
      "https://example.com/token/0",
      otherAccount.address
    );
    await mintTx.wait();

    // Connect as the token holder to burn their tokens
    await realEstateToken.connect(otherAccount).burnToken(tokenId, burnAmount);

    // Check remaining balance
    const remainingBalance = await realEstateToken.balanceOf(
      otherAccount.address,
      tokenId
    );
    expect(remainingBalance).to.equal(0); // Ensure all tokens are burned
  });

  it("Should revert minting by non-owner", async () => {
    const tokenId = 1;
    const amount = 50;
    const uri = "https://example.com/token/1";

    await expect(
      realEstateToken
        .connect(otherAccount)
        .mintToken(amount, uri, otherAccount.address)
    ).to.be.revertedWithCustomError(
      realEstateToken,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Should revert burning more tokens than available", async () => {
    const tokenId = 0;
    const burnAmount = 100;

    await expect(
      realEstateToken.connect(otherAccount).burnToken(tokenId, burnAmount)
    ).to.be.revertedWith("Insufficient balance to burn");
  });

  it("Should revert updating URI by non-owner", async () => {
    const tokenId = 0;
    const newUri = "https://example.com/token/0-updated";

    // Mint a token first
    const mintTx = await realEstateToken.mintToken(
      100,
      "https://example.com/token/0",
      otherAccount.address
    );
    await mintTx.wait();

    // Try updating the URI as a non-owner
    await expect(
      realEstateToken.connect(otherAccount).updateTokenURI(tokenId, newUri)
    ).to.be.revertedWithCustomError(
      realEstateToken,
      "OwnableUnauthorizedAccount"
    );
  });
});
