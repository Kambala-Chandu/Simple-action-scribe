import { create } from 'zustand';

export interface GasPoint {
  timestamp: number;
  baseFee: number;
  priorityFee: number;
  totalFee: number;
  usdPrice: number;
}

export interface ChainData {
  baseFee: number;
  priorityFee: number;
  history: GasPoint[];
}

export interface GasState {
  mode: 'live' | 'simulation';
  chains: {
    ethereum: ChainData;
    polygon: ChainData;
    arbitrum: ChainData;
  };
  usdPrice: number;
  transactionValue: string;
  isConnected: boolean;
  lastUpdate: number;
}

export interface GasActions {
  setMode: (mode: 'live' | 'simulation') => void;
  setTransactionValue: (value: string) => void;
  updateChainData: (chain: keyof GasState['chains'], data: Partial<ChainData>) => void;
  updateUsdPrice: (price: number) => void;
  setConnected: (connected: boolean) => void;
  addHistoryPoint: (chain: keyof GasState['chains'], point: GasPoint) => void;
}

export const useGasStore = create<GasState & GasActions>((set, get) => ({
  mode: 'live',
  chains: {
    ethereum: {
      baseFee: 0,
      priorityFee: 0,
      history: []
    },
    polygon: {
      baseFee: 0,
      priorityFee: 0,
      history: []
    },
    arbitrum: {
      baseFee: 0,
      priorityFee: 0,
      history: []
    }
  },
  usdPrice: 0,
  transactionValue: '0.5',
  isConnected: false,
  lastUpdate: Date.now(),

  setMode: (mode) => set({ mode }),
  
  setTransactionValue: (value) => set({ transactionValue: value }),
  
  updateChainData: (chain, data) => set((state) => ({
    chains: {
      ...state.chains,
      [chain]: {
        ...state.chains[chain],
        ...data
      }
    },
    lastUpdate: Date.now()
  })),
  
  updateUsdPrice: (price) => set({ usdPrice: price }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  addHistoryPoint: (chain, point) => set((state) => {
    const currentHistory = state.chains[chain].history;
    const newHistory = [...currentHistory, point].slice(-100); // Keep last 100 points
    
    return {
      chains: {
        ...state.chains,
        [chain]: {
          ...state.chains[chain],
          history: newHistory
        }
      }
    };
  })
}));