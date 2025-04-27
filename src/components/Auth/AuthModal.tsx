
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultTab = 'login' 
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (activeTab === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would connect to your backend authentication service
      // For now, we'll simulate a successful authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Authentication successful:', {
        type: activeTab,
        email: formData.email
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ form: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-trading-bg-secondary text-trading-text-primary border border-trading-bg-tertiary">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-trading-text-primary">
            {activeTab === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-trading-bg-tertiary/30">
            <TabsTrigger 
              value="login" 
              className={cn(
                "data-[state=active]:text-trading-accent-blue data-[state=active]:shadow-none",
                "data-[state=active]:bg-trading-bg-tertiary/70 text-sm"
              )}
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className={cn(
                "data-[state=active]:text-trading-accent-blue data-[state=active]:shadow-none",
                "data-[state=active]:bg-trading-bg-tertiary/70 text-sm"
              )}
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          {errors.form && (
            <div className="bg-trading-accent-red/10 border border-trading-accent-red/20 text-trading-accent-red rounded-md p-3 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{errors.form}</span>
            </div>
          )}
          
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary",
                      "placeholder:text-trading-text-secondary/70 focus-visible:ring-trading-accent-blue",
                      errors.email && "border-trading-accent-red focus-visible:ring-trading-accent-red"
                    )}
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
                </div>
                {errors.email && <p className="text-xs text-trading-accent-red">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 pr-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary",
                      "placeholder:text-trading-text-secondary/70 focus-visible:ring-trading-accent-blue",
                      errors.password && "border-trading-accent-red focus-visible:ring-trading-accent-red"
                    )}
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-0 top-0 h-9 w-9 text-trading-text-secondary hover:text-trading-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-trading-accent-red">{errors.password}</p>}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-trading-accent-blue hover:bg-trading-accent-blue/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-trading-text-secondary">
                  Forgot your password?{" "}
                  <button
                    type="button"
                    className="text-trading-accent-blue hover:underline"
                    onClick={() => console.log("Reset password")}
                  >
                    Reset it here
                  </button>
                </p>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary",
                      "placeholder:text-trading-text-secondary/70 focus-visible:ring-trading-accent-blue",
                      errors.name && "border-trading-accent-red focus-visible:ring-trading-accent-red"
                    )}
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
                </div>
                {errors.name && <p className="text-xs text-trading-accent-red">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary",
                      "placeholder:text-trading-text-secondary/70 focus-visible:ring-trading-accent-blue",
                      errors.email && "border-trading-accent-red focus-visible:ring-trading-accent-red"
                    )}
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
                </div>
                {errors.email && <p className="text-xs text-trading-accent-red">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 pr-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary",
                      "placeholder:text-trading-text-secondary/70 focus-visible:ring-trading-accent-blue",
                      errors.password && "border-trading-accent-red focus-visible:ring-trading-accent-red"
                    )}
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-0 top-0 h-9 w-9 text-trading-text-secondary hover:text-trading-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-xs text-trading-accent-red">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={cn(
                      "pl-10 bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary",
                      "placeholder:text-trading-text-secondary/70 focus-visible:ring-trading-accent-blue",
                      errors.confirmPassword && "border-trading-accent-red focus-visible:ring-trading-accent-red"
                    )}
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-trading-text-secondary" />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-trading-accent-red">{errors.confirmPassword}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-trading-accent-blue hover:bg-trading-accent-blue/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-trading-text-secondary">
                  By signing up, you agree to our{" "}
                  <button
                    type="button"
                    className="text-trading-accent-blue hover:underline"
                    onClick={() => console.log("Terms of Service")}
                  >
                    Terms of Service
                  </button>
                  {" "}and{" "}
                  <button
                    type="button"
                    className="text-trading-accent-blue hover:underline"
                    onClick={() => console.log("Privacy Policy")}
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
