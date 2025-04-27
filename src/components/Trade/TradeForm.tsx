
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { executeTrade } from '@/services/api';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TradeFormProps {
  assetId: string;
  assetSymbol: string;
  assetName: string;
  assetType: 'crypto' | 'stock' | 'forex';
  currentPrice: number;
  userBalance: number;
  onTradeComplete?: () => void;
}

const TradeForm: React.FC<TradeFormProps> = ({
  assetId,
  assetSymbol,
  assetName,
  assetType,
  currentPrice,
  userBalance,
  onTradeComplete
}) => {
  const { toast } = useToast();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(currentPrice.toString());
  const [loading, setLoading] = useState(false);

  const parsedQuantity = parseFloat(quantity) || 0;
  const parsedLimitPrice = parseFloat(limitPrice) || currentPrice;
  const total = parsedQuantity * (orderType === 'market' ? currentPrice : parsedLimitPrice);
  
  const isValidTrade = parsedQuantity > 0 && (
    tradeType === 'buy' ? total <= userBalance : true
  );
  
  const maxAffordable = userBalance / currentPrice;
  
  const handleSliderChange = (values: number[]) => {
    const percentage = values[0];
    if (tradeType === 'buy') {
      const maxQty = userBalance / currentPrice;
      setQuantity((maxQty * (percentage / 100)).toFixed(assetType === 'crypto' ? 6 : 2));
    } else {
      // In a real app, this would use the user's actual holdings
      const maxSellQty = 1; // This is just a placeholder
      setQuantity((maxSellQty * (percentage / 100)).toFixed(assetType === 'crypto' ? 6 : 2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidTrade) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await executeTrade(
        assetId,
        assetSymbol,
        assetName,
        assetType,
        tradeType,
        parsedQuantity,
        orderType === 'market' ? currentPrice : parsedLimitPrice
      );
      
      toast({
        title: `${tradeType === 'buy' ? 'Buy' : 'Sell'} Order Executed`,
        description: `Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${parsedQuantity} ${assetSymbol} at $${orderType === 'market' ? currentPrice.toFixed(2) : parsedLimitPrice.toFixed(2)} per unit`,
        variant: 'default',
      });
      
      // Reset form
      setQuantity('');
      setLimitPrice(currentPrice.toString());
      
      if (onTradeComplete) {
        onTradeComplete();
      }
    } catch (error) {
      toast({
        title: 'Trade Failed',
        description: `There was an error executing your trade. Please try again.`,
        variant: 'destructive',
      });
      console.error('Trade execution error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-trading-bg-tertiary/30 bg-trading-bg-secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trade {assetName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}>
          <TabsList className="grid grid-cols-2 mb-6 bg-trading-bg-tertiary/30">
            <TabsTrigger 
              value="buy" 
              className={cn(
                "data-[state=active]:shadow-none",
                "data-[state=active]:bg-trading-accent-green/20 text-sm",
                "data-[state=active]:text-trading-accent-green"
              )}
            >
              Buy
            </TabsTrigger>
            <TabsTrigger 
              value="sell"
              className={cn(
                "data-[state=active]:shadow-none",
                "data-[state=active]:bg-trading-accent-red/20 text-sm",
                "data-[state=active]:text-trading-accent-red"
              )}
            >
              Sell
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-6">
            <div className="flex justify-between">
              <div className="text-trading-text-secondary text-sm">Current Price</div>
              <div className="font-medium text-trading-text-primary">${currentPrice.toFixed(2)}</div>
            </div>
            
            <div className="flex justify-between mt-1">
              <div className="text-trading-text-secondary text-sm">Available Balance</div>
              <div className="font-medium text-trading-text-primary">${userBalance.toFixed(2)}</div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type</Label>
                <select
                  id="orderType"
                  className="w-full bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary rounded-md px-3 py-2"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
                >
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                </select>
              </div>
              
              {orderType === 'limit' && (
                <div className="space-y-2">
                  <Label htmlFor="limitPrice">Limit Price ($)</Label>
                  <Input
                    id="limitPrice"
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="quantity">Quantity</Label>
                {tradeType === 'buy' && (
                  <button
                    type="button"
                    className="text-xs text-trading-accent-blue"
                    onClick={() => setQuantity(maxAffordable.toFixed(assetType === 'crypto' ? 6 : 2))}
                  >
                    Max: {maxAffordable.toFixed(assetType === 'crypto' ? 6 : 2)}
                  </button>
                )}
              </div>
              <Input
                id="quantity"
                type="number"
                step={assetType === 'crypto' ? '0.000001' : '0.01'}
                placeholder={`Amount of ${assetSymbol}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-trading-bg-tertiary/30 border-trading-bg-tertiary text-trading-text-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <Slider
                defaultValue={[0]}
                max={100}
                step={1}
                onValueChange={handleSliderChange}
                className="py-4"
              />
              <div className="flex justify-between">
                <span className="text-xs text-trading-text-secondary">0%</span>
                <span className="text-xs text-trading-text-secondary">25%</span>
                <span className="text-xs text-trading-text-secondary">50%</span>
                <span className="text-xs text-trading-text-secondary">75%</span>
                <span className="text-xs text-trading-text-secondary">100%</span>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-trading-bg-tertiary/30">
              <div className="flex justify-between">
                <span className="text-trading-text-secondary">Total</span>
                <span className="font-medium text-trading-text-primary">${total.toFixed(2)}</span>
              </div>
              
              {!isValidTrade && parsedQuantity > 0 && tradeType === 'buy' && total > userBalance && (
                <div className="flex items-center text-xs text-trading-accent-red gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Insufficient balance for this trade</span>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={!isValidTrade || loading}
                className={cn(
                  "w-full",
                  tradeType === 'buy'
                    ? "bg-trading-accent-green hover:bg-trading-accent-green/90"
                    : "bg-trading-accent-red hover:bg-trading-accent-red/90",
                  "text-white"
                )}
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    {tradeType === 'buy' ? (
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="mr-2 h-4 w-4" />
                    )}
                    {`${tradeType === 'buy' ? 'Buy' : 'Sell'} ${assetSymbol}`}
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-1 text-xs text-trading-text-secondary mt-2">
                <Info className="h-3 w-3" />
                <span>
                  This is a mock trading platform. No real transactions will occur.
                </span>
              </div>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradeForm;
