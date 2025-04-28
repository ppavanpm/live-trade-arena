
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  LineChart, 
  Newspaper, 
  UserCircle,
  LogOut,
  PieChart,
  CreditCard,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useMobile from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { logoutUser } from '@/services/api';
import { toast } from 'sonner';

interface NavbarProps {
  isLoggedIn?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const isMobile = useMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setUser(data.user);
      }
    };
    
    if (isLoggedIn) {
      fetchUserData();
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isLoggedIn]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search functionality here
    toast.info(`Searching for: ${searchQuery}`);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <PieChart className="h-5 w-5" /> },
    { name: 'Markets', path: '/markets', icon: <LineChart className="h-5 w-5" /> },
    { name: 'News', path: '/news', icon: <Newspaper className="h-5 w-5" /> },
  ];

  return (
    <header className="bg-trading-bg-secondary border-b border-trading-bg-tertiary/30 z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-trading-accent-blue text-white p-1 rounded mr-2">
                <LineChart className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-trading-text-primary">TradePro</span>
            </Link>
          </div>

          {isLoggedIn && !isMobile && (
            <nav className="hidden md:flex ml-8 space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-trading-accent-blue/10 text-trading-accent-blue'
                      : 'text-trading-text-secondary hover:bg-trading-bg-tertiary/30 hover:text-trading-text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-trading-text-secondary" />
              <Input
                type="search"
                placeholder="Search markets..."
                className="w-full pl-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon" className="text-trading-text-secondary">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-trading-text-secondary flex items-center">
                      <UserCircle className="h-5 w-5 mr-1" />
                      <span className="hidden md:inline-block">
                        {user?.email ? user.email.split('@')[0] : 'Account'}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-trading-bg-secondary border-trading-bg-tertiary text-trading-text-primary">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-trading-bg-tertiary/30" />
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-trading-bg-tertiary/30 focus:bg-trading-bg-tertiary/30"
                      onClick={() => navigate('/dashboard')}
                    >
                      <PieChart className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-trading-bg-tertiary/30 focus:bg-trading-bg-tertiary/30"
                      onClick={() => navigate('/transactions')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Transactions
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-trading-bg-tertiary/30 focus:bg-trading-bg-tertiary/30"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-trading-bg-tertiary/30" />
                    <DropdownMenuItem 
                      className="cursor-pointer text-trading-accent-red focus:text-trading-accent-red hover:bg-trading-bg-tertiary/30 focus:bg-trading-bg-tertiary/30"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} className="bg-trading-accent-blue hover:bg-trading-accent-blue/90">
                Login
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-trading-text-secondary"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && isMobile && (
        <div className="md:hidden border-t border-trading-bg-tertiary/30">
          {isLoggedIn && (
            <nav className="py-2 px-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-trading-accent-blue/10 text-trading-accent-blue'
                      : 'text-trading-text-secondary hover:bg-trading-bg-tertiary/30 hover:text-trading-text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </Link>
              ))}
            </nav>
          )}
          
          <div className="py-2 px-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-trading-text-secondary" />
              <Input
                type="search"
                placeholder="Search markets..."
                className="w-full pl-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
