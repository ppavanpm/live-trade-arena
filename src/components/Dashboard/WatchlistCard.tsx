
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCryptoMarkets, getPopularStocks, CryptoAsset, StockAsset } from '@/services/api';

// Watchlist item interface
interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'forex';
  price: number;
  change: number;
  changePercentage: number;
}

// Convert API data to watchlist items
const cryptoToWatchlistItem = (crypto: CryptoAsset): WatchlistItem => ({
  id: crypto.id,
  symbol: crypto.symbol.toUpperCase(),
  name: crypto.name,
  type: 'crypto',
  price: crypto.current_price,
  change: crypto.current_price * (crypto.price_change_percentage_24h / 100),
  changePercentage: crypto.price_change_percentage_24h
});

const stockToWatchlistItem = (stock: StockAsset): WatchlistItem => ({
  id: stock.symbol.toLowerCase(),
  symbol: stock.symbol,
  name: stock.name,
  type: 'stock',
  price: stock.price,
  change: stock.change,
  changePercentage: stock.changePercent
});

const WatchlistCard: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WatchlistItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    } else {
      // Default watchlist
      const defaultWatchlist: WatchlistItem[] = [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          type: 'crypto',
          price: 50000,
          change: 1200,
          changePercentage: 2.4
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          type: 'crypto',
          price: 3000,
          change: -50,
          changePercentage: -1.2
        },
        {
          id: 'aapl',
          symbol: 'AAPL',
          name: 'Apple Inc',
          type: 'stock',
          price: 175,
          change: 1.5,
          changePercentage: 0.8
        }
      ];
      setWatchlist(defaultWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(defaultWatchlist));
    }
    setLoading(false);
  }, []);

  // Update localStorage when watchlist changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist, loading]);

  // Handle search for adding to watchlist
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Search for assets matching query
    try {
      const [cryptos, stocks] = await Promise.all([
        getCryptoMarkets(),
        getPopularStocks()
      ]);

      const matchingCryptos = cryptos
        .filter(crypto => 
          crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(cryptoToWatchlistItem);

      const matchingStocks = stocks
        .filter(stock => 
          stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(stockToWatchlistItem);

      const results = [...matchingCryptos, ...matchingStocks];
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching assets:', error);
      setSearchResults([]);
    }
  };

  // Add asset to watchlist
  const addToWatchlist = (item: WatchlistItem) => {
    // Check if already in watchlist
    if (watchlist.some(asset => asset.id === item.id)) {
      return;
    }
    
    setWatchlist(prev => [item, ...prev]);
    setIsDialogOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove asset from watchlist
  const removeFromWatchlist = (itemId: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== itemId));
  };

  // Format price based on value
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
  
  return (
    <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Watchlist</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-trading-bg-tertiary">
              <Plus className="h-4 w-4 mr-1" /> Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-trading-bg-secondary text-trading-text-primary border-trading-bg-tertiary">
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Search for assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between py-2 px-1 hover:bg-trading-bg-tertiary/20 rounded"
                    >
                      <div className="flex items-center">
                        <span className="text-sm text-trading-text-secondary mr-2">
                          {item.type === 'crypto' ? 'Crypto' : 'Stock'}:
                        </span>
                        <span>{item.name} ({item.symbol})</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => addToWatchlist(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() !== '' ? (
                <div className="text-center text-trading-text-secondary py-4">
                  No results found. Try a different search term.
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-8 text-trading-text-secondary">
            <Star className="h-12 w-12 mx-auto opacity-20 mb-3" />
            <h3 className="font-medium text-trading-text-primary mb-1">Your watchlist is empty</h3>
            <p className="text-sm max-w-xs mx-auto">
              Add assets to your watchlist to track their performance and quickly access them.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-trading-bg-tertiary/30">
            {watchlist.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between py-3 first:pt-0 relative group"
              >
                <Link 
                  to={`/market/${item.type}/${item.id}`} 
                  className="flex flex-col flex-1"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-trading-text-primary">{item.symbol}</span>
                    <span className="ml-2 text-xs bg-trading-bg-tertiary/50 px-1.5 py-0.5 rounded text-trading-text-secondary">
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-trading-text-secondary">{item.name}</span>
                </Link>
                
                <div className="text-right">
                  <div className="font-medium text-trading-text-primary">
                    ${formatPrice(item.price)}
                  </div>
                  <div>
                    {item.changePercentage >= 0 ? (
                      <div className="flex items-center text-trading-accent-green justify-end">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span className="text-sm">{item.changePercentage.toFixed(2)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-trading-accent-red justify-end">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span className="text-sm">{Math.abs(item.changePercentage).toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="15" 
                        height="15" 
                        viewBox="0 0 15 15" 
                        fill="none"
                        stroke="currentColor"
                        className="text-trading-text-secondary"
                      >
                        <path d="M8 2.75C8 2.33579 7.66421 2 7.25 2C6.83579 2 6.5 2.33579 6.5 2.75C6.5 3.16421 6.83579 3.5 7.25 3.5C7.66421 3.5 8 3.16421 8 2.75Z" />
                        <path d="M8 7.25C8 6.83579 7.66421 6.5 7.25 6.5C6.83579 6.5 6.5 6.83579 6.5 7.25C6.5 7.66421 6.83579 8 7.25 8C7.66421 8 8 7.66421 8 7.25Z" />
                        <path d="M8 11.75C8 11.3358 7.66421 11 7.25 11C6.83579 11 6.5 11.3358 6.5 11.75C6.5 12.1642 6.83579 12.5 7.25 12.5C7.66421 12.5 8 12.1642 8 11.75Z" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-trading-bg-secondary border-trading-bg-tertiary">
                    <DropdownMenuItem 
                      onClick={() => removeFromWatchlist(item.id)}
                      className="text-trading-accent-red cursor-pointer flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" /> Remove from Watchlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchlistCard;
