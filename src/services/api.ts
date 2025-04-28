import axios from 'axios';
import { toast } from 'sonner';

// Base API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_KEY = 'demo'; // Replace with your API key in production

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

// Stock API methods
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

    return {
      symbol,
      name: symbol, // Alpha Vantage doesn't provide name in quote
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

// Popular stocks to display - Expanded list
export const getPopularStocks = async (): Promise<StockAsset[]> => {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];
  try {
    const stockPromises = symbols.map(symbol => getStockQuote(symbol));
    const stocks = await Promise.all(stockPromises);
    return stocks.filter(stock => stock !== null) as StockAsset[];
  } catch (error) {
    console.error('Error fetching popular stocks:', error);
    toast.error("Failed to load stock data");
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
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 175.98,
        change: -0.87,
        changePercent: -0.49,
        volume: 18000000
      }
    ];
  }
};

// Forex data
export const getForexRates = async (): Promise<ForexAsset[]> => {
  try {
    // For now, using static data but in production connect to a real API
    return [
      { fromCurrency: 'EUR', toCurrency: 'USD', exchangeRate: 1.08, change: 0.002, changePercent: 0.19 },
      { fromCurrency: 'GBP', toCurrency: 'USD', exchangeRate: 1.27, change: -0.001, changePercent: -0.08 },
      { fromCurrency: 'USD', toCurrency: 'JPY', exchangeRate: 149.8, change: 0.56, changePercent: 0.37 },
      { fromCurrency: 'AUD', toCurrency: 'USD', exchangeRate: 0.66, change: -0.003, changePercent: -0.45 },
      { fromCurrency: 'USD', toCurrency: 'CAD', exchangeRate: 1.36, change: 0.005, changePercent: 0.37 },
      { fromCurrency: 'USD', toCurrency: 'CHF', exchangeRate: 0.90, change: 0.002, changePercent: 0.22 },
      { fromCurrency: 'NZD', toCurrency: 'USD', exchangeRate: 0.60, change: -0.001, changePercent: -0.17 },
      { fromCurrency: 'USD', toCurrency: 'CNY', exchangeRate: 7.23, change: 0.01, changePercent: 0.14 }
    ];
  } catch (error) {
    console.error('Error fetching forex rates:', error);
    toast.error("Failed to load forex data");
    return [];
  }
};

// Financial news - Expanded and more realistic
export const getFinancialNews = async (): Promise<NewsItem[]> => {
  // In a real app, connect to a news API
  // For demo, returning enhanced static data
  return [
    {
      title: 'Fed signals possibility of rate cuts later this year as inflation shows signs of cooling',
      url: '#',
      source: 'Financial Times',
      publishedAt: new Date().toISOString(),
      summary: 'Federal Reserve officials indicated they could begin cutting interest rates in the coming months if inflation continues to cool, according to minutes from their latest policy meeting released Wednesday.'
    },
    {
      title: 'Bitcoin surpasses $67,000 as institutional demand grows following spot ETF approvals',
      url: '#',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Bitcoin has crossed the $67,000 mark for the first time since March, driven by growing institutional adoption and continued inflows into spot Bitcoin ETFs that were approved earlier this year.'
    },
    {
      title: 'Apple unveils new AI features for upcoming iPhone operating system at WWDC',
      url: '#',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Apple announced a suite of new AI capabilities called Apple Intelligence that will be integrated into its next iPhone operating system, iOS 18, marking the company\'s biggest push into artificial intelligence.'
    },
    {
      title: 'Oil prices drop amid concerns over global demand and increased production',
      url: '#',
      source: 'CNBC',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Crude oil prices fell as traders assessed weakening demand in China and potential increases in global supply as OPEC+ members consider scaling back production cuts in the coming months.'
    },
    {
      title: 'Tech sector leads market rally as Nvidia stock reaches new all-time high',
      url: '#',
      source: 'Wall Street Journal',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Technology stocks led a broad market rally on Tuesday, with Nvidia shares reaching a new all-time high following strong quarterly earnings and optimistic forecasts for AI chip demand.'
    },
    {
      title: 'European Central Bank cuts interest rates for the first time since 2019',
      url: '#',
      source: 'BBC',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'The European Central Bank cut its key interest rate by 25 basis points on Thursday, its first reduction since 2019, as inflation in the eurozone continued to ease closer to the bank\'s 2% target.'
    }
  ];
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

// In a real app, these would interact with your backend
// Mock implementations for front-end development
export const getCurrentUser = () => {
  // Mock user for development
  return {
    id: '123',
    username: 'trader_joe',
    email: 'joe@example.com',
    balance: 100000,
    portfolioValue: 105250,
    joinDate: new Date().toISOString()
  };
};

export const getUserPortfolio = async (): Promise<Portfolio> => {
  // Mock portfolio for development - will be replaced with real data from Supabase
  return {
    assets: [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        quantity: 0.5,
        averageBuyPrice: 45000,
        currentPrice: 50000,
        totalValue: 25000,
        profitLoss: 2500,
        profitLossPercentage: 11.11
      },
      {
        id: 'aapl',
        symbol: 'AAPL',
        name: 'Apple Inc',
        type: 'stock',
        quantity: 10,
        averageBuyPrice: 170,
        currentPrice: 175,
        totalValue: 1750,
        profitLoss: 50,
        profitLossPercentage: 2.94
      }
    ],
    totalValue: 26750,
    totalProfit: 2550,
    dailyChange: 3.2
  };
};

export const getUserTransactions = async (): Promise<Transaction[]> => {
  // Mock transactions for development
  return [
    {
      id: '1',
      userId: '123',
      assetId: 'bitcoin',
      assetSymbol: 'BTC',
      assetName: 'Bitcoin',
      type: 'buy',
      quantity: 0.5,
      price: 45000,
      total: 22500,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      userId: '123',
      assetId: 'aapl',
      assetSymbol: 'AAPL',
      assetName: 'Apple Inc',
      type: 'buy',
      quantity: 10,
      price: 170,
      total: 1700,
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// In a real app, these would send requests to your backend
export const executeTrade = async (
  assetId: string,
  assetSymbol: string,
  assetName: string,
  assetType: 'crypto' | 'stock' | 'forex',
  tradeType: 'buy' | 'sell',
  quantity: number,
  price: number
): Promise<Transaction> => {
  // Mock implementation
  const transaction: Transaction = {
    id: Math.random().toString(36).substring(2, 9),
    userId: '123',
    assetId,
    assetSymbol,
    assetName,
    type: tradeType,
    quantity,
    price,
    total: quantity * price,
    timestamp: new Date().toISOString()
  };
  
  console.log('Trade executed:', transaction);
  return transaction;
};

// Real API implementation for user auth and signup with email functionality
// These functions will connect to Supabase for authentication in production
export const registerUser = async (email: string, password: string, fullName: string) => {
  try {
    // This would be a Supabase signup call in production
    console.log('Registering user:', { email, fullName });
    
    // Mock sending welcome email
    console.log('Sending welcome email to:', email);
    
    // Return mock success response
    return {
      success: true,
      message: 'Registration successful! Please check your email to verify your account.'
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register user');
  }
};

// Also implement login function to be connected to Supabase in production
export const loginUser = async (email: string, password: string) => {
  try {
    // This would be a Supabase login call in production
    console.log('Logging in user:', email);
    
    // Return mock success response
    return {
      success: true,
      user: getCurrentUser()
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to log in');
  }
};
