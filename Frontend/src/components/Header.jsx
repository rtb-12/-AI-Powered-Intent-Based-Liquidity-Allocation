import React from "react";
import { Link } from "react-router-dom";
import useWallet from "../hooks/useWallet"; // Adjust path as needed

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
          to="/contact"
          className="text-lg font-bold text-red-500 hover:text-red-700"
        >
          Contact
        </Link>
      </nav>
      {account ? (
        <div className="flex items-center space-x-4">
          <div className="bg-green-500 text-white py-2 px-4 rounded-lg">
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
        >
          Connect Wallet
        </button>
      )}
    </header>
  );
};

export default Header;
