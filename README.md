# ALIQ: AI-Powered Dynamic Liquidity Aggregator

**ALIQ (AI-Powered Dynamic Liquidity Aggregator)** is a cutting-edge DeFi platform that bridges Real-World Assets (RWAs), Decentralized Finance protocols, and advanced AI-driven optimization. Built on Mantle's scalable infrastructure, ALIQ offers seamless liquidity aggregation, RWA tokenization, and AI-powered financial strategies for optimal user outcomes.

---

## 🚀 Features

1. **AI-Driven Liquidity Allocation**

   - Uses machine learning to analyze on-chain and off-chain data for optimal liquidity allocation.
   - Dynamically manages staking, lending, and liquidity provisioning across protocols and RWAs.

2. **RWA Tokenization**

   - Tokenize real-world assets like real estate, invoices, or commodities using ERC-1155 tokens.
   - Store metadata securely on IPFS and integrate seamlessly into DeFi ecosystems.

3. **AI-Powered Metadata Validation**

   - Validate user-provided metadata using advanced LLMs like LLaMA.
   - Leverage Zero-Knowledge Proofs (ZKPs) to ensure data validity without revealing sensitive information.

4. **Decentralized Perpetual Markets**

   - Integrated perpetual trading system with Central Limit Order Book (CLOB) infrastructure.
   - AI models assess and mitigate liquidation risks in real time.

5. **Intent-Based Liquidity Optimization**

   - Enables users to specify financial goals (e.g., maximize staking, minimize risk).
   - AI dynamically matches user intents with optimal strategies in Mantle's ecosystem.

6. **Developer Toolkit**
   - APIs and SDKs for building AI-enhanced DeFi applications.
   - Tools for simulating and optimizing liquidity strategies.

---

## 🛠️ Technical Stack

- **Blockchain Layer**: Built on Mantle for high scalability and cost efficiency.
- **Tokenization Protocol**: ERC-1155 for flexible asset representation.
- **AI Models**: Powered by Python-based ML frameworks and LLaMA LLM.
- **ZKP Validation**: Uses Circom and SnarkJS for validating metadata integrity.
- **Storage**: IPFS for decentralized metadata storage.
- **Frontend**: React.js for a responsive and intuitive user interface.
- **Backend**: Node.js + Flask for APIs and LLM integration.

---

## 🖼️ Application Flow

![System Design Flowchart](https://github.com/user-attachments/assets/f0b74c89-8f2f-4723-98f5-cda80295d80e)

---

## 📖 User Flow for Liquidity Pool Interaction

1. **Wallet Connection**

   - User connects their wallet (e.g., MetaMask) to the ALIQ platform.
   - Wallet connection is securely established using Web3.js.

2. **Asset Deposit**

   - Users deposit crypto assets or tokenized RWAs into the liquidity pool.
   - Deposits are secured by smart contracts deployed on Mantle.

3. **Metadata Submission**

   - Users submit metadata (e.g., property name, address, and price) for RWAs.
   - Metadata is stored on IPFS and validated via AI models.

4. **Metadata Validation**

   - The AI validates the metadata for accuracy and appropriateness.
   - ZKPs are generated to ensure metadata integrity without revealing the original data.

5. **Liquidity Allocation**

   - The platform’s AI dynamically allocates liquidity based on the user’s intent (e.g., maximize staking returns, minimize risk).
   - Allocations are optimized across DeFi protocols and tokenized RWAs.

6. **Earnings**
   - Users earn rewards from staking, lending, or yield farming.
   - AI rebalances liquidity periodically to maximize returns.

---

## 💻 Development

### Smart Contracts

- Built using Solidity 0.8.22
- Uses OpenZeppelin contracts for security
- Implements ERC1155 for RWA tokenization

### Frontend

- React.js with Vite
- Ethers.js for blockchain interaction
- TailwindCSS for styling

### Backend

- Flask API for AI integration
- Circom for ZK circuit implementation
- IPFS integration for metadata storage

---

## 🏗️ Architecture

1. **Smart Contract Layer**

   - ERC1155LiquidityPool: Manages liquidity and asset allocation
   - MockOracle: Provides price feeds and allocation data
   - RealEstateToken: Handles RWA tokenization

2. **Frontend Layer**

   - React components for user interaction
   - Web3 integration for blockchain transactions
   - IPFS integration for metadata storage

3. **Backend Layer**
   - AI models for allocation optimization
   - ZK proofs for metadata validation
   - API endpoints for data processing

---

## 🛡️ Security Features

1. **ZKP-Enhanced Metadata Validation**

   - Ensures data integrity without revealing sensitive information using Zero-Knowledge Proofs.

2. **Scalable Smart Contracts**

   - Built on Mantle to handle high throughput while minimizing costs.

3. **Secure Wallet Integration**
   - Utilizes industry-standard Web3.js libraries for secure and seamless wallet connections.

---

## ⚠️ Disclaimer

This project is a **Proof of Concept (POC)** created for the Mantle APAC Hackathon hackathon. It is not intended for production use and may lack robust security, scalability, and comprehensive testing.

The goal of this POC is to demonstrate the feasibility and innovation of the proposed idea within the limited time frame of the hackathon. Contributions and feedback are welcome to help evolve this project further!

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 💬 Contact

For any inquiries or support, reach out to us at [rtbchawla12@gmail.com](mailto:rtbchawla12@gmail.com) or create an issue in the [repository](https://github.com/rtb-12/ALIQ/issues).
