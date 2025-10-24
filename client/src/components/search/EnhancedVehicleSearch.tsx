/**
 * Phase 4: Enhanced Vehicle Search
 * FTS5-powered search with real-time autocomplete and luxury styling
 */

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Calendar, DollarSign, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedValue } from '@/hooks/use-debounce';
import { useSearchAutocomplete } from '@/hooks/use-vehicle-search';
import { cn } from '@/lib/utils';

interface EnhancedVehicleSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  className?: string;
  showQuickFilters?: boolean;
}

export function EnhancedVehicleSearch({
  onSearch,
  initialQuery = '',
  className = '',
  showQuickFilters = true
}: EnhancedVehicleSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Debounce the search query to prevent excessive API calls
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Fetch autocomplete suggestions
  const { data: autocompleteData, isLoading: isLoadingAutocomplete } = useSearchAutocomplete(
    debouncedQuery,
    debouncedQuery.length >= 2
  );

  const suggestions = autocompleteData?.suggestions || [];

  // Show/hide autocomplete based on suggestions
  useEffect(() => {
    setShowAutocomplete(suggestions.length > 0 && searchQuery.length >= 2);
    setSelectedIndex(-1); // Reset selection when suggestions change
  }, [suggestions, searchQuery]);

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowAutocomplete(false);
      searchInputRef.current?.blur();
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowAutocomplete(false);
    onSearch(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowAutocomplete(false);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Popular quick filter buttons
  const quickFilters = [
    {
      label: 'Muscle Cars',
      icon: TrendingUp,
      color: 'bg-[#7D2027] hover:bg-[#5D1820]', // Burgundy
      action: () => onSearch('category:"Muscle Cars"')
    },
    {
      label: 'Investment A+',
      icon: Award,
      color: 'bg-[#C9A770] hover:bg-[#B8966A]', // Gold
      action: () => onSearch('investmentGrade:A+')
    },
    {
      label: 'Classic Cars',
      icon: Calendar,
      color: 'bg-[#5D7A94] hover:bg-[#4A6178]', // Steel
      action: () => onSearch('category:"Classic Cars"')
    },
    {
      label: 'Under $100k',
      icon: DollarSign,
      color: 'bg-[#C9A770]/80 hover:bg-[#C9A770]', // Gold variant
      action: () => onSearch('priceMax:100000')
    }
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#C9A770]" />

          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by make, model, year, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowAutocomplete(true);
            }}
            className={cn(
              "pl-12 pr-24 py-6 text-lg",
              "bg-[#2A2A2A] border-[#3A3A3A]",
              "text-[#F8F8F8] placeholder-[#888888]",
              "rounded-lg transition-all duration-200",
              "focus:ring-2 focus:ring-[#C9A770] focus:border-transparent",
              "hover:border-[#C9A770]/50"
            )}
            aria-label="Search for vehicles"
            aria-expanded={showAutocomplete}
            aria-controls="search-autocomplete"
            role="combobox"
            aria-autocomplete="list"
          />

          {/* Clear button */}
          {searchQuery && (
            <Button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowAutocomplete(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-24 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-transparent hover:bg-[#3A3A3A] text-[#888888] hover:text-[#F8F8F8] transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="submit"
            className={cn(
              "absolute right-2 top-1/2 transform -translate-y-1/2",
              "bg-[#7D2027] hover:bg-[#5D1820]",
              "text-white px-6 py-2 h-auto",
              "transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}
          >
            Search
          </Button>
        </div>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showAutocomplete && (
            <motion.div
              ref={autocompleteRef}
              id="search-autocomplete"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute top-full mt-2 w-full",
                "bg-[#2A2A2A] border border-[#3A3A3A]",
                "rounded-lg shadow-2xl overflow-hidden z-50",
                "backdrop-blur-sm"
              )}
              role="listbox"
              aria-label="Search suggestions"
            >
              {isLoadingAutocomplete ? (
                <div className="p-4 text-center text-[#888888]">
                  <span className="inline-block animate-pulse">Searching...</span>
                </div>
              ) : (
                <ul className="max-h-[300px] overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "w-full text-left px-4 py-3",
                          "transition-all duration-150",
                          "flex items-center gap-3",
                          index === selectedIndex
                            ? "bg-[#C9A770]/20 text-[#C9A770] border-l-2 border-[#C9A770]"
                            : "text-[#F8F8F8] hover:bg-[#3A3A3A] border-l-2 border-transparent"
                        )}
                      >
                        <Search className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 font-medium">{suggestion}</span>
                      </button>
                    </motion.li>
                  ))}

                  {suggestions.length > 0 && (
                    <li className="border-t border-[#3A3A3A]">
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="w-full text-center px-4 py-3 text-sm text-[#C9A770] hover:bg-[#3A3A3A] transition-colors font-medium"
                      >
                        See all results for "{searchQuery}"
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Quick Filters */}
      {showQuickFilters && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-[#888888]">
            <span className="text-sm font-medium font-playfair">Popular Searches</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter, index) => (
              <motion.div
                key={filter.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  type="button"
                  onClick={filter.action}
                  className={cn(
                    filter.color,
                    "text-white border-0 shadow-lg",
                    "transition-all duration-300",
                    "hover:shadow-xl hover:scale-105 hover:-translate-y-0.5",
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "font-medium text-sm"
                  )}
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
