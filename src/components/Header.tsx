import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Activity, Globe } from 'lucide-react';
import { useGasStore } from '@/store/useGasStore';

export const Header: React.FC = () => {
  const { isConnected, lastUpdate, mode } = useGasStore();
  
  const timeAgo = Math.floor((Date.now() - lastUpdate) / 1000);
  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gas Tracker
              </h1>
            </div>
            <Badge variant="outline" className="ml-2">
              Cross-Chain
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Mode Badge */}
            <Badge variant={mode === 'live' ? 'default' : 'secondary'}>
              <Activity className="w-3 h-3 mr-1" />
              {mode === 'live' ? 'Live Mode' : 'Simulation'}
            </Badge>

            {/* Last Update */}
            {lastUpdate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="w-3 h-3" />
                {formatTimeAgo(timeAgo)}
              </div>
            )}

            <Button variant="outline" size="sm">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};