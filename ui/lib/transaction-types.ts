export interface Transaction {
  id: string
  hash: string
  type: "swap" | "approve"
  status: "pending" | "confirmed" | "failed"
  timestamp: number
  chainId: number
  fromToken?: {
    symbol: string
    amount: string
    address: string
  }
  toToken?: {
    symbol: string
    amount: string
    address: string
  }
  gasUsed?: string
  gasPrice?: string
  blockNumber?: number
  error?: string
}

export type TransactionStatus = "pending" | "confirmed" | "failed"
