// DEX Router addresses for different chains
export const DEX_ROUTERS = {
  // Ethereum Mainnet
  1: {
    uniswapV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    uniswapV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    sushiswap: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    oneInch: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  },
  // Polygon
  137: {
    quickswap: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    sushiswap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    uniswapV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    oneInch: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  },
  // BSC
  56: {
    pancakeswap: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    sushiswap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    oneInch: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  },
  // Arbitrum
  42161: {
    uniswapV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    sushiswap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    oneInch: "0x1111111254EEB25477B68fb85Ed929f73A960582",
  },
}

// 1inch API endpoints
export const ONEINCH_API_BASE = "https://api.1inch.dev"

// Common ERC20 ABI for token operations
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]

// Uniswap V2 Router ABI (simplified)
export const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
]
