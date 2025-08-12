// Token definitions for each supported chain
export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export const NATIVE_TOKEN: Token = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "ETH",
  name: "Ethereum",
  decimals: 18,
}

export const TOKEN_LISTS: Record<number, Token[]> = {
  // Ethereum Mainnet
  1: [
    NATIVE_TOKEN,
    {
      address: "0xA0b86a33E6441b8435b662c7C5C8b4b1c8b4b1c8",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
    },
    {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
    },
  ],
  // Polygon
  137: [
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "MATIC",
      name: "Polygon",
      decimals: 18,
    },
    {
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    },
    {
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
    },
  ],
  // BSC
  56: [
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "BNB",
      name: "BNB",
      decimals: 18,
    },
    {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 18,
    },
    {
      address: "0x55d398326f99059fF775485246999027B3197955",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 18,
    },
    {
      address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
    },
  ],
  // Arbitrum
  42161: [
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    },
    {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
    },
  ],
}

export function getTokensForChain(chainId: number): Token[] {
  return TOKEN_LISTS[chainId] || []
}

export function findTokenByAddress(chainId: number, address: string): Token | undefined {
  const tokens = getTokensForChain(chainId)
  return tokens.find((token) => token.address.toLowerCase() === address.toLowerCase())
}
