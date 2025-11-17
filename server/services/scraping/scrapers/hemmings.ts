// Hemmings.com Scraper Configuration
// Target: 1,000 classic car listings

import { scrapeWithRetry } from '../playwrightScraper';
import { processAndSaveListings } from '../dataProcessor';
import type { PlaywrightScraperConfig, ScrapeResult, RawListing } from '../../../types/scraping';

/**
 * Hemmings.com scraper configuration
 */
export const hemmingsConfig: PlaywrightScraperConfig = {
  url: 'https://www.hemmings.com/classifieds/cars-for-sale',

  selectors: {
    // Main listing container
    listing: '.vehicle-card, .listing-item, article.car-listing',

    // Individual fields
    title: '.vehicle-title, h3.listing-title a',
    price: '.vehicle-price, .price-tag',
    make: '[data-make], .make-display',
    model: '[data-model], .model-display',
    year: '[data-year], .year-display',
    image: '.vehicle-image img, .listing-photo img',
    location: '.vehicle-location, .location-text',
    description: '.vehicle-description, .listing-desc',
  },

  pagination: {
    type: 'url',
    urlPattern: 'https://www.hemmings.com/classifieds/cars-for-sale?page={page}',
    maxPages: 20, // 50 listings/page = 1,000 total
  },

  useProxy: false,
  delayRange: [3000, 5000], // 3-5 second delay (more conservative)
  scrollBehavior: 'smooth',
};

/**
 * Scrape Hemmings.com listings
 */
export async function scrapeHemmings(maxListings: number = 1000): Promise<ScrapeResult<RawListing>> {
  console.log('[Hemmings] Starting scraper...');

  const config = {
    ...hemmingsConfig,
    pagination: {
      ...hemmingsConfig.pagination!,
      maxPages: Math.ceil(maxListings / 50),
    },
  };

  const result = await scrapeWithRetry(config, 3);

  if (result.success && result.data) {
    console.log(`[Hemmings] Successfully scraped ${result.data.length} listings`);

    const stats = await processAndSaveListings(result.data, 'Hemmings.com');
    console.log('[Hemmings] Processing stats:', stats);
  } else {
    console.error('[Hemmings] Scraping failed:', result.error);
  }

  return result;
}

/**
 * Scrape Hemmings by category
 */
export async function scrapeHemmingsByCategory(category: string, maxListings: number = 300): Promise<ScrapeResult<RawListing>> {
  const categoryUrls: Record<string, string> = {
    'prewar': 'https://www.hemmings.com/classifieds/cars-for-sale/prewar',
    'muscle': 'https://www.hemmings.com/classifieds/cars-for-sale/muscle-cars',
    'sports': 'https://www.hemmings.com/classifieds/cars-for-sale/sports-cars',
    'trucks': 'https://www.hemmings.com/classifieds/cars-for-sale/trucks',
    'european': 'https://www.hemmings.com/classifieds/cars-for-sale/european',
  };

  const url = categoryUrls[category] || hemmingsConfig.url;

  const config = {
    ...hemmingsConfig,
    url,
    pagination: {
      ...hemmingsConfig.pagination!,
      maxPages: Math.ceil(maxListings / 50),
    },
  };

  console.log(`[Hemmings] Scraping category: ${category}`);

  const result = await scrapeWithRetry(config, 3);

  if (result.success && result.data) {
    const stats = await processAndSaveListings(result.data, `Hemmings.com/${category}`);
    console.log(`[Hemmings/${category}] Processing stats:`, stats);
  }

  return result;
}
