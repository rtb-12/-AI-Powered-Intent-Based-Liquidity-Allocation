import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setProvider(ethProvider);
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    } else {
      alert("MetaMask not found. Please install it!");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
  };

  return { account, provider, connectWallet, disconnectWallet };
};

export default useWallet;
