
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  getCryptoMarkets,
  getPopularStocks,
  getForexRates,
  CryptoAsset,
  StockAsset,
  ForexAsset
} from '@/services/api';

const MarketOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('crypto');
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [stockAssets, setStockAssets] = useState<StockAsset[]>([]);
  const [forexAssets, setForexAssets] = useState<ForexAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'crypto') {
          const data = await getCryptoMarkets();
          setCryptoAssets(data.slice(0, 10));
        } else if (activeTab === 'stocks') {
          const data = await getPopularStocks();
          setStockAssets(data);
        } else if (activeTab === 'forex') {
          const data = await getForexRates();
          setForexAssets(data);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [activeTab]);

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else if (price >= 1000) {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      return price.toFixed(2);
    }
  };
  
  const formatPercentage = (percentage: number) => {
    return percentage.toFixed(2) + '%';
  };

  const filterAssets = (assets: any[], term: string) => {
    if (!term) return assets;
    term = term.toLowerCase();
    return assets.filter(asset => {
      const symbol = 'symbol' in asset ? asset.symbol.toLowerCase() : '';
      const name = 'name' in asset ? asset.name.toLowerCase() : '';
      const fromCurrency = 'fromCurrency' in asset ? asset.fromCurrency.toLowerCase() : '';
      const toCurrency = 'toCurrency' in asset ? asset.toCurrency.toLowerCase() : '';
      
      return symbol.includes(term) || 
             name.includes(term) || 
             fromCurrency.includes(term) || 
             toCurrency.includes(term);
    });
  };

  const filteredCryptoAssets = filterAssets(cryptoAssets, searchTerm);
  const filteredStockAssets = filterAssets(stockAssets, searchTerm);
  const filteredForexAssets = filterAssets(forexAssets, searchTerm);

  return (
    <Card className="border-[#222222]/30 bg-[#1a1f2c]">
      <CardContent className="p-0">
        <div className="p-6 border-b border-[#222222]/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-[#e0e0e0]">Market Overview</h2>
            <Button variant="ghost" asChild>
              <Link to="/markets" className="text-[#3b82f6] hover:text-[#3b82f6]/80 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-[#a0a0a0] mt-1">Real-time market data across assets</p>
        </div>
        
        <div className="p-4 border-b border-[#222222]/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0a0] h-4 w-4" />
            <Input 
              placeholder="Search assets..." 
              className="pl-9 bg-[#222222]/30 border-[#222222] focus:border-[#3b82f6] text-[#e0e0e0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 bg-[#222222]/30 rounded-none border-b border-[#222222]/30">
            <TabsTrigger 
              value="crypto" 
              className={cn(
                "data-[state=active]:text-[#3b82f6] data-[state=active]:shadow-none text-[#e0e0e0]",
                "data-[state=active]:bg-transparent data-[state=active]:border-b-2",
                "data-[state=active]:border-[#3b82f6] rounded-none"
              )}
            >
              Crypto
            </TabsTrigger>
            <TabsTrigger 
              value="stocks" 
              className={cn(
                "data-[state=active]:text-[#3b82f6] data-[state=active]:shadow-none text-[#e0e0e0]",
                "data-[state=active]:bg-transparent data-[state=active]:border-b-2",
                "data-[state=active]:border-[#3b82f6] rounded-none"
              )}
            >
              Stocks
            </TabsTrigger>
            <TabsTrigger 
              value="forex" 
              className={cn(
                "data-[state=active]:text-[#3b82f6] data-[state=active]:shadow-none text-[#e0e0e0]",
                "data-[state=active]:bg-transparent data-[state=active]:border-b-2",
                "data-[state=active]:border-[#3b82f6] rounded-none"
              )}
            >
              Forex
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto" className="px-0 py-0 m-0">
            <div className="divide-y divide-trading-bg-tertiary/30">
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                ))
              ) : filteredCryptoAssets.length === 0 ? (
                <div className="p-6 text-center text-trading-text-secondary">
                  No cryptocurrencies found matching your search.
                </div>
              ) : (
                filteredCryptoAssets.map((asset) => (
                  <Link 
                    to={`/market/crypto/${asset.id}`} 
                    key={asset.id} 
                    className="flex items-center justify-between p-4 hover:bg-trading-bg-tertiary/10"
                  >
                    <div className="flex items-center gap-3">
                      <img src={asset.image} alt={asset.name} className="h-8 w-8 rounded-full" />
                      <div>
                        <p className="font-medium text-trading-text-primary">{asset.name}</p>
                        <p className="text-sm text-trading-text-secondary">{asset.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-trading-text-primary">
                        ${formatPrice(asset.current_price)}
                      </p>
                      <div className="flex items-center justify-end">
                        {asset.price_change_percentage_24h >= 0 ? (
                          <div className="flex items-center text-trading-accent-green">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span className="text-sm">{formatPercentage(asset.price_change_percentage_24h)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-trading-accent-red">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            <span className="text-sm">{formatPercentage(Math.abs(asset.price_change_percentage_24h))}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stocks" className="px-0 py-0 m-0">
            <div className="divide-y divide-trading-bg-tertiary/30">
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                ))
              ) : filteredStockAssets.length === 0 ? (
                <div className="p-6 text-center text-trading-text-secondary">
                  No stocks found matching your search.
                </div>
              ) : (
                filteredStockAssets.map((stock) => (
                  <Link 
                    to={`/market/stock/${stock.symbol}`} 
                    key={stock.symbol} 
                    className="flex items-center justify-between p-4 hover:bg-trading-bg-tertiary/10"
                  >
                    <div>
                      <p className="font-medium text-trading-text-primary">{stock.symbol}</p>
                      <p className="text-sm text-trading-text-secondary">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-trading-text-primary">
                        ${formatPrice(stock.price)}
                      </p>
                      <div className="flex items-center justify-end">
                        {stock.changePercent >= 0 ? (
                          <div className="flex items-center text-trading-accent-green">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span className="text-sm">{formatPercentage(stock.changePercent)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-trading-accent-red">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            <span className="text-sm">{formatPercentage(Math.abs(stock.changePercent))}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="forex" className="px-0 py-0 m-0">
            <div className="divide-y divide-trading-bg-tertiary/30">
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                ))
              ) : filteredForexAssets.length === 0 ? (
                <div className="p-6 text-center text-trading-text-secondary">
                  No forex pairs found matching your search.
                </div>
              ) : (
                filteredForexAssets.map((forex) => (
                  <Link 
                    to={`/market/forex/${forex.fromCurrency}${forex.toCurrency}`} 
                    key={`${forex.fromCurrency}${forex.toCurrency}`} 
                    className="flex items-center justify-between p-4 hover:bg-trading-bg-tertiary/10"
                  >
                    <div>
                      <p className="font-medium text-trading-text-primary">{forex.fromCurrency}/{forex.toCurrency}</p>
                      <p className="text-sm text-trading-text-secondary">Forex</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-trading-text-primary">
                        {formatPrice(forex.exchangeRate)}
                      </p>
                      <div className="flex items-center justify-end">
                        {forex.changePercent >= 0 ? (
                          <div className="flex items-center text-trading-accent-green">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            <span className="text-sm">{formatPercentage(forex.changePercent)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-trading-accent-red">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            <span className="text-sm">{formatPercentage(Math.abs(forex.changePercent))}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
