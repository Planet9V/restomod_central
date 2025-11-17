# Vector Search Service - Implementation Guide

**Status:** ✅ Complete
**Phase:** 3.1 - AI Chat System - Vector Search
**Date:** 2025-11-17

---

## Overview

The Vector Search Service provides semantic search functionality for the classic car marketplace using **OpenAI embeddings** and **PostgreSQL pgvector**. This enables natural language queries like "blue 1967 Mustang fastback under $80k" to find relevant cars and events.

### Key Features

✅ **Semantic Search** - Natural language understanding using OpenAI ada-002 embeddings
✅ **Hybrid Search** - Combines vector similarity with business logic (featured, investment grade)
✅ **Similarity Matching** - Find cars/events similar to a specific item
✅ **Advanced Filtering** - Price, year, location, make, model, category filters
✅ **Performance Optimized** - Uses pgvector IVFFlat indexes for fast similarity search
✅ **Production Ready** - Error handling, logging, TypeScript types

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           User Query (Natural Language)         │
│   "affordable blue Mustang from the 60s"        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Embedding Service (OpenAI)              │
│   Converts text → 1536-dim vector               │
│   Cached for 24 hours                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│      Vector Search Service (pgvector)           │
│   Cosine similarity: embedding <=> query        │
│   Filters: price, year, location, etc.          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Ranked Results (0-1 similarity)         │
│   1. 1967 Ford Mustang - 0.89 match             │
│   2. 1969 Ford Mustang - 0.85 match             │
│   3. 1968 Chevrolet Camaro - 0.78 match         │
└─────────────────────────────────────────────────┘
```

---

## Installation & Setup

### 1. Prerequisites

```bash
# PostgreSQL 15+ with pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# Verify pgvector is installed
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 2. Create Vector Indexes

```sql
-- Index for cars_for_sale (cosine similarity)
CREATE INDEX cars_embedding_idx
ON cars_for_sale
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for car_show_events (cosine similarity)
CREATE INDEX events_embedding_idx
ON car_show_events
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Verify indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname LIKE '%embedding%';
```

**Index Tuning:**
- `lists` parameter should be approximately `sqrt(total_rows)`
- For 10,000 rows: `lists = 100`
- For 100,000 rows: `lists = 316`
- For 1,000,000 rows: `lists = 1000`

### 3. Environment Variables

```bash
# .env file
OPENAI_API_KEY=sk-...your-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/restomod_db
```

### 4. Install Dependencies

```bash
npm install openai drizzle-orm postgres
```

---

## API Reference

### `vectorSearchCars(query, options)`

Search for cars using semantic vector similarity.

**Parameters:**
- `query` (string) - Natural language search query
- `options` (VectorSearchOptions)
  - `limit?` (number) - Max results (default: 10)
  - `threshold?` (number) - Min similarity 0-1 (default: 0.7)
  - `filters?` (SearchFilters) - Additional filters
  - `boostFeatured?` (boolean) - Boost featured cars (default: false)

**Returns:** `Promise<VectorSearchResult<CarForSale>[]>`

**Example:**
```typescript
const results = await vectorSearchCars(
  "blue 1967 Mustang fastback",
  {
    limit: 5,
    threshold: 0.75,
    filters: {
      priceMax: 100000,
      locationState: 'CA',
    },
  }
);

results.forEach(result => {
  console.log(
    `${result.data.year} ${result.data.make} ${result.data.model}`,
    `- ${(result.similarity * 100).toFixed(1)}% match`
  );
});
```

---

### `vectorSearchEvents(query, options)`

Search for car show events using semantic vector similarity.

**Parameters:**
- `query` (string) - Natural language search query
- `options` (VectorSearchOptions)

**Returns:** `Promise<VectorSearchResult<CarShowEvent>[]>`

**Example:**
```typescript
const results = await vectorSearchEvents(
  "Mustang car show in Southern California",
  {
    limit: 10,
    filters: {
      state: 'CA',
      startDateMin: new Date('2025-06-01'),
    },
  }
);
```

---

### `hybridSearchCars(query, options)`

Hybrid search combining vector similarity with ranking factors.

**Scoring Formula:**
```
hybrid_score = vector_similarity
             + (featured ? 0.1 : 0)
             + investment_grade_boost (0.01-0.05)
             + exact_match_boost (0.05)
```

**Example:**
```typescript
const results = await hybridSearchCars(
  "investment-grade Corvette",
  {
    limit: 5,
    boostFeatured: true,
    filters: { investmentGrade: 'A+' },
  }
);
```

---

### `findSimilarCars(carId, limit)`

Find cars similar to a specific car.

**Example:**
```typescript
const similar = await findSimilarCars(123, 5);
// Returns 5 cars most similar to car #123
```

---

### `findSimilarEvents(eventId, limit)`

Find events similar to a specific event.

**Example:**
```typescript
const similar = await findSimilarEvents(456, 5);
// Returns 5 events most similar to event #456
```

---

### `getVectorSearchCoverage()`

Get statistics on embedding coverage.

**Example:**
```typescript
const stats = await getVectorSearchCoverage();
console.log(`Cars with embeddings: ${stats.cars.coveragePercent}%`);
console.log(`Events with embeddings: ${stats.events.coveragePercent}%`);
```

---

### `testVectorSearch()`

Test that pgvector is working correctly.

**Example:**
```typescript
const test = await testVectorSearch();
if (test.success) {
  console.log('✅ Vector search is working!');
}
```

---

## TypeScript Types

### VectorSearchOptions

```typescript
interface VectorSearchOptions {
  limit?: number;           // Max results (default 10)
  threshold?: number;       // Similarity threshold 0-1 (default 0.7)
  filters?: SearchFilters;  // Additional filters
  boostFeatured?: boolean;  // Boost featured items
}
```

### SearchFilters

```typescript
interface SearchFilters {
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
```

### VectorSearchResult

```typescript
interface VectorSearchResult<T> {
  id: number;
  similarity: number;  // 0-1, higher is more similar
  data: T;            // Full car/event object
}
```

---

## SQL Queries Used

### Basic Vector Search

```sql
SELECT
  *,
  (1 - (embedding <=> '[...]'::vector)) as similarity
FROM cars_for_sale
WHERE
  status = 'active'
  AND embedding IS NOT NULL
  AND (1 - (embedding <=> '[...]'::vector)) > 0.7
ORDER BY embedding <=> '[...]'::vector ASC
LIMIT 10;
```

### With Price Filter

```sql
SELECT
  *,
  (1 - (embedding <=> '[...]'::vector)) as similarity
FROM cars_for_sale
WHERE
  status = 'active'
  AND embedding IS NOT NULL
  AND (1 - (embedding <=> '[...]'::vector)) > 0.7
  AND price::numeric >= 30000
  AND price::numeric <= 80000
ORDER BY embedding <=> '[...]'::vector ASC
LIMIT 10;
```

### Hybrid Search with Boosting

```sql
SELECT
  *,
  (1 - (embedding <=> '[...]'::vector)) as vector_similarity,
  (
    (1 - (embedding <=> '[...]'::vector))
    + (CASE WHEN featured THEN 0.1 ELSE 0 END)
    + CASE
        WHEN investment_grade = 'A+' THEN 0.05
        WHEN investment_grade = 'A' THEN 0.03
        WHEN investment_grade = 'A-' THEN 0.01
        ELSE 0
      END
  ) as hybrid_score
FROM cars_for_sale
WHERE status = 'active' AND embedding IS NOT NULL
ORDER BY hybrid_score DESC
LIMIT 10;
```

---

## pgvector Operators

| Operator | Description | Use Case |
|----------|-------------|----------|
| `<=>` | Cosine distance | **Text embeddings** (recommended) |
| `<->` | L2/Euclidean distance | Spatial data |
| `<#>` | Inner product | Fast approximate search |

**For text embeddings (OpenAI ada-002), always use `<=>`**

---

## Performance Optimization

### 1. Index Configuration

```sql
-- Tune IVFFlat index
CREATE INDEX cars_embedding_idx
ON cars_for_sale
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);  -- Adjust based on data size

-- Set probes at query time (higher = more accurate, slower)
SET ivfflat.probes = 10;
```

### 2. Query Optimization

```sql
-- Always include these conditions:
WHERE
  embedding IS NOT NULL          -- Skip rows without embeddings
  AND status = 'active'           -- Use traditional index
  AND (1 - (embedding <=> $1::vector)) > 0.7  -- Filter before sorting
```

### 3. Caching

The `embeddingService` already caches embeddings for 24 hours. Consider adding:
- Query result caching for popular searches
- CDN caching for API responses
- Redis caching for frequently accessed items

### 4. Batch Processing

When embedding many items:
```typescript
import { generateBatchEmbeddings } from './embeddingService';

const texts = cars.map(car => generateCarEmbedding(car));
const embeddings = await generateBatchEmbeddings(texts);
// Processes 100 items per batch
```

---

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  const results = await vectorSearchCars("query");
} catch (error) {
  if (error.message.includes('embedding')) {
    // Embedding generation failed
  } else if (error.message.includes('pgvector')) {
    // Database/pgvector issue
  } else {
    // General error
  }
}
```

Common errors:
- ❌ `pgvector extension not installed` → Run `CREATE EXTENSION vector;`
- ❌ `No embedding found` → Run embedding generation job
- ❌ `Invalid similarity threshold` → Use 0-1 range
- ❌ `OpenAI API error` → Check API key and quota

---

## Testing

### Run Test Suite

```typescript
import { testVectorSearch, getVectorSearchCoverage } from './vectorSearchService';

// Test basic functionality
const test = await testVectorSearch();
console.log(test.success ? '✅ Pass' : '❌ Fail');

// Check coverage
const coverage = await getVectorSearchCoverage();
console.log(`Coverage: ${coverage.cars.coveragePercent}%`);
```

### Run Examples

```typescript
import { runAllExamples } from './vectorSearchServiceExample';

await runAllExamples();
```

---

## Integration with AI Chat

```typescript
import { vectorSearchCars } from './vectorSearchService';

// In your chat handler:
async function handleChatMessage(userMessage: string) {
  // Generate context using vector search
  const relevantCars = await vectorSearchCars(userMessage, {
    limit: 5,
    threshold: 0.75,
  });

  // Build system prompt with context
  const systemPrompt = `You are K.I.T.T., an AI assistant.

Relevant vehicles:
${relevantCars.map(r => `${r.data.year} ${r.data.make} ${r.data.model} - $${r.data.price}`).join('\n')}

Answer the user's question based on these vehicles.`;

  // Send to Claude...
}
```

---

## Monitoring & Debugging

### Check Index Usage

```sql
-- Verify index is being used
EXPLAIN ANALYZE
SELECT *
FROM cars_for_sale
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[...]'::vector
LIMIT 10;

-- Should show "Index Scan using cars_embedding_idx"
```

### Monitor Performance

```sql
-- Query performance stats
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%embedding <=>%'
ORDER BY mean_exec_time DESC;
```

### Debug Embeddings

```typescript
import { getCacheStats } from './embeddingService';

const stats = getCacheStats();
console.log(`Cache hit rate: ${stats.validEntries}/${stats.totalEntries}`);
```

---

## Migration Guide

If migrating from traditional search:

### Before (SQL LIKE)
```sql
SELECT * FROM cars_for_sale
WHERE
  LOWER(make) LIKE '%mustang%'
  OR LOWER(description) LIKE '%mustang%'
LIMIT 10;
```

### After (Vector Search)
```typescript
const results = await vectorSearchCars("Mustang", { limit: 10 });
```

**Benefits:**
- ✅ Understands "Boss 429" matches "high-performance Mustang"
- ✅ Handles misspellings and variations
- ✅ Semantic understanding ("affordable classic" = price + year filters)
- ✅ Better ranking based on relevance

---

## Cost Analysis

### OpenAI Embedding Costs

| Model | Cost per 1K tokens | Dimensions |
|-------|-------------------|-----------|
| text-embedding-ada-002 | $0.0001 | 1536 |
| text-embedding-3-small | $0.00002 | 1536 |

**Example:**
- 10,000 cars × 500 tokens avg = 5M tokens
- Cost: 5,000 × $0.0001 = **$0.50**
- With 24hr caching, ongoing cost is minimal

---

## Troubleshooting

### Issue: "pgvector extension not found"
```sql
-- Solution:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: "No results returned"
```typescript
// Check coverage:
const coverage = await getVectorSearchCoverage();
console.log(coverage); // Are embeddings generated?

// Lower threshold:
vectorSearchCars(query, { threshold: 0.5 });
```

### Issue: "Slow queries"
```sql
-- Rebuild index with more lists:
DROP INDEX cars_embedding_idx;
CREATE INDEX cars_embedding_idx
ON cars_for_sale
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 316);  -- For ~100k rows

-- Set higher probes:
SET ivfflat.probes = 20;
```

---

## Next Steps

1. ✅ Vector search service implemented
2. ⏭️ Generate embeddings for existing data
3. ⏭️ Integrate with AI chat service
4. ⏭️ Add API endpoints for search
5. ⏭️ Build frontend search UI
6. ⏭️ Set up monitoring and analytics

---

## References

- 📘 [SPEC_04_AI_CHAT_SYSTEM.md](../../../docs/SPEC_04_AI_CHAT_SYSTEM.md)
- 🗄️ [postgres-schema.ts](../../../shared/postgres-schema.ts)
- 🧠 [embeddingService.ts](./embeddingService.ts)
- 🔍 [vectorSearchService.ts](./vectorSearchService.ts)
- 📚 [pgvector Documentation](https://github.com/pgvector/pgvector)
- 🤖 [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-11-17
**Author:** AI Specialist - Vector Search Engineer
