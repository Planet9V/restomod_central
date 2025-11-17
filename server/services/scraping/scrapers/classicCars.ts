// ClassicCars.com Scraper Configuration
// Target: 1,500 classic car listings

import { scrapeWithRetry } from '../playwrightScraper';
import { processAndSaveListings } from '../dataProcessor';
import type { PlaywrightScraperConfig, ScrapeResult, RawListing } from '../../../types/scraping';

/**
 * ClassicCars.com scraper configuration
 */
export const classicCarsConfig: PlaywrightScraperConfig = {
  url: 'https://classiccars.com/listings/find/all-years',

  selectors: {
    // Main listing container
    listing: '.card.listing-card, article[data-listing-id]',

    // Individual fields
    title: '.listing-title, h3.card-title a',
    price: '.listing-price, .price-display',
    make: '[data-make]',
    model: '[data-model]',
    year: '[data-year], .year-display',
    image: '.listing-image img, .card-img-top',
    location: '.listing-location, .location-display',
    description: '.listing-description, .card-text',
  },

  pagination: {
    type: 'click',
    selector: 'a.next, button[aria-label="Next page"], .pagination-next',
    maxPages: 30, // Scrape up to 30 pages (50 listings/page = 1,500 total)
  },

  useProxy: false, // Start without proxy, enable if blocked
  delayRange: [2000, 4000], // 2-4 second delay between actions
  scrollBehavior: 'smooth',
};

/**
 * Scrape ClassicCars.com listings
 */
export async function scrapeClassicCars(maxListings: number = 1500): Promise<ScrapeResult<RawListing>> {
  console.log('[ClassicCars] Starting scraper...');

  const config = {
    ...classicCarsConfig,
    pagination: {
      ...classicCarsConfig.pagination!,
      maxPages: Math.ceil(maxListings / 50), // Adjust pages based on target
    },
  };

  const result = await scrapeWithRetry(config, 3);

  if (result.success && result.data) {
    console.log(`[ClassicCars] Successfully scraped ${result.data.length} listings`);

    // Process and save to database
    const stats = await processAndSaveListings(result.data, 'ClassicCars.com');
    console.log('[ClassicCars] Processing stats:', stats);
  } else {
    console.error('[ClassicCars] Scraping failed:', result.error);
  }

  return result;
}

/**
 * Scrape specific ClassicCars.com category
 */
export async function scrapeClassicCarsByCategory(category: string, maxListings: number = 500): Promise<ScrapeResult<RawListing>> {
  const categoryUrls: Record<string, string> = {
    'muscle': 'https://classiccars.com/listings/find/all-years/american-muscle',
    'classic': 'https://classiccars.com/listings/find/1945-to-1974',
    'vintage': 'https://classiccars.com/listings/find/1919-to-1944',
    'exotic': 'https://classiccars.com/listings/find/all-years/exotic-sports',
    'trucks': 'https://classiccars.com/listings/find/all-years/pickup',
  };

  const url = categoryUrls[category] || classicCarsConfig.url;

  const config = {
    ...classicCarsConfig,
    url,
    pagination: {
      ...classicCarsConfig.pagination!,
      maxPages: Math.ceil(maxListings / 50),
    },
  };

  console.log(`[ClassicCars] Scraping category: ${category} from ${url}`);

  const result = await scrapeWithRetry(config, 3);

  if (result.success && result.data) {
    const stats = await processAndSaveListings(result.data, `ClassicCars.com/${category}`);
    console.log(`[ClassicCars/${category}] Processing stats:`, stats);
  }

  return result;
}

/**
 * Scrape ClassicCars.com by make
 */
export async function scrapeClassicCarsByMake(make: string, maxListings: number = 200): Promise<ScrapeResult<RawListing>> {
  const url = `https://classiccars.com/listings/find/all-years/${make.toLowerCase()}`;

  const config = {
    ...classicCarsConfig,
    url,
    pagination: {
      ...classicCarsConfig.pagination!,
      maxPages: Math.ceil(maxListings / 50),
    },
  };

  console.log(`[ClassicCars] Scraping make: ${make} from ${url}`);

  const result = await scrapeWithRetry(config, 3);

  if (result.success && result.data) {
    const stats = await processAndSaveListings(result.data, `ClassicCars.com/${make}`);
    console.log(`[ClassicCars/${make}] Processing stats:`, stats);
  }

  return result;
}

/**
 * Popular makes to scrape
 */
export const popularMakes = [
  'Ford',
  'Chevrolet',
  'Dodge',
  'Plymouth',
  'Pontiac',
  'Buick',
  'Porsche',
  'Ferrari',
  'Corvette',
  'Mustang',
];

/**
 * Scrape all popular makes (diversified data collection)
 */
export async function scrapeAllPopularMakes(): Promise<void> {
  console.log('[ClassicCars] Starting diversified scraping across popular makes...');

  for (const make of popularMakes) {
    try {
      await scrapeClassicCarsByMake(make, 100); // 100 listings per make

      // Delay between makes to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay

    } catch (error) {
      console.error(`[ClassicCars] Failed to scrape ${make}:`, error);
    }
  }

  console.log('[ClassicCars] Completed diversified scraping');
}
