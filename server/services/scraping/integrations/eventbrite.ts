// Eventbrite API Integration
// Official API for automotive events
// Target: 400+ car show events

import type { RawEvent, ScrapeResult } from '../../../types/scraping';
import { processAndSaveEvents } from '../dataProcessor';

/**
 * Eventbrite API configuration
 */
const EVENTBRITE_API_URL = 'https://www.eventbriteapi.com/v3';
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_OAUTH_TOKEN || '';

interface EventbriteSearchParams {
  q?: string;
  'location.address'?: string;
  'location.within'?: string;
  'start_date.range_start'?: string;
  'start_date.range_end'?: string;
  'categories'?: string;
  page?: number;
}

/**
 * Search Eventbrite for automotive events
 */
export async function searchEventbrite(params: EventbriteSearchParams = {}): Promise<ScrapeResult<RawEvent>> {
  if (!EVENTBRITE_TOKEN) {
    return {
      success: false,
      error: 'Eventbrite API token not configured. Set EVENTBRITE_OAUTH_TOKEN in .env',
    };
  }

  try {
    const {
      q = 'car show classic automotive',
      page = 1,
      ...rest
    } = params;

    // Build API URL
    const url = new URL(`${EVENTBRITE_API_URL}/events/search/`);
    url.searchParams.append('q', q);
    url.searchParams.append('page', page.toString());

    // Add additional parameters
    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    console.log('[Eventbrite] Fetching events:', { q, page });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.statusText}`);
    }

    const data = await response.json();
    const events = data.events || [];

    console.log(`[Eventbrite] Found ${events.length} events`);

    // Transform Eventbrite events to RawEvent format
    const rawEvents: RawEvent[] = events.map((event: any) => ({
      name: event.name?.text || '',
      description: event.description?.text || '',
      startDate: event.start?.utc || event.start?.local,
      endDate: event.end?.utc || event.end?.local,
      url: event.url,
      image: event.logo?.url,
      venue: event.venue?.name,
      city: event.venue?.address?.city,
      state: event.venue?.address?.region,
      location: `${event.venue?.address?.city || ''}, ${event.venue?.address?.region || ''}`,
      type: 'car_show',
    }));

    return {
      success: true,
      data: rawEvents,
      metadata: {
        itemsFound: rawEvents.length,
        pagesCrawled: page,
        duration: 0,
        timestamp: new Date(),
      },
    };

  } catch (error: any) {
    console.error('[Eventbrite] API error:', error);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Scrape multiple pages from Eventbrite
 */
export async function scrapeEventbrite(maxEvents: number = 400): Promise<ScrapeResult<RawEvent>> {
  console.log('[Eventbrite] Starting multi-page scraping...');

  const allEvents: RawEvent[] = [];
  const eventsPerPage = 50;
  const totalPages = Math.ceil(maxEvents / eventsPerPage);

  // Get date range (now to 1 year from now)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  for (let page = 1; page <= totalPages; page++) {
    try {
      const result = await searchEventbrite({
        q: 'car show classic automotive vintage muscle',
        'start_date.range_start': startDate.toISOString(),
        'start_date.range_end': endDate.toISOString(),
        page,
      });

      if (result.success && result.data) {
        allEvents.push(...result.data);
        console.log(`[Eventbrite] Page ${page}/${totalPages}: ${result.data.length} events (total: ${allEvents.length})`);
      } else {
        console.error(`[Eventbrite] Page ${page} failed:`, result.error);
      }

      // Delay between pages (rate limit: 1,000 requests/hour)
      if (page < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }

      // Break if no more results
      if (result.data && result.data.length === 0) {
        console.log('[Eventbrite] No more events found');
        break;
      }

    } catch (error) {
      console.error(`[Eventbrite] Failed to fetch page ${page}:`, error);
    }
  }

  console.log(`[Eventbrite] Completed scraping: ${allEvents.length} total events`);

  // Process and save to database
  if (allEvents.length > 0) {
    const stats = await processAndSaveEvents(allEvents, 'Eventbrite');
    console.log('[Eventbrite] Processing stats:', stats);
  }

  return {
    success: true,
    data: allEvents,
    metadata: {
      itemsFound: allEvents.length,
      pagesCrawled: totalPages,
      duration: 0,
      timestamp: new Date(),
    },
  };
}

/**
 * Search events by location
 */
export async function scrapeEventbriteByLocation(city: string, state: string, maxEvents: number = 50): Promise<ScrapeResult<RawEvent>> {
  console.log(`[Eventbrite] Scraping location: ${city}, ${state}`);

  const location = `${city}, ${state}, USA`;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const result = await searchEventbrite({
    q: 'car show classic automotive',
    'location.address': location,
    'location.within': '100mi',
    'start_date.range_start': startDate.toISOString(),
    'start_date.range_end': endDate.toISOString(),
  });

  if (result.success && result.data) {
    const stats = await processAndSaveEvents(result.data, `Eventbrite/${city}`);
    console.log(`[Eventbrite/${city}] Processing stats:`, stats);
  }

  return result;
}

/**
 * Major car show cities in the US
 */
export const majorCarShowCities = [
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Miami', state: 'FL' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Seattle', state: 'WA' },
];

/**
 * Scrape events from major car show cities
 */
export async function scrapeAllMajorCities(): Promise<void> {
  console.log('[Eventbrite] Starting location-based scraping...');

  for (const { city, state } of majorCarShowCities) {
    try {
      await scrapeEventbriteByLocation(city, state, 50);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    } catch (error) {
      console.error(`[Eventbrite] Failed to scrape ${city}, ${state}:`, error);
    }
  }

  console.log('[Eventbrite] Completed location-based scraping');
}

/**
 * Search events by specific keywords
 */
export async function scrapeEventbriteByKeyword(keyword: string, maxEvents: number = 100): Promise<ScrapeResult<RawEvent>> {
  console.log(`[Eventbrite] Scraping keyword: ${keyword}`);

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const allEvents: RawEvent[] = [];
  const pages = Math.ceil(maxEvents / 50);

  for (let page = 1; page <= pages; page++) {
    const result = await searchEventbrite({
      q: keyword,
      'start_date.range_start': startDate.toISOString(),
      'start_date.range_end': endDate.toISOString(),
      page,
    });

    if (result.success && result.data) {
      allEvents.push(...result.data);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (allEvents.length > 0) {
    const stats = await processAndSaveEvents(allEvents, `Eventbrite/${keyword}`);
    console.log(`[Eventbrite/${keyword}] Processing stats:`, stats);
  }

  return {
    success: true,
    data: allEvents,
  };
}

/**
 * Popular automotive event keywords
 */
export const popularEventKeywords = [
  'classic car show',
  'vintage car show',
  'muscle car show',
  'hot rod show',
  'car cruise',
  'cars and coffee',
  'concours',
  'auto auction',
];

/**
 * Scrape events by popular keywords
 */
export async function scrapeAllEventKeywords(): Promise<void> {
  console.log('[Eventbrite] Starting keyword-based scraping...');

  for (const keyword of popularEventKeywords) {
    try {
      await scrapeEventbriteByKeyword(keyword, 30); // 30 events per keyword
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    } catch (error) {
      console.error(`[Eventbrite] Failed to scrape keyword "${keyword}":`, error);
    }
  }

  console.log('[Eventbrite] Completed keyword-based scraping');
}
