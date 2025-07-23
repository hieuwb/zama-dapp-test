"use client"

import { ReactNode } from "react"
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit"
import {
  metaMaskWallet,
  okxWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"
import { WagmiConfig, configureChains, createConfig } from "wagmi"
import { sepolia } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import "@rainbow-me/rainbowkit/styles.css"

// 1. Cấu hình mạng & provider
const { chains, publicClient } = configureChains(
  [sepolia],
  [publicProvider()]
)

// 2. Thêm các loại ví
const connectors = connectorsForWallets([
  {
    groupName: "Wallets",
    wallets: [
      metaMaskWallet({ chains, projectId: "0f9d920184238b800441b4515fc87282" }),
      okxWallet({ chains, projectId: "0f9d920184238b800441b4515fc87282" }),
      walletConnectWallet({ chains, projectId: "0f9d920184238b800441b4515fc87282" }),
    ],
  },
])

// 3. Cấu hình wagmi
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

// 4. Component bao bọc toàn bộ App
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
