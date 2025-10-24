/**
 * Phase 4: Faceted Filters
 * Filter panel with counts for make, year, price, category, etc.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchFilters, FacetCount } from '@/types/search';
import { cn } from '@/lib/utils';

interface FacetedFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  facetCounts?: {
    makes?: FacetCount[];
    categories?: FacetCount[];
    regions?: FacetCount[];
    investmentGrades?: FacetCount[];
  };
  className?: string;
}

export function FacetedFilters({
  filters,
  onFilterChange,
  facetCounts,
  className = ''
}: FacetedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    make: false,
    year: false,
    price: false,
    grade: false,
    region: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    onFilterChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined
    });
  };

  const handleGradeToggle = (grade: string) => {
    const currentGrades = filters.investmentGrade || [];
    const newGrades = currentGrades.includes(grade)
      ? currentGrades.filter(g => g !== grade)
      : [...currentGrades, grade];

    onFilterChange({
      ...filters,
      investmentGrade: newGrades.length > 0 ? newGrades : undefined
    });
  };

  const handleRegionToggle = (region: string) => {
    const currentRegions = filters.region || [];
    const newRegions = currentRegions.includes(region)
      ? currentRegions.filter(r => r !== region)
      : [...currentRegions, region];

    onFilterChange({
      ...filters,
      region: newRegions.length > 0 ? newRegions : undefined
    });
  };

  const handleYearChange = (values: number[]) => {
    onFilterChange({
      ...filters,
      yearMin: values[0],
      yearMax: values[1]
    });
  };

  const handlePriceChange = (values: number[]) => {
    onFilterChange({
      ...filters,
      priceMin: values[0],
      priceMax: values[1]
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      query: filters.query // Preserve search query
    });
  };

  const activeFilterCount = [
    filters.category?.length || 0,
    filters.investmentGrade?.length || 0,
    filters.region?.length || 0,
    filters.yearMin || filters.yearMax ? 1 : 0,
    filters.priceMin || filters.priceMax ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  // Facet Section Component
  const FacetSection = ({
    title,
    section,
    children
  }: {
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-[#3A3A3A] last:border-0">
      <button
        onClick={() => toggleSection(section)}
        className={cn(
          "w-full flex items-center justify-between",
          "px-4 py-3 text-left",
          "text-[#F8F8F8] font-playfair font-medium",
          "hover:bg-[#2A2A2A] transition-colors"
        )}
      >
        <span>{title}</span>
        {expandedSections[section] ? (
          <ChevronUp className="h-4 w-4 text-[#C9A770]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#888888]" />
        )}
      </button>

      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={cn("bg-[#222222] rounded-lg border border-[#3A3A3A]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3A]">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#C9A770]" />
          <h3 className="font-playfair font-semibold text-[#F8F8F8]">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge className="bg-[#7D2027] text-white text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-[#888888] hover:text-[#F8F8F8] hover:bg-[#2A2A2A] h-8 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-[#3A3A3A]">
        {/* Category */}
        <FacetSection title="Category" section="category">
          {(facetCounts?.categories || [
            { value: 'Muscle Cars', count: 0 },
            { value: 'Classic Cars', count: 0 },
            { value: 'Sports Cars', count: 0 },
            { value: 'Luxury Cars', count: 0 }
          ]).map((category) => (
            <div key={category.value} className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer flex-1">
                <Checkbox
                  checked={filters.category?.includes(category.value)}
                  onCheckedChange={() => handleCategoryToggle(category.value)}
                  className="border-[#C9A770] data-[state=checked]:bg-[#C9A770] data-[state=checked]:border-[#C9A770]"
                />
                <span className="text-[#F8F8F8] text-sm">{category.value}</span>
              </Label>
              {category.count > 0 && (
                <span className="text-xs text-[#888888] ml-2">({category.count})</span>
              )}
            </div>
          ))}
        </FacetSection>

        {/* Investment Grade */}
        <FacetSection title="Investment Grade" section="grade">
          {['A+', 'A', 'A-', 'B+', 'B'].map((grade) => (
            <div key={grade} className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer flex-1">
                <Checkbox
                  checked={filters.investmentGrade?.includes(grade)}
                  onCheckedChange={() => handleGradeToggle(grade)}
                  className="border-[#C9A770] data-[state=checked]:bg-[#C9A770]"
                />
                <span className="text-[#F8F8F8] text-sm">Grade {grade}</span>
              </Label>
            </div>
          ))}
        </FacetSection>

        {/* Region */}
        <FacetSection title="Location" section="region">
          {['west', 'south', 'midwest', 'northeast'].map((region) => (
            <div key={region} className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer flex-1">
                <Checkbox
                  checked={filters.region?.includes(region)}
                  onCheckedChange={() => handleRegionToggle(region)}
                  className="border-[#C9A770] data-[state=checked]:bg-[#C9A770]"
                />
                <span className="text-[#F8F8F8] text-sm capitalize">{region}</span>
              </Label>
            </div>
          ))}
        </FacetSection>

        {/* Year Range */}
        <FacetSection title="Year Range" section="year">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#888888]">
                {filters.yearMin || 1950} - {filters.yearMax || 2025}
              </span>
            </div>
            <Slider
              min={1950}
              max={2025}
              step={1}
              value={[filters.yearMin || 1950, filters.yearMax || 2025]}
              onValueChange={handleYearChange}
              className="[&_[role=slider]]:bg-[#C9A770] [&_[role=slider]]:border-[#C9A770]"
            />
          </div>
        </FacetSection>

        {/* Price Range */}
        <FacetSection title="Price Range" section="price">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#888888]">
                ${((filters.priceMin || 0) / 1000).toFixed(0)}k - ${((filters.priceMax || 500000) / 1000).toFixed(0)}k
              </span>
            </div>
            <Slider
              min={0}
              max={500000}
              step={10000}
              value={[filters.priceMin || 0, filters.priceMax || 500000]}
              onValueChange={handlePriceChange}
              className="[&_[role=slider]]:bg-[#C9A770] [&_[role=slider]]:border-[#C9A770]"
            />
          </div>
        </FacetSection>
      </div>
    </div>
  );
}
