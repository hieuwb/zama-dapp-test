# 🔐 Zama DApp with FHEVM & Hardhat by Hieuwb

Link: (http://37.27.224.233:3000/)

This project is a **Fully Homomorphic Encryption (FHE)**-enabled smart contract DApp built with **Hardhat** and **FHEVM** by [Zama](https://www.zama.ai).

> ✨ Example contract: `FHECounter.sol`  
> 🔬 Works on both local dev node and Sepolia testnet

---

## 🚀 Quick Start

### ✅ Requirements

- Node.js v20+
- npm (or pnpm/yarn)
- Git
- Infura or similar RPC provider

---

### 📦 Installation

```bash
# Clone your own repository
git clone https://github.com/hieuwb/zama-dapp-test.git
cd zama-dapp-test

# Install dependencies
npm install
```

---

### 🔐 Environment Setup

Set required variables:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY # optional
```

---

### 🔨 Build & Test

```bash
npm run compile      # Compile contracts
npm run test         # Run tests
```

---

### 📡 Deploy

**Local FHEVM Node**  
```bash
npx hardhat node
npx hardhat deploy --network localhost
```

**Sepolia Testnet**  
```bash
npx hardhat deploy --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## 📁 Project Structure

```
zama-dapp-test/
├── contracts/           # Solidity contracts
├── deploy/              # Hardhat deploy scripts
├── tasks/               # Custom Hardhat tasks
├── test/                # Unit tests
├── hardhat.config.ts    # Hardhat config
└── package.json         # Scripts & dependencies
```

---

## 🧰 NPM Scripts

| Command             | Description              |
|---------------------|--------------------------|
| `npm run compile`   | Compile contracts         |
| `npm run test`      | Run all tests             |
| `npm run clean`     | Clean build artifacts     |
| `npm run coverage`  | Generate coverage report  |
| `npm run lint`      | Run code lint checks      |

---

## 📚 Resources

- 📘 [FHEVM Overview](https://docs.zama.ai/fhevm)
- 🛠️ [Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- 🔍 [Write FHEVM Tests](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)

---

## 🆘 Support

- GitHub Issues: [Report bugs or features](https://github.com/zama-ai/fhevm/issues)
- Discord: [Join Zama community](https://discord.gg/zama)

---

## 📄 License

Licensed under the **BSD-3-Clause-Clear** license. See [LICENSE](./LICENSE) for full text.

---
Discord: hieuwb
X: @AH_Fomo
> ✍️ Signed with GPG by [@hieuwb](https://github.com/hieuwb)
