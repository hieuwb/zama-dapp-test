"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Play, RotateCcw, Trophy } from "lucide-react"

interface Position {
  x: number
  y: number
}

interface GameState {
  snake: Position[]
  food: Position
  direction: Position
  gameOver: boolean
  score: number
  isPlaying: boolean
}

export default function SnakeDApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 0, y: 0 },
    gameOver: false,
    score: 0,
    isPlaying: false,
  })

  const GRID_SIZE = 20
  const CANVAS_SIZE = 400

  // Wallet connection functions
  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })
        setWalletAddress(accounts[0])
        setWalletConnected(true)
      } else {
        // Mock wallet connection for demo
        const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
        setWalletAddress(mockAddress)
        setWalletConnected(true)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnectWallet = () => {
    setWalletConnected(false)
    setWalletAddress("")
  }

  // Game functions
  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
    }
  }, [])

  const resetGame = () => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: generateFood(),
      direction: { x: 0, y: 0 },
      gameOver: false,
      score: 0,
      isPlaying: false,
    })
  }

  const startGame = () => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      direction: { x: 1, y: 0 },
    }))
  }

  const moveSnake = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.gameOver) return prev

      const newSnake = [...prev.snake]
      const head = { ...newSnake[0] }

      head.x += prev.direction.x
      head.y += prev.direction.y

      // Check wall collision
      if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        return { ...prev, gameOver: true, isPlaying: false }
      }

      // Check self collision
      if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        return { ...prev, gameOver: true, isPlaying: false }
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === prev.food.x && head.y === prev.food.y) {
        return {
          ...prev,
          snake: newSnake,
          food: generateFood(),
          score: prev.score + 10,
        }
      } else {
        newSnake.pop()
        return {
          ...prev,
          snake: newSnake,
        }
      }
    })
  }, [generateFood])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return

      setGameState((prev) => {
        let newDirection = { ...prev.direction }

        switch (e.key) {
          case "ArrowUp":
            if (prev.direction.y === 0) newDirection = { x: 0, y: -1 }
            break
          case "ArrowDown":
            if (prev.direction.y === 0) newDirection = { x: 0, y: 1 }
            break
          case "ArrowLeft":
            if (prev.direction.x === 0) newDirection = { x: -1, y: 0 }
            break
          case "ArrowRight":
            if (prev.direction.x === 0) newDirection = { x: 1, y: 0 }
            break
        }

        return { ...prev, direction: newDirection }
      })
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState.isPlaying])

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying) return

    const gameInterval = setInterval(moveSnake, 150)
    return () => clearInterval(gameInterval)
  }, [gameState.isPlaying, moveSnake])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw snake
    ctx.fillStyle = "#22c55e"
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        ctx.fillStyle = "#16a34a"
      } else {
        ctx.fillStyle = "#22c55e"
      }
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2)
    })

    // Draw food
    ctx.fillStyle = "#ef4444"
    ctx.fillRect(gameState.food.x * GRID_SIZE, gameState.food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2)

    // Draw grid
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, CANVAS_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(CANVAS_SIZE, i)
      ctx.stroke()
    }
  }, [gameState])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🐍</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Snake dApp</h1>
          </div>

          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Wallet className="w-4 h-4 mr-1" />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Badge>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Game Canvas */}
          <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Game Board</span>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">{gameState.score}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border-2 border-white/20 rounded-lg"
              />

              <div className="flex gap-2">
                {!gameState.isPlaying && !gameState.gameOver && (
                  <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                )}

                {gameState.gameOver && (
                  <div className="text-center">
                    <p className="text-red-400 font-bold mb-2">Game Over!</p>
                    <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </div>
                )}

                {gameState.isPlaying && (
                  <Button onClick={resetGame} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Info */}
          <div className="space-y-6">
            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                <p>• Use arrow keys to control the snake</p>
                <p>• Eat the red food to grow and score points</p>
                <p>• Avoid hitting walls or yourself</p>
                <p>• Each food gives you 10 points</p>
                <p>• Connect your wallet to save high scores!</p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-gray-300">
                  <span>Current Score:</span>
                  <span className="text-yellow-400 font-bold">{gameState.score}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Snake Length:</span>
                  <span className="text-green-400 font-bold">{gameState.snake.length}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Status:</span>
                  <Badge variant={gameState.isPlaying ? "default" : gameState.gameOver ? "destructive" : "secondary"}>
                    {gameState.isPlaying ? "Playing" : gameState.gameOver ? "Game Over" : "Ready"}
                  </Badge>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Wallet:</span>
                  <Badge variant={walletConnected ? "default" : "outline"}>
                    {walletConnected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {walletConnected && (
              <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Web3 Features</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p>🎮 Wallet connected! Future features:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Save high scores on-chain</li>
                    <li>• Earn tokens for high scores</li>
                    <li>• Compete in tournaments</li>
                    <li>• NFT rewards for achievements</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
