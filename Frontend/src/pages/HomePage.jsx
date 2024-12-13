import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Tokenization",
      description: "Mint and manage Real-World Asset (RWA) tokens.",
      color: "bg-blue-500",
      path: "/tokenization",
    },
    {
      title: "Dynamic Liquidity",
      description: "AI-powered liquidity aggregation for DeFi.",
      color: "bg-green-500",
    },
    {
      title: "Wallet Integration",
      description: "Seamless integration with MetaMask.",
      color: "bg-red-500",
    },
    {
      title: "Advanced Analytics",
      description: "Track asset performance in real time.",
      color: "bg-yellow-500",
    },
    {
      title: "Cross-chain Support",
      description: "Interact across multiple blockchains.",
      color: "bg-purple-500",
    },
  ];

  const handleFeatureClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen p-8">
      <section className="text-center mb-12">
        <h1 className="text-6xl font-black tracking-tight text-black">
          Discover <span className="text-blue-500">ALIQ</span>
        </h1>
        <p className="text-xl font-medium mt-4 text-gray-700">
          The AI-powered platform redefining tokenization and liquidity.
        </p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`p-6 text-white rounded-lg shadow-lg ${feature.color} cursor-pointer`}
            onClick={() => handleFeatureClick(feature.path)}
          >
            <h2 className="text-3xl font-bold">{feature.title}</h2>
            <p className="text-lg mt-2">{feature.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
};

export default HomePage;
