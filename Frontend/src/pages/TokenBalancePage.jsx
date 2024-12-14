import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../abi/RealEstateToken.json";
import useWallet from "../hooks/useWallet";

const TokenBalancePage = () => {
  const { account } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const contractAddress = "0x7Cd27F2530106cb9cc4F062C6D5B4E3E96376302";

  useEffect(() => {
    if (account) {
      console.log("Fetching tokens for account:", account);
      fetchUserTokens();
    }
  }, [account]);

  const fetchUserTokens = async () => {
    if (!window.ethereum || !account) {
      console.log("No ethereum object or account found");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi.abi, provider);

      // Get current block
      const currentBlock = await provider.getBlockNumber();
      // Set chunk size to 2000 blocks to avoid RPC limitations
      const chunkSize = 2000;
      const chunks = [];

      // Split block range into chunks
      for (let i = 0; i < currentBlock; i += chunkSize) {
        const fromBlock = i;
        const toBlock = Math.min(i + chunkSize, currentBlock);
        chunks.push({ fromBlock, toBlock });
      }

      let allEvents = [];
      // Query each chunk
      for (const chunk of chunks) {
        const filter = contract.filters.TransferSingle(
          null, // operator (any)
          null, // from (any)
          account // to (current user)
        );

        const events = await contract.queryFilter(
          filter,
          chunk.fromBlock,
          chunk.toBlock
        );
        allEvents = [...allEvents, ...events];
      }

      console.log("Found events:", allEvents);

      const tokenDetails = await Promise.all(
        allEvents.map(async (event) => {
          const tokenId = event.args.id;
          const balance = await contract.balanceOf(account, tokenId);
          const uri = await contract.uri(tokenId);

          try {
            const response = await fetch(uri);
            const metadata = await response.json();
            return {
              tokenId: tokenId.toString(),
              balance: balance.toString(),
              uri,
              metadata,
            };
          } catch (error) {
            console.error("Error fetching metadata:", error);
            return {
              tokenId: tokenId.toString(),
              balance: balance.toString(),
              uri,
              metadata: {
                name: `Token #${tokenId}`,
                description: "Metadata not available",
              },
            };
          }
        })
      );

      console.log("Token details:", tokenDetails);
      setTokens(tokenDetails);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-yellow-600">
        My Token Balance
      </h1>
      <p className="text-center text-gray-600 mt-2">
        View all your RWA tokens and balances
      </p>

      {!account ? (
        <div className="text-center mt-8">
          Please connect your wallet to view your tokens.
        </div>
      ) : (
        <div className="max-w-4xl mx-auto mt-8">
          {loading ? (
            <div className="text-center">Loading your tokens...</div>
          ) : tokens.length === 0 ? (
            <div className="text-center">No tokens found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.map((token) => (
                <div
                  key={token.tokenId}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  {token.metadata.imageURI && (
                    <img
                      src={token.metadata.imageURI}
                      alt={token.metadata.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">
                    {token.metadata.name || `Token #${token.tokenId}`}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {token.metadata.description}
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm font-medium">Token ID:</span>
                    <span className="text-sm text-gray-600">
                      {token.tokenId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Balance:</span>
                    <span className="text-sm text-gray-600">
                      {token.balance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenBalancePage;
