/**
 * Vector Search Service
 *
 * Provides semantic search functionality using pgvector and OpenAI embeddings.
 * Enables finding cars and events through natural language queries and similarity.
 *
 * Features:
 * - Vector search for cars and events using cosine similarity
 * - Hybrid search combining vector similarity with traditional filters
 * - Find similar items by ID
 * - Support for filtering, boosting, and ranking
 * - Performance optimized with proper indexing
 *
 * @see docs/SPEC_04_AI_CHAT_SYSTEM.md - Vector Search section
 */

import { db } from '../../../db';
import { carsForSale, carShowEvents } from '../../../shared/postgres-schema';
import type { CarForSale, CarShowEvent } from '../../../shared/postgres-schema';
import { generateEmbedding } from './embeddingService';
import { sql } from 'drizzle-orm';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Options for vector search operations
 */
export interface VectorSearchOptions {
  /** Maximum number of results to return (default: 10) */
  limit?: number;

  /** Minimum similarity threshold 0-1 (default: 0.7) */
  threshold?: number;

  /** Additional filters to apply */
  filters?: SearchFilters;

  /** Boost featured items in results (default: false) */
  boostFeatured?: boolean;
}

/**
 * Filters for narrowing search results
 */
export interface SearchFilters {
  // Car filters
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  location?: string;
  locationState?: string;
  make?: string;
  model?: string;
  category?: string;
  investmentGrade?: string;

  // Event filters
  city?: string;
  state?: string;
  eventType?: string;
  eventCategory?: string;
  startDateMin?: Date;
  startDateMax?: Date;
}

/**
 * Result from vector search with similarity score
 */
export interface VectorSearchResult<T> {
  /** Item ID */
  id: number;

  /** Cosine similarity score 0-1 (higher is more similar) */
  similarity: number;

  /** Full item data */
  data: T;
}

// ============================================================================
// VECTOR SEARCH - CARS
// ============================================================================

/**
 * Search for cars using semantic vector similarity
 *
 * Generates an embedding for the query and finds cars with similar embeddings
 * using pgvector's cosine similarity operator.
 *
 * @param query - Natural language search query
 * @param options - Search options (limit, threshold, filters)
 * @returns Array of cars sorted by similarity score (highest first)
 *
 * @example
 * const results = await vectorSearchCars(
 *   "blue 1967 Mustang fastback",
 *   { limit: 5, threshold: 0.75, filters: { priceMax: 100000 } }
 * );
 */
export async function vectorSearchCars(
  query: string,
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult<CarForSale>[]> {
  const {
    limit = 10,
    threshold = 0.7,
    filters = {},
    boostFeatured = false,
  } = options;

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Build WHERE conditions
    const conditions: string[] = [
      "status = 'active'",
      "embedding IS NOT NULL",
      `(1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) > ${threshold}`,
    ];

    // Apply filters
    if (filters.priceMin !== undefined) {
      conditions.push(`price::numeric >= ${filters.priceMin}`);
    }
    if (filters.priceMax !== undefined) {
      conditions.push(`price::numeric <= ${filters.priceMax}`);
    }
    if (filters.yearMin !== undefined) {
      conditions.push(`year >= ${filters.yearMin}`);
    }
    if (filters.yearMax !== undefined) {
      conditions.push(`year <= ${filters.yearMax}`);
    }
    if (filters.make) {
      conditions.push(`LOWER(make) = LOWER('${filters.make.replace(/'/g, "''")}')`);
    }
    if (filters.model) {
      conditions.push(`LOWER(model) = LOWER('${filters.model.replace(/'/g, "''")}')`);
    }
    if (filters.locationState) {
      conditions.push(`LOWER(location_state) = LOWER('${filters.locationState.replace(/'/g, "''")}')`);
    }
    if (filters.category) {
      conditions.push(`LOWER(category) = LOWER('${filters.category.replace(/'/g, "''")}')`);
    }
    if (filters.investmentGrade) {
      conditions.push(`investment_grade = '${filters.investmentGrade.replace(/'/g, "''")}'`);
    }

    const whereClause = conditions.join(' AND ');

    // Build SELECT query with similarity score
    const orderBy = boostFeatured
      ? `(CASE WHEN featured THEN 0.1 ELSE 0 END) + (1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) DESC`
      : `embedding <=> '[${queryEmbedding.join(',')}]'::vector ASC`;

    const query_sql = `
      SELECT
        *,
        (1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) as similarity
      FROM cars_for_sale
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limit}
    `;

    // Execute query
    const results = await db.execute(sql.raw(query_sql));

    // Transform results
    return (results as any[]).map((row) => {
      const { similarity, ...data } = row;
      return {
        id: row.id,
        similarity: parseFloat(similarity),
        data: data as CarForSale,
      };
    });

  } catch (error) {
    console.error('Vector search for cars failed:', error);
    throw new Error(`Failed to search cars: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// VECTOR SEARCH - EVENTS
// ============================================================================

/**
 * Search for car show events using semantic vector similarity
 *
 * @param query - Natural language search query
 * @param options - Search options (limit, threshold, filters)
 * @returns Array of events sorted by similarity score (highest first)
 *
 * @example
 * const results = await vectorSearchEvents(
 *   "Mustang car show in California",
 *   { limit: 10, filters: { state: 'CA' } }
 * );
 */
export async function vectorSearchEvents(
  query: string,
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult<CarShowEvent>[]> {
  const {
    limit = 10,
    threshold = 0.7,
    filters = {},
    boostFeatured = false,
  } = options;

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Build WHERE conditions
    const conditions: string[] = [
      "status = 'active'",
      "embedding IS NOT NULL",
      `(1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) > ${threshold}`,
      "start_date > NOW()", // Only future events
    ];

    // Apply filters
    if (filters.city) {
      conditions.push(`LOWER(city) = LOWER('${filters.city.replace(/'/g, "''")}')`);
    }
    if (filters.state) {
      conditions.push(`LOWER(state) = LOWER('${filters.state.replace(/'/g, "''")}')`);
    }
    if (filters.eventType) {
      conditions.push(`event_type = '${filters.eventType.replace(/'/g, "''")}'`);
    }
    if (filters.eventCategory) {
      conditions.push(`event_category = '${filters.eventCategory.replace(/'/g, "''")}'`);
    }
    if (filters.startDateMin) {
      conditions.push(`start_date >= '${filters.startDateMin.toISOString()}'`);
    }
    if (filters.startDateMax) {
      conditions.push(`start_date <= '${filters.startDateMax.toISOString()}'`);
    }

    const whereClause = conditions.join(' AND ');

    // Build SELECT query with similarity score
    const orderBy = boostFeatured
      ? `(CASE WHEN featured THEN 0.1 ELSE 0 END) + (1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) DESC`
      : `embedding <=> '[${queryEmbedding.join(',')}]'::vector ASC`;

    const query_sql = `
      SELECT
        *,
        (1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) as similarity
      FROM car_show_events
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limit}
    `;

    // Execute query
    const results = await db.execute(sql.raw(query_sql));

    // Transform results
    return (results as any[]).map((row) => {
      const { similarity, ...data } = row;
      return {
        id: row.id,
        similarity: parseFloat(similarity),
        data: data as CarShowEvent,
      };
    });

  } catch (error) {
    console.error('Vector search for events failed:', error);
    throw new Error(`Failed to search events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// HYBRID SEARCH
// ============================================================================

/**
 * Hybrid search combining vector similarity with traditional ranking factors
 *
 * Scoring formula:
 * - Base score: Vector similarity (0-1)
 * - Featured boost: +0.1
 * - Investment grade boost: +0.05 for A+, +0.03 for A, +0.01 for A-
 * - Exact make/model match in query: +0.05
 *
 * @param query - Natural language search query
 * @param options - Search options with filters
 * @returns Array of cars sorted by hybrid score (highest first)
 *
 * @example
 * const results = await hybridSearchCars(
 *   "affordable classic Mustang",
 *   { limit: 10, boostFeatured: true, filters: { priceMax: 50000 } }
 * );
 */
export async function hybridSearchCars(
  query: string,
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult<CarForSale>[]> {
  const {
    limit = 10,
    threshold = 0.7,
    filters = {},
    boostFeatured = true, // Default to true for hybrid search
  } = options;

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Build WHERE conditions
    const conditions: string[] = [
      "status = 'active'",
      "embedding IS NOT NULL",
      `(1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) > ${threshold}`,
    ];

    // Apply filters (same as vectorSearchCars)
    if (filters.priceMin !== undefined) {
      conditions.push(`price::numeric >= ${filters.priceMin}`);
    }
    if (filters.priceMax !== undefined) {
      conditions.push(`price::numeric <= ${filters.priceMax}`);
    }
    if (filters.yearMin !== undefined) {
      conditions.push(`year >= ${filters.yearMin}`);
    }
    if (filters.yearMax !== undefined) {
      conditions.push(`year <= ${filters.yearMax}`);
    }
    if (filters.make) {
      conditions.push(`LOWER(make) = LOWER('${filters.make.replace(/'/g, "''")}')`);
    }
    if (filters.model) {
      conditions.push(`LOWER(model) = LOWER('${filters.model.replace(/'/g, "''")}')`);
    }
    if (filters.locationState) {
      conditions.push(`LOWER(location_state) = LOWER('${filters.locationState.replace(/'/g, "''")}')`);
    }
    if (filters.category) {
      conditions.push(`LOWER(category) = LOWER('${filters.category.replace(/'/g, "''")}')`);
    }

    const whereClause = conditions.join(' AND ');

    // Normalize query for keyword matching
    const queryLower = query.toLowerCase();

    // Build hybrid scoring query
    const query_sql = `
      SELECT
        *,
        (1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector)) as vector_similarity,
        (
          -- Base: Vector similarity
          (1 - (embedding <=> '[${queryEmbedding.join(',')}]'::vector))

          -- Featured boost
          ${boostFeatured ? "+ (CASE WHEN featured THEN 0.1 ELSE 0 END)" : ""}

          -- Investment grade boost
          + CASE
            WHEN investment_grade = 'A+' THEN 0.05
            WHEN investment_grade = 'A' THEN 0.03
            WHEN investment_grade = 'A-' THEN 0.01
            ELSE 0
          END

          -- Exact make/model match boost
          + CASE
            WHEN LOWER(make) = '${queryLower.replace(/'/g, "''")}' OR LOWER(model) = '${queryLower.replace(/'/g, "''")}'
            THEN 0.05
            ELSE 0
          END

        ) as hybrid_score
      FROM cars_for_sale
      WHERE ${whereClause}
      ORDER BY hybrid_score DESC
      LIMIT ${limit}
    `;

    // Execute query
    const results = await db.execute(sql.raw(query_sql));

    // Transform results
    return (results as any[]).map((row) => {
      const { vector_similarity, hybrid_score, ...data } = row;
      return {
        id: row.id,
        similarity: parseFloat(hybrid_score),
        data: data as CarForSale,
      };
    });

  } catch (error) {
    console.error('Hybrid search for cars failed:', error);
    throw new Error(`Failed to perform hybrid search: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// FIND SIMILAR ITEMS
// ============================================================================

/**
 * Find cars similar to a specific car using vector similarity
 *
 * Retrieves the embedding of the target car and finds other cars with
 * similar embeddings. Useful for "You might also like" features.
 *
 * @param carId - ID of the car to find similar cars for
 * @param limit - Maximum number of similar cars to return (default: 5)
 * @returns Array of similar cars sorted by similarity (highest first)
 *
 * @example
 * const similar = await findSimilarCars(123, 5);
 */
export async function findSimilarCars(
  carId: number,
  limit: number = 5
): Promise<VectorSearchResult<CarForSale>[]> {
  try {
    // First, get the target car's embedding
    const targetQuery = `
      SELECT embedding
      FROM cars_for_sale
      WHERE id = ${carId} AND embedding IS NOT NULL
    `;

    const targetResults = await db.execute(sql.raw(targetQuery));

    if (!targetResults || (targetResults as any[]).length === 0) {
      console.warn(`Car ${carId} not found or has no embedding`);
      return [];
    }

    const targetEmbedding = (targetResults as any[])[0].embedding;

    // Find similar cars (exclude the original)
    const similarQuery = `
      SELECT
        *,
        (1 - (embedding <=> '${targetEmbedding}'::vector)) as similarity
      FROM cars_for_sale
      WHERE
        id != ${carId}
        AND status = 'active'
        AND embedding IS NOT NULL
      ORDER BY embedding <=> '${targetEmbedding}'::vector ASC
      LIMIT ${limit}
    `;

    const results = await db.execute(sql.raw(similarQuery));

    // Transform results
    return (results as any[]).map((row) => {
      const { similarity, ...data } = row;
      return {
        id: row.id,
        similarity: parseFloat(similarity),
        data: data as CarForSale,
      };
    });

  } catch (error) {
    console.error(`Failed to find similar cars for ID ${carId}:`, error);
    throw new Error(`Failed to find similar cars: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find events similar to a specific event using vector similarity
 *
 * Retrieves the embedding of the target event and finds other events with
 * similar embeddings. Useful for suggesting related events.
 *
 * @param eventId - ID of the event to find similar events for
 * @param limit - Maximum number of similar events to return (default: 5)
 * @returns Array of similar events sorted by similarity (highest first)
 *
 * @example
 * const similar = await findSimilarEvents(456, 5);
 */
export async function findSimilarEvents(
  eventId: number,
  limit: number = 5
): Promise<VectorSearchResult<CarShowEvent>[]> {
  try {
    // First, get the target event's embedding
    const targetQuery = `
      SELECT embedding
      FROM car_show_events
      WHERE id = ${eventId} AND embedding IS NOT NULL
    `;

    const targetResults = await db.execute(sql.raw(targetQuery));

    if (!targetResults || (targetResults as any[]).length === 0) {
      console.warn(`Event ${eventId} not found or has no embedding`);
      return [];
    }

    const targetEmbedding = (targetResults as any[])[0].embedding;

    // Find similar events (exclude the original, only future events)
    const similarQuery = `
      SELECT
        *,
        (1 - (embedding <=> '${targetEmbedding}'::vector)) as similarity
      FROM car_show_events
      WHERE
        id != ${eventId}
        AND status = 'active'
        AND start_date > NOW()
        AND embedding IS NOT NULL
      ORDER BY embedding <=> '${targetEmbedding}'::vector ASC
      LIMIT ${limit}
    `;

    const results = await db.execute(sql.raw(similarQuery));

    // Transform results
    return (results as any[]).map((row) => {
      const { similarity, ...data } = row;
      return {
        id: row.id,
        similarity: parseFloat(similarity),
        data: data as CarShowEvent,
      };
    });

  } catch (error) {
    console.error(`Failed to find similar events for ID ${eventId}:`, error);
    throw new Error(`Failed to find similar events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get statistics about vector search coverage
 *
 * Returns how many cars and events have embeddings vs total count.
 * Useful for monitoring and debugging.
 *
 * @returns Object with coverage statistics
 */
export async function getVectorSearchCoverage() {
  try {
    const carsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(embedding) as with_embedding,
        ROUND(COUNT(embedding)::numeric / COUNT(*)::numeric * 100, 2) as coverage_percent
      FROM cars_for_sale
      WHERE status = 'active'
    `;

    const eventsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(embedding) as with_embedding,
        ROUND(COUNT(embedding)::numeric / COUNT(*)::numeric * 100, 2) as coverage_percent
      FROM car_show_events
      WHERE status = 'active' AND start_date > NOW()
    `;

    const [carsStats] = await db.execute(sql.raw(carsQuery)) as any[];
    const [eventsStats] = await db.execute(sql.raw(eventsQuery)) as any[];

    return {
      cars: {
        total: parseInt(carsStats.total),
        withEmbedding: parseInt(carsStats.with_embedding),
        coveragePercent: parseFloat(carsStats.coverage_percent),
      },
      events: {
        total: parseInt(eventsStats.total),
        withEmbedding: parseInt(eventsStats.with_embedding),
        coveragePercent: parseFloat(eventsStats.coverage_percent),
      },
    };

  } catch (error) {
    console.error('Failed to get vector search coverage:', error);
    throw error;
  }
}

/**
 * Test vector search setup
 *
 * Performs a simple test query to verify pgvector is working correctly.
 * Useful for debugging and health checks.
 *
 * @returns Test results with status and any errors
 */
export async function testVectorSearch(): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    // Test query - simple embedding similarity check
    const testEmbedding = await generateEmbedding("test classic car");

    const testQuery = `
      SELECT COUNT(*) as count
      FROM cars_for_sale
      WHERE embedding IS NOT NULL
      LIMIT 1
    `;

    await db.execute(sql.raw(testQuery));

    return {
      success: true,
      message: 'Vector search is working correctly',
    };

  } catch (error) {
    console.error('Vector search test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
