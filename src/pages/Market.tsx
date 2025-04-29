import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Info, ChevronLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navigation/Navbar';
import TradingViewChart from '@/components/Charts/TradingViewChart';
import TradeForm from '@/components/Trade/TradeForm';
import { 
  getCryptoDetail, 
  getCryptoChart, 
  getStockQuote, 
  getStockHistory,
  getCurrentUser 
} from '@/services/api';

interface ChartData {
  time: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  value?: number;
}

const Market = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [asset, setAsset] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let assetData;
        
        if (!type || !id) {
          throw new Error('Invalid asset type or ID');
        }
        
        // Fetch asset details based on type
        if (type === 'crypto') {
          assetData = await getCryptoDetail(id);
          setAsset({
            id: assetData.id,
            symbol: assetData.symbol.toUpperCase(),
            name: assetData.name,
            image: assetData.image?.large,
            currentPrice: assetData.market_data?.current_price?.usd,
            priceChange24h: assetData.market_data?.price_change_24h,
            priceChangePercentage24h: assetData.market_data?.price_change_percentage_24h,
            marketCap: assetData.market_data?.market_cap?.usd,
            volume: assetData.market_data?.total_volume?.usd,
            high24h: assetData.market_data?.high_24h?.usd,
            low24h: assetData.market_data?.low_24h?.usd,
            circulatingSupply: assetData.market_data?.circulating_supply,
            totalSupply: assetData.market_data?.total_supply,
            description: assetData.description?.en,
            website: assetData.links?.homepage?.[0],
            explorer: assetData.links?.blockchain_site?.[0],
            reddit: assetData.links?.subreddit_url,
            twitter: assetData.links?.twitter_screen_name,
          });
        } else if (type === 'stock') {
          assetData = await getStockQuote(id);
          if (!assetData) {
            throw new Error('Stock data not available');
          }
          setAsset({
            id: assetData.symbol.toLowerCase(),
            symbol: assetData.symbol,
            name: assetData.name,
            currentPrice: assetData.price,
            priceChange24h: assetData.change,
            priceChangePercentage24h: assetData.changePercent,
            volume: assetData.volume,
          });
        } else {
          throw new Error('Unsupported asset type');
        }
        
        // Get user data for trading form
        const userData = await getCurrentUser();
        setUser(userData);

      } catch (error) {
        console.error('Error fetching asset data:', error);
        setError('Failed to load asset data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssetData();
  }, [id, type]);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!asset) return;
      
      setIsChartLoading(true);
      try {
        let days;
        switch (timeframe) {
          case '1H':
            days = 1/24; // 1 hour
            break;
          case '1D':
            days = 1;
            break;
          case '1W':
            days = 7;
            break;
          case '1M':
            days = 30;
            break;
          case 'ALL':
            days = 'max';
            break;
          default:
            days = 1;
        }
        
        // We still fetch chart data to keep the API calls in place
        // but we won't use it since TradingViewChart now uses demo data
        if (type === 'crypto') {
          const response = await getCryptoChart(id!, days);
          const data = response.prices.map((price: [number, number]) => ({
            time: price[0] / 1000,
            value: price[1]
          }));
          setChartData(data);
        } else if (type === 'stock') {
          const response = await getStockHistory(id!);
          const timeSeriesData = response['Time Series (Daily)'];
          const data = Object.entries(timeSeriesData)
            .slice(0, days === 'max' ? undefined : days)
            .map(([date, values]: [string, any]) => ({
              time: new Date(date).getTime() / 1000,
              open: parseFloat(values['1. open']),
              high: parseFloat(values['2. high']),
              low: parseFloat(values['3. low']),
              close: parseFloat(values['4. close']),
            }))
            .reverse();
          setChartData(data);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsChartLoading(false);
      }
    };
    
    fetchChartData();
  }, [asset, timeframe, id, type]);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  const handleTradeComplete = () => {
    // Refresh user data to get updated balance
    const refreshUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };
    
    refreshUserData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: value >= 1000000 ? 2 : 2
    }).format(value);
  };

  if (error) {
    return (
      <div className="trading-app min-h-screen flex flex-col">
        <Navbar isLoggedIn={true} />
        <main className="flex-1 py-8 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-trading-bg-secondary border border-trading-accent-red/30 p-6 rounded-lg text-center">
              <h2 className="text-xl font-medium text-trading-accent-red mb-2">Error</h2>
              <p className="text-trading-text-secondary mb-4">{error}</p>
              <Button asChild>
                <Link to="/markets">Return to Markets</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="trading-app min-h-screen flex flex-col bg-[#121212]">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            asChild
            className="mb-4 text-[#a0a0a0] hover:text-[#e0e0e0]"
          >
            <Link to="/markets">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Markets
            </Link>
          </Button>
          
          {isLoading ? (
            <div className="mb-6 flex items-center">
              <Skeleton className="h-12 w-12 rounded-full mr-3" />
              <div>
                <Skeleton className="h-7 w-40 mb-1" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ) : (
            <div className="mb-6 flex flex-wrap items-center gap-y-3">
              {asset?.image && (
                <img src={asset.image} alt={asset.name} className="h-12 w-12 rounded-full mr-3" />
              )}
              <div className="mr-6">
                <h1 className="text-2xl font-bold text-[#e0e0e0]">
                  {asset?.name} ({asset?.symbol})
                </h1>
                <p className="text-[#a0a0a0]">
                  {type === 'crypto' ? 'Cryptocurrency' : type === 'stock' ? 'Stock' : 'Forex'}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <div className="text-xl font-bold text-[#e0e0e0]">
                    {formatCurrency(asset?.currentPrice || 0)}
                  </div>
                  <div>
                    {(asset?.priceChangePercentage24h || 0) >= 0 ? (
                      <div className="flex items-center text-sm text-[#22c55e]">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>{asset?.priceChangePercentage24h?.toFixed(2)}% (24h)</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-[#ef4444]">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span>{Math.abs(asset?.priceChangePercentage24h || 0).toFixed(2)}% (24h)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {asset?.marketCap && (
                  <div>
                    <div className="text-sm text-trading-text-secondary mb-1">Market Cap</div>
                    <div className="font-medium text-trading-text-primary">{formatCurrency(asset.marketCap)}</div>
                  </div>
                )}
                
                {asset?.volume && (
                  <div>
                    <div className="text-sm text-trading-text-secondary mb-1">24h Volume</div>
                    <div className="font-medium text-trading-text-primary">{formatCurrency(asset.volume)}</div>
                  </div>
                )}
                
                {asset?.high24h && (
                  <div>
                    <div className="text-sm text-trading-text-secondary mb-1">24h High</div>
                    <div className="font-medium text-trading-text-primary">{formatCurrency(asset.high24h)}</div>
                  </div>
                )}
                
                {asset?.low24h && (
                  <div>
                    <div className="text-sm text-trading-text-secondary mb-1">24h Low</div>
                    <div className="font-medium text-trading-text-primary">{formatCurrency(asset.low24h)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TradingViewChart 
                type={type as 'crypto' | 'stock' | 'forex'} 
                symbol={asset?.symbol || ''} 
                name={asset?.name || ''} 
                isLoading={isLoading || isChartLoading}
                onTimeframeChange={handleTimeframeChange}
              />
              
              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-[#222222]/30 rounded-none border-b border-[#222222]/30">
                    <TabsTrigger 
                      value="chart" 
                      className="rounded-none text-[#e0e0e0] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#3b82f6]"
                    >
                      Market Info
                    </TabsTrigger>
                    <TabsTrigger 
                      value="about" 
                      className="rounded-none text-[#e0e0e0] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#3b82f6]"
                    >
                      About
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart">
                    <Card className="border-[#222222]/30 bg-[#1a1f2c] shadow-none rounded-t-none">
                      <CardContent className="p-6 space-y-6 text-[#e0e0e0]">
                        {isLoading ? (
                          Array(4).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {asset?.circulatingSupply && (
                                <div>
                                  <div className="text-sm text-trading-text-secondary mb-1">Circulating Supply</div>
                                  <div className="font-medium text-trading-text-primary">
                                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(asset.circulatingSupply)}
                                  </div>
                                </div>
                              )}
                              
                              {asset?.totalSupply && (
                                <div>
                                  <div className="text-sm text-trading-text-secondary mb-1">Total Supply</div>
                                  <div className="font-medium text-trading-text-primary">
                                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(asset.totalSupply)}
                                  </div>
                                </div>
                              )}
                              
                              {asset?.website && (
                                <div>
                                  <div className="text-sm text-trading-text-secondary mb-1">Website</div>
                                  <a 
                                    href={asset.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-trading-accent-blue hover:underline break-all"
                                  >
                                    {asset.website.replace(/(^\w+:|^)\/\//, '')}
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-trading-text-secondary p-3 bg-trading-bg-tertiary/20 rounded-lg">
                              <Info className="h-4 w-4 flex-shrink-0" />
                              <p>
                                This is mock trading platform for educational purposes. All trades are simulated and no real money is involved.
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="about">
                    <Card className="border-[#222222]/30 bg-[#1a1f2c] shadow-none rounded-t-none">
                      <CardContent className="p-6 text-[#e0e0e0]">
                        {isLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />
                          </div>
                        ) : (
                          <>
                            {asset?.description ? (
                              <div 
                                className="text-trading-text-secondary prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: asset.description }}
                              />
                            ) : (
                              <p className="text-trading-text-secondary">
                                No detailed information available for this asset.
                              </p>
                            )}
                            
                            <div className="mt-6 flex flex-wrap gap-3">
                              {asset?.explorer && (
                                <a
                                  href={asset.explorer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-trading-accent-blue hover:underline flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
                                  </svg>
                                  Blockchain Explorer
                                </a>
                              )}
                              
                              {asset?.reddit && (
                                <a
                                  href={asset.reddit}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-trading-accent-blue hover:underline flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <circle cx="12" cy="8" r="5"></circle>
                                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                                  </svg>
                                  Reddit Community
                                </a>
                              )}
                              
                              {asset?.twitter && (
                                <a
                                  href={`https://twitter.com/${asset.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-trading-accent-blue hover:underline flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                  </svg>
                                  Twitter
                                </a>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <div>
              {isLoading || !user ? (
                <Skeleton className="h-[500px] w-full" />
              ) : (
                <TradeForm 
                  assetId={asset?.id}
                  assetSymbol={asset?.symbol}
                  assetName={asset?.name}
                  assetType={type as 'crypto' | 'stock' | 'forex'}
                  currentPrice={asset?.currentPrice}
                  userBalance={user?.balance}
                  onTradeComplete={handleTradeComplete}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Market;
