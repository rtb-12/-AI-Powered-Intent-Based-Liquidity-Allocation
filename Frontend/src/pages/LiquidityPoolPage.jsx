import React, { useState, useEffect } from "react";
import useWallet from "../hooks/useWallet";
import { ethers } from "ethers";
import { FaWallet, FaChartPie, FaCoins, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import LiquidityPoolABI from "../abi/LiquidityPool.json";

const LiquidityPoolPage = () => {
  const { account, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [userTokens, setUserTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [stakingStats, setStakingStats] = useState({
    totalStaked: "0",
    userStaked: "0",
    stakingPercentage: 0,
  });
  const [rewards, setRewards] = useState({
    available: "0",
    claimed: "0",
    apr: "0",
  });

  // Contract addresses (replace with your deployed addresses)
  const contractAddresses = {
    realEstateToken: "YOUR_DEPLOYED_TOKEN_ADDRESS",
    liquidityPool: "YOUR_DEPLOYED_POOL_ADDRESS",
  };

  const getContracts = async () => {
    if (!window.ethereum) throw new Error("No Web3 Provider");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const realEstateToken = new ethers.Contract(
      contractAddresses.realEstateToken,
      RealEstateTokenABI,
      signer
    );

    const liquidityPool = new ethers.Contract(
      contractAddresses.liquidityPool,
      LiquidityPoolABI,
      signer
    );

    return { realEstateToken, liquidityPool, provider, signer };
  };

  useEffect(() => {
    if (account) {
      refreshData();
    }
  }, [account]);

  const refreshData = async () => {
    await Promise.all([fetchUserTokens(), fetchStakingStats(), fetchRewards()]);
  };

  const fetchUserTokens = async () => {
    try {
      setLoading(true);
      const { realEstateToken } = await getContracts();
      const filter = realEstateToken.filters.TransferSingle(
        null,
        null,
        account
      );
      const events = await realEstateToken.queryFilter(filter);

      const tokenPromises = events.map(async (event) => {
        const tokenId = event.args.id;
        const balance = await realEstateToken.balanceOf(account, tokenId);
        if (balance.toString() === "0") return null;

        const uri = await realEstateToken.uri(tokenId);
        const metadata = await fetch(
          uri.replace("ipfs://", "https://ipfs.io/ipfs/")
        ).then((res) => res.json());

        return {
          id: tokenId.toString(),
          name: metadata.name,
          balance: balance.toString(),
          imageUrl: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/"),
          type: metadata.properties?.type || "Unknown",
          value: metadata.properties?.value || "0",
        };
      });

      const tokens = (await Promise.all(tokenPromises)).filter(Boolean);
      setUserTokens(tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      toast.error("Failed to fetch tokens");
    } finally {
      setLoading(false);
    }
  };

  const fetchStakingStats = async () => {
    try {
      const { liquidityPool } = await getContracts();

      const [totalStaked, userStaked, { staking: stakingAlloc }] =
        await Promise.all([
          liquidityPool.totalLiquidity(),
          liquidityPool.userLiquidity(account),
          liquidityPool.getAssetAllocations(),
        ]);

      setStakingStats({
        totalStaked: totalStaked.toString(),
        userStaked: userStaked.toString(),
        stakingPercentage: (Number(stakingAlloc) * 100) / Number(totalStaked),
      });
    } catch (error) {
      console.error("Error fetching staking stats:", error);
      toast.error("Failed to fetch staking stats");
    }
  };

  const fetchRewards = async () => {
    try {
      const { liquidityPool } = await getContracts();

      const [available, rewardRate, totalLiquidity] = await Promise.all([
        liquidityPool.pendingRewards(account),
        liquidityPool.rewardRate(),
        liquidityPool.totalLiquidity(),
      ]);

      const annualRewards = rewardRate.mul(365 * 24 * 3600);
      const apr = totalLiquidity.gt(0)
        ? annualRewards.mul(100).div(totalLiquidity)
        : 0;

      setRewards({
        available: available.toString(),
        claimed: (
          await liquidityPool.userInfo(account)
        ).claimedRewards.toString(),
        apr: apr.toString(),
      });
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to fetch rewards");
    }
  };

  const handleStake = async (amount) => {
    if (!selectedToken) return;
    try {
      setLoading(true);
      const { liquidityPool, realEstateToken } = await getContracts();

      // Approve spending
      const approveTx = await realEstateToken.setApprovalForAll(
        contractAddresses.liquidityPool,
        true
      );
      await approveTx.wait();

      // Stake tokens
      const stakeTx = await liquidityPool.deposit(amount);
      await stakeTx.wait();

      toast.success("Tokens staked successfully");
      refreshData();
    } catch (error) {
      console.error("Error staking:", error);
      toast.error("Failed to stake tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setLoading(true);
      const { liquidityPool } = await getContracts();
      const tx = await liquidityPool.claimRewards();
      await tx.wait();

      toast.success("Rewards claimed successfully");
      refreshData();
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-yellow-600 mb-8">
          Liquidity Pool Dashboard
        </h1>

        {!account ? (
          <div className="text-center">
            <button
              onClick={connect}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg text-lg"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Tokens Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FaWallet className="text-yellow-600 text-xl mr-2" />
                <h2 className="text-xl font-semibold">Your Tokens</h2>
              </div>
              <div className="space-y-4">
                {userTokens.map((token) => (
                  <div
                    key={token.id}
                    className="border rounded-lg p-4 cursor-pointer hover:border-yellow-600"
                    onClick={() => setSelectedToken(token)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={token.imageUrl}
                        alt={token.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{token.name}</h3>
                        <p className="text-sm text-gray-600">
                          Balance: {token.balance}
                        </p>
                        <p className="text-sm text-gray-600">
                          Value: ${Number(token.value).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staking Stats Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FaChartPie className="text-yellow-600 text-xl mr-2" />
                <h2 className="text-xl font-semibold">Staking Overview</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">
                    Staking Percentage
                  </h3>
                  <div className="h-4 bg-gray-200 rounded-full">
                    <div
                      className="h-4 bg-yellow-600 rounded-full"
                      style={{ width: `${stakingStats.stakingPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm mt-1">
                    {stakingStats.stakingPercentage}%
                  </p>
                </div>
                <div>
                  <p className="flex justify-between text-sm">
                    <span>Your Stake:</span>
                    <span>
                      {ethers.formatEther(stakingStats.userStaked)} ETH
                    </span>
                  </p>
                  <p className="flex justify-between text-sm mt-2">
                    <span>Total Staked:</span>
                    <span>
                      {ethers.formatEther(stakingStats.totalStaked)} ETH
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FaCoins className="text-yellow-600 text-xl mr-2" />
                <h2 className="text-xl font-semibold">Rewards</h2>
              </div>
              <div className="space-y-6">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold">Available Rewards</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {ethers.formatEther(rewards.available)} ETH
                  </p>
                  <p className="text-sm text-gray-600">APR: {rewards.apr}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Total Claimed</h3>
                  <p className="text-xl">
                    {ethers.formatEther(rewards.claimed)} ETH
                  </p>
                </div>
                <button
                  onClick={handleClaimRewards}
                  disabled={loading || rewards.available === "0"}
                  className={`w-full py-2 px-4 rounded-lg ${
                    loading || rewards.available === "0"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  } text-white`}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin mx-auto" />
                  ) : (
                    "Claim Rewards"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidityPoolPage;
