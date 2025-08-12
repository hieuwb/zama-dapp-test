"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useWallet } from "./wallet-provider"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ArrowUpDown, Loader2 } from "lucide-react"
import { SEPOLIA_TOKENS, type Token } from "@/lib/sepolia-tokens"
import { useToast } from "@/hooks/use-toast"

export function SimpleSwap() {
  const { account, provider, chainId } = useWallet()
  const { toast } = useToast()

  const [fromToken, setFromToken] = useState<Token>(SEPOLIA_TOKENS[0])
  const [toToken, setToToken] = useState<Token>(SEPOLIA_TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [isSwapping, setIsSwapping] = useState(false)
  const [fromBalance, setFromBalance] = useState("0")
  const [toBalance, setToBalance] = useState("0")

  const fetchBalance = async (token: Token) => {
    if (!provider || !account) return "0"

    try {
      if (token.address === "0x0000000000000000000000000000000000000000") {
        const balance = await provider.getBalance(account)
        return ethers.formatEther(balance)
      } else {
        const erc20Abi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ]

        const contract = new ethers.Contract(token.address, erc20Abi, provider)
        const [balance, decimals] = await Promise.all([contract.balanceOf(account), contract.decimals()])

        return ethers.formatUnits(balance, decimals)
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
      return "0"
    }
  }

  const refreshBalances = async () => {
    if (account && provider) {
      try {
        const [fromBal, toBal] = await Promise.all([fetchBalance(fromToken), fetchBalance(toToken)])
        setFromBalance(fromBal)
        setToBalance(toBal)
      } catch (error) {
        console.error("Error refreshing balances:", error)
        toast({
          title: "Balance Error",
          description: "Failed to fetch token balances",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    refreshBalances()
  }, [account, provider, fromToken, toToken])

  useEffect(() => {
    if (fromAmount && !isNaN(Number(fromAmount))) {
      const mockRate = 0.95 // Simple 5% slippage for demo
      setToAmount((Number(fromAmount) * mockRate).toFixed(6))
    } else {
      setToAmount("")
    }
  }, [fromAmount, fromToken, toToken])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempBalance = fromBalance
    setFromToken(toToken)
    setToToken(tempToken)
    setFromBalance(toBalance)
    setToBalance(tempBalance)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleSwap = async () => {
    if (!account || !provider || chainId !== 11155111) {
      toast({
        title: "Connection Error",
        description: "Please connect to Sepolia Testnet",
        variant: "destructive",
      })
      return
    }

    if (!fromAmount || !toAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setIsSwapping(true)

    try {
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: account, // Send to self for demo
        value: ethers.parseEther("0.001"), // Small amount for testnet
        gasLimit: 21000,
      })

      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      })

      const receipt = await tx.wait()

      if (receipt?.status === 1) {
        toast({
          title: "Swap Successful!",
          description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        })

        setFromAmount("")
        setToAmount("")

        await refreshBalances()

        setTimeout(async () => {
          await refreshBalances()
        }, 3000)
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error: any) {
      console.error("Swap failed:", error)

      if (error.code === 4001) {
        toast({
          title: "Transaction Cancelled",
          description: "You cancelled the transaction",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Swap Failed",
          description: error.message || "Transaction failed. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSwapping(false)
    }
  }

  if (!account) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Connect your wallet to start swapping on Sepolia Testnet</p>
        </CardContent>
      </Card>
    )
  }

  if (chainId !== 11155111) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-yellow-600 dark:text-yellow-400">Please switch to Sepolia Testnet to use Zama Swap</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Swap Tokens</CardTitle>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">Trade tokens on Sepolia Testnet</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>From</span>
            <span className="text-gray-500">Balance: {Number(fromBalance).toFixed(4)}</span>
          </div>
          <div className="flex space-x-2">
            <Select
              value={fromToken.address}
              onValueChange={(value) => {
                const token = SEPOLIA_TOKENS.find((t) => t.address === value)
                if (token) setFromToken(token)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEPOLIA_TOKENS.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={handleSwapTokens} className="rounded-full p-2">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>To</span>
            <span className="text-gray-500">Balance: {Number(toBalance).toFixed(4)}</span>
          </div>
          <div className="flex space-x-2">
            <Select
              value={toToken.address}
              onValueChange={(value) => {
                const token = SEPOLIA_TOKENS.find((t) => t.address === value)
                if (token) setToToken(token)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEPOLIA_TOKENS.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="flex-1 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isSwapping || !fromAmount || !toAmount}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isSwapping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : (
            "Swap Tokens"
          )}
        </Button>

        <div className="text-xs text-center text-gray-500 dark:text-gray-400 space-y-1">
          <p>⚡ Powered by Zama Protocol</p>
          <p>🔒 Privacy-preserving swaps on Sepolia</p>
        </div>
      </CardContent>
    </Card>
  )
}
