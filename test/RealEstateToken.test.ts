import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RealEstateToken } from "../typechain-types";

describe("RealEstateToken Contract", function () {
  let realEstateToken: RealEstateToken;
  let owner: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  beforeEach(async () => {
    [owner, otherAccount] = await ethers.getSigners();

    const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    realEstateToken = await RealEstateToken.deploy(owner.address);
    await realEstateToken.waitForDeployment();
  });

  it("Should deploy with the correct owner", async () => {
    expect(await realEstateToken.owner()).to.equal(owner.address);
  });

  it("Should mint a new token and track it", async () => {
    const amount = BigInt(100);
    const uri = "https://example.com/token/0";
    const tokenId = 0n;

    // Mint token and wait for confirmation
    const mintTx = await realEstateToken.mintToken(
      amount,
      uri,
      otherAccount.address
    );
    await mintTx.wait();

    // Verify balance
    const balance = await realEstateToken.balanceOf(
      otherAccount.address,
      tokenId
    );
    expect(balance).to.equal(amount);

    // Verify URI
    const tokenURI = await realEstateToken.uri(tokenId);
    expect(tokenURI).to.equal(uri);

    // Verify token tracking
    const mintedTokens = await realEstateToken.getMintedTokensByAddress(
      otherAccount.address
    );
    expect(mintedTokens.length).to.equal(1);
    expect(mintedTokens[0].tokenId).to.equal(tokenId);
    expect(mintedTokens[0].amount).to.equal(amount);
    expect(mintedTokens[0].tokenURI).to.equal(uri); // Changed from uri to tokenURI
  });

  it("Should retrieve all minted tokens", async () => {
    const mintData = [
      {
        amount: BigInt(50),
        uri: "https://example.com/token/1",
        recipient: owner.address,
      },
      {
        amount: BigInt(75),
        uri: "https://example.com/token/2",
        recipient: otherAccount.address,
      },
    ];

    // Mint tokens
    for (const data of mintData) {
      await realEstateToken.mintToken(data.amount, data.uri, data.recipient);
    }

    // Get all minted tokens
    const allMintedTokens = await realEstateToken.getAllMintedTokens();
    expect(allMintedTokens.length).to.equal(2);

    // Verify each token's data
    for (let i = 0; i < mintData.length; i++) {
      const balance = await realEstateToken.balanceOf(
        mintData[i].recipient,
        BigInt(i)
      );
      expect(balance).to.equal(mintData[i].amount);
      expect(allMintedTokens[i].tokenURI).to.equal(mintData[i].uri);
    }
  });

  it("Should burn tokens and update balances", async () => {
    const tokenId = 0;
    const initialAmount = 100;
    const burnAmount = 40;

    const mintTx = await realEstateToken.mintToken(
      initialAmount,
      "https://example.com/token/0",
      otherAccount.address
    );
    await mintTx.wait();

    await realEstateToken.connect(otherAccount).burnToken(tokenId, burnAmount);

    const remainingBalance = await realEstateToken.balanceOf(
      otherAccount.address,
      tokenId
    );
    expect(remainingBalance).to.equal(initialAmount - burnAmount);

    const mintedTokens = await realEstateToken.getMintedTokensByAddress(
      otherAccount.address
    );
    expect(mintedTokens[0].amount).to.equal(initialAmount - burnAmount);
  });

  it("Should track creator of tokens", async () => {
    const amount = 50;
    const uri = "https://example.com/token/1";

    const mintTx = await realEstateToken.mintToken(
      amount,
      uri,
      otherAccount.address
    );
    await mintTx.wait();

    const tokenId = 0; // First minted token has ID 0
    const creator = await realEstateToken.getTokenCreator(tokenId);
    expect(creator).to.equal(owner.address);
  });

  it("Should revert minting by non-owner", async () => {
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

    const mintTx = await realEstateToken.mintToken(
      100,
      "https://example.com/token/0",
      otherAccount.address
    );
    await mintTx.wait();

    await expect(
      realEstateToken.connect(otherAccount).updateTokenURI(tokenId, newUri)
    ).to.be.revertedWithCustomError(
      realEstateToken,
      "OwnableUnauthorizedAccount"
    );
  });
});
