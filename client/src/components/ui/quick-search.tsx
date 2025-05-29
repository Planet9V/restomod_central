import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, TrendingUp, Star, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface QuickSearchProps {
  onSearch?: (term: string) => void;
  className?: string;
}

export function QuickSearch({ onSearch, className = "" }: QuickSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const popularFilters = [
    {
      label: "Muscle Cars",
      icon: TrendingUp,
      params: "category=Muscle Cars",
      color: "bg-red-600 hover:bg-red-700"
    },
    {
      label: "Sports Cars", 
      icon: Star,
      params: "category=Sports Cars",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      label: "Investment A+",
      icon: Star,
      params: "investmentGrade=A%2B",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      label: "Under $50k",
      icon: DollarSign,
      params: "priceMax=50000",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      label: "Recently Added",
      icon: Calendar,
      params: "sortBy=createdAt&sortOrder=desc",
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/cars-for-sale?search=${encodeURIComponent(searchTerm.trim())}`);
      if (onSearch) onSearch(searchTerm.trim());
    }
  };

  const handleFilterClick = (params: string) => {
    setLocation(`/cars-for-sale?${params}`);
  };

  return (
    <div className={`bg-slate-800/80 backdrop-blur rounded-lg p-6 ${className}`}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by make, model, year, or features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-4 text-lg bg-slate-700 border-slate-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Popular Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-300">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Popular Searches</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {popularFilters.map((filter, index) => (
            <motion.div
              key={filter.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={() => handleFilterClick(filter.params)}
                className={`
                  ${filter.color} text-white border-0 shadow-lg
                  transition-all duration-300 hover:shadow-xl hover:scale-105
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  font-medium text-sm
                `}
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">164+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Vehicles</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">A+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Investment Grade</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">35%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Appreciation</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">Daily</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">New Listings</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sticky version for header
export function StickyQuickSearch() {
  const [isVisible, setIsVisible] = useState(false);
  const [, setLocation] = useLocation();

  const handleQuickFilter = (params: string) => {
    setLocation(`/cars-for-sale?${params}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/95 backdrop-blur border-b border-slate-700 py-3"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 overflow-x-auto">
        <span className="text-white text-sm font-medium whitespace-nowrap">Quick Filters:</span>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleQuickFilter("category=Muscle Cars")}
            className="bg-red-600 hover:bg-red-700 text-white text-xs whitespace-nowrap"
          >
            Muscle Cars
          </Button>
          
          <Button
            size="sm"
            onClick={() => handleQuickFilter("category=Sports Cars")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap"
          >
            Sports Cars
          </Button>
          
          <Button
            size="sm"
            onClick={() => handleQuickFilter("priceMax=50000")}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs whitespace-nowrap"
          >
            Under $50k
          </Button>
          
          <Button
            size="sm"
            onClick={() => handleQuickFilter("investmentGrade=A%2B")}
            className="bg-green-600 hover:bg-green-700 text-white text-xs whitespace-nowrap"
          >
            A+ Grade
          </Button>
        </div>
      </div>
    </motion.div>
  );
}