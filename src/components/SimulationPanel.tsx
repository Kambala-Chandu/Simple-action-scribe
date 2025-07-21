import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PlayCircle, PauseCircle, Zap } from 'lucide-react';
import { useGasStore } from '@/store/useGasStore';
import { CHAINS } from '@/services/gasService';

export const SimulationPanel: React.FC = () => {
  const { mode, transactionValue, chains, usdPrice, setMode, setTransactionValue } = useGasStore();
  
  const calculateCosts = () => {
    const gasLimit = 21000;
    const ethValue = parseFloat(transactionValue) || 0;
    
    return Object.entries(chains).map(([chainKey, data]) => {
      const totalGasFee = data.baseFee + data.priorityFee;
      const gasCostEth = (totalGasFee * gasLimit) / 1e9;
      const totalCostUSD = (gasCostEth + ethValue) * usdPrice;
      
      return {
        chain: chainKey,
        name: CHAINS[chainKey].name,
        color: CHAINS[chainKey].color,
        gasCostEth,
        totalCostUSD,
        totalGasFee
      };
    });
  };

  const costs = calculateCosts();
  const cheapestChain = costs.reduce((min, chain) => 
    chain.totalCostUSD < min.totalCostUSD ? chain : min
  );

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Simulation Mode</h3>
            <p className="text-sm text-muted-foreground">
              {mode === 'live' ? 'Real-time data updates' : 'Manual transaction simulation'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-muted-foreground" />
            <Switch
              checked={mode === 'live'}
              onCheckedChange={(checked) => setMode(checked ? 'live' : 'simulation')}
            />
            <PlayCircle className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Transaction Input */}
        <div className="space-y-2">
          <Label htmlFor="transaction-value">Transaction Value (ETH)</Label>
          <Input
            id="transaction-value"
            type="number"
            step="0.1"
            value={transactionValue}
            onChange={(e) => setTransactionValue(e.target.value)}
            placeholder="0.5"
            className="font-mono"
          />
        </div>

        {/* Current ETH/USD Price */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">ETH/USD Price</span>
          <div className="flex items-center gap-1">
            <span className="font-mono font-semibold text-primary">
              ${usdPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Cost Comparison Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Cross-Chain Cost Comparison</h4>
          </div>
          
          <div className="space-y-2">
            {costs.map((cost) => (
              <div 
                key={cost.chain}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  cost.chain === cheapestChain.chain 
                    ? 'bg-success/10 border-success/30' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cost.color }}
                  />
                  <span className="font-medium">{cost.name}</span>
                  {cost.chain === cheapestChain.chain && (
                    <Badge variant="outline" className="text-xs text-success border-success">
                      Cheapest
                    </Badge>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-semibold">
                    ${cost.totalCostUSD.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cost.totalGasFee.toFixed(1)} gwei
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculate Button for Simulation Mode */}
        {mode === 'simulation' && (
          <Button className="w-full" variant="outline">
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Simulation
          </Button>
        )}
      </div>
    </Card>
  );
};