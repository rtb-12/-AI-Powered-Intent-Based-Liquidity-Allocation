import React from "react";
import { Link } from "react-router-dom";
import useWallet from "../hooks/useWallet";

const Header = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();

  return (
    <header className="bg-yellow-400 flex items-center justify-between px-8 py-4">
      <h1 className="text-4xl font-black text-black tracking-tighter">
        ALIQ App
      </h1>
      <nav className="flex space-x-6">
        <Link
          to="/"
          className="text-lg font-bold text-blue-500 hover:text-blue-700"
        >
          Home
        </Link>
        <Link
          to="/uri-creation"
          className="text-lg font-bold text-purple-500 hover:text-purple-700"
        >
          URI Creation
        </Link>
        <Link
          to="/tokenization"
          className="text-lg font-bold text-green-500 hover:text-green-700"
        >
          Tokenization
        </Link>
        <Link
          to="/balance"
          className="text-lg font-bold text-orange-500 hover:text-orange-700"
        >
          My Tokens
        </Link>
      </nav>
      {account ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Connect Wallet
        </button>
      )}
    </header>
  );
};

export default Header;
