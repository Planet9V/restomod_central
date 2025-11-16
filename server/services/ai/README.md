# AI Services

This directory contains AI-powered services for the RestoMod Central platform.

## Overview

The AI services provide intelligent features including:
- **Vector Embeddings**: Generate semantic embeddings for cars and events
- **Semantic Search**: Find similar vehicles and events using vector similarity
- **Chat Assistant**: K.I.T.T. AI assistant (planned for Phase 1, Task 1.3.2)

## Services

### 1. Embedding Service (`embeddingService.ts`)

Generates 1536-dimensional vector embeddings using OpenAI's `text-embedding-ada-002` model.

#### Features

- **Single Embedding Generation**: Generate embedding for a single text
- **Batch Processing**: Efficiently process up to 625+ items with automatic batching
- **Caching**: 24-hour in-memory cache to avoid redundant API calls
- **Error Handling**: Automatic retry with exponential backoff (up to 3 attempts)
- **Helper Functions**: Pre-built functions for car and event embedding generation

#### API Reference

```typescript
import {
  generateEmbedding,
  generateBatchEmbeddings,
  generateCarEmbedding,
  generateEventEmbedding,
  getCacheStats,
  cleanExpiredCache,
} from './embeddingService';
```

##### `generateEmbedding(text: string): Promise<number[]>`

Generates a single 1536-dimensional embedding vector.

**Parameters:**
- `text` - Text to embed (max 8,000 characters)

**Returns:** Promise resolving to number array with 1536 elements

**Example:**
```typescript
const embedding = await generateEmbedding("1967 Ford Mustang");
// embedding: number[] (1536 dimensions)
```

##### `generateBatchEmbeddings(texts: string[]): Promise<number[][]>`

Generates embeddings for multiple texts with automatic batching (100 at a time).

**Parameters:**
- `texts` - Array of texts to embed

**Returns:** Promise resolving to array of embedding vectors

**Example:**
```typescript
const texts = ["1967 Mustang", "1969 Camaro", "1970 Charger"];
const embeddings = await generateBatchEmbeddings(texts);
// embeddings: number[][] (array of 1536-dimensional vectors)
```

##### `generateCarEmbedding(car: CarForSale): string`

Generates optimized embedding text from a car object.

**Parameters:**
- `car` - CarForSale object from database

**Returns:** Combined text string ready for embedding

**Includes:**
- Year, make, model
- Price
- Colors (exterior/interior)
- Engine and transmission
- Mileage
- Investment grade and appreciation rate
- Market trend
- Category and condition
- Location
- Description
- Features
- Research notes

**Example:**
```typescript
const car = await db.select().from(carsForSale).where(eq(carsForSale.id, 1));
const embeddingText = generateCarEmbedding(car[0]);
const embedding = await generateEmbedding(embeddingText);
```

##### `generateEventEmbedding(event: CarShowEvent): string`

Generates optimized embedding text from an event object.

**Parameters:**
- `event` - CarShowEvent object from database

**Returns:** Combined text string ready for embedding

**Includes:**
- Event name
- Location (city, state, country)
- Venue name
- Date range
- Event type and category
- Vehicle makes and models
- Expected attendance
- Description
- Features (food vendors, swap meet, live music, etc.)
- Entry fees
- Organizer info
- Special notes

**Example:**
```typescript
const event = await db.select().from(carShowEvents).where(eq(carShowEvents.id, 1));
const embeddingText = generateEventEmbedding(event[0]);
const embedding = await generateEmbedding(embeddingText);
```

##### `getCacheStats(): CacheStats`

Returns cache performance statistics.

**Returns:**
```typescript
{
  totalEntries: number,
  validEntries: number,
  expiredEntries: number,
  cacheTTL: number,
  model: string,
  dimensions: number
}
```

##### `cleanExpiredCache(): void`

Manually removes expired cache entries. Called automatically every hour.

#### Configuration

The service requires the `OPENAI_API_KEY` environment variable:

```bash
# .env
OPENAI_API_KEY="sk-your-api-key-here"
```

Get your API key from: https://platform.openai.com/api-keys

#### Constants

```typescript
EMBEDDING_MODEL = 'text-embedding-ada-002'
EMBEDDING_DIMENSIONS = 1536
MAX_TEXT_LENGTH = 8000
BATCH_SIZE = 100
CACHE_TTL = 24 hours
MAX_RETRIES = 3
```

#### Cost Estimation

**Model:** OpenAI `text-embedding-ada-002`
**Cost:** $0.0001 per 1,000 tokens

**Estimated costs for initial data:**
- 625 cars × ~200 tokens avg = 125,000 tokens ≈ $0.0125
- 223 events × ~150 tokens avg = 33,450 tokens ≈ $0.0033
- **Total:** ~$0.016 for initial embedding generation

**With caching:**
- Subsequent requests for the same text = $0 (cache hit)
- Cache persists for 24 hours

#### Performance

- **Single embedding:** ~200ms average
- **Batch (100 items):** ~2-3 seconds
- **625 cars:** ~40-50 seconds (7 batches)
- **223 events:** ~10-15 seconds (3 batches)

#### Error Handling

The service implements automatic retry with exponential backoff:

1. **Attempt 1:** Immediate
2. **Attempt 2:** Wait 1 second
3. **Attempt 3:** Wait 2 seconds
4. **Attempt 4:** Wait 4 seconds

If all attempts fail, throws error with detailed message.

Common errors:
- `Invalid API key`: Check OPENAI_API_KEY in .env
- `Rate limit exceeded`: Service will automatically retry
- `Invalid embedding dimensions`: Contact support

#### Cache Behavior

- **TTL:** 24 hours from creation
- **Storage:** In-memory (lost on server restart)
- **Key:** SHA-256 hash of input text
- **Auto-cleanup:** Every 60 minutes
- **Manual cleanup:** Call `cleanExpiredCache()`

#### Best Practices

1. **Batch whenever possible**: Use `generateBatchEmbeddings()` for multiple items
2. **Monitor cache**: Call `getCacheStats()` periodically
3. **Handle errors gracefully**: Implement retry logic in your application
4. **Validate input**: Ensure text is not empty and under 8,000 characters
5. **Store embeddings**: Save to database to avoid regeneration

#### Integration Example

See `embeddingServiceExample.ts` for complete integration examples.

**Basic workflow:**
```typescript
// 1. Fetch data from database
const cars = await db.select().from(carsForSale);

// 2. Generate embedding texts
const texts = cars.map(car => generateCarEmbedding(car));

// 3. Generate embeddings in batch
const embeddings = await generateBatchEmbeddings(texts);

// 4. Store embeddings in database
for (let i = 0; i < cars.length; i++) {
  await db.update(carsForSale)
    .set({ embedding: JSON.stringify(embeddings[i]) })
    .where(eq(carsForSale.id, cars[i].id));
}
```

## Testing

To test the embedding service:

1. Set your OpenAI API key in `.env`:
   ```bash
   OPENAI_API_KEY="sk-your-actual-key"
   ```

2. Run a simple test:
   ```typescript
   import { generateEmbedding } from './services/ai/embeddingService';

   const embedding = await generateEmbedding("Test embedding");
   console.log(`Success! Generated ${embedding.length}-dimensional vector`);
   ```

## Upcoming Services

### Vector Search Service (Phase 1, Task 1.3.2)
- PostgreSQL pgvector integration
- Semantic similarity search
- Hybrid search (vector + filters)

### Chat Service (Phase 1, Task 1.3.3)
- Anthropic Claude integration
- K.I.T.T. AI assistant
- Streaming responses (SSE)
- Context-aware conversations

## Support

For issues or questions:
1. Check the examples in `embeddingServiceExample.ts`
2. Review the specification in `docs/SPEC_04_AI_CHAT_SYSTEM.md`
3. Verify your OpenAI API key is correctly set
4. Check OpenAI API status: https://status.openai.com

## Version History

- **v1.0.0** (2025-11-16) - Initial release
  - OpenAI embedding generation
  - 24-hour caching
  - Batch processing
  - Error handling with retry logic
  - Helper functions for cars and events
