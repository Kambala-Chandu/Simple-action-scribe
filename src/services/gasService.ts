import { ethers } from 'ethers';

export interface ChainConfig {
  name: string;
  rpc: string;
  chainId: number;
  nativeCurrency: string;
  color: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    chainId: 1,
    nativeCurrency: 'ETH',
    color: '#627EEA'
  },
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon.llamarpc.com',
    chainId: 137,
    nativeCurrency: 'MATIC',
    color: '#8247E5'
  },
  arbitrum: {
    name: 'Arbitrum',
    rpc: 'https://arbitrum.llamarpc.com',
    chainId: 42161,
    nativeCurrency: 'ETH',
    color: '#28A0F0'
  }
};

export class GasService {
  private providers: Record<string, ethers.Provider> = {};
  private usdPrice = 0;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    Object.entries(CHAINS).forEach(([key, config]) => {
      this.providers[key] = new ethers.JsonRpcProvider(config.rpc);
    });
  }

  async getGasPrice(chain: string): Promise<{ baseFee: number; priorityFee: number }> {
    try {
      const provider = this.providers[chain];
      if (!provider) throw new Error(`Provider not found for chain: ${chain}`);

      const feeData = await provider.getFeeData();
      const block = await provider.getBlock('latest');

      let baseFee = 0;
      let priorityFee = 0;

      if (feeData.gasPrice) {
        // For chains without EIP-1559
        const gasPriceGwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
        baseFee = gasPriceGwei * 0.7; // Estimate base fee
        priorityFee = gasPriceGwei * 0.3; // Estimate priority fee
      } else if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // For EIP-1559 chains
        if (block?.baseFeePerGas) {
          baseFee = Number(ethers.formatUnits(block.baseFeePerGas, 'gwei'));
        }
        priorityFee = Number(ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'));
      }

      return { baseFee, priorityFee };
    } catch (error) {
      console.error(`Error fetching gas for ${chain}:`, error);
      return { baseFee: 0, priorityFee: 0 };
    }
  }

  async getETHUSDPrice(): Promise<number> {
    try {
      // Mock USD price for demo - in real app would use Uniswap V3 or price oracle
      this.usdPrice = 2500 + (Math.random() - 0.5) * 100; // Simulate price volatility
      return this.usdPrice;
    } catch (error) {
      console.error('Error fetching ETH/USD price:', error);
      return this.usdPrice || 2500;
    }
  }

  calculateTransactionCost(
    baseFee: number,
    priorityFee: number,
    gasLimit: number = 21000,
    ethAmount: number = 0,
    usdPrice: number
  ): number {
    const gasPrice = baseFee + priorityFee;
    const gasCostEth = (gasPrice * gasLimit) / 1e9; // Convert from gwei to ETH
    const totalEthCost = gasCostEth + ethAmount;
    return totalEthCost * usdPrice;
  }

  startRealTimeUpdates(callback: (data: any) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const usdPrice = await this.getETHUSDPrice();
        
        const updates = await Promise.all(
          Object.keys(CHAINS).map(async (chain) => {
            const gasData = await this.getGasPrice(chain);
            return { chain, ...gasData, usdPrice };
          })
        );

        callback({ updates, usdPrice });
      } catch (error) {
        console.error('Error in real-time updates:', error);
      }
    }, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }
}

export const gasService = new GasService();