/**
 * Phase 4: Price Trend Chart
 * Visualizes price history and appreciation trends
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceTrendChartProps {
  vehicleId: number;
  timeframe?: number; // months
  className?: string;
}

interface PriceTrendData {
  vehicleId: number;
  startPrice: number;
  currentPrice: number;
  percentageChange: number;
  annualizedRate: string;
  dataPoints: number;
  trend: 'rising' | 'declining' | 'stable';
  timeframe: string;
}

export function PriceTrendChart({
  vehicleId,
  timeframe = 12,
  className = ''
}: PriceTrendChartProps) {
  const { data, isLoading, error } = useQuery<PriceTrendData>({
    queryKey: ['price-trends', vehicleId, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/price-trends/${vehicleId}?timeframe=${timeframe}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Insufficient price history data');
        }
        throw new Error('Failed to fetch price trends');
      }
      return response.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  if (isLoading) {
    return (
      <Card className={cn("bg-[#222222] border-[#3A3A3A]", className)}>
        <CardHeader>
          <CardTitle className="text-[#F8F8F8] font-playfair">Price Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-[#888888]">Loading price data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={cn("bg-[#222222] border-[#3A3A3A]", className)}>
        <CardHeader>
          <CardTitle className="text-[#F8F8F8] font-playfair">Price Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-[#888888] text-sm">
              {error instanceof Error ? error.message : 'No price history available'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'rising':
        return 'text-green-500 bg-green-500/10';
      case 'declining':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-[#888888] bg-[#3A3A3A]';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Simple chart data (start and end points)
  const chartData = [
    { month: `${timeframe} months ago`, price: data.startPrice },
    { month: 'Now', price: data.currentPrice }
  ];

  return (
    <Card className={cn("bg-[#222222] border-[#3A3A3A]", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#F8F8F8] font-playfair">Price Trend</CardTitle>
          <Badge className={cn("flex items-center gap-1", getTrendColor())}>
            {getTrendIcon()}
            <span className="capitalize">{data.trend}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Change Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#888888] mb-1">Start Price</p>
            <p className="text-lg font-semibold text-[#F8F8F8]">
              {formatCurrency(data.startPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#888888] mb-1">Current Price</p>
            <p className="text-lg font-semibold text-[#C9A770]">
              {formatCurrency(data.currentPrice)}
            </p>
          </div>
        </div>

        {/* Appreciation Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#2A2A2A] rounded-lg p-3">
            <p className="text-xs text-[#888888] mb-1">Change</p>
            <p className={cn(
              "text-2xl font-bold",
              data.percentageChange > 0 ? "text-green-500" :
                data.percentageChange < 0 ? "text-red-500" : "text-[#888888]"
            )}>
              {data.percentageChange > 0 ? '+' : ''}{data.percentageChange}%
            </p>
          </div>
          <div className="bg-[#2A2A2A] rounded-lg p-3">
            <p className="text-xs text-[#888888] mb-1">Annual Rate</p>
            <p className="text-2xl font-bold text-[#C9A770]">
              {data.annualizedRate}
            </p>
          </div>
        </div>

        {/* Simple Line Chart */}
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis
                dataKey="month"
                stroke="#888888"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#888888"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid #3A3A3A',
                  borderRadius: '8px',
                  color: '#F8F8F8'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#7D2027"
                strokeWidth={3}
                dot={{ fill: '#C9A770', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Data Quality Indicator */}
        <p className="text-xs text-[#888888] text-center">
          Based on {data.dataPoints} data points over {data.timeframe}
        </p>
      </CardContent>
    </Card>
  );
}
