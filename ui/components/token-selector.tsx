"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ChevronDown, Search } from "lucide-react"
import { type Token, getTokensForChain } from "@/lib/tokens"
import { useWallet } from "./wallet-provider"
import { ethers } from "ethers"

interface TokenSelectorProps {
  selectedToken: Token | null
  onTokenSelect: (token: Token) => void
  otherToken?: Token | null
  label: string
}

export function TokenSelector({ selectedToken, onTokenSelect, otherToken, label }: TokenSelectorProps) {
  const { chainId, provider, account } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})
  const [availableTokens, setAvailableTokens] = useState<Token[]>([])

  // Update available tokens when chain changes
  useEffect(() => {
    if (chainId) {
      const tokens = getTokensForChain(chainId)
      setAvailableTokens(tokens)
    }
  }, [chainId])

  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!provider || !account || !chainId) return

      const tokens = getTokensForChain(chainId)
      const balances: Record<string, string> = {}

      for (const token of tokens) {
        try {
          if (token.address === "0x0000000000000000000000000000000000000000") {
            // Native token balance
            const balance = await provider.getBalance(account)
            balances[token.address] = ethers.formatEther(balance)
          } else {
            // ERC20 token balance
            const contract = new ethers.Contract(
              token.address,
              ["function balanceOf(address) view returns (uint256)"],
              provider,
            )
            const balance = await contract.balanceOf(account)
            balances[token.address] = ethers.formatUnits(balance, token.decimals)
          }
        } catch (error) {
          console.error(`Failed to fetch balance for ${token.symbol}:`, error)
          balances[token.address] = "0"
        }
      }

      setTokenBalances(balances)
    }

    fetchBalances()
  }, [provider, account, chainId])

  const filteredTokens = availableTokens.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())

    // Don't show the token that's selected in the other selector
    const isNotOtherToken = !otherToken || token.address !== otherToken.address

    return matchesSearch && isNotOtherToken
  })

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token)
    setIsOpen(false)
    setSearchQuery("")
  }

  const formatBalance = (balance: string) => {
    const num = Number.parseFloat(balance)
    if (num === 0) return "0"
    if (num < 0.001) return "< 0.001"
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return num.toFixed(2)
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 px-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <div className="flex items-center space-x-2">
            {selectedToken ? (
              <>
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0"></div>
                <div className="text-left">
                  <div className="font-medium">{selectedToken.symbol}</div>
                  <div className="text-xs text-gray-500">{selectedToken.name}</div>
                </div>
              </>
            ) : (
              <span className="text-gray-500">Select {label}</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select {label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Token List */}
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => handleTokenSelect(token)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0"></div>
                  <div className="text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatBalance(tokenBalances[token.address] || "0")}</div>
                  <div className="text-xs text-gray-500">Balance</div>
                </div>
              </button>
            ))}

            {filteredTokens.length === 0 && <div className="text-center py-8 text-gray-500">No tokens found</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
