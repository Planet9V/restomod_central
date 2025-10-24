/**
 * Phase 4: Vehicle Search Hook
 * Custom hook for FTS5-powered vehicle search with autocomplete
 */

import { useQuery } from '@tanstack/react-query';
import { SearchFilters, SearchResponse, AutocompleteResponse } from '@/types/search';

/**
 * Main search hook using FTS5 full-text search
 */
export function useVehicleSearch(filters: SearchFilters, enabled: boolean = true) {
  return useQuery<SearchResponse>({
    queryKey: ['vehicle-search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Add search query
      if (filters.query) params.set('q', filters.query);

      // Add filters
      if (filters.category?.length) params.set('category', filters.category.join(','));
      if (filters.region?.length) params.set('region', filters.region.join(','));
      if (filters.priceMin !== undefined) params.set('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) params.set('priceMax', filters.priceMax.toString());
      if (filters.yearMin !== undefined) params.set('yearMin', filters.yearMin.toString());
      if (filters.yearMax !== undefined) params.set('yearMax', filters.yearMax.toString());
      if (filters.investmentGrade?.length) params.set('investmentGrade', filters.investmentGrade.join(','));

      // Add pagination
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.offset) params.set('offset', filters.offset.toString());

      const response = await fetch(`/api/vehicle-search?${params}`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }

      return response.json();
    },
    enabled: enabled && (!!filters.query || Object.keys(filters).length > 1),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Autocomplete hook for search suggestions
 */
export function useSearchAutocomplete(prefix: string, enabled: boolean = true) {
  return useQuery<AutocompleteResponse>({
    queryKey: ['search-autocomplete', prefix],
    queryFn: async () => {
      const params = new URLSearchParams({ q: prefix });

      const response = await fetch(`/api/vehicle-search/autocomplete?${params}`);
      if (!response.ok) {
        throw new Error('Autocomplete request failed');
      }

      return response.json();
    },
    enabled: enabled && prefix.length >= 2, // Only trigger after 2 characters
    staleTime: 1000 * 60 * 10, // Cache autocomplete for 10 minutes
  });
}

/**
 * Search by make
 */
export function useSearchByMake(make: string, limit: number = 20) {
  return useQuery({
    queryKey: ['search-by-make', make, limit],
    queryFn: async () => {
      const response = await fetch(`/api/vehicle-search/by-make/${encodeURIComponent(make)}?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Make search failed');
      }

      return response.json();
    },
    enabled: !!make,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Search by category
 */
export function useSearchByCategory(category: string, limit: number = 20) {
  return useQuery({
    queryKey: ['search-by-category', category, limit],
    queryFn: async () => {
      const response = await fetch(`/api/vehicle-search/by-category/${encodeURIComponent(category)}?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Category search failed');
      }

      return response.json();
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Get search statistics
 */
export function useSearchStats() {
  return useQuery({
    queryKey: ['search-stats'],
    queryFn: async () => {
      const response = await fetch('/api/vehicle-search/stats');
      if (!response.ok) {
        throw new Error('Stats request failed');
      }

      return response.json();
    },
    staleTime: Infinity, // Static data
  });
}
