import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODEL_SPECIFIC_VALUATIONS, PREMIUM_AUCTION_RESULTS } from '@/data/specific-model-data';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';

export function ModelValueAnalysis() {
  const [selectedModel, setSelectedModel] = useState(MODEL_SPECIFIC_VALUATIONS[0].id);
  const [expandedFactors, setExpandedFactors] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get the selected model data
  const model = MODEL_SPECIFIC_VALUATIONS.find(m => m.id === selectedModel);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate model's average annual appreciation
  const calculateAAG = (trends: { year: number, value: number }[]) => {
    if (trends.length < 2) return 'N/A';
    const startValue = trends[0].value;
    const endValue = trends[trends.length - 1].value;
    const years = trends[trends.length - 1].year - trends[0].year;
    const rate = (Math.pow((endValue / startValue), 1/years) - 1) * 100;
    return rate.toFixed(1) + '%';
  };
  
  const formatWithCommas = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  if (!model) return null;
  
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">Model-Specific Market Analysis</h2>
          <p className="text-muted-foreground">
            Detailed investment and market performance data for top restomod platforms
          </p>
        </div>
        <div className="w-full md:w-72">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {MODEL_SPECIFIC_VALUATIONS.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Model Card */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{model.name}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  <Badge variant="outline" className="mr-2">{model.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {model.cagr}% CAGR
                  </Badge>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Average Build</div>
                <div className="text-xl font-bold">{formatCurrency(model.keyMetrics.averageBuild)}</div>
                <div className="text-sm text-muted-foreground mt-1">Top Tier</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(model.keyMetrics.topTier)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="factors">Value Factors</TabsTrigger>
                <TabsTrigger value="trends">Market Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {model.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs uppercase text-muted-foreground mb-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> Appreciation
                    </div>
                    <div className="text-lg font-bold">{model.keyMetrics.appreciationIndex}/10</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs uppercase text-muted-foreground mb-1 flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> Liquidity
                    </div>
                    <div className="text-lg font-bold">{model.keyMetrics.liquidityScore}/10</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs uppercase text-muted-foreground mb-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Build Time
                    </div>
                    <div className="text-lg font-bold">{model.keyMetrics.buildTime}</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs uppercase text-muted-foreground mb-1 flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1" /> Annual Return
                    </div>
                    <div className="text-lg font-bold text-green-600">{calculateAAG(model.marketTrend)}</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">10-Year Market Value Trend</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                      data={model.marketTrend}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id={`colorValue-${model.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={model.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={model.color} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 'dataMax + 50']} />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <Tooltip 
                        formatter={(value: number) => [`Index: ${value}`, 'Value']}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={model.color} 
                        fillOpacity={1}
                        fill={`url(#colorValue-${model.id})`} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-center text-muted-foreground mt-2">
                    Indexed market value (2014 = 100)
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="factors">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Key factors impacting market value and investment potential for {model.name} restomods.
                  </p>
                  
                  {model.valueFactors.map((factor, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <div className="text-sm font-medium">{factor.factor}</div>
                        <div className="text-sm font-medium">{factor.impact}/10</div>
                      </div>
                      <Progress value={factor.impact * 10} className="h-2" />
                    </div>
                  ))}
                  
                  <div className="bg-muted p-4 rounded-lg mt-6">
                    <h4 className="font-medium mb-2">Premium Builder Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      {model.name} builds from established shops like Ringbrothers, 
                      SpeedKore, and Singer command 35-65% higher market values than comparable 
                      independent builds. Premium builders often have 12-24 month waitlists, 
                      which further drives appreciation of their completed vehicles.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="trends">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Price Range Analysis</h4>
                      <div className="space-y-3 bg-muted p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Entry Level:</span>
                          <span className="font-medium">{formatCurrency(model.keyMetrics.averageBuild * 0.7)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average Build:</span>
                          <span className="font-medium">{formatCurrency(model.keyMetrics.averageBuild)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Premium Build:</span>
                          <span className="font-medium">{formatCurrency(model.keyMetrics.averageBuild * 1.4)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Top-Tier Builder:</span>
                          <span className="font-medium text-green-600">{formatCurrency(model.keyMetrics.topTier)}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mt-6 mb-2">Market Performance Stats</h4>
                      <div className="space-y-3 bg-muted p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>10-Year Appreciation:</span>
                          <span className="font-medium">{model.marketTrend[model.marketTrend.length-1].value - model.marketTrend[0].value}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg. Annual Growth:</span>
                          <span className="font-medium text-green-600">{calculateAAG(model.marketTrend)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Liquidity Index:</span>
                          <span className="font-medium">{model.keyMetrics.liquidityScore}/10</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Auction Success Rate:</span>
                          <span className="font-medium">92%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Investment Outlook (5-Year Projection)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={[
                            { name: 'Base', value: 100 },
                            { name: 'Entry', value: Math.round(100 * (1 + model.cagr/100) ** 5) },
                            { name: 'Avg', value: Math.round(110 * (1 + model.cagr/100) ** 5) },
                            { name: 'Premium', value: Math.round(125 * (1 + model.cagr/100) ** 5) }
                          ]}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 'dataMax + 20']} />
                          <Tooltip 
                            formatter={(value: number) => [`${value}% of initial value`, 'Projected Value']}
                          />
                          <Bar dataKey="value" fill={model.color} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="text-xs text-center text-muted-foreground mt-1 mb-4">
                        Projected 5-year value (current value = 100%)
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg mt-3">
                        <h4 className="font-medium mb-2">Recent Auction Results</h4>
                        {PREMIUM_AUCTION_RESULTS
                          .filter(item => item.model.toLowerCase().includes(model.name.split(" ")[0].toLowerCase()))
                          .map((result, idx) => (
                            <div key={idx} className="text-sm mb-2">
                              <div className="font-medium">{result.model}</div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{result.builder}, {result.year}</span>
                                <span className="font-medium text-green-600">{formatCurrency(result.salePrice)}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <Button variant="outline" size="sm">
                <ChevronDown className="h-4 w-4 mr-1" />
                Full Market Report
              </Button>
              <div className="text-xs text-muted-foreground">
                Data updated: May 2024
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Sidebar Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Build Quality Impact</span>
                  <span className="text-sm font-medium">Very High</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Liquidity</span>
                  <span className="text-sm font-medium">High</span>
                </div>
                <Progress value={model.keyMetrics.liquidityScore * 10} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Appreciation Potential</span>
                  <span className="text-sm font-medium">Excellent</span>
                </div>
                <Progress value={model.keyMetrics.appreciationIndex * 10} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entry Cost</span>
                  <span className="text-sm font-medium">Very High</span>
                </div>
                <Progress 
                  value={Math.min(100, (model.keyMetrics.averageBuild / 200000) * 100)} 
                  className="h-2" 
                />
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm text-muted-foreground">Five Year ROI Potential</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(Math.pow(1 + model.cagr/100, 5) * 100 - 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on market data and model-specific CAGR of {model.cagr}%
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Value Comparison</CardTitle>
              <CardDescription>Versus alternative investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">This Model</span>
                  <span className="text-sm font-medium">{model.cagr}% Annual</span>
                </div>
                <Progress value={model.cagr * 5} className="h-1.5 bg-muted" 
                  indicatorClassName="bg-green-600" />
                
                <div className="flex justify-between">
                  <span className="text-sm">S&P 500 (Avg)</span>
                  <span className="text-sm font-medium">9.4% Annual</span>
                </div>
                <Progress value={9.4 * 5} className="h-1.5 bg-muted" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Real Estate</span>
                  <span className="text-sm font-medium">6.8% Annual</span>
                </div>
                <Progress value={6.8 * 5} className="h-1.5 bg-muted" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Fine Art</span>
                  <span className="text-sm font-medium">12.6% Annual</span>
                </div>
                <Progress value={12.6 * 5} className="h-1.5 bg-muted" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Gold</span>
                  <span className="text-sm font-medium">5.4% Annual</span>
                </div>
                <Progress value={5.4 * 5} className="h-1.5 bg-muted" />
              </div>
              
              <div className="text-xs text-muted-foreground mt-4">
                * Annual returns shown for 5-year average performance
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ModelValueAnalysis;