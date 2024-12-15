import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaCoins,
  FaChartLine,
  FaShieldAlt,
  FaCode,
  FaDatabase,
} from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      title: "AI-Driven Liquidity",
      description:
        "Machine learning powered allocation across DeFi protocols and RWAs",
      icon: <FaRobot className="text-4xl mb-4" />,
      color: "from-blue-500 to-purple-600",
      path: "/liquidity",
      stats: { tvl: "$5.2M", users: "1.2k", apy: "12.5%" },
    },
    {
      title: "RWA Tokenization",
      description:
        "Tokenize real-world assets with ERC-1155 and secure IPFS metadata",
      icon: <FaCoins className="text-4xl mb-4" />,
      color: "from-green-500 to-teal-600",
      path: "/tokenization",
      stats: { assets: "250+", value: "$12M", holders: "850" },
    },
    {
      title: "AI Metadata Validation",
      description: "LLM-powered validation with zero-knowledge proofs",
      icon: <FaShieldAlt className="text-4xl mb-4" />,
      color: "from-yellow-500 to-orange-600",
      path: "/validation",
      stats: { validated: "1.5k", accuracy: "99.9%", proofs: "12k" },
    },
    {
      title: "Intent Optimization",
      description: "Specify goals and let AI optimize your strategy",
      icon: <FaChartLine className="text-4xl mb-4" />,
      color: "from-red-500 to-pink-600",
      path: "/intent",
      stats: { strategies: "15", returns: "+25%", active: "500" },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 mb-6">
            Welcome to ALIQ
          </h1>
          <p className="text-2xl text-gray-300 mb-12">
            AI-Powered Intent-Based Liquidity Allocation Platform
          </p>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => navigate("/tokenization")}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg text-white font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              Start Tokenizing
            </button>
            <button
              onClick={() => navigate("/liquidity")}
              className="px-8 py-3 bg-gray-700 rounded-lg text-white font-bold hover:bg-gray-600 transition-all"
            >
              View Pools
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl bg-gradient-to-br ${feature.color} transform hover:scale-105 transition-all cursor-pointer`}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
              onClick={() => navigate(feature.path)}
            >
              <div className="text-white">
                {feature.icon}
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="mb-4 opacity-90">{feature.description}</p>

                {/* Stats Display */}
                {activeFeature === index && (
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                    {Object.entries(feature.stats).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-lg font-bold">{value}</div>
                        <div className="text-sm opacity-75">{key}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Stack */}
      <section className="bg-gray-800/50 py-16 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Powered By</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["Mantle", "IPFS", "LLaMA", "Circom"].map((tech) => (
              <div
                key={tech}
                className="text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <div className="text-xl font-semibold">{tech}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
