import { ethers } from "ethers"
import type { Token } from "./tokens"
import { DEX_ROUTERS, ERC20_ABI, UNISWAP_V2_ROUTER_ABI, ONEINCH_API_BASE } from "./dex-config"

export interface SwapQuote {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  exchangeRate: string
  priceImpact: string
  gasEstimate: string
  route: string[]
  dex: string
  allowanceTarget?: string
}

export interface SwapParams {
  fromToken: Token
  toToken: Token
  fromAmount: string
  slippage: number
  userAddress: string
}

export class SwapService {
  private provider: ethers.BrowserProvider
  private chainId: number

  constructor(provider: ethers.BrowserProvider, chainId: number) {
    this.provider = provider
    this.chainId = chainId
  }

  async getQuote(fromToken: Token, toToken: Token, fromAmount: string): Promise<SwapQuote | null> {
    try {
      // Try 1inch first for best rates
      const oneInchQuote = await this.get1inchQuote(fromToken, toToken, fromAmount)
      if (oneInchQuote) {
        return oneInchQuote
      }

      // Fallback to Uniswap V2 for direct quotes
      const uniswapQuote = await this.getUniswapQuote(fromToken, toToken, fromAmount)
      if (uniswapQuote) {
        return uniswapQuote
      }

      // Final fallback to mock data
      return this.getMockQuote(fromToken, toToken, fromAmount)
    } catch (error) {
      console.error("Failed to get quote:", error)
      return this.getMockQuote(fromToken, toToken, fromAmount)
    }
  }

  private async get1inchQuote(fromToken: Token, toToken: Token, fromAmount: string): Promise<SwapQuote | null> {
    try {
      const fromAmountWei = ethers.parseUnits(fromAmount, fromToken.decimals)

      const params = new URLSearchParams({
        src: fromToken.address,
        dst: toToken.address,
        amount: fromAmountWei.toString(),
      })

      const response = await fetch(`${ONEINCH_API_BASE}/swap/v6.0/${this.chainId}/quote?${params}`, {
        headers: {
          Authorization: "Bearer YOUR_1INCH_API_KEY", // In production, use environment variable
        },
      })

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status}`)
      }

      const data = await response.json()
      const toAmountFormatted = ethers.formatUnits(data.toAmount, toToken.decimals)
      const exchangeRate = (Number.parseFloat(toAmountFormatted) / Number.parseFloat(fromAmount)).toFixed(6)

      return {
        fromToken,
        toToken,
        fromAmount,
        toAmount: toAmountFormatted,
        exchangeRate,
        priceImpact: "0.1", // 1inch doesn't always provide this
        gasEstimate: `$${((Number.parseInt(data.gas) * 20 * 3500) / 1e18).toFixed(2)}`,
        route: data.protocols?.[0]?.map((p: any) => p.name) || [fromToken.symbol, toToken.symbol],
        dex: "1inch",
        allowanceTarget: data.to,
      }
    } catch (error) {
      console.error("1inch quote failed:", error)
      return null
    }
  }

  private async getUniswapQuote(fromToken: Token, toToken: Token, fromAmount: string): Promise<SwapQuote | null> {
    try {
      const routers = DEX_ROUTERS[this.chainId as keyof typeof DEX_ROUTERS]
      if (!routers?.uniswapV2) {
        return null
      }

      const routerContract = new ethers.Contract(routers.uniswapV2, UNISWAP_V2_ROUTER_ABI, this.provider)
      const fromAmountWei = ethers.parseUnits(fromAmount, fromToken.decimals)

      // Create path for swap
      const path = [fromToken.address, toToken.address]

      // Handle native token swaps
      const WETH_ADDRESS = this.getWETHAddress()
      if (fromToken.address === "0x0000000000000000000000000000000000000000") {
        path[0] = WETH_ADDRESS
      }
      if (toToken.address === "0x0000000000000000000000000000000000000000") {
        path[1] = WETH_ADDRESS
      }

      const amounts = await routerContract.getAmountsOut(fromAmountWei, path)
      const toAmountWei = amounts[amounts.length - 1]
      const toAmountFormatted = ethers.formatUnits(toAmountWei, toToken.decimals)
      const exchangeRate = (Number.parseFloat(toAmountFormatted) / Number.parseFloat(fromAmount)).toFixed(6)

      return {
        fromToken,
        toToken,
        fromAmount,
        toAmount: toAmountFormatted,
        exchangeRate,
        priceImpact: "0.3", // Estimated
        gasEstimate: "$5.00", // Estimated
        route: [fromToken.symbol, toToken.symbol],
        dex: "Uniswap V2",
        allowanceTarget: routers.uniswapV2,
      }
    } catch (error) {
      console.error("Uniswap quote failed:", error)
      return null
    }
  }

  private getMockQuote(fromToken: Token, toToken: Token, fromAmount: string): SwapQuote {
    const mockExchangeRate = this.getMockExchangeRate(fromToken, toToken)
    const fromAmountNum = Number.parseFloat(fromAmount)
    const toAmountNum = fromAmountNum * mockExchangeRate
    const variance = 0.98 + Math.random() * 0.04
    const adjustedToAmount = toAmountNum * variance

    return {
      fromToken,
      toToken,
      fromAmount,
      toAmount: adjustedToAmount.toFixed(6),
      exchangeRate: mockExchangeRate.toFixed(6),
      priceImpact: (Math.random() * 0.5).toFixed(2),
      gasEstimate: this.estimateGasCost(),
      route: [fromToken.symbol, toToken.symbol],
      dex: "Mock DEX",
    }
  }

  async checkTokenAllowance(tokenAddress: string, spenderAddress: string, userAddress: string): Promise<string> {
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      return ethers.MaxUint256.toString() // Native tokens don't need approval
    }

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider)
      const allowance = await tokenContract.allowance(userAddress, spenderAddress)
      return allowance.toString()
    } catch (error) {
      console.error("Failed to check allowance:", error)
      return "0"
    }
  }

  async approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<string> {
    try {
      const signer = await this.provider.getSigner()
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

      const tx = await tokenContract.approve(spenderAddress, amount)
      return tx.hash
    } catch (error) {
      console.error("Token approval failed:", error)
      throw error
    }
  }

  async executeSwap(params: SwapParams, quote: SwapQuote): Promise<string> {
    try {
      // Try 1inch swap first
      if (quote.dex === "1inch") {
        return await this.execute1inchSwap(params, quote)
      }

      // Fallback to Uniswap
      return await this.executeUniswapSwap(params, quote)
    } catch (error) {
      console.error("Swap execution failed:", error)
      throw error
    }
  }

  private async execute1inchSwap(params: SwapParams, quote: SwapQuote): Promise<string> {
    try {
      const fromAmountWei = ethers.parseUnits(params.fromAmount, params.fromToken.decimals)
      const minToAmountWei = ethers.parseUnits(
        (Number.parseFloat(quote.toAmount) * (1 - params.slippage / 100)).toFixed(6),
        params.toToken.decimals,
      )

      const swapParams = new URLSearchParams({
        src: params.fromToken.address,
        dst: params.toToken.address,
        amount: fromAmountWei.toString(),
        from: params.userAddress,
        slippage: params.slippage.toString(),
        disableEstimate: "true",
      })

      const response = await fetch(`${ONEINCH_API_BASE}/swap/v6.0/${this.chainId}/swap?${swapParams}`, {
        headers: {
          Authorization: "Bearer YOUR_1INCH_API_KEY",
        },
      })

      if (!response.ok) {
        throw new Error(`1inch swap API error: ${response.status}`)
      }

      const swapData = await response.json()
      const signer = await this.provider.getSigner()

      const tx = await signer.sendTransaction({
        to: swapData.tx.to,
        data: swapData.tx.data,
        value: swapData.tx.value,
        gasLimit: swapData.tx.gas,
      })

      return tx.hash
    } catch (error) {
      console.error("1inch swap failed:", error)
      throw error
    }
  }

  private async executeUniswapSwap(params: SwapParams, quote: SwapQuote): Promise<string> {
    try {
      const routers = DEX_ROUTERS[this.chainId as keyof typeof DEX_ROUTERS]
      if (!routers?.uniswapV2) {
        throw new Error("Uniswap router not available for this chain")
      }

      const signer = await this.provider.getSigner()
      const routerContract = new ethers.Contract(routers.uniswapV2, UNISWAP_V2_ROUTER_ABI, signer)

      const fromAmountWei = ethers.parseUnits(params.fromAmount, params.fromToken.decimals)
      const minToAmountWei = ethers.parseUnits(
        (Number.parseFloat(quote.toAmount) * (1 - params.slippage / 100)).toFixed(6),
        params.toToken.decimals,
      )
      const deadline = Math.floor(Date.now() / 1000) + 1200 // 20 minutes

      // Create path
      const path = [params.fromToken.address, params.toToken.address]
      const WETH_ADDRESS = this.getWETHAddress()

      if (params.fromToken.address === "0x0000000000000000000000000000000000000000") {
        path[0] = WETH_ADDRESS
      }
      if (params.toToken.address === "0x0000000000000000000000000000000000000000") {
        path[1] = WETH_ADDRESS
      }

      let tx
      if (params.fromToken.address === "0x0000000000000000000000000000000000000000") {
        // ETH to Token
        tx = await routerContract.swapExactETHForTokens(minToAmountWei, path, params.userAddress, deadline, {
          value: fromAmountWei,
        })
      } else if (params.toToken.address === "0x0000000000000000000000000000000000000000") {
        // Token to ETH
        tx = await routerContract.swapExactTokensForETH(
          fromAmountWei,
          minToAmountWei,
          path,
          params.userAddress,
          deadline,
        )
      } else {
        // Token to Token
        tx = await routerContract.swapExactTokensForTokens(
          fromAmountWei,
          minToAmountWei,
          path,
          params.userAddress,
          deadline,
        )
      }

      return tx.hash
    } catch (error) {
      console.error("Uniswap swap failed:", error)
      throw error
    }
  }

  private getWETHAddress(): string {
    const wethAddresses: Record<number, string> = {
      1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Ethereum
      137: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // Polygon (WMATIC)
      56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // BSC (WBNB)
      42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // Arbitrum
    }
    return wethAddresses[this.chainId] || wethAddresses[1]
  }

  private getMockExchangeRate(fromToken: Token, toToken: Token): number {
    const mockRates: Record<string, Record<string, number>> = {
      ETH: { USDC: 3500, USDT: 3500, DAI: 3500, WBTC: 0.05 },
      USDC: { ETH: 1 / 3500, USDT: 1, DAI: 1, WBTC: 0.000014 },
      USDT: { ETH: 1 / 3500, USDC: 1, DAI: 1, WBTC: 0.000014 },
      DAI: { ETH: 1 / 3500, USDC: 1, USDT: 1, WBTC: 0.000014 },
      WBTC: { ETH: 20, USDC: 70000, USDT: 70000, DAI: 70000 },
      MATIC: { USDC: 0.8, USDT: 0.8, DAI: 0.8 },
      BNB: { USDC: 600, USDT: 600, DAI: 600 },
    }
    return mockRates[fromToken.symbol]?.[toToken.symbol] || 1
  }

  private estimateGasCost(): string {
    const gasPrice = 20
    const gasLimit = 150000
    const gasCostEth = (gasPrice * gasLimit) / 1e9 / 1e9
    return `$${(gasCostEth * 3500).toFixed(2)}`
  }
}
