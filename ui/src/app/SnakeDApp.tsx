"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import SnakeDAppUI from "@/components/snake-dapp-ui"

export default function SnakeDApp() {
  return (
    <div className="p-4">
      <ConnectButton />
      <SnakeDAppUI />
    </div>
  )
}
