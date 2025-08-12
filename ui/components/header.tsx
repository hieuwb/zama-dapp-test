"use client"

import { useWallet } from "./wallet-provider"
import { Button } from "./ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

export function Header() {
  const { account, chainId, isConnecting, connectWallet, disconnectWallet, switchChain, getSupportedChains } =
    useWallet()

  const supportedChains = getSupportedChains()
  const currentChain = chainId ? supportedChains[chainId as keyof typeof supportedChains] : null

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Zama Swap
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sepolia Testnet</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {account && currentChain && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 dark:text-green-400">{currentChain.name}</span>
              </div>
            )}

            {/* Wallet Connection */}
            {account ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{formatAddress(account)}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={disconnectWallet}>Disconnect</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
