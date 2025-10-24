/**
 * Phase 4: Search Types
 * Type definitions for FTS5 vehicle search functionality
 */

export interface SearchFilters {
  query?: string;
  make?: string[];
  model?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  category?: string[];
  region?: string[];
  investmentGrade?: string[];
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc';
  viewMode?: 'grid' | 'list';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string | null;
  description: string | null;
  imageUrl: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationRegion: string | null;
  category: string | null;
  condition: string | null;
  investmentGrade: string | null;
  sourceName: string | null;
  stockNumber: string | null;
  rank: number; // FTS5 BM25 ranking score
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
  queryTime: string;
  performance: string;
  engine: string;
}

export interface AutocompleteResponse {
  success: boolean;
  prefix: string;
  suggestions: string[];
  count: number;
}

export interface FacetCount {
  value: string;
  count: number;
  label?: string;
}

export interface SearchFacets {
  makes: FacetCount[];
  categories: FacetCount[];
  regions: FacetCount[];
  investmentGrades: FacetCount[];
  priceRanges: FacetCount[];
  yearRanges: FacetCount[];
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchResult[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  queryTime: string | null;
  facets: SearchFacets | null;
}
