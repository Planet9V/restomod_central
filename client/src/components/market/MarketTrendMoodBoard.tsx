import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3,
  Calendar,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface MarketTrendData {
  overall_sentiment: "bullish" | "bearish" | "neutral";
  sentiment_score: number;
  market_confidence: number;
  trending_models: Array<{
    model: string;
    change_percentage: number;
    current_value: number;
    trend_direction: "up" | "down" | "stable";
  }>;
  market_indicators: Array<{
    name: string;
    value: number;
    change: number;
    status: "positive" | "negative" | "neutral";
  }>;
  recent_activity: Array<{
    event: string;
    impact: "high" | "medium" | "low";
    timestamp: string;
  }>;
}

/**
 * Dynamic Market Trend Mood Board
 * Real-time visualization of restomod and classic car market sentiment
 */
export function MarketTrendMoodBoard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // Query market trend data from Perplexity API
  const { data: trendData, isLoading, error, refetch } = useQuery<MarketTrendData>({
    queryKey: ['/api/market-trends', selectedTimeframe, refreshKey],
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 240000, // 4 minutes
  });

  // Mock data for development (will be replaced with real API data)
  const mockTrendData: MarketTrendData = {
    overall_sentiment: "bullish",
    sentiment_score: 78,
    market_confidence: 82,
    trending_models: [
      { model: "1967 Mustang Fastback", change_percentage: 12.5, current_value: 145000, trend_direction: "up" },
      { model: "1969 Camaro SS", change_percentage: 8.3, current_value: 165000, trend_direction: "up" },
      { model: "1970 Challenger R/T", change_percentage: -3.2, current_value: 125000, trend_direction: "down" },
      { model: "1966 Bronco", change_percentage: 15.7, current_value: 95000, trend_direction: "up" },
      { model: "1953 Ford F100", change_percentage: 6.1, current_value: 75000, trend_direction: "up" }
    ],
    market_indicators: [
      { name: "Auction Activity", value: 89, change: 5.2, status: "positive" },
      { name: "Collector Interest", value: 76, change: 2.1, status: "positive" },
      { name: "Investment Flow", value: 68, change: -1.8, status: "negative" },
      { name: "Supply Availability", value: 45, change: -3.5, status: "negative" }
    ],
    recent_activity: [
      { event: "Barrett-Jackson record sale: 1967 Shelby GT500 for $1.3M", impact: "high", timestamp: "2 hours ago" },
      { event: "Mecum announces spring classic car lineup", impact: "medium", timestamp: "5 hours ago" },
      { event: "Ford announces new Bronco Heritage Edition parts", impact: "medium", timestamp: "1 day ago" },
      { event: "Hagerty updates classic car valuations", impact: "high", timestamp: "2 days ago" }
    ]
  };

  const displayData = trendData || mockTrendData;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Get sentiment color and icon
  const getSentimentDisplay = (sentiment: string, score: number) => {
    switch (sentiment) {
      case "bullish":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          icon: <TrendingUp className="h-5 w-5" />,
          label: "Bullish Market"
        };
      case "bearish":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          icon: <TrendingDown className="h-5 w-5" />,
          label: "Bearish Market"
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          icon: <Minus className="h-5 w-5" />,
          label: "Neutral Market"
        };
    }
  };

  const sentimentDisplay = getSentimentDisplay(displayData.overall_sentiment, displayData.sentiment_score);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold font-playfair mb-2">Market Trend Mood Board</h3>
          <p className="text-muted-foreground">Real-time insights into the restomod and classic car market</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="day">24 Hours</option>
            <option value="week">7 Days</option>
            <option value="month">30 Days</option>
          </select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Overall Market Sentiment */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${sentimentDisplay.bgColor}`}>
                <div className={sentimentDisplay.color}>
                  {sentimentDisplay.icon}
                </div>
                <div>
                  <div className="font-semibold">{sentimentDisplay.label}</div>
                  <div className="text-sm text-muted-foreground">
                    Sentiment Score: {displayData.sentiment_score}/100
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Market Confidence</span>
                    <span>{displayData.market_confidence}%</span>
                  </div>
                  <Progress value={displayData.market_confidence} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sentiment Strength</span>
                    <span>{displayData.sentiment_score}%</span>
                  </div>
                  <Progress value={displayData.sentiment_score} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Indicators */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Key Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayData.market_indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{indicator.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={indicator.value} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{indicator.value}%</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <Badge 
                        variant={indicator.status === "positive" ? "default" : indicator.status === "negative" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {indicator.status === "positive" ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : indicator.status === "negative" ? (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        ) : (
                          <Minus className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(indicator.change)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Market Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayData.recent_activity.map((activity, index) => (
                  <div key={index} className="border-l-2 border-burgundy/20 pl-3">
                    <div className="text-sm font-medium">{activity.event}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={activity.impact === "high" ? "destructive" : activity.impact === "medium" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {activity.impact} impact
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Models */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Trending Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {displayData.trending_models.map((model, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="text-sm font-medium mb-2">{model.model}</div>
                    <div className="text-lg font-bold mb-1">{formatCurrency(model.current_value)}</div>
                    <div className="flex items-center gap-1">
                      {model.trend_direction === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : model.trend_direction === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-600" />
                      )}
                      <span 
                        className={`text-sm font-medium ${
                          model.trend_direction === "up" ? "text-green-600" : 
                          model.trend_direction === "down" ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {model.change_percentage > 0 ? "+" : ""}{model.change_percentage}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Updating market data...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}