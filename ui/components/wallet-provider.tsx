"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"

export const SUPPORTED_CHAINS = {
  11155111: {
    name: "Sepolia Testnet",
    symbol: "SepoliaETH",
    rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "Sepolia Ether", symbol: "SepoliaETH", decimals: 18 },
  },
}

interface WalletContextType {
  account: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchChain: (chainId: number) => Promise<void>
  getSupportedChains: () => typeof SUPPORTED_CHAINS
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask!")
      return
    }

    try {
      setIsConnecting(true)

      // First request accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Create provider after account connection
      const provider = new ethers.BrowserProvider(window.ethereum)

      // Check current network
      const network = await provider.getNetwork()
      const currentChainId = Number(network.chainId)

      // If not on Sepolia, switch to it
      if (currentChainId !== 11155111) {
        await switchChain(11155111)
        // Wait a bit for network to switch
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Create new provider instance after network switch
        const newProvider = new ethers.BrowserProvider(window.ethereum)
        const newNetwork = await newProvider.getNetwork()

        setProvider(newProvider)
        setChainId(Number(newNetwork.chainId))
      } else {
        setProvider(provider)
        setChainId(currentChainId)
      }

      setAccount(accounts[0])
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      if (error.code === "NETWORK_ERROR" || error.message?.includes("network changed")) {
        // Network change is expected, try to reconnect
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const network = await provider.getNetwork()
          setProvider(provider)
          setChainId(Number(network.chainId))
        } catch (retryError) {
          console.error("Retry connection failed:", retryError)
        }
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
  }

  const switchChain = async (targetChainId: number) => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (error: any) {
      // Chain not added to wallet
      if (error.code === 4902) {
        const chain = SUPPORTED_CHAINS[targetChainId as keyof typeof SUPPORTED_CHAINS]
        if (chain) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [chain.rpcUrl],
                  blockExplorerUrls: [chain.blockExplorer],
                },
              ],
            })
          } catch (addError) {
            console.error("Failed to add chain:", addError)
            throw addError
          }
        }
      } else {
        console.error("Failed to switch chain:", error)
        throw error
      }
    }
  }

  const getSupportedChains = () => SUPPORTED_CHAINS

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setAccount(accounts[0])
      }
    }

    const handleChainChanged = async (chainId: string) => {
      const newChainId = Number.parseInt(chainId, 16)
      setChainId(newChainId)

      // Update provider when chain changes
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(newProvider)
      } catch (error) {
        console.error("Failed to update provider after chain change:", error)
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum?.removeListener("chainChanged", handleChainChanged)
    }
  }, [])

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window === "undefined" || !window.ethereum) return

      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const network = await provider.getNetwork()
          setProvider(provider)
          setAccount(accounts[0].address)
          setChainId(Number(network.chainId))
        }
      } catch (error) {
        console.error("Auto-connect failed:", error)
      }
    }

    autoConnect()
  }, [])

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        provider,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchChain,
        getSupportedChains,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
