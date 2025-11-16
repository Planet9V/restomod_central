/**
 * OpenAI Embedding Service
 *
 * Generates vector embeddings for semantic search using OpenAI's text-embedding-ada-002 model.
 * Includes caching, batch processing, error handling, and retry logic.
 *
 * Features:
 * - Single embedding generation
 * - Batch embeddings (100 items at a time)
 * - 24-hour caching layer
 * - Automatic retry with exponential backoff
 * - Helper functions for car and event embedding text generation
 */

import OpenAI from 'openai';
import * as crypto from 'crypto';
import type { CarForSale, CarShowEvent } from '../../../shared/schema';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_TEXT_LENGTH = 8000; // ~8K tokens limit
const BATCH_SIZE = 100; // OpenAI allows up to 2048, but we use 100 for safety
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// In-memory cache with TTL
interface CacheEntry {
  embedding: number[];
  timestamp: number;
}

const embeddingCache = new Map<string, CacheEntry>();

/**
 * Generate a cache key from text content
 */
function generateCacheKey(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Get embedding from cache if available and valid
 */
function getCachedEmbedding(text: string): number[] | null {
  const cacheKey = generateCacheKey(text);
  const entry = embeddingCache.get(cacheKey);

  if (entry && isCacheValid(entry)) {
    return entry.embedding;
  }

  // Remove expired entry
  if (entry) {
    embeddingCache.delete(cacheKey);
  }

  return null;
}

/**
 * Store embedding in cache
 */
function setCachedEmbedding(text: string, embedding: number[]): void {
  const cacheKey = generateCacheKey(text);
  embeddingCache.set(cacheKey, {
    embedding,
    timestamp: Date.now(),
  });
}

/**
 * Clean up expired cache entries (called periodically)
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of embeddingCache.entries()) {
    if (now - entry.timestamp >= CACHE_TTL) {
      embeddingCache.delete(key);
    }
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a single embedding with retry logic
 *
 * @param text - Text to generate embedding for
 * @param retryCount - Current retry attempt (used internally)
 * @returns Promise<number[]> - 1536-dimensional embedding vector
 */
export async function generateEmbedding(
  text: string,
  retryCount = 0
): Promise<number[]> {
  // Check cache first
  const cached = getCachedEmbedding(text);
  if (cached) {
    return cached;
  }

  try {
    // Trim text to max length
    const trimmedText = text.substring(0, MAX_TEXT_LENGTH);

    // Generate embedding
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: trimmedText,
    });

    const embedding = response.data[0].embedding;

    // Validate embedding dimensions
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${embedding.length}`
      );
    }

    // Cache the result
    setCachedEmbedding(text, embedding);

    return embedding;

  } catch (error: any) {
    // Check if we should retry
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff

      console.warn(
        `Embedding generation failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}), ` +
        `retrying in ${delay}ms...`,
        error.message
      );

      await sleep(delay);
      return generateEmbedding(text, retryCount + 1);
    }

    // All retries exhausted
    console.error('Embedding generation failed after all retries:', error);
    throw new Error(
      `Failed to generate embedding after ${MAX_RETRIES + 1} attempts: ${error.message}`
    );
  }
}

/**
 * Generate embeddings for multiple texts in batches
 *
 * @param texts - Array of texts to generate embeddings for
 * @returns Promise<number[][]> - Array of 1536-dimensional embedding vectors
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const results: number[][] = [];
  const uncachedTexts: string[] = [];
  const uncachedIndices: number[] = [];

  // Check cache for each text
  for (let i = 0; i < texts.length; i++) {
    const cached = getCachedEmbedding(texts[i]);
    if (cached) {
      results[i] = cached;
    } else {
      uncachedTexts.push(texts[i].substring(0, MAX_TEXT_LENGTH));
      uncachedIndices.push(i);
    }
  }

  // If all texts were cached, return early
  if (uncachedTexts.length === 0) {
    return results;
  }

  // Process uncached texts in batches
  for (let i = 0; i < uncachedTexts.length; i += BATCH_SIZE) {
    const batch = uncachedTexts.slice(i, i + BATCH_SIZE);
    const batchIndices = uncachedIndices.slice(i, i + BATCH_SIZE);

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
      });

      // Store results and cache
      response.data.forEach((item, batchIdx) => {
        const embedding = item.embedding;
        const originalIdx = batchIndices[batchIdx];
        const originalText = texts[originalIdx];

        // Validate dimensions
        if (embedding.length !== EMBEDDING_DIMENSIONS) {
          throw new Error(
            `Invalid embedding dimensions at index ${originalIdx}: ` +
            `expected ${EMBEDDING_DIMENSIONS}, got ${embedding.length}`
          );
        }

        results[originalIdx] = embedding;
        setCachedEmbedding(originalText, embedding);
      });

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < uncachedTexts.length) {
        await sleep(100);
      }

    } catch (error: any) {
      console.error(`Batch embedding generation failed for batch starting at index ${i}:`, error);
      throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
  }

  return results;
}

/**
 * Generate embedding text for a car listing
 * Combines key fields for rich semantic representation
 *
 * @param car - Car for sale object
 * @returns string - Combined text for embedding generation
 */
export function generateCarEmbedding(car: CarForSale): string {
  const parts: string[] = [];

  // Year, make, model (most important)
  parts.push(`${car.year} ${car.make} ${car.model}`);

  // Price
  if (car.price) {
    parts.push(`Price: ${car.price}`);
  }

  // Colors
  if (car.exteriorColor) {
    parts.push(`Exterior Color: ${car.exteriorColor}`);
  }
  if (car.interiorColor) {
    parts.push(`Interior Color: ${car.interiorColor}`);
  }

  // Mechanical details
  if (car.engine) {
    parts.push(`Engine: ${car.engine}`);
  }
  if (car.transmission) {
    parts.push(`Transmission: ${car.transmission}`);
  }

  // Mileage
  if (car.mileage !== null && car.mileage !== undefined) {
    parts.push(`Mileage: ${car.mileage.toLocaleString()} miles`);
  }

  // Investment details
  if (car.investmentGrade) {
    parts.push(`Investment Grade: ${car.investmentGrade}`);
  }
  if (car.appreciationRate) {
    parts.push(`Appreciation Rate: ${car.appreciationRate}`);
  }
  if (car.marketTrend) {
    parts.push(`Market Trend: ${car.marketTrend}`);
  }

  // Category and condition
  if (car.category) {
    parts.push(`Category: ${car.category}`);
  }
  if (car.condition) {
    parts.push(`Condition: ${car.condition}`);
  }

  // Location
  if (car.locationCity && car.locationState) {
    parts.push(`Location: ${car.locationCity}, ${car.locationState}`);
  } else if (car.locationState) {
    parts.push(`Location: ${car.locationState}`);
  }

  // Description (truncated if too long)
  if (car.description) {
    const desc = car.description.length > 500
      ? car.description.substring(0, 500) + '...'
      : car.description;
    parts.push(desc);
  }

  // Features (if JSON parseable)
  if (car.features) {
    try {
      const features = typeof car.features === 'string'
        ? JSON.parse(car.features)
        : car.features;

      if (Array.isArray(features)) {
        parts.push(`Features: ${features.join(', ')}`);
      } else if (typeof features === 'object') {
        const activeFeatures = Object.keys(features).filter(k => features[k]);
        if (activeFeatures.length > 0) {
          parts.push(`Features: ${activeFeatures.join(', ')}`);
        }
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }

  // Research notes
  if (car.researchNotes) {
    parts.push(car.researchNotes);
  }

  return parts.filter(Boolean).join('. ');
}

/**
 * Generate embedding text for a car show event
 * Combines key fields for rich semantic representation
 *
 * @param event - Car show event object
 * @returns string - Combined text for embedding generation
 */
export function generateEventEmbedding(event: CarShowEvent): string {
  const parts: string[] = [];

  // Event name (most important)
  parts.push(event.eventName);

  // Location
  const locationParts: string[] = [];
  if (event.city) locationParts.push(event.city);
  if (event.state) locationParts.push(event.state);
  if (event.country && event.country !== 'USA') locationParts.push(event.country);
  if (locationParts.length > 0) {
    parts.push(`Location: ${locationParts.join(', ')}`);
  }

  // Venue
  if (event.venueName) {
    parts.push(`Venue: ${event.venueName}`);
  } else if (event.venue) {
    parts.push(`Venue: ${event.venue}`);
  }

  // Date
  if (event.startDate) {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    if (endDate && endDate.getTime() !== startDate.getTime()) {
      parts.push(
        `Date: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
      );
    } else {
      parts.push(`Date: ${startDate.toLocaleDateString()}`);
    }
  }

  // Event type and category
  if (event.eventType) {
    parts.push(`Type: ${event.eventType}`);
  }
  if (event.eventCategory) {
    parts.push(`Category: ${event.eventCategory}`);
  }

  // Vehicle focus
  if (event.vehicleMakes) {
    try {
      const makes = typeof event.vehicleMakes === 'string'
        ? JSON.parse(event.vehicleMakes)
        : event.vehicleMakes;
      if (Array.isArray(makes) && makes.length > 0) {
        parts.push(`Vehicle Makes: ${makes.join(', ')}`);
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }

  if (event.vehicleModels) {
    try {
      const models = typeof event.vehicleModels === 'string'
        ? JSON.parse(event.vehicleModels)
        : event.vehicleModels;
      if (Array.isArray(models) && models.length > 0) {
        parts.push(`Vehicle Models: ${models.join(', ')}`);
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }

  // Expected attendance
  if (event.expectedAttendanceMin && event.expectedAttendanceMax) {
    parts.push(
      `Expected Attendance: ${event.expectedAttendanceMin}-${event.expectedAttendanceMax}`
    );
  } else if (event.expectedAttendance) {
    parts.push(`Expected Attendance: ${event.expectedAttendance}`);
  }

  // Description
  if (event.description) {
    const desc = event.description.length > 500
      ? event.description.substring(0, 500) + '...'
      : event.description;
    parts.push(desc);
  }

  // Features and amenities
  const eventFeatures: string[] = [];
  if (event.foodVendors) eventFeatures.push('Food Vendors');
  if (event.swapMeet) eventFeatures.push('Swap Meet');
  if (event.liveMusic) eventFeatures.push('Live Music');
  if (event.kidsActivities) eventFeatures.push('Kids Activities');

  if (eventFeatures.length > 0) {
    parts.push(`Features: ${eventFeatures.join(', ')}`);
  }

  // Entry fees
  if (event.entryFeeSpectator) {
    parts.push(`Spectator Fee: ${event.entryFeeSpectator}`);
  }
  if (event.entryFeeParticipant) {
    parts.push(`Participant Fee: ${event.entryFeeParticipant}`);
  }

  // Organizer
  if (event.organizerName) {
    parts.push(`Organizer: ${event.organizerName}`);
  }

  // Special notes
  if (event.specialNotes) {
    parts.push(event.specialNotes);
  }

  return parts.filter(Boolean).join('. ');
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const entry of embeddingCache.values()) {
    if (isCacheValid(entry)) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: embeddingCache.size,
    validEntries,
    expiredEntries,
    cacheTTL: CACHE_TTL,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  };
}

// Set up periodic cache cleanup (every hour)
setInterval(cleanExpiredCache, 60 * 60 * 1000);

// Export constants for use in other services
export {
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  BATCH_SIZE,
  MAX_TEXT_LENGTH,
};
