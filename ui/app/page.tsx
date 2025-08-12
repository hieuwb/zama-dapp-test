"use client"

import { WalletProvider } from "@/components/wallet-provider"
import { SimpleSwap } from "@/components/simple-swap"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { FHECounterUI } from "@/components/fhe-counter-ui"

export default function Home() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Zama Protocol Swap</h2>
              <p className="text-gray-600 dark:text-gray-300">Privacy-preserving token swaps on Sepolia Testnet</p>
            </div>
            <SimpleSwap />
          </div>
        </main>
        <Toaster />
      </div>
    </WalletProvider>
  )
}
