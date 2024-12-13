// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/RealEstateToken.json";

const TokenizationPage = () => {
  const contractAddress = "0x7Cd27F2530106cb9cc4F062C6D5B4E3E96376302";
  const [tokenURI, setTokenURI] = useState("");
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState(null);

  const isValidAddress = (address) => {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const mintToken = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to continue.");
      return;
    }

    if (!isValidAddress(recipient)) {
      setStatus("Invalid recipient address.");
      return;
    }

    if (!tokenURI.trim()) {
      setStatus("Token URI cannot be empty.");
      return;
    }

    if (amount <= 0) {
      setStatus("Amount must be greater than zero.");
      return;
    }

    try {
      setStatus("Connecting to wallet...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi.abi, signer);

      setStatus("Minting token...");
      const tx = await contract.mintToken(amount, tokenURI, recipient);
      const receipt = await tx.wait();

      const tokenId = receipt.events?.find(
        (event) => event.event === "TokenMinted"
      )?.args?.tokenId;
      setMintedTokenId(tokenId);

      setStatus("Token minted successfully!");
      setTokenURI("");
      setAmount(0);
      setRecipient("");
    } catch (error) {
      console.error(error);
      setStatus("An error occurred while minting the token.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-yellow-600">
        Tokenization Portal
      </h1>
      <p className="text-center text-gray-600 mt-2">
        Mint and manage your Real-World Asset (RWA) tokens.
      </p>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md mt-8 p-6">
        <h2 className="text-2xl font-semibold mb-4">Mint RWA Token</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Token URI
          </label>
          <input
            type="text"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            placeholder="Enter token metadata URI"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter token amount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient's wallet address"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
          />
        </div>

        <button
          onClick={mintToken}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md shadow hover:bg-yellow-700"
        >
          Mint Token
        </button>

        {status && (
          <p className="text-center text-sm text-gray-500 mt-4">{status}</p>
        )}

        {mintedTokenId !== null && (
          <div className="mt-6 bg-gray-100 p-4 rounded-md shadow">
            <h3 className="text-lg font-semibold">Minted Token Details</h3>
            <p>
              <strong>Token ID:</strong> {mintedTokenId.toString()}
            </p>
            <p>
              <strong>Contract Address:</strong> {contractAddress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenizationPage;
