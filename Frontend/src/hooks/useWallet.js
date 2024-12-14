import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            setProvider(ethProvider);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.send("eth_requestAccounts", []);
        const signer = await ethProvider.getSigner();
        setAccount(signer.address);
        setProvider(ethProvider);
        console.log("Wallet connected:", signer.address);
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
