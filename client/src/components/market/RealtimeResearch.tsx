import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface RealtimeResearchProps {
  initialQuery?: string;
}

export default function RealtimeResearch({ initialQuery = "restomod market trends 2024" }: RealtimeResearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<null | {
    content: string;
    citations: string[];
    searchTime: string;
  }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = new Date();
      const response = await fetch('/api/market-research/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const endTime = new Date();
      const searchTime = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);
      
      setResults({
        content: data.content,
        citations: data.citations || [],
        searchTime
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Process and format the content with paragraphs
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
    ));
  };

  return (
    <Card className="w-full shadow-md bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <span className="font-playfair text-xl">Real-Time Market Research</span>
          <Badge variant="outline" className="bg-burgundy/10 text-burgundy">
            Powered by AI
          </Badge>
        </CardTitle>
        <CardDescription>
          Search for the latest market data, trends, and research information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Search for market trends, vehicle values, or builder information..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="bg-burgundy hover:bg-burgundy/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Search</span>
          </Button>
        </div>
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-burgundy animate-spin mb-4" />
            <p className="text-sm text-charcoal/70">Searching for latest market information...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-sm text-red-800">
            <p className="font-medium mb-1">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {!isLoading && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="prose prose-sm max-w-none mb-4 text-charcoal/80">
              {formatContent(results.content)}
            </div>
            
            {results.citations && results.citations.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Sources:</h4>
                  <ul className="space-y-1 text-xs">
                    {results.citations.slice(0, 5).map((citation, index) => (
                      <li key={index} className="flex items-start gap-1 text-charcoal/70">
                        <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{citation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            
            <div className="flex justify-between items-center mt-4 text-xs text-charcoal/60">
              <span>Results in {results.searchTime} seconds</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSearch} 
                className="h-8 gap-1"
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}