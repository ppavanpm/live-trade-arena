
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface TradingViewChartProps {
  type: 'crypto' | 'stock' | 'forex';
  symbol: string;
  name: string;
  isLoading?: boolean;
  onTimeframeChange?: (timeframe: string) => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  type, 
  symbol, 
  name,
  isLoading = false,
  onTimeframeChange
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = React.useState('1D');

  // Enhanced demo data for better visualization
  const demoData = React.useMemo(() => {
    const basePrice = type === 'crypto' ? 50000 : type === 'forex' ? 1.2 : 150;
    const volatility = type === 'crypto' ? 0.03 : type === 'forex' ? 0.005 : 0.01;
    const trend = Math.random() > 0.5 ? 1 : -1;
    const numberOfPoints = 100;
    const data = [];
    
    let currentPrice = basePrice;
    
    for (let i = 0; i < numberOfPoints; i++) {
      const time = new Date();
      time.setDate(time.getDate() - (numberOfPoints - i));
      
      // Add some trend and randomness
      currentPrice = currentPrice * (1 + (trend * 0.002) + ((Math.random() - 0.5) * volatility));
      
      const open = currentPrice;
      const close = currentPrice * (1 + ((Math.random() - 0.5) * volatility));
      const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      
      data.push({
        time: time.getTime() / 1000,
        open,
        high,
        low,
        close,
      });
    }
    
    return data;
  }, [type]);

  // Available timeframes
  const timeframes = ['1H', '1D', '1W', '1M', 'ALL'];

  useEffect(() => {
    if (isLoading || !chartContainerRef.current) return;
    
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    
    const chartOptions = {
      layout: {
        background: { color: '#0F172A' },
        textColor: '#e0e0e0',
      },
      grid: {
        vertLines: { color: '#1E293B' },
        horzLines: { color: '#1E293B' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      crosshair: {
        horzLine: {
          color: '#3B82F6',
          labelBackgroundColor: '#3B82F6',
        },
        vertLine: {
          color: '#3B82F6',
          labelBackgroundColor: '#3B82F6',
        },
      },
    };
    
    // Create chart
    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;
    
    // Create and store candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
    });
    
    seriesRef.current = candlestickSeries;
    
    // Set data to the series
    candlestickSeries.setData(demoData);
    
    // Handle resize
    resizeObserverRef.current = new ResizeObserver(entries => {
      if (entries[0] && chartRef.current) {
        const newWidth = entries[0].contentRect.width;
        chartRef.current.applyOptions({ width: newWidth });
        chartRef.current.timeScale().fitContent();
      }
    });
    
    resizeObserverRef.current.observe(chartContainerRef.current);
    
    // Fit content
    chart.timeScale().fitContent();
    
    return () => {
      if (resizeObserverRef.current && chartContainerRef.current) {
        resizeObserverRef.current.unobserve(chartContainerRef.current);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [demoData, isLoading]);

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    if (onTimeframeChange) {
      onTimeframeChange(timeframe);
    }
  };

  return (
    <Card className="border-trading-bg-tertiary/30 bg-[#1a1f2c]">
      <div className="p-4 border-b border-trading-bg-tertiary/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-[#e0e0e0]">
              {name} ({symbol})
            </h2>
            <p className="text-sm text-[#a0a0a0]">
              {type === 'crypto' ? 'Cryptocurrency' : type === 'stock' ? 'Stock' : 'Forex'}
            </p>
          </div>
          <div className="flex space-x-2">
            {timeframes.map(timeframe => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeframeChange(timeframe)}
                className={
                  selectedTimeframe === timeframe 
                    ? "bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white" 
                    : "border-[#222222] text-[#a0a0a0] hover:text-[#e0e0e0]"
                }
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <div ref={chartContainerRef} className="w-full h-[400px]" />
        )}
      </div>
    </Card>
  );
};

export default TradingViewChart;
