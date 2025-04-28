
import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navigation/Navbar';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  category: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Use newsapi.org API (requires signing up for a free API key)
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'us',
            category: 'business',
            apiKey: 'c39970775c1f420fa5a0b03146e99fe9' // Free API key with limited requests
          }
        });
        
        // Transform the response to match our interface
        const newsData = response.data.articles.map((article: any) => ({
          title: article.title,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          summary: article.description || article.content,
          category: assignCategory(article.title, article.description)
        }));
        
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast.error("Failed to load news data");
        
        // Fallback data in case API calls are exhausted
        const fallbackNews = [
          {
            title: 'Federal Reserve signals potential interest rate cuts later this year',
            url: 'https://www.cnbc.com/federal-reserve-rate-cut',
            source: 'CNBC',
            publishedAt: new Date().toISOString(),
            summary: 'The Federal Reserve indicated it could begin cutting interest rates in the coming months if inflation continues to cool, according to recently released policy meeting minutes.',
            category: 'economy'
          },
          {
            title: 'Bitcoin surpasses $65,000 as institutional demand continues to grow',
            url: 'https://www.bloomberg.com/bitcoin-surge',
            source: 'Bloomberg',
            publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            summary: 'Bitcoin exceeded $65,000 as institutional adoption increases and ETF inflows remain strong. Analysts suggest further upside potential.',
            category: 'crypto'
          },
          {
            title: 'Apple announces major AI features for upcoming iOS release',
            url: 'https://www.theverge.com/apple-ai-features',
            source: 'The Verge',
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            summary: 'Apple unveiled new AI capabilities for its upcoming iOS release, marking the company\'s strongest push into artificial intelligence to date.',
            category: 'stocks'
          },
          {
            title: 'Oil prices decline amid concerns over global economic slowdown',
            url: 'https://www.reuters.com/oil-prices-decline',
            source: 'Reuters',
            publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            summary: 'Crude oil prices fell as traders assessed weak manufacturing data from major economies and concerns about reduced demand.',
            category: 'business'
          },
          {
            title: 'Nvidia reports record quarterly earnings, exceeding expectations',
            url: 'https://www.wsj.com/nvidia-earnings',
            source: 'Wall Street Journal',
            publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            summary: 'Chip manufacturer Nvidia reported record quarterly revenue and profit, driven by continued demand for AI processors.',
            category: 'stocks'
          },
          {
            title: 'European Central Bank cuts interest rates as inflation eases',
            url: 'https://www.ft.com/ecb-rate-cut',
            source: 'Financial Times',
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            summary: 'The ECB reduced its key interest rate as inflation in the eurozone continued to moderate closer to target levels.',
            category: 'economy'
          }
        ];
        
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();

    // Check auth status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  // Helper function to categorize news based on content
  const assignCategory = (title: string, description: string): string => {
    const content = (title + ' ' + (description || '')).toLowerCase();
    
    if (content.includes('crypto') || content.includes('bitcoin') || content.includes('ethereum') || content.includes('blockchain')) {
      return 'crypto';
    } else if (content.includes('stock') || content.includes('nasdaq') || content.includes('dow') || content.includes('apple') || content.includes('tesla')) {
      return 'stocks';
    } else if (content.includes('economy') || content.includes('inflation') || content.includes('rate') || content.includes('fed') || content.includes('gdp')) {
      return 'economy';
    } else {
      return 'business';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Filter news based on selected category
  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const categories = ['all', 'crypto', 'stocks', 'economy', 'business'];

  return (
    <div className="trading-app min-h-screen flex flex-col">
      <Navbar isLoggedIn={true} />
      
      <main className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-trading-text-primary mb-2">Financial News</h1>
            <p className="text-trading-text-secondary">Stay updated with the latest market news and analysis</p>
          </div>
          
          <Tabs defaultValue={activeCategory} value={activeCategory} onValueChange={setActiveCategory}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-trading-bg-tertiary/30">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="capitalize"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                // Loading skeletons
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="border-trading-bg-tertiary/30 bg-trading-bg-secondary overflow-hidden">
                    <div className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : filteredNews.length > 0 ? (
                // Actual news cards
                filteredNews.map((item, index) => (
                  <Card 
                    key={index} 
                    className="border-trading-bg-tertiary/30 bg-trading-bg-secondary overflow-hidden hover:border-trading-accent-blue transition-colors"
                  >
                    <div className="p-6">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-trading-accent-blue border-trading-accent-blue/30">
                          {item.source}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-medium text-trading-text-primary mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-trading-text-secondary mb-4 line-clamp-3">
                        {item.summary}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-xs text-trading-text-secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(item.publishedAt)}
                        </div>
                        <Button size="sm" variant="ghost" className="text-trading-accent-blue p-0 h-auto" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            Read <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-10">
                  <h3 className="text-lg font-medium text-trading-text-primary mb-2">No news found in this category</h3>
                  <p className="text-trading-text-secondary">Try selecting a different category</p>
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default News;
