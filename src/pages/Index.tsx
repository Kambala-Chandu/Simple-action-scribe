import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { GasWidget } from '@/components/GasWidget';
import { GasChart } from '@/components/GasChart';
import { SimulationPanel } from '@/components/SimulationPanel';
import { useGasStore } from '@/store/useGasStore';
import { gasService } from '@/services/gasService';

const Index = () => {
  const { mode, setConnected, updateChainData, updateUsdPrice, addHistoryPoint } = useGasStore();

  useEffect(() => {
    // Initialize connection
    setConnected(true);
    
    // Start real-time updates
    const stopUpdates = gasService.startRealTimeUpdates((data) => {
      const { updates, usdPrice } = data;
      
      updateUsdPrice(usdPrice);
      
      updates.forEach(({ chain, baseFee, priorityFee, usdPrice: currentUsdPrice }) => {
        updateChainData(chain as any, { baseFee, priorityFee });
        
        // Add to history for charts
        addHistoryPoint(chain as any, {
          timestamp: Date.now(),
          baseFee,
          priorityFee,
          totalFee: baseFee + priorityFee,
          usdPrice: currentUsdPrice
        });
      });
    });

    return () => {
      stopUpdates();
      setConnected(false);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Gas Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GasWidget chain="ethereum" />
          <GasWidget chain="polygon" />
          <GasWidget chain="arbitrum" />
        </div>

        {/* Charts and Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Column */}
          <div className="lg:col-span-2 space-y-6">
            <GasChart chain="ethereum" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GasChart chain="polygon" height={250} />
              <GasChart chain="arbitrum" height={250} />
            </div>
          </div>

          {/* Simulation Panel */}
          <div>
            <SimulationPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
