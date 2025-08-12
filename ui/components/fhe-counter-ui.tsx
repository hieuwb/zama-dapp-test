"use client"

import { useState, useEffect } from "react"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { formatEther } from "viem"
import { ethers } from "ethers"

// ABI rút gọn chỉ cần các hàm cần dùng
const FHECounterABI = [
  "function getCounter() view returns (uint256)",
  "function increment() public",
  "function decrement() public"
]

// Địa chỉ contract FHECounter trên Sepolia
const CONTRACT_ADDRESS = "0x2703Cd19A583256e08BB4D9c56d7377a7D74F806"

export function FHECounterUI() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [counter, setCounter] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Hàm đọc counter từ contract
  const fetchCounter = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://rpc.sepolia.org" // RPC Sepolia
      )
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FHECounterABI, provider)
      const value = await contract.getCounter()
      setCounter(Number(value))
    } catch (error) {
      console.error("Lỗi khi đọc counter:", error)
    }
  }

  // Hàm gọi increment/decrement
  const callContract = async (method: "increment" | "decrement") => {
    if (!walletClient) return
    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(walletClient as any)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FHECounterABI, signer)
      const tx = await contract[method]()
      await tx.wait()
      await fetchCounter()
    } catch (error) {
      console.error(`Lỗi khi gọi ${method}:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCounter()
  }, [])

  return (
    <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Encrypted Counter</h3>
      {counter !== null ? (
        <p className="text-lg">
          Giá trị hiện tại: <span className="font-bold">{counter}</span>
        </p>
      ) : (
        <p>Đang tải...</p>
      )}
      {isConnected ? (
        <div className="flex gap-4">
          <button
            onClick={() => callContract("increment")}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            + Tăng
          </button>
          <button
            onClick={() => callContract("decrement")}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            - Giảm
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Hãy kết nối ví để thao tác</p>
      )}
    </div>
  )
}
