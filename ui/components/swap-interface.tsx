"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./wallet-provider"
import { useTransactions } from "./transaction-provider"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { AlertCircle, ArrowUpDown, Loader2, CheckCircle } from "lucide-react"
import { TokenSelector } from "./token-selector"
import { SwapSettings } from "./swap-settings"
import { SwapService, type SwapQuote } from "@/lib/swap-service"
import type { Token } from "@/lib/tokens"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"

export function SwapInterface() {
  const { account, chainId, provider } = useWallet()
  const { addTransaction } = useTransactions()
  const { toast } = useToast()

  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  // Updated to use real DEX integration with chainId
  const fetchQuote = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || !provider || !chainId) {
      setQuote(null)
      setToAmount("")
      setNeedsApproval(false)
      return
    }

    const amount = Number.parseFloat(fromAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      setQuote(null)
      setToAmount("")
      setNeedsApproval(false)
      return
    }

    setIsLoadingQuote(true)
    try {
      const swapService = new SwapService(provider, chainId)
      const newQuote = await swapService.getQuote(fromToken, toToken, fromAmount)

      if (newQuote) {
        setQuote(newQuote)
        setToAmount(newQuote.toAmount)

        // Check if token approval is needed
        if (fromToken.address !== "0x0000000000000000000000000000000000000000" && newQuote.allowanceTarget && account) {
          const allowance = await swapService.checkTokenAllowance(fromToken.address, newQuote.allowanceTarget, account)
          const fromAmountWei = ethers.parseUnits(fromAmount, fromToken.decimals)
          setNeedsApproval(BigInt(allowance) < fromAmountWei)
        } else {
          setNeedsApproval(false)
        }
      } else {
        setQuote(null)
        setToAmount("")
        setNeedsApproval(false)
        toast({
          title: "Quote Failed",
          description: "Unable to get price quote. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Quote error:", error)
      setQuote(null)
      setToAmount("")
      setNeedsApproval(false)
    } finally {
      setIsLoadingQuote(false)
    }
  }, [fromToken, toToken, fromAmount, provider, chainId, account, toast])

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
    setQuote(null)
    setNeedsApproval(false)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    setQuote(null)
    setNeedsApproval(false)
  }

  // Added token approval functionality
  const handleApproval = async () => {
    if (!fromToken || !quote || !provider || !chainId || !account) return

    setIsApproving(true)
    try {
      const swapService = new SwapService(provider, chainId)
      const fromAmountWei = ethers.parseUnits(fromAmount, fromToken.decimals)

      const txHash = await swapService.approveToken(fromToken.address, quote.allowanceTarget!, fromAmountWei.toString())

      addTransaction({
        hash: txHash,
        type: "approve",
        status: "pending",
        chainId,
        fromToken: {
          symbol: fromToken.symbol,
          amount: fromAmount,
          address: fromToken.address,
        },
      })

      toast({
        title: "Approval Submitted",
        description: `Approving ${fromToken.symbol} for trading`,
      })

      // Wait for approval to be mined
      const receipt = await provider.waitForTransaction(txHash)
      if (receipt?.status === 1) {
        setNeedsApproval(false)
        toast({
          title: "Approval Confirmed",
          description: `${fromToken.symbol} approved successfully`,
        })
      }
    } catch (error: any) {
      console.error("Approval error:", error)
      toast({
        title: "Approval Failed",
        description: error.message || "Token approval failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  // Updated swap execution to use real DEX integration
  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !provider || !account || !quote || !chainId) return

    setIsSwapping(true)
    try {
      const swapService = new SwapService(provider, chainId)
      const txHash = await swapService.executeSwap(
        {
          fromToken,
          toToken,
          fromAmount,
          slippage,
          userAddress: account,
        },
        quote,
      )

      addTransaction({
        hash: txHash,
        type: "swap",
        status: "pending",
        chainId,
        fromToken: {
          symbol: fromToken.symbol,
          amount: fromAmount,
          address: fromToken.address,
        },
        toToken: {
          symbol: toToken.symbol,
          amount: toAmount,
          address: toToken.address,
        },
      })

      toast({
        title: "Swap Submitted",
        description: `Swapping ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`,
      })

      setFromAmount("")
      setToAmount("")
      setQuote(null)
      setNeedsApproval(false)
    } catch (error: any) {
      console.error("Swap error:", error)
      toast({
        title: "Swap Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }

  if (!account) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to start swapping tokens</p>
        </CardContent>
      </Card>
    )
  }

  const canSwap = fromToken && toToken && fromAmount && quote && !isLoadingQuote && !isSwapping && !needsApproval
  const canApprove = needsApproval && !isApproving && !isSwapping
  const priceImpactHigh = quote && Number.parseFloat(quote.priceImpact) > 3

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-center flex-1">Swap Tokens</CardTitle>
          <SwapSettings slippage={slippage} onSlippageChange={setSlippage} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
            {fromToken && <span className="text-xs text-gray-500">Balance: 0.00 {fromToken.symbol}</span>}
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            <div className="w-32">
              <TokenSelector
                selectedToken={fromToken}
                onTokenSelect={setFromToken}
                otherToken={toToken}
                label="token"
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapTokens}
            className="rounded-full w-10 h-10 p-0 border-2 bg-transparent"
            disabled={isLoadingQuote || isSwapping || isApproving}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
            {toToken && <span className="text-xs text-gray-500">Balance: 0.00 {toToken.symbol}</span>}
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="text-lg font-medium bg-gray-50 dark:bg-gray-800"
              />
              {isLoadingQuote && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <div className="w-32">
              <TokenSelector selectedToken={toToken} onTokenSelect={setToToken} otherToken={fromToken} label="token" />
            </div>
          </div>
        </div>

        {/* Approval Button */}
        {needsApproval && (
          <Button
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
            disabled={!canApprove}
            onClick={handleApproval}
          >
            {isApproving ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Approving {fromToken?.symbol}...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Approve {fromToken?.symbol}</span>
              </div>
            )}
          </Button>
        )}

        {/* Swap Button */}
        <Button
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
          disabled={!canSwap}
          onClick={handleSwap}
        >
          {isSwapping ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Swapping...</span>
            </div>
          ) : !fromToken || !toToken ? (
            "Select tokens"
          ) : !fromAmount ? (
            "Enter amount"
          ) : isLoadingQuote ? (
            "Getting quote..."
          ) : needsApproval ? (
            "Approve token first"
          ) : (
            "Swap"
          )}
        </Button>

        {/* Price Impact Warning */}
        {priceImpactHigh && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">High Price Impact</span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              This swap has a price impact of {quote?.priceImpact}%. Consider reducing your trade size.
            </p>
          </div>
        )}

        {/* Swap Details */}
        {quote && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">DEX</span>
              <span className="font-medium">{quote.dex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Exchange Rate</span>
              <span>
                1 {quote.fromToken.symbol} = {quote.exchangeRate} {quote.toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Price Impact</span>
              <span className={Number.parseFloat(quote.priceImpact) > 3 ? "text-yellow-600" : ""}>
                {quote.priceImpact}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
              <span>{quote.gasEstimate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance</span>
              <span>{slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Route</span>
              <span>{quote.route.join(" → ")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
