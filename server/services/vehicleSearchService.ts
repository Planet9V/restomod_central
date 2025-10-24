/**
 * Phase 3 Task 3.3: Vehicle Search Service with FTS5
 * Provides ultra-fast full-text search using SQLite FTS5
 * Target: <50ms search performance vs 2-3s with LIKE queries
 */

import { db } from '@db';
import { carsForSale } from '@shared/schema';
import { sql } from 'drizzle-orm';

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
  rank: number; // BM25 ranking score from FTS5
}

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    category?: string;
    region?: string;
    priceMin?: number;
    priceMax?: number;
    yearMin?: number;
    yearMax?: number;
    investmentGrade?: string;
  };
}

export class VehicleSearchService {
  /**
   * Perform full-text search using FTS5 with optional filters
   * Uses BM25 ranking algorithm for relevance scoring
   */
  async searchVehicles(options: SearchOptions): Promise<{ results: SearchResult[]; total: number; queryTime: number }> {
    const startTime = Date.now();
    const { query, limit = 50, offset = 0, filters } = options;

    try {
      // Sanitize search query for FTS5
      const sanitizedQuery = this.sanitizeFTS5Query(query);

      // Build the FTS5 search query with JOIN to main table for complete data
      let searchQuery = sql`
        SELECT
          c.id,
          c.make,
          c.model,
          c.year,
          c.price,
          c.description,
          c.image_url as imageUrl,
          c.location_city as locationCity,
          c.location_state as locationState,
          c.location_region as locationRegion,
          c.category,
          c.condition,
          c.investment_grade as investmentGrade,
          c.source_name as sourceName,
          c.stock_number as stockNumber,
          fts.rank as rank
        FROM cars_for_sale_fts fts
        JOIN cars_for_sale c ON fts.vehicle_id = c.id
        WHERE cars_for_sale_fts MATCH ${sanitizedQuery}
      `;

      // Apply additional filters if provided
      const conditions: string[] = [];

      if (filters?.category) {
        conditions.push(`c.category = '${filters.category}'`);
      }

      if (filters?.region) {
        conditions.push(`c.location_region = '${filters.region}'`);
      }

      if (filters?.priceMin !== undefined) {
        conditions.push(`CAST(c.price AS NUMERIC) >= ${filters.priceMin}`);
      }

      if (filters?.priceMax !== undefined) {
        conditions.push(`CAST(c.price AS NUMERIC) <= ${filters.priceMax}`);
      }

      if (filters?.yearMin !== undefined) {
        conditions.push(`c.year >= ${filters.yearMin}`);
      }

      if (filters?.yearMax !== undefined) {
        conditions.push(`c.year <= ${filters.yearMax}`);
      }

      if (filters?.investmentGrade) {
        conditions.push(`c.investment_grade = '${filters.investmentGrade}'`);
      }

      // Combine filters
      if (conditions.length > 0) {
        searchQuery = sql`${searchQuery} AND ${sql.raw(conditions.join(' AND '))}`;
      }

      // Add ordering by relevance rank and pagination
      searchQuery = sql`
        ${searchQuery}
        ORDER BY fts.rank
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Execute search
      const results = (await db.execute(searchQuery)).rows as unknown as SearchResult[];

      // Get total count for pagination
      let countQuery = sql`
        SELECT COUNT(*) as total
        FROM cars_for_sale_fts fts
        JOIN cars_for_sale c ON fts.vehicle_id = c.id
        WHERE cars_for_sale_fts MATCH ${sanitizedQuery}
      `;

      if (conditions.length > 0) {
        countQuery = sql`${countQuery} AND ${sql.raw(conditions.join(' AND '))}`;
      }

      const countResult = (await db.execute(countQuery)).rows[0] as { total: number };
      const total = countResult.total;

      const queryTime = Date.now() - startTime;

      return {
        results,
        total,
        queryTime
      };

    } catch (error) {
      console.error('FTS5 search error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get search suggestions/autocomplete using FTS5 prefix matching
   */
  async getSearchSuggestions(prefix: string, limit: number = 10): Promise<string[]> {
    try {
      // Use FTS5 prefix matching (append * for prefix search)
      const prefixQuery = `${this.sanitizeFTS5Query(prefix)}*`;

      const query = sql`
        SELECT DISTINCT c.make || ' ' || c.model as suggestion
        FROM cars_for_sale_fts fts
        JOIN cars_for_sale c ON fts.vehicle_id = c.id
        WHERE cars_for_sale_fts MATCH ${prefixQuery}
        ORDER BY fts.rank
        LIMIT ${limit}
      `;

      const results = (await db.execute(query)).rows as { suggestion: string }[];
      return results.map(r => r.suggestion);

    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Search by specific fields (make, model, category, etc.)
   */
  async searchByField(field: string, query: string, limit: number = 20): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      // Field-specific FTS5 search
      const sanitizedQuery = this.sanitizeFTS5Query(query);
      const ftsQuery = `${field}:${sanitizedQuery}`;

      const searchQuery = sql`
        SELECT
          c.id,
          c.make,
          c.model,
          c.year,
          c.price,
          c.description,
          c.image_url as imageUrl,
          c.location_city as locationCity,
          c.location_state as locationState,
          c.location_region as locationRegion,
          c.category,
          c.condition,
          c.investment_grade as investmentGrade,
          c.source_name as sourceName,
          c.stock_number as stockNumber,
          fts.rank as rank
        FROM cars_for_sale_fts fts
        JOIN cars_for_sale c ON fts.vehicle_id = c.id
        WHERE cars_for_sale_fts MATCH ${ftsQuery}
        ORDER BY fts.rank
        LIMIT ${limit}
      `;

      const results = (await db.execute(searchQuery)).rows as unknown as SearchResult[];
      const queryTime = Date.now() - startTime;

      console.log(`✅ Field search '${field}:${query}' completed in ${queryTime}ms`);
      return results;

    } catch (error) {
      console.error(`Field search error for ${field}:`, error);
      return [];
    }
  }

  /**
   * Sanitize user input for FTS5 to prevent injection
   * FTS5 has special characters that need escaping: " * ( ) AND OR NOT
   */
  private sanitizeFTS5Query(query: string): string {
    // Remove or escape special FTS5 characters
    return query
      .trim()
      .replace(/[^\w\s]/g, ' ') // Remove special characters except word chars and spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Advanced search with complex FTS5 operators
   * Supports: AND, OR, NOT, phrase matching, prefix search
   */
  async advancedSearch(ftsQuery: string, limit: number = 50): Promise<SearchResult[]> {
    try {
      const searchQuery = sql`
        SELECT
          c.id,
          c.make,
          c.model,
          c.year,
          c.price,
          c.description,
          c.image_url as imageUrl,
          c.location_city as locationCity,
          c.location_state as locationState,
          c.location_region as locationRegion,
          c.category,
          c.condition,
          c.investment_grade as investmentGrade,
          c.source_name as sourceName,
          c.stock_number as stockNumber,
          fts.rank as rank
        FROM cars_for_sale_fts fts
        JOIN cars_for_sale c ON fts.vehicle_id = c.id
        WHERE cars_for_sale_fts MATCH ${ftsQuery}
        ORDER BY fts.rank
        LIMIT ${limit}
      `;

      const results = (await db.execute(searchQuery)).rows as unknown as SearchResult[];
      return results;

    } catch (error) {
      console.error('Advanced search error:', error);
      throw new Error('Advanced search query syntax error');
    }
  }
}

export const vehicleSearchService = new VehicleSearchService();
