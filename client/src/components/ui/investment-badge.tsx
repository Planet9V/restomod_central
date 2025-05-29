import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, BarChart3, Award } from "lucide-react";

interface InvestmentBadgeProps {
  grade: string;
  appreciationRate?: string;
  size?: 'sm' | 'md' | 'lg';
  showRate?: boolean;
}

export function InvestmentBadge({ 
  grade, 
  appreciationRate, 
  size = 'md', 
  showRate = false 
}: InvestmentBadgeProps) {
  const getGradeConfig = (grade: string) => {
    switch (grade) {
      case 'A+':
        return {
          icon: Trophy,
          bgColor: 'bg-green-600 hover:bg-green-700',
          textColor: 'text-white',
          label: 'Investment Grade A+',
          description: 'Premium Investment Vehicle'
        };
      case 'A':
        return {
          icon: Star,
          bgColor: 'bg-blue-600 hover:bg-blue-700',
          textColor: 'text-white',
          label: 'Investment Grade A',
          description: 'Excellent Investment Potential'
        };
      case 'A-':
        return {
          icon: TrendingUp,
          bgColor: 'bg-purple-600 hover:bg-purple-700',
          textColor: 'text-white',
          label: 'Investment Grade A-',
          description: 'Strong Investment Value'
        };
      case 'B+':
        return {
          icon: BarChart3,
          bgColor: 'bg-yellow-600 hover:bg-yellow-700',
          textColor: 'text-white',
          label: 'Investment Grade B+',
          description: 'Good Investment Opportunity'
        };
      default:
        return {
          icon: Award,
          bgColor: 'bg-gray-600 hover:bg-gray-700',
          textColor: 'text-white',
          label: 'Investment Grade',
          description: 'Authenticated Vehicle'
        };
    }
  };

  const config = getGradeConfig(grade);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className="flex flex-col gap-1">
      <Badge 
        className={`
          ${config.bgColor} ${config.textColor} ${sizeClasses[size]}
          font-semibold tracking-wide border-0 shadow-lg
          transition-all duration-300 hover:shadow-xl hover:scale-105
          flex items-center gap-1.5
        `}
        title={config.description}
      >
        <Icon className={iconSizes[size]} />
        <span>{grade}</span>
      </Badge>
      
      {showRate && appreciationRate && (
        <div className="text-xs text-green-400 font-medium flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{appreciationRate}</span>
        </div>
      )}
    </div>
  );
}

export function InvestmentBadgeTooltip({ 
  grade, 
  appreciationRate,
  marketTrend,
  valuationConfidence 
}: {
  grade: string;
  appreciationRate?: string;
  marketTrend?: string;
  valuationConfidence?: string;
}) {
  const config = getGradeConfig(grade);
  
  return (
    <div className="bg-slate-800 text-white p-4 rounded-lg shadow-xl border border-slate-700 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <config.icon className="h-5 w-5 text-yellow-400" />
        <span className="font-semibold">{config.label}</span>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">{config.description}</p>
      
      <div className="space-y-2 text-sm">
        {appreciationRate && (
          <div className="flex justify-between">
            <span className="text-gray-400">Appreciation:</span>
            <span className="text-green-400 font-medium">{appreciationRate}</span>
          </div>
        )}
        
        {marketTrend && (
          <div className="flex justify-between">
            <span className="text-gray-400">Market Trend:</span>
            <span className={`font-medium ${
              marketTrend === 'rising' ? 'text-green-400' : 
              marketTrend === 'stable' ? 'text-blue-400' : 'text-yellow-400'
            }`}>
              {marketTrend}
            </span>
          </div>
        )}
        
        {valuationConfidence && (
          <div className="flex justify-between">
            <span className="text-gray-400">Confidence:</span>
            <span className="text-white font-medium">
              {Math.round(parseFloat(valuationConfidence) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  function getGradeConfig(grade: string) {
    switch (grade) {
      case 'A+':
        return {
          icon: Trophy,
          label: 'Investment Grade A+',
          description: 'Premium Investment Vehicle'
        };
      case 'A':
        return {
          icon: Star,
          label: 'Investment Grade A',
          description: 'Excellent Investment Potential'
        };
      case 'A-':
        return {
          icon: TrendingUp,
          label: 'Investment Grade A-',
          description: 'Strong Investment Value'
        };
      case 'B+':
        return {
          icon: BarChart3,
          label: 'Investment Grade B+',
          description: 'Good Investment Opportunity'
        };
      default:
        return {
          icon: Award,
          label: 'Investment Grade',
          description: 'Authenticated Vehicle'
        };
    }
  }
}