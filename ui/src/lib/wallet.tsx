"use client"

import { ReactNode } from "react"
import { WagmiConfig, configureChains, createConfig } from "wagmi"
import { sepolia } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  RainbowKitProvider,
  getDefaultWallets
} from "@rainbow-me/rainbowkit"

const { chains, publicClient } = configureChains(
  [sepolia],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: "Zama DApp",
  projectId: "0f9d920184238b800441b4515fc87282", // dùng projectId từ WalletConnect Cloud
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}
