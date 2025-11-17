/**
 * Vector Search Service - Usage Examples
 *
 * This file demonstrates how to use the vector search service for
 * semantic search across cars and events using OpenAI embeddings + pgvector.
 *
 * @see vectorSearchService.ts for implementation details
 * @see docs/SPEC_04_AI_CHAT_SYSTEM.md for full specification
 */

import {
  vectorSearchCars,
  vectorSearchEvents,
  hybridSearchCars,
  findSimilarCars,
  findSimilarEvents,
  getVectorSearchCoverage,
  testVectorSearch,
  type VectorSearchOptions,
  type SearchFilters,
} from './vectorSearchService';

// ============================================================================
// EXAMPLE 1: Basic Vector Search for Cars
// ============================================================================

/**
 * Search for cars using natural language
 */
async function example1_basicCarSearch() {
  console.log('\n=== Example 1: Basic Car Search ===');

  const results = await vectorSearchCars(
    "affordable blue Mustang fastback from the 60s",
    {
      limit: 5,
      threshold: 0.75, // Only return results with >75% similarity
    }
  );

  console.log(`Found ${results.length} matching cars:`);
  results.forEach((result, idx) => {
    const car = result.data;
    console.log(`
${idx + 1}. ${car.year} ${car.make} ${car.model}
   Price: $${car.price}
   Location: ${car.locationCity}, ${car.locationState}
   Similarity: ${(result.similarity * 100).toFixed(1)}%
   Investment Grade: ${car.investmentGrade}
    `);
  });

  return results;
}

// ============================================================================
// EXAMPLE 2: Vector Search with Filters
// ============================================================================

/**
 * Search for cars with price and location constraints
 */
async function example2_searchWithFilters() {
  console.log('\n=== Example 2: Search with Filters ===');

  const filters: SearchFilters = {
    priceMin: 30000,
    priceMax: 80000,
    yearMin: 1965,
    yearMax: 1970,
    locationState: 'CA',
  };

  const results = await vectorSearchCars(
    "classic muscle car with V8 engine",
    {
      limit: 10,
      threshold: 0.7,
      filters,
    }
  );

  console.log(`Found ${results.length} cars in California, $30k-$80k, 1965-1970:`);
  results.forEach((result) => {
    const car = result.data;
    console.log(`- ${car.year} ${car.make} ${car.model}: $${car.price} (${(result.similarity * 100).toFixed(1)}% match)`);
  });

  return results;
}

// ============================================================================
// EXAMPLE 3: Hybrid Search with Boosting
// ============================================================================

/**
 * Hybrid search combines vector similarity with business logic
 * - Featured cars get a boost
 * - Investment grade affects ranking
 * - Exact keyword matches get extra weight
 */
async function example3_hybridSearch() {
  console.log('\n=== Example 3: Hybrid Search ===');

  const results = await hybridSearchCars(
    "Chevrolet Corvette investment opportunity",
    {
      limit: 5,
      threshold: 0.65, // Lower threshold since we're boosting results
      boostFeatured: true, // Featured cars rank higher
      filters: {
        investmentGrade: 'A+', // Only top-tier investment vehicles
      },
    }
  );

  console.log(`Found ${results.length} investment-grade Corvettes:`);
  results.forEach((result, idx) => {
    const car = result.data;
    console.log(`
${idx + 1}. ${car.year} ${car.make} ${car.model}
   Price: $${car.price}
   Investment Grade: ${car.investmentGrade}
   Appreciation Rate: ${car.appreciationRate}%/year
   Market Trend: ${car.marketTrend}
   Featured: ${car.featured ? 'YES' : 'No'}
   Hybrid Score: ${(result.similarity * 100).toFixed(1)}%
    `);
  });

  return results;
}

// ============================================================================
// EXAMPLE 4: Find Similar Cars
// ============================================================================

/**
 * Find cars similar to a specific car
 * Useful for "You might also like" features
 */
async function example4_findSimilarCars() {
  console.log('\n=== Example 4: Find Similar Cars ===');

  const targetCarId = 123; // Example car ID

  const similarCars = await findSimilarCars(targetCarId, 5);

  console.log(`Cars similar to car #${targetCarId}:`);
  similarCars.forEach((result, idx) => {
    const car = result.data;
    console.log(`
${idx + 1}. ${car.year} ${car.make} ${car.model}
   Price: $${car.price}
   Similarity: ${(result.similarity * 100).toFixed(1)}%
    `);
  });

  return similarCars;
}

// ============================================================================
// EXAMPLE 5: Search Events
// ============================================================================

/**
 * Search for car show events using natural language
 */
async function example5_searchEvents() {
  console.log('\n=== Example 5: Search Events ===');

  const results = await vectorSearchEvents(
    "Mustang car show in Southern California this summer",
    {
      limit: 10,
      threshold: 0.7,
      filters: {
        state: 'CA',
        startDateMin: new Date('2025-06-01'),
        startDateMax: new Date('2025-08-31'),
      },
    }
  );

  console.log(`Found ${results.length} Mustang events in CA this summer:`);
  results.forEach((result, idx) => {
    const event = result.data;
    const date = new Date(event.startDate).toLocaleDateString();
    console.log(`
${idx + 1}. ${event.eventName}
   Date: ${date}
   Location: ${event.city}, ${event.state}
   Type: ${event.eventType}
   Venue: ${event.venueName || event.venue}
   Similarity: ${(result.similarity * 100).toFixed(1)}%
    `);
  });

  return results;
}

// ============================================================================
// EXAMPLE 6: Find Similar Events
// ============================================================================

/**
 * Find events similar to a specific event
 */
async function example6_findSimilarEvents() {
  console.log('\n=== Example 6: Find Similar Events ===');

  const targetEventId = 456; // Example event ID

  const similarEvents = await findSimilarEvents(targetEventId, 5);

  console.log(`Events similar to event #${targetEventId}:`);
  similarEvents.forEach((result, idx) => {
    const event = result.data;
    const date = new Date(event.startDate).toLocaleDateString();
    console.log(`
${idx + 1}. ${event.eventName}
   Date: ${date}
   Location: ${event.city}, ${event.state}
   Similarity: ${(result.similarity * 100).toFixed(1)}%
    `);
  });

  return similarEvents;
}

// ============================================================================
// EXAMPLE 7: Multi-filter Advanced Search
// ============================================================================

/**
 * Complex search with multiple filters
 */
async function example7_advancedSearch() {
  console.log('\n=== Example 7: Advanced Multi-Filter Search ===');

  const filters: SearchFilters = {
    make: 'Ford',
    category: 'Muscle Cars',
    yearMin: 1968,
    yearMax: 1973,
    priceMax: 100000,
    investmentGrade: 'A',
  };

  const results = await vectorSearchCars(
    "restored Boss engine performance upgrades",
    {
      limit: 5,
      threshold: 0.7,
      filters,
      boostFeatured: true,
    }
  );

  console.log(`Found ${results.length} matching Ford muscle cars:`);
  results.forEach((result) => {
    const car = result.data;
    console.log(`
- ${car.year} ${car.make} ${car.model}
  Engine: ${car.engine}
  Transmission: ${car.transmission}
  Price: $${car.price}
  Match: ${(result.similarity * 100).toFixed(1)}%
    `);
  });

  return results;
}

// ============================================================================
// EXAMPLE 8: Check Vector Search Coverage
// ============================================================================

/**
 * Get statistics on how many items have embeddings
 */
async function example8_checkCoverage() {
  console.log('\n=== Example 8: Vector Search Coverage ===');

  const coverage = await getVectorSearchCoverage();

  console.log(`
Cars:
  Total Active: ${coverage.cars.total}
  With Embeddings: ${coverage.cars.withEmbedding}
  Coverage: ${coverage.cars.coveragePercent}%

Events:
  Total Active: ${coverage.events.total}
  With Embeddings: ${coverage.events.withEmbedding}
  Coverage: ${coverage.events.coveragePercent}%
  `);

  return coverage;
}

// ============================================================================
// EXAMPLE 9: Test Vector Search Setup
// ============================================================================

/**
 * Test that pgvector is working correctly
 */
async function example9_testSetup() {
  console.log('\n=== Example 9: Test Vector Search Setup ===');

  const testResult = await testVectorSearch();

  if (testResult.success) {
    console.log('✅ Vector search is working correctly!');
    console.log(`   Message: ${testResult.message}`);
  } else {
    console.log('❌ Vector search test failed!');
    console.log(`   Error: ${testResult.error}`);
  }

  return testResult;
}

// ============================================================================
// EXAMPLE 10: Integration with AI Chat
// ============================================================================

/**
 * Example of how to use vector search in the AI chat system
 */
async function example10_aiChatIntegration() {
  console.log('\n=== Example 10: AI Chat Integration ===');

  // User asks: "Show me affordable classic cars under $50k"
  const userMessage = "Show me affordable classic cars under $50k";

  // Generate context using vector search
  const relevantCars = await vectorSearchCars(userMessage, {
    limit: 5,
    threshold: 0.7,
    filters: { priceMax: 50000 },
  });

  // Build context string for Claude
  const contextString = relevantCars.map((result, idx) => {
    const car = result.data;
    return `
${idx + 1}. ${car.year} ${car.make} ${car.model}
   - Price: $${car.price}
   - Investment Grade: ${car.investmentGrade}
   - Location: ${car.locationCity}, ${car.locationState}
   - Description: ${car.description?.substring(0, 150)}...
   - Similarity: ${(result.similarity * 100).toFixed(1)}%
    `.trim();
  }).join('\n\n');

  console.log('Context for AI:');
  console.log(contextString);

  // This context would be included in the system prompt for Claude
  const systemPrompt = `You are K.I.T.T., an AI assistant for a classic car marketplace.

Here are relevant vehicles from our inventory:

${contextString}

Answer the user's question based on these vehicles.`;

  console.log('\n--- System Prompt Built ---');
  console.log(systemPrompt.substring(0, 500) + '...');

  return { relevantCars, systemPrompt };
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

/**
 * Main function to run all examples
 */
export async function runAllExamples() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Vector Search Service - Comprehensive Examples          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    // Test setup first
    await example9_testSetup();

    // Check coverage
    await example8_checkCoverage();

    // Search examples
    await example1_basicCarSearch();
    await example2_searchWithFilters();
    await example3_hybridSearch();
    await example5_searchEvents();

    // Similarity examples
    // await example4_findSimilarCars(); // Uncomment if you have a valid car ID
    // await example6_findSimilarEvents(); // Uncomment if you have a valid event ID

    // Advanced examples
    await example7_advancedSearch();
    await example10_aiChatIntegration();

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Example failed:', error);
    throw error;
  }
}

// Export individual examples for selective testing
export {
  example1_basicCarSearch,
  example2_searchWithFilters,
  example3_hybridSearch,
  example4_findSimilarCars,
  example5_searchEvents,
  example6_findSimilarEvents,
  example7_advancedSearch,
  example8_checkCoverage,
  example9_testSetup,
  example10_aiChatIntegration,
};

// ============================================================================
// USAGE IN API ENDPOINTS
// ============================================================================

/**
 * Example API endpoint integration
 *
 * // In your Express route:
 *
 * router.get('/api/cars/search', async (req, res) => {
 *   try {
 *     const { q, limit = 10, priceMin, priceMax, make } = req.query;
 *
 *     const results = await vectorSearchCars(q as string, {
 *       limit: parseInt(limit as string),
 *       threshold: 0.7,
 *       filters: {
 *         priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
 *         priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
 *         make: make as string,
 *       },
 *     });
 *
 *     res.json({
 *       success: true,
 *       results: results.map(r => ({
 *         ...r.data,
 *         similarity: r.similarity,
 *       })),
 *     });
 *
 *   } catch (error) {
 *     res.status(500).json({ success: false, error: error.message });
 *   }
 * });
 */

// ============================================================================
// PERFORMANCE NOTES
// ============================================================================

/**
 * pgvector Performance Tips:
 *
 * 1. **Indexes**: Make sure you have IVFFlat indexes:
 *    CREATE INDEX ON cars_for_sale USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
 *
 * 2. **Lists Parameter**: For IVFFlat index, choose lists = sqrt(total_rows)
 *    - For 10,000 cars: lists = 100
 *    - For 100,000 cars: lists = 316
 *    - For 1,000,000 cars: lists = 1000
 *
 * 3. **Probes**: At query time, you can set:
 *    SET ivfflat.probes = 10; // Higher = more accurate but slower
 *
 * 4. **Similarity Operators**:
 *    - <=> (cosine distance) - RECOMMENDED for text embeddings
 *    - <-> (L2 distance) - Good for spatial data
 *    - <#> (inner product) - Fast but less accurate
 *
 * 5. **Query Optimization**:
 *    - Always include WHERE embedding IS NOT NULL
 *    - Use threshold filtering to reduce results
 *    - Combine with traditional indexes on make, year, price
 *
 * 6. **Caching**:
 *    - The embeddingService already caches embeddings for 24 hours
 *    - Consider caching popular queries at the API level
 */
