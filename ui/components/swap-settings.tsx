"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Settings, Info } from "lucide-react"

interface SwapSettingsProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
}

export function SwapSettings({ slippage, onSlippageChange }: SwapSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customSlippage, setCustomSlippage] = useState("")

  const presetSlippages = [0.1, 0.5, 1.0]

  const handlePresetSlippage = (value: number) => {
    onSlippageChange(value)
    setCustomSlippage("")
  }

  const handleCustomSlippage = (value: string) => {
    setCustomSlippage(value)
    const numValue = Number.parseFloat(value)
    if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slippage Tolerance */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">Slippage Tolerance</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              {presetSlippages.map((preset) => (
                <Button
                  key={preset}
                  variant={slippage === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetSlippage(preset)}
                  className="flex-1"
                >
                  {preset}%
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Custom"
                value={customSlippage}
                onChange={(e) => handleCustomSlippage(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                min="0"
                max="50"
                step="0.1"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>

            <p className="text-xs text-gray-500">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>

          {/* Transaction Deadline */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">Transaction Deadline</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                defaultValue="20"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                min="1"
                max="4320"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>

            <p className="text-xs text-gray-500">
              Your transaction will revert if it is pending for more than this long.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
