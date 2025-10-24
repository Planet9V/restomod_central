/**
 * Phase 4: Search Results Grid
 * Displays search results with grid/list view toggle and sorting
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid3x3, List, MapPin, Calendar, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchResult } from '@/types/search';
import { cn } from '@/lib/utils';

interface SearchResultsGridProps {
  results: SearchResult[];
  total: number;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  queryTime?: string;
  className?: string;
}

export function SearchResultsGrid({
  results,
  total,
  isLoading = false,
  viewMode = 'grid',
  onViewModeChange,
  sortBy = 'relevance',
  onSortChange,
  queryTime,
  className = ''
}: SearchResultsGridProps) {
  const formatPrice = (price: string | null) => {
    if (!price) return 'Price on Request';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  const getGradeBadgeColor = (grade: string | null) => {
    switch (grade) {
      case 'A+': return 'bg-green-600 hover:bg-green-700';
      case 'A': return 'bg-green-500 hover:bg-green-600';
      case 'A-': return 'bg-blue-500 hover:bg-blue-600';
      case 'B+': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const VehicleCardGrid = ({ vehicle, index }: { vehicle: SearchResult; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(201, 167, 112, 0.15)' }}
      className={cn(
        "bg-[#2A2A2A] rounded-lg overflow-hidden",
        "border border-[#3A3A3A]",
        "transition-all duration-300",
        "hover:border-[#C9A770]/50"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1A1A1A]">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#888888]">
            <Calendar className="h-12 w-12" />
          </div>
        )}

        {/* Investment Grade Badge */}
        {vehicle.investmentGrade && (
          <Badge className={cn(
            "absolute top-3 right-3",
            getGradeBadgeColor(vehicle.investmentGrade)
          )}>
            <Award className="h-3 w-3 mr-1" />
            {vehicle.investmentGrade}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-playfair font-semibold text-lg text-[#F8F8F8] line-clamp-1">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.category && (
            <p className="text-xs text-[#888888] mt-1">{vehicle.category}</p>
          )}
        </div>

        {/* Location */}
        {(vehicle.locationCity || vehicle.locationRegion) && (
          <div className="flex items-center gap-1 text-sm text-[#888888]">
            <MapPin className="h-3 w-3" />
            <span>
              {vehicle.locationCity && vehicle.locationState
                ? `${vehicle.locationCity}, ${vehicle.locationState}`
                : vehicle.locationRegion}
            </span>
          </div>
        )}

        {/* Description */}
        {vehicle.description && (
          <p className="text-sm text-[#888888] line-clamp-2">
            {vehicle.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#3A3A3A]">
          <span className="text-xl font-bold text-[#C9A770]">
            {formatPrice(vehicle.price)}
          </span>
          <Button
            size="sm"
            className="bg-[#7D2027] hover:bg-[#5D1820] text-white"
          >
            View Details
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const VehicleCardList = ({ vehicle, index }: { vehicle: SearchResult; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "bg-[#2A2A2A] rounded-lg overflow-hidden",
        "border border-[#3A3A3A]",
        "transition-all duration-300",
        "hover:border-[#C9A770]/50 hover:shadow-lg"
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-auto overflow-hidden bg-[#1A1A1A]">
          {vehicle.imageUrl ? (
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#888888]">
              <Calendar className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-playfair font-semibold text-xl text-[#F8F8F8]">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              {vehicle.investmentGrade && (
                <Badge className={cn(getGradeBadgeColor(vehicle.investmentGrade))}>
                  <Award className="h-3 w-3 mr-1" />
                  {vehicle.investmentGrade}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#888888] mb-3">
              {vehicle.category && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {vehicle.category}
                </span>
              )}
              {(vehicle.locationCity || vehicle.locationRegion) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vehicle.locationCity && vehicle.locationState
                    ? `${vehicle.locationCity}, ${vehicle.locationState}`
                    : vehicle.locationRegion}
                </span>
              )}
            </div>

            {vehicle.description && (
              <p className="text-sm text-[#888888] line-clamp-2">
                {vehicle.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-2xl font-bold text-[#C9A770]">
              {formatPrice(vehicle.price)}
            </span>
            <Button className="bg-[#7D2027] hover:bg-[#5D1820] text-white">
              View Details
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const LoadingSkeleton = () => (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[#2A2A2A] rounded-lg overflow-hidden border border-[#3A3A3A] p-4">
          <Skeleton className="w-full aspect-[4/3] mb-4 bg-[#3A3A3A]" />
          <Skeleton className="h-6 w-3/4 mb-2 bg-[#3A3A3A]" />
          <Skeleton className="h-4 w-1/2 mb-4 bg-[#3A3A3A]" />
          <Skeleton className="h-4 w-full mb-2 bg-[#3A3A3A]" />
          <Skeleton className="h-4 w-2/3 bg-[#3A3A3A]" />
        </div>
      ))}
    </>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Results count */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-playfair font-semibold text-[#F8F8F8]">
            {total} {total === 1 ? 'Vehicle' : 'Vehicles'}
          </h2>
          {queryTime && (
            <span className="text-sm text-[#888888]">
              ({queryTime})
            </span>
          )}
        </div>

        {/* View controls */}
        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          {onSortChange && (
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px] bg-[#2A2A2A] border-[#3A3A3A] text-[#F8F8F8]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="year-desc">Year: Newest First</SelectItem>
                <SelectItem value="year-asc">Year: Oldest First</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* View toggle */}
          {onViewModeChange && (
            <div className="flex gap-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  viewMode === 'grid' ? 'bg-[#7D2027] text-white' : 'text-[#888888] hover:text-[#F8F8F8]'
                )}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => onViewModeChange('list')}
                className={cn(
                  viewMode === 'list' ? 'bg-[#7D2027] text-white' : 'text-[#888888] hover:text-[#F8F8F8]'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          <LoadingSkeleton />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4 text-[#888888]">
            <Search className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-playfair font-semibold text-[#F8F8F8] mb-2">
            No vehicles found
          </h3>
          <p className="text-[#888888]">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {results.map((vehicle, index) =>
            viewMode === 'grid' ? (
              <VehicleCardGrid key={vehicle.id} vehicle={vehicle} index={index} />
            ) : (
              <VehicleCardList key={vehicle.id} vehicle={vehicle} index={index} />
            )
          )}
        </div>
      )}
    </div>
  );
}
