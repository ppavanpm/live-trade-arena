
import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navigation/Navbar';
import { getFinancialNews, NewsItem } from '@/services/api';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const newsData = await getFinancialNews();
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

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
          
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
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
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-0">
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
                  ) : (
                    // Actual news cards
                    news.map((item, index) => (
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
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default News;
