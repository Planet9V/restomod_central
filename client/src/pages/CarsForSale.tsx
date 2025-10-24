import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { EnhancedVehicleSearch } from "@/components/search/EnhancedVehicleSearch";
import { FacetedFilters } from "@/components/search/FacetedFilters";
import { SearchResultsGrid } from "@/components/search/SearchResultsGrid";
import { useVehicleSearch } from "@/hooks/use-vehicle-search";
import { SearchFilters } from "@/types/search";

export default function CarsForSale() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Parse URL query parameters
  const parseUrlParams = (): SearchFilters => {
    const params = new URLSearchParams(window.location.search);
    const filters: SearchFilters = {};

    // Parse query
    if (params.get('q')) filters.query = params.get('q')!;

    // Parse arrays
    if (params.get('category')) filters.category = params.get('category')!.split(',');
    if (params.get('region')) filters.region = params.get('region')!.split(',');
    if (params.get('investmentGrade')) filters.investmentGrade = params.get('investmentGrade')!.split(',');

    // Parse numbers
    if (params.get('priceMin')) filters.priceMin = parseInt(params.get('priceMin')!);
    if (params.get('priceMax')) filters.priceMax = parseInt(params.get('priceMax')!);
    if (params.get('yearMin')) filters.yearMin = parseInt(params.get('yearMin')!);
    if (params.get('yearMax')) filters.yearMax = parseInt(params.get('yearMax')!);

    // Parse sorting
    if (params.get('sortBy')) filters.sortBy = params.get('sortBy') as any;

    return filters;
  };

  // State from URL or defaults
  const [filters, setFilters] = useState<SearchFilters>(parseUrlParams);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.query) params.set('q', filters.query);
    if (filters.category?.length) params.set('category', filters.category.join(','));
    if (filters.region?.length) params.set('region', filters.region.join(','));
    if (filters.investmentGrade?.length) params.set('investmentGrade', filters.investmentGrade.join(','));
    if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
    if (filters.yearMin) params.set('yearMin', filters.yearMin.toString());
    if (filters.yearMax) params.set('yearMax', filters.yearMax.toString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);

    const queryString = params.toString();
    const newPath = queryString ? `/cars-for-sale?${queryString}` : '/cars-for-sale';

    // Update URL without triggering navigation
    window.history.replaceState({}, '', newPath);
  }, [filters]);

  // Use FTS5 search hook
  const { data: searchData, isLoading, error } = useVehicleSearch(filters, true);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as any }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#222222] text-[#F8F8F8] p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">Cars for Sale</h1>
          <p className="text-red-400">Error loading vehicles. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#F8F8F8]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A] border-b border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-4 bg-gradient-to-r from-[#C9A770] to-[#7D2027] bg-clip-text text-transparent">
              Classic Cars for Sale
            </h1>
            <p className="text-xl text-[#888888] mb-8 max-w-3xl mx-auto">
              Discover authenticated classic cars from trusted dealers nationwide with investment analysis and market insights
            </p>

            {/* Stats Summary */}
            {searchData && (
              <div className="flex justify-center gap-6 mb-8 flex-wrap">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#C9A770]">{searchData.total}</div>
                  <div className="text-sm text-[#888888]">Total Vehicles</div>
                </div>
                {searchData.stats?.categories && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C9A770]">{searchData.stats.categories.length}</div>
                    <div className="text-sm text-[#888888]">Categories</div>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="text-center">
                    <Badge className="bg-[#7D2027]/20 text-[#C9A770] border-[#C9A770]/30">
                      <Award className="w-3 h-3 mr-1" />
                      Personalized
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Search and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search */}
        <EnhancedVehicleSearch
          onSearch={handleSearch}
          initialQuery={filters.query}
          showQuickFilters={!filters.query}
          className="mb-8"
        />

        {/* Main Content: Filters + Results */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Faceted Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <FacetedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              facetCounts={searchData?.facets}
            />
          </aside>

          {/* Search Results */}
          <main className="flex-1 min-w-0">
            <SearchResultsGrid
              results={searchData?.results || []}
              total={searchData?.total || 0}
              isLoading={isLoading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
              queryTime={searchData?.queryTime}
            />
          </main>
        </div>
      </div>
    </div>
  );
}