import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, LineChart, Line, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, ArrowUpRight, Banknote, BarChart3, Binary, ChevronRight, Clock, Compass, DollarSign, FileCheck, GanttChart, LineChart as LineChartIcon, Percent, Shield, Star, Tag, Ticket, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tilt } from 'react-tilt';
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
  const [activeTab, setActiveTab] = useState<string>("overview");

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

  // Calculate the value appreciation from classic to restomod
  const appreciationPercentage = currentModel.currentValue && currentModel.classicValue
    ? Math.round((currentModel.currentValue / currentModel.classicValue - 1) * 100)
    : 0;
  
  // Prepare auction data
  const auctionData = currentModel.auctionHighlights?.recentSales.map((sale, index) => ({
    name: `Sale ${index + 1}`,
    value: sale
  })) || [];

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
              Detailed financial metrics for premium restomod models based on real auction results from Hagerty, Barrett-Jackson, Mecum, and RM Sotheby's
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-0">
                    <div className="flex justify-between mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Premium Restomod Value</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(currentModel.currentValue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Unmodified Classic Value</p>
                        <p className="text-xl font-medium text-muted-foreground">{formatCurrency(currentModel.classicValue)}</p>
                        <p className="text-sm font-bold text-green-600">+{appreciationPercentage}% Premium</p>
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
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Ticket className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          Auction History
                        </h3>
                        <div className="bg-muted/50 rounded-md p-3 text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Highest recorded sale:</span>
                            <span className="font-medium">{formatCurrency(currentModel.auctionHighlights?.highestSale || 0)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Recent auction houses:</span>
                            <span className="font-medium">{currentModel.auctionHighlights?.auctionHouses.join(', ')}</span>
                          </div>
                          <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={auctionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                <YAxis domain={[0, 'dataMax + 100000']} tick={{ fontSize: 9 }} tickFormatter={(value) => `$${value/1000}k`} />
                                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Sale Price']} />
                                <Bar dataKey="value" fill="#be123c" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-center mt-1 text-muted-foreground">Recent auction results</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <Binary className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          Valuation Comparison
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-muted/50 rounded-md p-3">
                            <div className="text-muted-foreground mb-1">Original Classic</div>
                            <div className="text-base font-medium">{formatCurrency(currentModel.classicValue)}</div>
                            <div className="text-xs mt-1 text-muted-foreground">
                              In #3 "Good" condition with matching numbers
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-md p-3">
                            <div className="text-green-700 mb-1">Premium Restomod</div>
                            <div className="text-base font-medium">{formatCurrency(currentModel.currentValue)}</div>
                            <div className="text-xs mt-1 text-green-700/70">
                              +{appreciationPercentage}% premium over original
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-center mt-1 text-muted-foreground italic">
                        Data sourced from Hagerty, Barrett-Jackson, Mecum, and RM Sotheby's
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
                  Key factors influencing the {currentModel.model}'s market valuation based on real-world data
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
                      <XAxis type="number" domain={[0, 'dataMax + 10']} />
                      <YAxis dataKey="factor" type="category" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`+${value}%`, 'Market Impact']}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderColor: "#eaeaea",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Bar dataKey="impact" fill="#be123c" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-4 flex items-center justify-between">
                <span>Data sourced from professional appraisals and auction results</span>
                <Badge variant="outline" className="text-xs font-normal">2024 Analysis</Badge>
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