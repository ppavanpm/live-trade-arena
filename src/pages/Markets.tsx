
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navigation/Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getCryptoMarkets, getPopularStocks, getForexRates } from '@/services/api';

const Markets = () => {
  const [activeTab, setActiveTab] = useState('crypto');
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [stocksData, setStocksData] = useState<any[]>([]);
  const [forexData, setForexData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const [crypto, stocks, forex] = await Promise.all([
          getCryptoMarkets(),
          getPopularStocks(),
          getForexRates()
        ]);
        
        setCryptoData(crypto);
        setStocksData(stocks);
        setForexData(forex);
      } catch (error) {
        console.error("Error fetching market data:", error);
        toast.error("Failed to load market data");
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();

    // Check auth status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAssetClick = (type: string, id: string) => {
    navigate(`/market/${type}/${id}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: value >= 1000000 ? 1 : 2
    }).format(value);
  };

  return (
    <div className="trading-app min-h-screen flex flex-col">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-trading-text-primary mb-2">Markets</h1>
            <p className="text-trading-text-secondary">Explore the latest prices across different markets</p>
          </div>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-trading-bg-tertiary/30">
              <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="forex">Forex</TabsTrigger>
            </TabsList>
            
            <TabsContent value="crypto" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-trading-bg-secondary border border-trading-bg-tertiary/30 p-4 rounded-lg animate-pulse">
                      <div className="h-6 w-24 bg-trading-bg-tertiary/50 rounded mb-2"></div>
                      <div className="h-5 w-16 bg-trading-bg-tertiary/50 rounded mb-4"></div>
                      <div className="h-4 w-32 bg-trading-bg-tertiary/50 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cryptoData.map((crypto) => (
                    <div 
                      key={crypto.id}
                      className="bg-trading-bg-secondary border border-trading-bg-tertiary/30 p-4 rounded-lg cursor-pointer hover:border-trading-accent-blue transition-colors"
                      onClick={() => handleAssetClick('crypto', crypto.id)}
                    >
                      <div className="flex items-center mb-3">
                        {crypto.image && <img src={crypto.image} alt={crypto.name} className="w-8 h-8 mr-3 rounded-full" />}
                        <div>
                          <h3 className="font-medium text-trading-text-primary">{crypto.name}</h3>
                          <span className="text-sm text-trading-text-secondary">{crypto.symbol.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-trading-text-primary">{formatCurrency(crypto.current_price)}</span>
                        <span className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-trading-accent-green' : 'text-trading-accent-red'}`}>
                          {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stocks" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-trading-bg-secondary border border-trading-bg-tertiary/30 p-4 rounded-lg animate-pulse">
                      <div className="h-6 w-24 bg-trading-bg-tertiary/50 rounded mb-2"></div>
                      <div className="h-5 w-16 bg-trading-bg-tertiary/50 rounded mb-4"></div>
                      <div className="h-4 w-32 bg-trading-bg-tertiary/50 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stocksData.map((stock) => (
                    <div 
                      key={stock.symbol}
                      className="bg-trading-bg-secondary border border-trading-bg-tertiary/30 p-4 rounded-lg cursor-pointer hover:border-trading-accent-blue transition-colors"
                      onClick={() => handleAssetClick('stock', stock.symbol)}
                    >
                      <div className="mb-3">
                        <h3 className="font-medium text-trading-text-primary">{stock.name}</h3>
                        <span className="text-sm text-trading-text-secondary">{stock.symbol}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-trading-text-primary">{formatCurrency(stock.price)}</span>
                        <span className={`text-sm ${stock.changePercent >= 0 ? 'text-trading-accent-green' : 'text-trading-accent-red'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="forex" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-trading-bg-secondary border border-trading-bg-tertiary/30 p-4 rounded-lg animate-pulse">
                      <div className="h-6 w-24 bg-trading-bg-tertiary/50 rounded mb-2"></div>
                      <div className="h-5 w-16 bg-trading-bg-tertiary/50 rounded mb-4"></div>
                      <div className="h-4 w-32 bg-trading-bg-tertiary/50 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forexData.map((forex, index) => (
                    <div 
                      key={index}
                      className="bg-trading-bg-secondary border border-trading-bg-tertiary/30 p-4 rounded-lg cursor-pointer hover:border-trading-accent-blue transition-colors"
                      onClick={() => handleAssetClick('forex', `${forex.fromCurrency}${forex.toCurrency}`)}
                    >
                      <div className="mb-3">
                        <h3 className="font-medium text-trading-text-primary">{forex.fromCurrency}/{forex.toCurrency}</h3>
                        <span className="text-sm text-trading-text-secondary">Forex</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-trading-text-primary">{forex.exchangeRate.toFixed(4)}</span>
                        <span className={`text-sm ${forex.changePercent >= 0 ? 'text-trading-accent-green' : 'text-trading-accent-red'}`}>
                          {forex.changePercent >= 0 ? '+' : ''}{forex.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Markets;
