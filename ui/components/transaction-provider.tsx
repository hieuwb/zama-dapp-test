"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "./wallet-provider"
import type { Transaction, TransactionStatus } from "@/lib/transaction-types"
import { useToast } from "@/hooks/use-toast"

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => void
  updateTransactionStatus: (hash: string, status: TransactionStatus, details?: Partial<Transaction>) => void
  getTransactionByHash: (hash: string) => Transaction | undefined
  clearTransactions: () => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}

interface TransactionProviderProps {
  children: ReactNode
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const { provider, account, chainId } = useWallet()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load transactions from localStorage on mount
  useEffect(() => {
    if (account) {
      const stored = localStorage.getItem(`transactions_${account}`)
      if (stored) {
        try {
          const parsedTransactions = JSON.parse(stored)
          setTransactions(parsedTransactions)
        } catch (error) {
          console.error("Failed to parse stored transactions:", error)
        }
      }
    }
  }, [account])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (account && transactions.length > 0) {
      localStorage.setItem(`transactions_${account}`, JSON.stringify(transactions))
    }
  }, [transactions, account])

  // Monitor pending transactions
  useEffect(() => {
    if (!provider) return

    const pendingTxs = transactions.filter((tx) => tx.status === "pending")
    if (pendingTxs.length === 0) return

    const checkTransactions = async () => {
      for (const tx of pendingTxs) {
        try {
          const receipt = await provider.getTransactionReceipt(tx.hash)
          if (receipt) {
            const status: TransactionStatus = receipt.status === 1 ? "confirmed" : "failed"
            updateTransactionStatus(tx.hash, status, {
              gasUsed: receipt.gasUsed.toString(),
              blockNumber: receipt.blockNumber,
            })

            // Show toast notification
            toast({
              title: status === "confirmed" ? "Transaction Confirmed" : "Transaction Failed",
              description: `${tx.type === "swap" ? "Swap" : "Approval"} ${status}`,
              variant: status === "confirmed" ? "default" : "destructive",
            })
          }
        } catch (error) {
          console.error(`Failed to check transaction ${tx.hash}:`, error)
        }
      }
    }

    // Check immediately and then every 10 seconds
    checkTransactions()
    const interval = setInterval(checkTransactions, 10000)

    return () => clearInterval(interval)
  }, [transactions, provider, toast])

  const addTransaction = (tx: Omit<Transaction, "id" | "timestamp">) => {
    const newTransaction: Transaction = {
      ...tx,
      id: `${tx.hash}_${Date.now()}`,
      timestamp: Date.now(),
    }

    setTransactions((prev) => [newTransaction, ...prev])
  }

  const updateTransactionStatus = (hash: string, status: TransactionStatus, details?: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.hash === hash
          ? {
              ...tx,
              status,
              ...details,
            }
          : tx,
      ),
    )
  }

  const getTransactionByHash = (hash: string) => {
    return transactions.find((tx) => tx.hash === hash)
  }

  const clearTransactions = () => {
    setTransactions([])
    if (account) {
      localStorage.removeItem(`transactions_${account}`)
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransactionStatus,
        getTransactionByHash,
        clearTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
