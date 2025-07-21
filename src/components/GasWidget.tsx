import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useGasStore } from '@/store/useGasStore';
import { CHAINS } from '@/services/gasService';

interface GasWidgetProps {
  chain: 'ethereum' | 'polygon' | 'arbitrum';
}

export const GasWidget: React.FC<GasWidgetProps> = ({ chain }) => {
  const { chains, usdPrice, transactionValue } = useGasStore();
  const chainData = chains[chain];
  const chainConfig = CHAINS[chain];
  
  const currentGasPrice = chainData.baseFee + chainData.priorityFee;
  const transactionCostUSD = (currentGasPrice * 21000 / 1e9) * usdPrice + 
                            (parseFloat(transactionValue) * usdPrice);

  // Calculate trend from history
  const getTrend = () => {
    if (chainData.history.length < 2) return 'neutral';
    const current = chainData.history[chainData.history.length - 1];
    const previous = chainData.history[chainData.history.length - 2];
    
    if (!current || !previous) return 'neutral';
    
    const currentTotal = current.baseFee + current.priorityFee;
    const previousTotal = previous.baseFee + previous.priorityFee;
    
    if (currentTotal > previousTotal) return 'up';
    if (currentTotal < previousTotal) return 'down';
    return 'neutral';
  };

  const trend = getTrend();
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-destructive' : trend === 'down' ? 'text-success' : 'text-muted-foreground';

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: chainConfig.color }}
          />
          <h3 className="text-lg font-semibold">{chainConfig.name}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {chainConfig.nativeCurrency}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Base Fee</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-sm">{chainData.baseFee.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">gwei</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Priority Fee</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-sm">{chainData.priorityFee.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">gwei</span>
          </div>
        </div>

        <div className="h-px bg-border my-3" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Gas</span>
          <div className="flex items-center gap-2">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className="font-mono font-semibold">{currentGasPrice.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">gwei</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">TX Cost</span>
          <div className="text-right">
            <div className="font-mono font-semibold text-primary">
              ${transactionCostUSD.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              + {transactionValue} {chainConfig.nativeCurrency}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};