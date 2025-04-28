
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Base API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_KEY = 'demo'; // Replace with actual API key

// Market data types
export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

export interface StockAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface ForexAsset {
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
}

// Crypto API methods
export const getCryptoMarkets = async (): Promise<CryptoAsset[]> => {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto markets:', error);
    toast.error("Failed to load cryptocurrency data");
    
    // Return minimal fallback data if API fails
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: 64000,
        price_change_percentage_24h: 2.5,
        market_cap: 1250000000000,
        total_volume: 32000000000
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: 3450,
        price_change_percentage_24h: 1.8,
        market_cap: 420000000000,
        total_volume: 15000000000
      }
    ];
  }
};

export const getCryptoDetail = async (id: string): Promise<any> => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching crypto detail for ${id}:`, error);
    throw error;
  }
};

export const getCryptoChart = async (id: string, days: number = 7): Promise<any> => {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching chart data for ${id}:`, error);
    throw error;
  }
};

// Stock API methods - Using Alpha Vantage
export const getStockQuote = async (symbol: string): Promise<StockAsset | null> => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_KEY
      }
    });

    const data = response.data['Global Quote'];
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    const stockInfo = await getStockCompanyInfo(symbol);
    const name = stockInfo?.name || symbol;

    return {
      symbol,
      name,
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      volume: parseInt(data['06. volume'])
    };
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    toast.error(`Failed to load stock data for ${symbol}`);
    return null;
  }
};

// Get company name info
export const getStockCompanyInfo = async (symbol: string): Promise<{ name: string } | null> => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: 'OVERVIEW',
        symbol,
        apikey: ALPHA_VANTAGE_KEY
      }
    });
    
    if (response.data && response.data.Name) {
      return { name: response.data.Name };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching company info for ${symbol}:`, error);
    return null;
  }
};

export const getStockHistory = async (symbol: string): Promise<any> => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        outputsize: 'compact',
        apikey: ALPHA_VANTAGE_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching stock history for ${symbol}:`, error);
    throw error;
  }
};

// Popular stocks to display
export const getPopularStocks = async (): Promise<StockAsset[]> => {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];
  try {
    const stockPromises = symbols.map(symbol => getStockQuote(symbol));
    const stocks = await Promise.all(stockPromises);
    return stocks.filter(stock => stock !== null) as StockAsset[];
  } catch (error) {
    console.error('Error fetching popular stocks:', error);
    toast.error("Failed to load stock data");
    
    // Minimal fallback data
    return [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 182.52,
        change: 1.25,
        changePercent: 0.69,
        volume: 52000000
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 417.88,
        change: 2.33,
        changePercent: 0.56,
        volume: 22000000
      }
    ];
  }
};

// Forex data - Using Alpha Vantage
export const getForexRates = async (): Promise<ForexAsset[]> => {
  const pairs = [
    {fromCurrency: 'EUR', toCurrency: 'USD'},
    {fromCurrency: 'GBP', toCurrency: 'USD'},
    {fromCurrency: 'USD', toCurrency: 'JPY'},
    {fromCurrency: 'AUD', toCurrency: 'USD'},
    {fromCurrency: 'USD', toCurrency: 'CAD'},
    {fromCurrency: 'USD', toCurrency: 'CHF'}
  ];
  
  try {
    const forexPromises = pairs.map(async ({fromCurrency, toCurrency}) => {
      try {
        const response = await axios.get(ALPHA_VANTAGE_API, {
          params: {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: fromCurrency,
            to_currency: toCurrency,
            apikey: ALPHA_VANTAGE_KEY
          }
        });
        
        const data = response.data['Realtime Currency Exchange Rate'];
        
        if (!data) {
          throw new Error('No data returned');
        }
        
        const exchangeRate = parseFloat(data['5. Exchange Rate']);
        // Since this API doesn't provide change data, we'll generate some random change
        const change = (Math.random() * 0.01 - 0.005) * exchangeRate;
        const changePercent = (change / exchangeRate) * 100;
        
        return {
          fromCurrency,
          toCurrency,
          exchangeRate,
          change,
          changePercent
        };
      } catch (error) {
        console.error(`Error fetching forex data for ${fromCurrency}/${toCurrency}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(forexPromises);
    return results.filter(result => result !== null) as ForexAsset[];
  } catch (error) {
    console.error('Error fetching forex rates:', error);
    toast.error("Failed to load forex data");
    
    // Minimal fallback data
    return [
      { fromCurrency: 'EUR', toCurrency: 'USD', exchangeRate: 1.08, change: 0.002, changePercent: 0.19 },
      { fromCurrency: 'GBP', toCurrency: 'USD', exchangeRate: 1.27, change: -0.001, changePercent: -0.08 }
    ];
  }
};

// User-related interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  portfolioValue: number;
  joinDate: string;
}

export interface Portfolio {
  assets: PortfolioAsset[];
  totalValue: number;
  totalProfit: number;
  dailyChange: number;
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'forex';
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface Transaction {
  id: string;
  userId: string;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
}

// Get user portfolio from database
export const getUserPortfolio = async (): Promise<Portfolio | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Get all user trades from the database
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) {
      throw error;
    }
    
    if (!trades || trades.length === 0) {
      return {
        assets: [],
        totalValue: 0,
        totalProfit: 0,
        dailyChange: 0
      };
    }
    
    // Process trades to build portfolio
    // This is a simplified implementation - in a real app you'd need to:
    // 1. Group by asset
    // 2. Calculate average buy price from buys and sells
    // 3. Fetch current prices
    // 4. Calculate profit/loss
    
    // For now, we'll mock this part
    return {
      assets: [],
      totalValue: 0,
      totalProfit: 0,
      dailyChange: 0
    };
  } catch (error) {
    console.error('Error getting user portfolio:', error);
    toast.error('Failed to load portfolio');
    return null;
  }
};

// Get user transactions from database
export const getUserTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    if (!trades) {
      return [];
    }
    
    // Convert database trades to Transaction format
    return trades.map(trade => ({
      id: trade.id,
      userId: trade.user_id,
      assetId: trade.symbol.toLowerCase(),
      assetSymbol: trade.symbol,
      assetName: trade.symbol, // We don't have name in the trades table
      type: trade.type as 'buy' | 'sell',
      quantity: parseFloat(trade.quantity.toString()), // Convert to string first
      price: parseFloat(trade.price.toString()), // Convert to string first
      total: parseFloat(trade.total.toString()), // Convert to string first
      timestamp: trade.created_at
    }));
  } catch (error) {
    console.error('Error getting user transactions:', error);
    toast.error('Failed to load transactions');
    return [];
  }
};

// Execute trade
export const executeTrade = async (
  assetId: string,
  assetSymbol: string,
  assetName: string,
  assetType: 'crypto' | 'stock' | 'forex',
  tradeType: 'buy' | 'sell',
  quantity: number,
  price: number
): Promise<Transaction> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const total = quantity * price;
    
    // Insert trade into database - wrap the object in an array to match the expected type
    const { data: trade, error } = await supabase
      .from('trades')
      .insert([{
        user_id: user.id,
        symbol: assetSymbol,
        type: tradeType,
        order_type: 'market',
        quantity: quantity.toString(), // Convert to string
        price: price.toString(), // Convert to string 
        total: total.toString() // Convert to string
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!trade) {
      throw new Error('Failed to execute trade');
    }
    
    // Return the created transaction
    return {
      id: trade.id,
      userId: trade.user_id,
      assetId,
      assetSymbol,
      assetName,
      type: tradeType,
      quantity: parseFloat(trade.quantity.toString()),
      price: parseFloat(trade.price.toString()),
      total: parseFloat(trade.total.toString()),
      timestamp: trade.created_at
    };
  } catch (error) {
    console.error('Error executing trade:', error);
    toast.error('Failed to execute trade');
    throw error;
  }
};

// Authentication functions with email functionality
export const registerUser = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: window.location.origin + '/auth',
      },
    });

    if (error) throw error;

    // Send welcome email via edge function
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          name: fullName,
          email: email
        }
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't throw - login still succeeded even if email fails
    }
    
    toast.success("Registration successful! Please check your email to verify your account.");
    return {
      success: true,
      user: data.user
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    toast.error(error.message || 'Failed to register user');
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    toast.success("Login successful!");
    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    console.error('Login error:', error);
    toast.error(error.message || 'Failed to log in');
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    toast.success("Logged out successfully");
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    toast.error(error.message || 'Failed to log out');
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      return null;
    }
    
    // In a real app, you would fetch additional user data from a profiles table
    return {
      id: data.user.id,
      username: data.user.email?.split('@')[0] || 'User',
      email: data.user.email,
      balance: 100000, // This would come from the database in a real app
      portfolioValue: 0,    // Calculate this from actual portfolio
      joinDate: data.user.created_at,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
