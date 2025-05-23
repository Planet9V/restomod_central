import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, LineChart, Line, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Banknote, BarChart3, Clock, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Tilt from 'react-tilt';
import { MODEL_SPECIFIC_VALUATIONS, PREMIUM_AUCTION_RESULTS, REGIONAL_MARKET_HOTSPOTS, ROI_BY_VEHICLE_CLASS } from '@/data/specific-model-data';

// Constants
const ANIMATION_DELAY = 0.1;
const CARD_TRANSITION = { duration: 0.5, ease: "easeOut" };
const tiltOptions = { max: 5, scale: 1.01, speed: 500 };

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: CARD_TRANSITION
  }
};

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export function ModelValueAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<number>(1);

  // Filter models by category if needed
  const filteredModels = selectedCategory === 'All' 
    ? MODEL_SPECIFIC_VALUATIONS 
    : MODEL_SPECIFIC_VALUATIONS.filter(model => model.category === selectedCategory);
  
  // Get the currently selected model
  const currentModel = MODEL_SPECIFIC_VALUATIONS.find(model => model.id === selectedModel) || MODEL_SPECIFIC_VALUATIONS[0];
  
  // Unique categories for filter
  const categories = ['All', ...Array.from(new Set(MODEL_SPECIFIC_VALUATIONS.map(model => model.category)))];
  
  // Process data for value determinants chart
  const valueDeterminantsData = currentModel.valueDeterminants.map(item => ({
    factor: item.factor,
    impact: item.impact
  }));
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Categories and Models Selection */}
      <motion.div variants={cardVariants} className="mb-4">
        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-medium">Model-Specific Valuation Data</CardTitle>
            <CardDescription>
              Detailed financial metrics for premium restomod models based on real market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-sm"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Select Model for Detailed Analysis</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {filteredModels.map((model) => (
                    <Button
                      key={model.id}
                      variant={selectedModel === model.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedModel(model.id)}
                      className="text-sm h-auto py-2 flex flex-col items-center justify-center"
                    >
                      <span>{model.model}</span>
                      <span className="text-xs mt-1">{formatCurrency(model.currentValue)}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Selected Model Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Model Overview Card */}
        <motion.div variants={cardVariants}>
          <Tilt options={tiltOptions}>
            <Card className="h-full shadow-md overflow-hidden">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={currentModel.imageUrl} 
                  alt={currentModel.model} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h2 className="text-2xl font-bold">{currentModel.model}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className="bg-white/20 text-white border-none">
                      {currentModel.category}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-none flex items-center">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {currentModel.fiveYearGrowth}% Growth
                    </Badge>
                  </div>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <div className="flex justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Market Value</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(currentModel.currentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">5-Year Growth</p>
                    <p className="text-xl font-semibold text-green-600">+{currentModel.fiveYearGrowth}%</p>
                  </div>
                </div>
                
                <Separator className="mb-6" />
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted rounded-md p-4">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <Tag className="h-4 w-4 mr-1" />
                      <span className="text-xs">Average Build Cost</span>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(currentModel.averageBuildCost)}</p>
                  </div>
                  <div className="bg-muted rounded-md p-4">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <Banknote className="h-4 w-4 mr-1" />
                      <span className="text-xs">Premium Build Cost</span>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(currentModel.premiumBuildCost)}</p>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium mb-3">Key Value Determinants</h3>
                <div className="space-y-3">
                  {currentModel.valueDeterminants.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm">{item.factor}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        +{item.impact}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>
        
        {/* Value Determinants Chart */}
        <motion.div variants={cardVariants}>
          <Tilt options={tiltOptions}>
            <Card className="h-full shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-medium">Value Impact Factors</CardTitle>
                <CardDescription>
                  Key factors influencing the {currentModel.model}'s market valuation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={valueDeterminantsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" domain={[0, 40]} />
                      <YAxis dataKey="factor" type="category" width={140} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`+${value}%`, 'Market Impact']}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderColor: "#eaeaea",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Bar dataKey="impact" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                Data sourced from recent auction results and builder pricing (Q1 2024)
              </CardFooter>
            </Card>
          </Tilt>
        </motion.div>
      </div>
      
      {/* Additional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Regional Hotspots */}
        <motion.div variants={cardVariants}>
          <Card className="h-full shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Regional Market Hotspots</CardTitle>
                <Badge variant="outline" className="text-xs font-normal">Q1 2024</Badge>
              </div>
              <CardDescription className="text-xs">
                Top markets for restomod valuation and demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {REGIONAL_MARKET_HOTSPOTS.slice(0, 5).map((region, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                        {idx + 1}
                      </span>
                      <span>{region.region}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        +{region.growthRate}%
                      </Badge>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {region.averageSellingTime}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Auction Results */}
        <motion.div variants={cardVariants}>
          <Card className="h-full shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Premium Auction Results</CardTitle>
                <Badge variant="outline" className="text-xs font-normal">Q1 2024</Badge>
              </div>
              <CardDescription className="text-xs">
                Recent high-value restomod sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {PREMIUM_AUCTION_RESULTS.slice(0, 3).map((auction, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{auction.vehicleModel}</div>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                        {formatCurrency(auction.salePrice)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>{auction.builder}</div>
                      <div>{auction.auctionHouse} • {auction.saleDate}</div>
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* ROI Analysis */}
        <motion.div variants={cardVariants}>
          <Card className="h-full shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">10-Year ROI by Class</CardTitle>
                <Badge variant="outline" className="text-xs font-normal">2014-2024</Badge>
              </div>
              <CardDescription className="text-xs">
                Investment returns by vehicle category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {Object.entries(ROI_BY_VEHICLE_CLASS).slice(0, 5).map(([category, data], idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{category}</div>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        {data.tenYearROI}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <div className="text-muted-foreground">Initial: {formatCurrency(data.initialInvestment.averagePurchase + data.initialInvestment.averageBuild)}</div>
                      <div className="font-medium">Now: {formatCurrency(data.currentValue.average)}</div>
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}