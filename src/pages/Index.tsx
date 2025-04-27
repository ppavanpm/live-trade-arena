
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, LineChart, Lock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navigation/Navbar';
import AuthModal from '@/components/Auth/AuthModal';
import MarketOverview from '@/components/Markets/MarketOverview';
import { Link } from 'react-router-dom';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('signup');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleOpenAuthModal = (type: 'login' | 'signup') => {
    setAuthType(type);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="trading-app min-h-screen flex flex-col">
      <Navbar 
        isLoggedIn={isLoggedIn}
        onLogin={() => handleOpenAuthModal('login')}
        onSignup={() => handleOpenAuthModal('signup')}
        onLogout={handleLogout}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess}
        defaultTab={authType}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-trading-bg-primary py-12 md:py-24 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                className="max-w-xl"
              >
                <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 text-trading-text-primary">
                  Trade with confidence in our <span className="text-trading-accent-blue">risk-free arena</span>
                </h1>
                <p className="text-xl mb-8 text-trading-text-secondary">
                  Practice trading stocks, crypto, and forex with real market data and zero financial risk. Perfect your strategy before trading with real money.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => handleOpenAuthModal('signup')}
                    className="bg-trading-accent-blue hover:bg-trading-accent-blue/90 text-white px-8 py-6 text-lg"
                  >
                    Start Trading Now
                  </Button>
                  <Button 
                    variant="outline" 
                    asChild
                    className="border-trading-bg-tertiary text-trading-text-primary hover:bg-trading-bg-tertiary/20 px-8 py-6 text-lg"
                  >
                    <Link to="/markets">
                      Explore Markets <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-trading-accent-blue/20 to-purple-600/20 rounded-2xl p-1">
                  <div className="bg-trading-bg-secondary rounded-xl overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1642014359734-7806cd250d5e?q=80&w=800&auto=format&fit=crop" 
                      alt="Trading dashboard preview" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Market Overview Section */}
        <section className="py-16 px-6 bg-trading-bg-primary/95">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-trading-text-primary">Real-Time Market Data</h2>
              <p className="text-lg text-trading-text-secondary">
                Access live market data from global exchanges. Track prices, monitor trends, and make informed trading decisions.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <MarketOverview />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-6 bg-trading-bg-secondary">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-trading-text-primary">Trading Platform Features</h2>
              <p className="text-lg text-trading-text-secondary">
                Our comprehensive trading platform equips you with all the tools needed to develop and refine your trading strategies.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-trading-bg-tertiary/20 rounded-xl p-6"
              >
                <div className="bg-trading-accent-blue/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <LineChart className="h-6 w-6 text-trading-accent-blue" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-trading-text-primary">Advanced Charting</h3>
                <p className="text-trading-text-secondary">
                  Interactive charts with multiple timeframes and technical indicators to analyze asset performance.
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-trading-bg-tertiary/20 rounded-xl p-6"
              >
                <div className="bg-trading-accent-green/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-trading-accent-green" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-trading-text-primary">Portfolio Tracking</h3>
                <p className="text-trading-text-secondary">
                  Track your mock portfolio performance with real-time profit and loss calculations.
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-trading-bg-tertiary/20 rounded-xl p-6"
              >
                <div className="bg-purple-500/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-trading-text-primary">Market Analytics</h3>
                <p className="text-trading-text-secondary">
                  Comprehensive market data and analytics to inform your trading decisions.
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-trading-bg-tertiary/20 rounded-xl p-6"
              >
                <div className="bg-amber-500/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-amber-500"
                  >
                    <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon>
                    <line x1="3" y1="22" x2="21" y2="22"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3 text-trading-text-primary">Trading Journal</h3>
                <p className="text-trading-text-secondary">
                  Record and analyze your trades to refine your strategy over time.
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-trading-bg-tertiary/20 rounded-xl p-6"
              >
                <div className="bg-pink-500/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-pink-500"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-3 text-trading-text-primary">Price Alerts</h3>
                <p className="text-trading-text-secondary">
                  Set custom price alerts to be notified of market movements.
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-trading-bg-tertiary/20 rounded-xl p-6"
              >
                <div className="bg-trading-accent-red/20 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-trading-accent-red" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-trading-text-primary">Secure Account</h3>
                <p className="text-trading-text-secondary">
                  Your account is protected with industry-standard security measures.
                </p>
              </motion.div>
            </div>
            
            <div className="mt-12 text-center">
              <Button 
                onClick={() => handleOpenAuthModal('signup')}
                className="bg-trading-accent-blue hover:bg-trading-accent-blue/90 text-white px-8"
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-trading-accent-blue/20 to-purple-600/20">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-trading-text-primary">
              Ready to start your trading journey?
            </h2>
            <p className="text-xl mb-8 text-trading-text-secondary">
              Join thousands of traders learning and practicing in a risk-free environment.
            </p>
            <Button 
              onClick={() => handleOpenAuthModal('signup')}
              className="bg-trading-accent-blue hover:bg-trading-accent-blue/90 text-white px-8 py-6 text-lg"
            >
              Start Trading Now
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-trading-bg-secondary py-10 px-6 border-t border-trading-bg-tertiary/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4 text-trading-text-primary">LiveTradeArena</h3>
              <p className="text-sm text-trading-text-secondary">
                A realistic paper trading platform with real market data for practicing trading strategies.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-trading-text-primary">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Market Data</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Trading Tools</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Portfolio Tracking</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Price Alerts</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-trading-text-primary">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Help Center</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Trading Guides</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">API Documentation</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Market News</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 text-trading-text-primary">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Terms of Service</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Privacy Policy</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Cookie Policy</a></li>
                <li><a href="#" className="text-trading-text-secondary hover:text-trading-accent-blue">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-trading-bg-tertiary/30 text-sm text-trading-text-secondary text-center">
            <p>© {new Date().getFullYear()} LiveTradeArena. All rights reserved.</p>
            <p className="mt-1">This is a paper trading platform. No real money is involved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
