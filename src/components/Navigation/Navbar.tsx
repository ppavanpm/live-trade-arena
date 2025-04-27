
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, Menu, Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isLoggedIn = false, 
  onLogin, 
  onSignup,
  onLogout 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };

  return (
    <nav className="bg-trading-bg-secondary border-b border-trading-bg-tertiary/30 py-4 px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-trading-text-primary flex items-center">
          <span className="text-trading-accent-blue">Live</span>Trade<span className="text-xs ml-1 bg-trading-accent-blue text-white px-1 rounded">Arena</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-trading-text-primary hover:text-trading-accent-blue transition-colors">Home</Link>
          <Link to="/markets" className="text-trading-text-primary hover:text-trading-accent-blue transition-colors">Markets</Link>
          <Link to="/dashboard" className="text-trading-text-primary hover:text-trading-accent-blue transition-colors">Dashboard</Link>
          <Link to="/news" className="text-trading-text-primary hover:text-trading-accent-blue transition-colors">News</Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full bg-trading-bg-tertiary/50 text-trading-text-primary rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-trading-accent-blue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
          </form>
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-trading-text-secondary hover:text-trading-text-primary">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-trading-accent-blue rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-trading-bg-secondary border border-trading-bg-tertiary text-trading-text-primary">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-2">
                    <div>
                      <p className="text-sm font-medium">BTC price alert triggered</p>
                      <p className="text-xs text-trading-text-secondary">Price exceeded $50,000</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2">
                    <div>
                      <p className="text-sm font-medium">Trade executed successfully</p>
                      <p className="text-xs text-trading-text-secondary">Bought 0.1 BTC at $49,250</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-trading-text-primary hover:bg-trading-bg-tertiary/50">
                    <User className="h-5 w-5 mr-2" />
                    <span className="mr-1">My Account</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-trading-bg-secondary border border-trading-bg-tertiary text-trading-text-primary">
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/portfolio">Portfolio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/transactions">Transactions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-trading-accent-red" 
                    onClick={onLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={onLogin} 
                className="text-trading-text-primary hover:bg-trading-bg-tertiary/50"
              >
                Login
              </Button>
              <Button 
                onClick={onSignup}
                className="bg-trading-accent-blue hover:bg-trading-accent-blue/90 text-white"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6 text-trading-text-primary" /> : <Menu className="h-6 w-6 text-trading-text-primary" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-3 px-4 space-y-4 border-t border-trading-bg-tertiary/30 mt-4">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full bg-trading-bg-tertiary/50 text-trading-text-primary rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-trading-accent-blue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
          </form>
          <Link to="/" className="block py-2 text-trading-text-primary hover:text-trading-accent-blue">Home</Link>
          <Link to="/markets" className="block py-2 text-trading-text-primary hover:text-trading-accent-blue">Markets</Link>
          <Link to="/dashboard" className="block py-2 text-trading-text-primary hover:text-trading-accent-blue">Dashboard</Link>
          <Link to="/news" className="block py-2 text-trading-text-primary hover:text-trading-accent-blue">News</Link>
          
          {isLoggedIn ? (
            <>
              <div className="border-t border-trading-bg-tertiary/30 pt-3 mt-3">
                <Link to="/portfolio" className="block py-2 text-trading-text-primary hover:text-trading-accent-blue">Portfolio</Link>
                <Link to="/transactions" className="block py-2 text-trading-text-primary hover:text-trading-accent-blue">Transactions</Link>
                <Link to="/settings" className="block py-2 text-trading-text-primary hover:text-trading-accent-blue">Settings</Link>
                <button 
                  onClick={onLogout}
                  className="w-full text-left block py-2 text-trading-accent-red hover:text-trading-accent-red/80"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-trading-bg-tertiary/30 pt-3 mt-3 flex flex-col space-y-2">
              <Button 
                variant="outline" 
                onClick={onLogin} 
                className="w-full border-trading-bg-tertiary text-trading-text-primary"
              >
                Login
              </Button>
              <Button 
                onClick={onSignup}
                className="w-full bg-trading-accent-blue hover:bg-trading-accent-blue/90 text-white"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
