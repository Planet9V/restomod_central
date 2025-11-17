// eBay Motors API Integration
// Official API - no scraping needed!
// Target: 600 classic car listings

import type { RawListing, ScrapeResult } from '../../../types/scraping';
import { processAndSaveListings } from '../dataProcessor';

/**
 * eBay Motors API configuration
 */
const EBAY_API_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';
const EBAY_APP_ID = process.env.EBAY_APP_ID || '';

interface EBaySearchParams {
  categoryId?: string;
  keywords?: string;
  minPrice?: number;
  maxPrice?: number;
  entriesPerPage?: number;
  pageNumber?: number;
}

/**
 * Search eBay Motors using Finding API
 */
export async function searchEBayMotors(params: EBaySearchParams = {}): Promise<ScrapeResult<RawListing>> {
  if (!EBAY_APP_ID) {
    return {
      success: false,
      error: 'eBay API key not configured. Set EBAY_APP_ID in .env',
    };
  }

  try {
    const {
      categoryId = '6001', // eBay Motors > Cars & Trucks
      keywords = 'classic car',
      minPrice = 5000,
      maxPrice = 500000,
      entriesPerPage = 100,
      pageNumber = 1,
    } = params;

    // Build API URL
    const url = new URL(EBAY_API_URL);
    url.searchParams.append('OPERATION-NAME', 'findItemsAdvanced');
    url.searchParams.append('SERVICE-VERSION', '1.0.0');
    url.searchParams.append('SECURITY-APPNAME', EBAY_APP_ID);
    url.searchParams.append('RESPONSE-DATA-FORMAT', 'JSON');
    url.searchParams.append('REST-PAYLOAD', '');
    url.searchParams.append('keywords', keywords);
    url.searchParams.append('categoryId', categoryId);
    url.searchParams.append('paginationInput.entriesPerPage', entriesPerPage.toString());
    url.searchParams.append('paginationInput.pageNumber', pageNumber.toString());
    url.searchParams.append('itemFilter(0).name', 'MinPrice');
    url.searchParams.append('itemFilter(0).value', minPrice.toString());
    url.searchParams.append('itemFilter(1).name', 'MaxPrice');
    url.searchParams.append('itemFilter(1).value', maxPrice.toString());
    url.searchParams.append('itemFilter(2).name', 'ListingType');
    url.searchParams.append('itemFilter(2).value(0)', 'FixedPrice');
    url.searchParams.append('itemFilter(2).value(1)', 'Auction');
    url.searchParams.append('sortOrder', 'EndTimeSoonest');

    console.log('[eBay] Fetching listings:', { keywords, categoryId, pageNumber });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.statusText}`);
    }

    const data = await response.json();

    const searchResult = data.findItemsAdvancedResponse?.[0];
    const items = searchResult?.searchResult?.[0]?.item || [];

    console.log(`[eBay] Found ${items.length} listings`);

    // Transform eBay items to RawListing format
    const listings: RawListing[] = items.map((item: any) => {
      const title = item.title?.[0] || '';

      return {
        title,
        price: item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__,
        image: item.galleryURL?.[0],
        url: item.viewItemURL?.[0],
        location: item.location?.[0],
        description: item.subtitle?.[0],
      };
    });

    return {
      success: true,
      data: listings,
      metadata: {
        itemsFound: listings.length,
        pagesCrawled: pageNumber,
        duration: 0,
        timestamp: new Date(),
      },
    };

  } catch (error: any) {
    console.error('[eBay] API error:', error);

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Scrape multiple pages from eBay Motors
 */
export async function scrapeEBayMotors(maxListings: number = 600): Promise<ScrapeResult<RawListing>> {
  console.log('[eBay] Starting multi-page scraping...');

  const allListings: RawListing[] = [];
  const entriesPerPage = 100;
  const totalPages = Math.ceil(maxListings / entriesPerPage);

  for (let page = 1; page <= totalPages; page++) {
    try {
      const result = await searchEBayMotors({
        keywords: 'classic car vintage muscle',
        entriesPerPage,
        pageNumber: page,
      });

      if (result.success && result.data) {
        allListings.push(...result.data);
        console.log(`[eBay] Page ${page}/${totalPages}: ${result.data.length} listings (total: ${allListings.length})`);
      } else {
        console.error(`[eBay] Page ${page} failed:`, result.error);
      }

      // Delay between pages (eBay rate limit: 5,000 calls/day)
      if (page < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }

    } catch (error) {
      console.error(`[eBay] Failed to fetch page ${page}:`, error);
    }
  }

  console.log(`[eBay] Completed scraping: ${allListings.length} total listings`);

  // Process and save to database
  if (allListings.length > 0) {
    const stats = await processAndSaveListings(allListings, 'eBay Motors');
    console.log('[eBay] Processing stats:', stats);
  }

  return {
    success: true,
    data: allListings,
    metadata: {
      itemsFound: allListings.length,
      pagesCrawled: totalPages,
      duration: 0,
      timestamp: new Date(),
    },
  };
}

/**
 * Search eBay by specific make
 */
export async function scrapeEBayByMake(make: string, maxListings: number = 100): Promise<ScrapeResult<RawListing>> {
  console.log(`[eBay] Scraping make: ${make}`);

  const allListings: RawListing[] = [];
  const entriesPerPage = 100;
  const totalPages = Math.ceil(maxListings / entriesPerPage);

  for (let page = 1; page <= totalPages; page++) {
    const result = await searchEBayMotors({
      keywords: `${make} classic vintage`,
      entriesPerPage,
      pageNumber: page,
    });

    if (result.success && result.data) {
      allListings.push(...result.data);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (allListings.length > 0) {
    const stats = await processAndSaveListings(allListings, `eBay Motors/${make}`);
    console.log(`[eBay/${make}] Processing stats:`, stats);
  }

  return {
    success: true,
    data: allListings,
  };
}

/**
 * Popular classic car makes for eBay
 */
export const ebayPopularMakes = [
  'Ford Mustang',
  'Chevrolet Corvette',
  'Chevrolet Camaro',
  'Dodge Charger',
  'Pontiac GTO',
  'Plymouth Barracuda',
];

/**
 * Scrape all popular makes from eBay
 */
export async function scrapeAllEBayMakes(): Promise<void> {
  console.log('[eBay] Starting diversified scraping across makes...');

  for (const make of ebayPopularMakes) {
    try {
      await scrapeEBayByMake(make, 50); // 50 listings per make
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    } catch (error) {
      console.error(`[eBay] Failed to scrape ${make}:`, error);
    }
  }

  console.log('[eBay] Completed diversified scraping');
}
