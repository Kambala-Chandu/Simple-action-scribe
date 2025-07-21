import React, { useEffect, useRef } from 'react';
import { useGasStore } from '@/store/useGasStore';
import { Card } from '@/components/ui/card';

interface GasChartProps {
  chain: 'ethereum' | 'polygon' | 'arbitrum';
  height?: number;
}

export const GasChart: React.FC<GasChartProps> = ({ chain, height = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { chains } = useGasStore();
  const chainData = chains[chain];

  useEffect(() => {
    if (!canvasRef.current || !chainData.history.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = 'hsl(220, 23%, 10%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;

    if (chainData.history.length < 2) return;

    // Get data points
    const dataPoints = chainData.history.map(point => point.baseFee + point.priorityFee);
    const minValue = Math.min(...dataPoints);
    const maxValue = Math.max(...dataPoints);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = 'hsl(220, 20%, 18%)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i / 4) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw price line
    ctx.strokeStyle = chainColors[chain];
    ctx.lineWidth = 2;
    ctx.beginPath();

    dataPoints.forEach((value, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
    gradient.addColorStop(0, chainColors[chain] + '40');
    gradient.addColorStop(1, chainColors[chain] + '10');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    
    dataPoints.forEach((value, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw data points
    ctx.fillStyle = chainColors[chain];
    dataPoints.forEach((value, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = 'hsl(213, 31%, 91%)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (i / 5) * valueRange;
      const y = padding + (i / 5) * chartHeight;
      ctx.fillText(value.toFixed(1), padding - 10, y + 4);
    }

  }, [chainData.history, chain]);

  const chainColors = {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    arbitrum: '#28A0F0'
  };

  const chainNames = {
    ethereum: 'Ethereum',
    polygon: 'Polygon', 
    arbitrum: 'Arbitrum'
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: chainColors[chain] }}
        />
        <h3 className="text-lg font-semibold">{chainNames[chain]} Gas Price Trend</h3>
        <div className="ml-auto text-sm text-muted-foreground">
          {chainData.history.length} data points
        </div>
      </div>
      <canvas 
        ref={canvasRef}
        className="w-full rounded-lg"
        style={{ height: `${height}px` }}
      />
    </Card>
  );
};