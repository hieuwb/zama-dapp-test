export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export const SEPOLIA_TOKENS: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "SepoliaETH",
    name: "Sepolia Ether",
    decimals: 18,
    logoURI: "/ethereum-logo.png",
  },
  {
    address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    symbol: "LINK",
    name: "Chainlink Token",
    decimals: 18,
    logoURI: "/chainlink-logo.png",
  },
  {
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    symbol: "UNI",
    name: "Uniswap Token",
    decimals: 18,
    logoURI: "/uniswap-logo.png",
  },
  {
    address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logoURI: "/placeholder-8ljm2.png",
  },
  {
    address: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "/usdc-logo.png",
  },
]

export function getTokenByAddress(address: string): Token | undefined {
  return SEPOLIA_TOKENS.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

export function getTokenBySymbol(symbol: string): Token | undefined {
  return SEPOLIA_TOKENS.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase())
}
