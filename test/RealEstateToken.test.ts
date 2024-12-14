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

  it("Should mint a new token and track it", async () => {
    const amount = 100;
    const uri = "https://example.com/token/0";

    const mintTx = await realEstateToken.mintToken(
      amount,
      uri,
      otherAccount.address
    );
    await mintTx.wait();

    const tokenId = 0; // First minted token has ID 0

    expect(
      await realEstateToken.balanceOf(otherAccount.address, tokenId)
    ).to.equal(amount);
    expect(await realEstateToken.uri(tokenId)).to.equal(uri);

    const mintedTokens = await realEstateToken.getMintedTokensByAddress(
      otherAccount.address
    );

    expect(mintedTokens.length).to.equal(1);
    expect(mintedTokens[0].tokenId).to.equal(tokenId);
    expect(mintedTokens[0].amount).to.equal(amount);
    expect(mintedTokens[0].uri).to.equal(uri);
  });

  it("Should retrieve all minted tokens", async () => {
    const mintData = [
      {
        amount: 50,
        uri: "https://example.com/token/1",
        recipient: owner.address,
      },
      {
        amount: 75,
        uri: "https://example.com/token/2",
        recipient: otherAccount.address,
      },
    ];

    for (const data of mintData) {
      const mintTx = await realEstateToken.mintToken(
        data.amount,
        data.uri,
        data.recipient
      );
      await mintTx.wait();
    }

    const allMintedTokens = await realEstateToken.getAllMintedTokens();
    expect(allMintedTokens.length).to.equal(2);

    for (let i = 0; i < mintData.length; i++) {
      expect(allMintedTokens[i].tokenId).to.equal(i);
      expect(allMintedTokens[i].amount).to.equal(mintData[i].amount);
      expect(allMintedTokens[i].uri).to.equal(mintData[i].uri);
      expect(allMintedTokens[i].creator).to.equal(owner.address);
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
