// Data Processing Pipeline
// Normalizes, validates, and deduplicates scraped data

import { db } from '../../db';
import { carsForSale, carShowEvents } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import type { RawListing, RawEvent, NormalizedListing, NormalizedEvent } from '../../types/scraping';
import {
  parsePrice,
  parseYear,
  parseLocation,
  parseTitleForDetails,
  cleanDescription,
  normalizeImageUrl,
  generateHash,
  fuzzyMatch,
} from './utils';
import { generateEmbedding } from '../ai/embeddingService';

/**
 * Normalize raw listing data into database format
 */
export function normalizeListing(raw: RawListing, source: string): NormalizedListing {
  // Parse title for details if not explicitly provided
  const titleDetails = parseTitleForDetails(raw.title);

  // Parse location
  const location = parseLocation(raw.location);

  // Parse price
  const price = parsePrice(raw.price);

  // Parse year
  const year = parseYear(raw.year || titleDetails.year);

  return {
    // Vehicle details
    make: raw.make || titleDetails.make,
    model: raw.model || titleDetails.model,
    year: year || undefined,
    title: raw.title,

    // Pricing
    price: price || undefined,

    // Location
    locationCity: location.city,
    locationState: location.state,
    locationCountry: location.country || 'USA',

    // Media
    imageUrl: normalizeImageUrl(raw.image, raw.url),
    images: raw.image ? [normalizeImageUrl(raw.image, raw.url)].filter(Boolean) as string[] : undefined,

    // Content
    description: cleanDescription(raw.description),

    // Source tracking
    sourceType: 'scraped',
    sourceName: source,
    sourceUrl: raw.url,

    // Timestamps
    scrapedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Normalize raw event data into database format
 */
export function normalizeEvent(raw: RawEvent, source: string): NormalizedEvent | null {
  try {
    // Parse dates
    const startDate = new Date(raw.startDate || raw.date || '');
    if (isNaN(startDate.getTime())) {
      console.warn('[DataProcessor] Invalid start date:', raw);
      return null;
    }

    const endDate = raw.endDate ? new Date(raw.endDate) : undefined;

    // Parse location
    const location = parseLocation(raw.location);

    return {
      // Event details
      name: raw.name || 'Untitled Event',
      eventType: raw.type || 'car_show',

      // Dates
      startDate,
      endDate,

      // Location
      venueName: raw.venue,
      city: raw.city || location.city,
      state: raw.state || location.state,
      country: location.country || 'USA',
      address: raw.location,

      // Content
      description: cleanDescription(raw.description),
      imageUrl: normalizeImageUrl(raw.image, raw.url),

      // Source tracking
      sourceType: 'scraped',
      sourceName: source,
      sourceUrl: raw.url,

      // Timestamps
      scrapedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

  } catch (error) {
    console.error('[DataProcessor] Failed to normalize event:', error);
    return null;
  }
}

/**
 * Validate listing has required fields
 */
export function validateListing(listing: NormalizedListing): boolean {
  // Required fields
  if (!listing.make || !listing.model || !listing.year) {
    console.warn('[DataProcessor] Missing required fields (make/model/year):', {
      make: listing.make,
      model: listing.model,
      year: listing.year,
    });
    return false;
  }

  // Year range check
  const currentYear = new Date().getFullYear();
  if (listing.year < 1900 || listing.year > currentYear + 1) {
    console.warn('[DataProcessor] Invalid year:', listing.year);
    return false;
  }

  // Price sanity check (if provided)
  if (listing.price !== undefined && listing.price !== null) {
    if (listing.price < 100 || listing.price > 10000000) {
      console.warn('[DataProcessor] Suspicious price:', listing.price);
      return false;
    }
  }

  return true;
}

/**
 * Validate event has required fields
 */
export function validateEvent(event: NormalizedEvent): boolean {
  // Required fields
  if (!event.name || !event.startDate) {
    console.warn('[DataProcessor] Missing required fields (name/startDate)');
    return false;
  }

  // Date range check (events should be within next 2 years)
  const now = new Date();
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

  if (event.startDate < now || event.startDate > twoYearsFromNow) {
    console.warn('[DataProcessor] Event date out of range:', event.startDate);
    return false;
  }

  return true;
}

/**
 * Check for duplicate listings using VIN, exact match, and fuzzy matching
 */
export async function deduplicateListing(listing: NormalizedListing): Promise<{ isDuplicate: boolean; existingId?: number }> {
  // Strategy 1: Check for exact duplicates by source URL
  if (listing.sourceUrl) {
    const existing = await db.select()
      .from(carsForSale)
      .where(eq(carsForSale.sourceUrl, listing.sourceUrl))
      .limit(1);

    if (existing.length > 0) {
      console.log('[DataProcessor] Duplicate found by source URL:', listing.sourceUrl);
      return { isDuplicate: true, existingId: existing[0].id };
    }
  }

  // Strategy 2: Check for fuzzy duplicates (same make/model/year, similar location)
  if (listing.make && listing.model && listing.year) {
    const fuzzyMatches = await db.select()
      .from(carsForSale)
      .where(
        and(
          eq(carsForSale.make, listing.make),
          eq(carsForSale.model, listing.model),
          eq(carsForSale.year, listing.year),
          listing.locationCity ? eq(carsForSale.locationCity, listing.locationCity) : undefined
        )
      )
      .limit(10);

    for (const match of fuzzyMatches) {
      // Check if prices are similar (within $2,000)
      if (listing.price && match.price) {
        const priceDiff = Math.abs(match.price - listing.price);
        if (priceDiff < 2000) {
          console.log('[DataProcessor] Fuzzy duplicate found (similar price):', {
            existing: match.id,
            priceDiff,
          });
          return { isDuplicate: true, existingId: match.id };
        }
      }

      // Check if titles are similar
      if (listing.title && match.title) {
        if (fuzzyMatch(listing.title, match.title, 0.85)) {
          console.log('[DataProcessor] Fuzzy duplicate found (similar title):', {
            existing: match.id,
            title: listing.title,
          });
          return { isDuplicate: true, existingId: match.id };
        }
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Check for duplicate events
 */
export async function deduplicateEvent(event: NormalizedEvent): Promise<{ isDuplicate: boolean; existingId?: number }> {
  // Strategy 1: Check by source URL
  if (event.sourceUrl) {
    const existing = await db.select()
      .from(carShowEvents)
      .where(eq(carShowEvents.sourceUrl, event.sourceUrl))
      .limit(1);

    if (existing.length > 0) {
      console.log('[DataProcessor] Duplicate event found by source URL:', event.sourceUrl);
      return { isDuplicate: true, existingId: existing[0].id };
    }
  }

  // Strategy 2: Check for same name, date, and location
  const fuzzyMatches = await db.select()
    .from(carShowEvents)
    .where(
      and(
        event.city ? eq(carShowEvents.city, event.city) : undefined,
        event.state ? eq(carShowEvents.state, event.state) : undefined
      )
    )
    .limit(10);

  for (const match of fuzzyMatches) {
    // Check if names are similar and dates match
    if (fuzzyMatch(event.name, match.name, 0.8)) {
      const startDateMatch = Math.abs(event.startDate.getTime() - new Date(match.startDate).getTime()) < 86400000; // Within 1 day

      if (startDateMatch) {
        console.log('[DataProcessor] Duplicate event found (similar name and date):', {
          existing: match.id,
          name: event.name,
        });
        return { isDuplicate: true, existingId: match.id };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Process and save listings to database
 */
export async function processAndSaveListings(
  rawListings: RawListing[],
  source: string
): Promise<{ inserted: number; updated: number; failed: number; duplicates: number }> {
  let inserted = 0;
  let updated = 0;
  let failed = 0;
  let duplicates = 0;

  console.log(`[DataProcessor] Processing ${rawListings.length} listings from ${source}...`);

  for (const raw of rawListings) {
    try {
      // Normalize
      const normalized = normalizeListing(raw, source);

      // Validate
      if (!validateListing(normalized)) {
        failed++;
        continue;
      }

      // Deduplicate
      const { isDuplicate, existingId } = await deduplicateListing(normalized);

      if (isDuplicate) {
        duplicates++;

        // Optionally update existing listing
        if (existingId && normalized.price) {
          await db.update(carsForSale)
            .set({
              price: normalized.price,
              updatedAt: new Date(),
            })
            .where(eq(carsForSale.id, existingId));

          updated++;
        }

        continue;
      }

      // Generate embedding for semantic search
      const embeddingText = `${normalized.year} ${normalized.make} ${normalized.model} ${normalized.description || ''}`.substring(0, 500);
      const embedding = await generateEmbedding(embeddingText);

      // Insert new listing
      await db.insert(carsForSale).values({
        ...normalized,
        embedding: JSON.stringify(embedding),
        status: 'active',
        sellerId: 1, // System user for scraped listings
      } as any);

      inserted++;

    } catch (error) {
      console.error('[DataProcessor] Failed to process listing:', error);
      failed++;
    }
  }

  console.log(`[DataProcessor] Completed: ${inserted} inserted, ${updated} updated, ${duplicates} duplicates, ${failed} failed`);

  return { inserted, updated, failed, duplicates };
}

/**
 * Process and save events to database
 */
export async function processAndSaveEvents(
  rawEvents: RawEvent[],
  source: string
): Promise<{ inserted: number; updated: number; failed: number; duplicates: number }> {
  let inserted = 0;
  let updated = 0;
  let failed = 0;
  let duplicates = 0;

  console.log(`[DataProcessor] Processing ${rawEvents.length} events from ${source}...`);

  for (const raw of rawEvents) {
    try {
      // Normalize
      const normalized = normalizeEvent(raw, source);

      if (!normalized) {
        failed++;
        continue;
      }

      // Validate
      if (!validateEvent(normalized)) {
        failed++;
        continue;
      }

      // Deduplicate
      const { isDuplicate, existingId } = await deduplicateEvent(normalized);

      if (isDuplicate) {
        duplicates++;

        // Optionally update existing event
        if (existingId) {
          await db.update(carShowEvents)
            .set({
              description: normalized.description,
              updatedAt: new Date(),
            })
            .where(eq(carShowEvents.id, existingId));

          updated++;
        }

        continue;
      }

      // Insert new event
      await db.insert(carShowEvents).values({
        ...normalized,
        organizerId: 1, // System user for scraped events
      } as any);

      inserted++;

    } catch (error) {
      console.error('[DataProcessor] Failed to process event:', error);
      failed++;
    }
  }

  console.log(`[DataProcessor] Completed: ${inserted} inserted, ${updated} updated, ${duplicates} duplicates, ${failed} failed`);

  return { inserted, updated, failed, duplicates };
}

/**
 * Batch validate listings
 */
export async function batchValidate(listings: NormalizedListing[]): Promise<{ valid: NormalizedListing[]; invalid: NormalizedListing[] }> {
  const valid: NormalizedListing[] = [];
  const invalid: NormalizedListing[] = [];

  for (const listing of listings) {
    if (validateListing(listing)) {
      valid.push(listing);
    } else {
      invalid.push(listing);
    }
  }

  console.log(`[DataProcessor] Batch validation: ${valid.length} valid, ${invalid.length} invalid`);

  return { valid, invalid };
}

/**
 * Clean up old scraped data (older than X days)
 */
export async function cleanupOldScrapedData(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Delete old scraped listings that haven't been updated
  const result = await db.delete(carsForSale)
    .where(
      and(
        eq(carsForSale.sourceType, 'scraped'),
        // @ts-ignore - less than operator
        carsForSale.updatedAt < cutoffDate
      )
    );

  console.log(`[DataProcessor] Cleaned up ${result.rowCount} old scraped listings`);

  return result.rowCount || 0;
}
