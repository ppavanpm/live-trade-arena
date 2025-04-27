
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Eye, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navigation/Navbar';
import WatchlistCard from '@/components/Dashboard/WatchlistCard';
import { 
  getCryptoMarkets, 
  getCurrentUser, 
  getUserPortfolio, 
  getUserTransactions 
} from '@/services/api';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trendingAssets, setTrendingAssets] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get user data and portfolio in parallel
        const [userResponse, portfolioResponse, transactionsResponse, trendingResponse] = await Promise.all([
          getCurrentUser(),
          getUserPortfolio(),
          getUserTransactions(),
          getCryptoMarkets()
        ]);
        
        setUser(userResponse);
        setPortfolio(portfolioResponse);
        setTransactions(transactionsResponse);
        setTrendingAssets(trendingResponse.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="trading-app min-h-screen flex flex-col">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-trading-text-primary">
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                `Welcome back, ${user?.username || 'Trader'}`
              )}
            </h1>
            <p className="text-trading-text-secondary">
              {isLoading ? (
                <Skeleton className="h-5 w-72 mt-1" />
              ) : (
                `Your trading dashboard • ${new Date().toLocaleDateString()}`
              )}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Account Balance */}
            <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-trading-text-secondary">Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-trading-text-primary">
                    {formatCurrency(user?.balance || 0)}
                  </div>
                )}
                <div className="text-sm text-trading-text-secondary mt-1">Available for trading</div>
              </CardContent>
            </Card>

            {/* Portfolio Value */}
            <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-trading-text-secondary">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className="text-2xl font-bold text-trading-text-primary">
                    {formatCurrency(portfolio?.totalValue || 0)}
                  </div>
                )}
                {isLoading ? (
                  <Skeleton className="h-5 w-28 mt-1" />
                ) : (
                  <div className="flex items-center mt-1">
                    {(portfolio?.dailyChange || 0) >= 0 ? (
                      <div className="flex items-center text-sm text-trading-accent-green">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>{portfolio?.dailyChange.toFixed(2)}% today</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-trading-accent-red">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span>{Math.abs(portfolio?.dailyChange || 0).toFixed(2)}% today</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total P&L */}
            <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-trading-text-secondary">Total Profit/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <div className={`text-2xl font-bold ${
                    (portfolio?.totalProfit || 0) >= 0 
                      ? 'text-trading-accent-green' 
                      : 'text-trading-accent-red'
                  }`}>
                    {formatCurrency(portfolio?.totalProfit || 0)}
                  </div>
                )}
                <div className="text-sm text-trading-text-secondary mt-1">All time</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Summary */}
              <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Portfolio Summary</CardTitle>
                  <Button variant="ghost" asChild>
                    <Link to="/portfolio" className="text-trading-accent-blue hover:text-trading-accent-blue/80 flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <div className="space-y-1 text-right">
                            <Skeleton className="h-5 w-24 ml-auto" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : portfolio?.assets?.length ? (
                    <div className="space-y-4">
                      {portfolio.assets.map((asset: any) => (
                        <div key={asset.id} className="flex items-center justify-between">
                          <div>
                            <Link 
                              to={`/market/${asset.type}/${asset.id}`}
                              className="font-medium text-trading-text-primary hover:text-trading-accent-blue"
                            >
                              {asset.name} ({asset.symbol})
                            </Link>
                            <div className="text-sm text-trading-text-secondary">
                              {asset.quantity} {asset.symbol} × ${asset.currentPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-trading-text-primary">
                              {formatCurrency(asset.totalValue)}
                            </div>
                            <div>
                              {asset.profitLoss >= 0 ? (
                                <div className="flex items-center text-sm text-trading-accent-green justify-end">
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                  <span>{asset.profitLossPercentage.toFixed(2)}%</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-sm text-trading-accent-red justify-end">
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                  <span>{Math.abs(asset.profitLossPercentage).toFixed(2)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {portfolio.assets.length === 0 && (
                        <div className="text-center py-6 text-trading-text-secondary">
                          <p>You don't have any assets in your portfolio.</p>
                          <Link to="/markets" className="text-trading-accent-blue hover:underline mt-2 block">
                            Start trading now
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-trading-text-secondary">
                      <p className="mb-2">Your portfolio is empty</p>
                      <Button asChild>
                        <Link to="/markets">Start Trading</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
                  <Button variant="ghost" asChild>
                    <Link to="/transactions" className="text-trading-accent-blue hover:text-trading-accent-blue/80 flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="space-y-1 text-right">
                            <Skeleton className="h-5 w-20 ml-auto" />
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : transactions.length ? (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-trading-text-primary">
                              {transaction.type === 'buy' ? 'Bought' : 'Sold'} {transaction.quantity} {transaction.assetSymbol}
                            </div>
                            <div className="text-sm text-trading-text-secondary">
                              {formatDate(transaction.timestamp)} • ${transaction.price.toFixed(2)} per unit
                            </div>
                          </div>
                          <div>
                            <div className={`font-medium ${
                              transaction.type === 'buy'
                                ? 'text-trading-accent-red'
                                : 'text-trading-accent-green'
                            }`}>
                              {transaction.type === 'buy' ? '-' : '+'}{formatCurrency(transaction.total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-trading-text-secondary">
                      <p className="mb-2">You haven't made any transactions yet</p>
                      <Button asChild>
                        <Link to="/markets">Start Trading</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trending Assets */}
              <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">Trending Assets</CardTitle>
                  <Button variant="ghost" asChild>
                    <Link to="/markets" className="text-trading-accent-blue hover:text-trading-accent-blue/80 flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5].map((_, index) => (
                        <div key={index} className="bg-trading-bg-tertiary/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trendingAssets.map(asset => (
                        <Link 
                          key={asset.id} 
                          to={`/market/crypto/${asset.id}`}
                          className="bg-trading-bg-tertiary/20 rounded-lg p-4 transition-colors hover:bg-trading-bg-tertiary/30"
                        >
                          <div className="flex items-center space-x-3">
                            <img src={asset.image} alt={asset.name} className="w-10 h-10 rounded-full" />
                            <div>
                              <div className="font-medium text-trading-text-primary">{asset.name}</div>
                              <div className="text-sm text-trading-text-secondary">{asset.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="font-medium text-trading-text-primary">${asset.current_price.toFixed(2)}</div>
                            <div>
                              {asset.price_change_percentage_24h >= 0 ? (
                                <div className="flex items-center text-sm text-trading-accent-green">
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                  <span>{asset.price_change_percentage_24h.toFixed(2)}%</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-sm text-trading-accent-red">
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                  <span>{Math.abs(asset.price_change_percentage_24h).toFixed(2)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Watchlist */}
              <WatchlistCard />
              
              {/* Quick Actions */}
              <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/markets">
                    <Button variant="outline" className="w-full justify-start border-trading-bg-tertiary text-trading-text-primary">
                      <Eye className="h-4 w-4 mr-2" /> Browse Markets
                    </Button>
                  </Link>
                  <Link to="/portfolio">
                    <Button variant="outline" className="w-full justify-start border-trading-bg-tertiary text-trading-text-primary">
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
                        className="mr-2"
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                      </svg>
                      View Portfolio
                    </Button>
                  </Link>
                  <Link to="/transactions">
                    <Button variant="outline" className="w-full justify-start border-trading-bg-tertiary text-trading-text-primary">
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
                        className="mr-2"
                      >
                        <path d="M12 2H2v10h10V2z"></path>
                        <path d="M22 12h-10v10h10V12z"></path>
                        <path d="M12 12H2v10h10V12z"></path>
                        <path d="M22 2h-10v10h10V2z"></path>
                      </svg>
                      Transaction History
                    </Button>
                  </Link>
                  <Link to="/leaderboard">
                    <Button variant="outline" className="w-full justify-start border-trading-bg-tertiary text-trading-text-primary">
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
                        className="mr-2"
                      >
                        <path d="M12 20v-6"></path>
                        <path d="M18 20v-4"></path>
                        <path d="M6 20v-8"></path>
                        <path d="M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                        <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                        <path d="M6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                      </svg>
                      Leaderboard
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="outline" className="w-full justify-start border-trading-bg-tertiary text-trading-text-primary">
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
                        className="mr-2"
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Account Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Account Summary */}
              <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <>
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-trading-text-secondary">Account Type</span>
                        <span className="text-trading-text-primary font-medium">Demo Account</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-trading-text-secondary">Member Since</span>
                        <span className="text-trading-text-primary font-medium">
                          {formatDate(user?.joinDate || new Date().toISOString())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-trading-text-secondary">Email</span>
                        <span className="text-trading-text-primary font-medium">{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-trading-text-secondary">Total Assets</span>
                        <span className="text-trading-text-primary font-medium">
                          {portfolio?.assets?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-trading-text-secondary">Transactions</span>
                        <span className="text-trading-text-primary font-medium">
                          {transactions.length || 0}
                        </span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-trading-bg-tertiary/30">
                        <Button variant="outline" className="w-full text-trading-text-primary border-trading-bg-tertiary">
                          Deposit Funds
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
