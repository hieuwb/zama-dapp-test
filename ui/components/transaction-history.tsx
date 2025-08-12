"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Clock, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useTransactions } from "./transaction-provider"
import { useWallet } from "./wallet-provider"
import type { Transaction } from "@/lib/transaction-types"

export function TransactionHistory() {
  const { transactions, clearTransactions } = useTransactions()
  const { getSupportedChains } = useWallet()
  const [isOpen, setIsOpen] = useState(false)

  const supportedChains = getSupportedChains()

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      pending: "secondary",
      confirmed: "default",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getExplorerUrl = (chainId: number, hash: string) => {
    const chain = supportedChains[chainId as keyof typeof supportedChains]
    return chain ? `${chain.blockExplorer}/tx/${hash}` : "#"
  }

  const pendingCount = transactions.filter((tx) => tx.status === "pending").length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Clock className="w-4 h-4 mr-2" />
          History
          {pendingCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingCount}
            </div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Transaction History</DialogTitle>
            {transactions.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearTransactions}>
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Your swap history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(tx.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium capitalize">{tx.type}</span>
                          {getStatusBadge(tx.status)}
                        </div>

                        {tx.fromToken && tx.toToken && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {tx.fromToken.amount} {tx.fromToken.symbol} → {tx.toToken.amount} {tx.toToken.symbol}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTime(tx.timestamp)}</span>
                          <span>
                            {supportedChains[tx.chainId as keyof typeof supportedChains]?.name || `Chain ${tx.chainId}`}
                          </span>
                          {tx.gasUsed && <span>Gas: {Number.parseInt(tx.gasUsed).toLocaleString()}</span>}
                        </div>

                        {tx.error && (
                          <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {tx.error}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getExplorerUrl(tx.chainId, tx.hash), "_blank")}
                        className="p-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400 font-mono break-all">{tx.hash}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
