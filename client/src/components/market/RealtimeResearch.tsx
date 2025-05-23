import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Search, Car, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';

export function RealtimeResearch() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const marketResearchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const res = await apiRequest('POST', '/api/market-research/search', { query: searchQuery });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to fetch market research data');
      }
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: 'Research Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setSearchTerm(query);
    marketResearchMutation.mutate(query);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Sample search suggestions specific to restomod market research
  const searchSuggestions = [
    "Current market value of 1967 Ford Mustang Fastback restomods",
    "Average ROI for Corvette C2 restomods over the past 5 years",
    "Most valuable modification factors for classic Bronco restomods",
    "Porsche 911 Singer values compared to other premium builds",
    "Current trends in 1980s classic car restomod market"
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Search className="mr-2 h-5 w-5 text-muted-foreground" />
          Realtime Market Research
        </CardTitle>
        <CardDescription>
          Access current market data and analyses powered by Perplexity AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Research specific model values, trends, or investment insights..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={marketResearchMutation.isPending}>
            {marketResearchMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
        
        {!searchTerm && !marketResearchMutation.data && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Suggested searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setQuery(suggestion);
                    setSearchTerm(suggestion);
                    marketResearchMutation.mutate(suggestion);
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {marketResearchMutation.isPending && (
          <div className="py-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Researching market data...</p>
            <p className="text-xs text-muted-foreground mt-1">Sourcing information from global databases and auctions</p>
          </div>
        )}
        
        {marketResearchMutation.isError && (
          <div className="py-8 text-center border rounded-md bg-destructive/10">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Research Error</p>
            <p className="text-muted-foreground mt-1">Unable to retrieve market data. Please try again.</p>
          </div>
        )}
        
        {marketResearchMutation.isSuccess && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Research Results</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>Updated just now</span>
              </div>
            </div>
            
            <Tabs defaultValue="analysis">
              <TabsList className="mb-4">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="data">Market Data</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-md">
                  <div className="flex items-center mb-3">
                    <Car className="h-5 w-5 mr-2 text-primary" />
                    <h4 className="font-medium">Market Insights: {searchTerm}</h4>
                  </div>
                  <div className="whitespace-pre-line text-sm space-y-4">
                    {marketResearchMutation.data?.content || "No analysis available"}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="data">
                <div className="p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-3">Key Data Points</h4>
                  {marketResearchMutation.data?.marketData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(marketResearchMutation.data.marketData).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-2 bg-background rounded border">
                          <span className="text-sm font-medium">{key}</span>
                          <span className="text-sm">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific data points extracted</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="sources">
                <div className="p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-3">Information Sources</h4>
                  {marketResearchMutation.data?.sources && marketResearchMutation.data.sources.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {marketResearchMutation.data.sources.map((source: string, index: number) => (
                        <li key={index} className="text-blue-600 hover:underline overflow-hidden text-ellipsis">
                          <a href={source} target="_blank" rel="noopener noreferrer">
                            {source}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No source citations available</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Powered by Perplexity AI • Data refreshed daily • Market trends are for informational purposes only
      </CardFooter>
    </Card>
  );
}

export default RealtimeResearch;