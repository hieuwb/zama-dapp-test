// Environment variables for API keys
export const API_KEYS = {
  ONEINCH_API_KEY: process.env.NEXT_PUBLIC_ONEINCH_API_KEY || "demo-key",
  INFURA_PROJECT_ID: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || "",
  ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "",
}

// API endpoints
export const RPC_ENDPOINTS = {
  1: `https://mainnet.infura.io/v3/${API_KEYS.INFURA_PROJECT_ID}`,
  137: `https://polygon-mainnet.infura.io/v3/${API_KEYS.INFURA_PROJECT_ID}`,
  56: "https://bsc-dataseed.binance.org/",
  42161: `https://arbitrum-mainnet.infura.io/v3/${API_KEYS.INFURA_PROJECT_ID}`,
}
