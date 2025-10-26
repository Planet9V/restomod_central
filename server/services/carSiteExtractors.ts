/**
 * Website-specific extractors for classic car listing sites
 * Each extractor knows how to parse a specific website's structure
 */

import { Page } from 'playwright';
import { CarListing, parsePrice, parseYear, cleanText } from './playwrightScraper.js';

export interface SiteExtractor {
  name: string;
  searchUrl: (query: string, page?: number) => string;
  extractListings: (page: Page) => Promise<Partial<CarListing>[]>;
  extractDetails: (page: Page, url: string) => Promise<Partial<CarListing>>;
}

/**
 * ClassicCars.com extractor
 */
export const ClassicCarsExtractor: SiteExtractor = {
  name: 'ClassicCars.com',

  searchUrl: (query: string, pageNum = 1) => {
    const encoded = encodeURIComponent(query);
    return `https://classiccars.com/listings/find?q=${encoded}&p=${pageNum}`;
  },

  extractListings: async (page: Page): Promise<Partial<CarListing>[]> => {
    const listings: Partial<CarListing>[] = [];

    try {
      // Wait for listings to load
      await page.waitForSelector('[data-testid="listing-card"], .listing-item, .vehicle-card', {
        timeout: 10000
      }).catch(() => console.log('Listing cards not found with standard selectors'));

      // Extract listing cards
      const cards = await page.$$('[data-testid="listing-card"], .listing-item, .vehicle-card, .result-item');

      for (const card of cards) {
        try {
          const title = await card.$eval('h3, h2, .title, .vehicle-title', el => el.textContent?.trim() || '').catch(() => '');
          const priceText = await card.$eval('.price, .asking-price, [data-testid="price"]', el => el.textContent?.trim() || '').catch(() => '');
          const location = await card.$eval('.location, .seller-location', el => el.textContent?.trim() || '').catch(() => null);
          const url = await card.$eval('a', el => el.getAttribute('href') || '').catch(() => '');

          if (title && url) {
            listings.push({
              title: cleanText(title),
              priceText: cleanText(priceText),
              price: parsePrice(priceText),
              location,
              url: url.startsWith('http') ? url : `https://classiccars.com${url}`,
              source: 'ClassicCars.com',
              year: parseYear(title)
            });
          }
        } catch (error) {
          console.error('Error extracting card:', error);
        }
      }
    } catch (error) {
      console.error('Error in ClassicCars extractor:', error);
    }

    return listings;
  },

  extractDetails: async (page: Page, url: string): Promise<Partial<CarListing>> => {
    const details: Partial<CarListing> = { url, source: 'ClassicCars.com' };

    try {
      // Title
      details.title = await page.$eval('h1, .vehicle-title', el => cleanText(el.textContent || '')).catch(() => '');

      // Price
      const priceText = await page.$eval('.price, .asking-price', el => el.textContent?.trim() || '').catch(() => '');
      details.priceText = priceText;
      details.price = parsePrice(priceText);

      // Description
      details.description = await page.$eval('.description, .vehicle-description, #description', el => cleanText(el.textContent || '')).catch(() => '');

      // Images
      const images = await page.$$eval('.gallery img, .image-gallery img', imgs =>
        imgs.map(img => img.getAttribute('src') || '').filter(Boolean)
      ).catch(() => []);
      details.images = images;

      // Specs
      const specs = await page.$$eval('.specs li, .vehicle-specs dt, .specifications dd', els =>
        els.map(el => cleanText(el.textContent || ''))
      ).catch(() => []);

      // Parse specs
      for (const spec of specs) {
        const lower = spec.toLowerCase();
        if (lower.includes('mileage')) {
          const match = spec.match(/[\d,]+/);
          if (match) details.mileage = parseInt(match[0].replace(/,/g, ''), 10);
        } else if (lower.includes('engine')) {
          details.engine = spec;
        } else if (lower.includes('transmission')) {
          details.transmission = spec;
        } else if (lower.includes('exterior')) {
          details.exteriorColor = spec.split(':')[1]?.trim();
        } else if (lower.includes('interior')) {
          details.interiorColor = spec.split(':')[1]?.trim();
        } else if (lower.includes('vin')) {
          details.vin = spec.split(':')[1]?.trim();
        }
      }

      // Year from title
      if (details.title) {
        details.year = parseYear(details.title);

        // Parse make/model
        const parts = details.title.split(' ');
        if (parts.length >= 3) {
          details.make = parts[1];
          details.model = parts.slice(2).join(' ');
        }
      }

      // Location
      details.location = await page.$eval('.location, .seller-location', el => cleanText(el.textContent || '')).catch(() => null);

    } catch (error) {
      console.error('Error extracting ClassicCars details:', error);
    }

    return details;
  }
};

/**
 * Bring a Trailer extractor
 */
export const BringATrailerExtractor: SiteExtractor = {
  name: 'BringATrailer.com',

  searchUrl: (query: string, pageNum = 1) => {
    const encoded = encodeURIComponent(query);
    return `https://bringatrailer.com/search/?q=${encoded}&page=${pageNum}`;
  },

  extractListings: async (page: Page): Promise<Partial<CarListing>[]> => {
    const listings: Partial<CarListing>[] = [];

    try {
      await page.waitForSelector('.listing-item, .auction-item', { timeout: 10000 }).catch(() => {});

      const items = await page.$$('.listing-item, .auction-item, article');

      for (const item of items) {
        try {
          const title = await item.$eval('h2, h3, .title', el => cleanText(el.textContent || '')).catch(() => '');
          const priceText = await item.$eval('.price, .current-bid', el => cleanText(el.textContent || '')).catch(() => '');
          const url = await item.$eval('a', el => el.getAttribute('href') || '').catch(() => '');
          const imageUrl = await item.$eval('img', el => el.getAttribute('src') || '').catch(() => '');

          if (title && url) {
            listings.push({
              title,
              priceText,
              price: parsePrice(priceText),
              url: url.startsWith('http') ? url : `https://bringatrailer.com${url}`,
              source: 'BringATrailer.com',
              year: parseYear(title),
              images: imageUrl ? [imageUrl] : []
            });
          }
        } catch (error) {
          console.error('Error extracting BaT card:', error);
        }
      }
    } catch (error) {
      console.error('Error in BaT extractor:', error);
    }

    return listings;
  },

  extractDetails: async (page: Page, url: string): Promise<Partial<CarListing>> => {
    const details: Partial<CarListing> = { url, source: 'BringATrailer.com' };

    try {
      details.title = await page.$eval('h1', el => cleanText(el.textContent || '')).catch(() => '');

      const priceText = await page.$eval('.current-bid, .price', el => cleanText(el.textContent || '')).catch(() => '');
      details.priceText = priceText;
      details.price = parsePrice(priceText);

      details.description = await page.$eval('.listing-description, .post-content', el => cleanText(el.textContent || '')).catch(() => '');

      const images = await page.$$eval('.gallery img, .slides img', imgs =>
        imgs.map(img => img.getAttribute('src') || '').filter(Boolean)
      ).catch(() => []);
      details.images = images;

      if (details.title) {
        details.year = parseYear(details.title);
        const parts = details.title.split(' ');
        if (parts.length >= 3) {
          details.make = parts[1];
          details.model = parts.slice(2).join(' ');
        }
      }
    } catch (error) {
      console.error('Error extracting BaT details:', error);
    }

    return details;
  }
};

/**
 * Hemmings extractor
 */
export const HemmingsExtractor: SiteExtractor = {
  name: 'Hemmings.com',

  searchUrl: (query: string, pageNum = 1) => {
    const encoded = encodeURIComponent(query);
    return `https://www.hemmings.com/classifieds?q=${encoded}&page=${pageNum}`;
  },

  extractListings: async (page: Page): Promise<Partial<CarListing>[]> => {
    const listings: Partial<CarListing>[] = [];

    try {
      await page.waitForSelector('.vehicle-card, .listing-card', { timeout: 10000 }).catch(() => {});

      const cards = await page.$$('.vehicle-card, .listing-card, .classified-item');

      for (const card of cards) {
        try {
          const title = await card.$eval('h3, h2, .title', el => cleanText(el.textContent || '')).catch(() => '');
          const priceText = await card.$eval('.price', el => cleanText(el.textContent || '')).catch(() => '');
          const url = await card.$eval('a', el => el.getAttribute('href') || '').catch(() => '');

          if (title && url) {
            listings.push({
              title,
              priceText,
              price: parsePrice(priceText),
              url: url.startsWith('http') ? url : `https://www.hemmings.com${url}`,
              source: 'Hemmings.com',
              year: parseYear(title)
            });
          }
        } catch (error) {
          console.error('Error extracting Hemmings card:', error);
        }
      }
    } catch (error) {
      console.error('Error in Hemmings extractor:', error);
    }

    return listings;
  },

  extractDetails: async (page: Page, url: string): Promise<Partial<CarListing>> => {
    const details: Partial<CarListing> = { url, source: 'Hemmings.com' };

    try {
      details.title = await page.$eval('h1', el => cleanText(el.textContent || '')).catch(() => '');

      const priceText = await page.$eval('.price', el => cleanText(el.textContent || '')).catch(() => '');
      details.priceText = priceText;
      details.price = parsePrice(priceText);

      details.description = await page.$eval('.description, .vehicle-description', el => cleanText(el.textContent || '')).catch(() => '');

      if (details.title) {
        details.year = parseYear(details.title);
        const parts = details.title.split(' ');
        if (parts.length >= 3) {
          details.make = parts[1];
          details.model = parts.slice(2).join(' ');
        }
      }
    } catch (error) {
      console.error('Error extracting Hemmings details:', error);
    }

    return details;
  }
};

/**
 * Get extractor by site name
 */
export function getExtractor(siteName: string): SiteExtractor | null {
  const extractors: { [key: string]: SiteExtractor } = {
    'classiccars': ClassicCarsExtractor,
    'classiccars.com': ClassicCarsExtractor,
    'bringatrailer': BringATrailerExtractor,
    'bat': BringATrailerExtractor,
    'bringatrailer.com': BringATrailerExtractor,
    'hemmings': HemmingsExtractor,
    'hemmings.com': HemmingsExtractor
  };

  return extractors[siteName.toLowerCase()] || null;
}

/**
 * Get all available extractors
 */
export function getAllExtractors(): SiteExtractor[] {
  return [
    ClassicCarsExtractor,
    BringATrailerExtractor,
    HemmingsExtractor
  ];
}
