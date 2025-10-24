/**
 * Direct HTTP Scraper for ClassicCars.com
 * Uses axios + cheerio (no browser required)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

interface Vehicle {
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  price: string;
  location: string;
  dealer?: string;
  dealerPhone?: string;
  url: string;
  scrapedDate: string;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  description?: string;
  images?: string[];
}

// User agent to avoid basic bot detection
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a URL with retries
 */
async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`  Fetching: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000,
        maxRedirects: 5,
      });

      return response.data;
    } catch (error: any) {
      console.log(`  ⚠️  Attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        const waitTime = (i + 1) * 2000; // 2s, 4s, 6s
        console.log(`  ⏳ Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
  throw new Error('All retries failed');
}

/**
 * Extract vehicle data from a listing page
 */
async function scrapeVehicleDetail(url: string): Promise<Vehicle | null> {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    // Extract stock number from URL (CC-XXXXXXX)
    const stockMatch = url.match(/\/view\/(\d+)/);
    const stockNumber = stockMatch ? `CC-${stockMatch[1]}` : '';

    // Try to extract data from the page
    // Note: Selectors may need adjustment based on actual ClassicCars.com HTML structure

    const title = $('h1.vehicle-title, h1[class*="title"]').first().text().trim();
    const priceText = $('.vehicle-price, [class*="price"]').first().text().trim();
    const location = $('.vehicle-location, [class*="location"]').first().text().trim();
    const description = $('.vehicle-description, [class*="description"]').first().text().trim();

    // Parse title for year/make/model (e.g., "1967 Chevrolet Corvette")
    const titleMatch = title.match(/(\d{4})\s+(\w+)\s+(.+)/);

    if (!titleMatch) {
      console.log(`  ⚠️  Could not parse vehicle title: ${title}`);
      return null;
    }

    const [, yearStr, make, model] = titleMatch;
    const year = parseInt(yearStr);

    // Extract additional details
    const specs = $('.vehicle-specs, [class*="specs"]').text();
    const engineMatch = specs.match(/(\d+\s*(?:V\d+|L\d+|CI))/i);
    const transmissionMatch = specs.match(/(Manual|Automatic|4-Speed|5-Speed|6-Speed)/i);
    const mileageMatch = specs.match(/(\d{1,3}(?:,\d{3})*)\s*(?:miles|mi)/i);

    // Extract images
    const images: string[] = [];
    $('img[class*="vehicle"], img[class*="gallery"]').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src && !src.includes('placeholder')) {
        images.push(src);
      }
    });

    const vehicle: Vehicle = {
      stockNumber,
      year,
      make,
      model: model.trim(),
      price: priceText || '$0',
      location: location || 'Unknown',
      url,
      scrapedDate: new Date().toISOString().split('T')[0],
      description: description || title,
      engine: engineMatch ? engineMatch[0] : undefined,
      transmission: transmissionMatch ? transmissionMatch[0] : undefined,
      mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : undefined,
      images: images.length > 0 ? images.slice(0, 5) : undefined,
    };

    return vehicle;
  } catch (error: any) {
    console.log(`  ❌ Error scraping ${url}: ${error.message}`);
    return null;
  }
}

/**
 * Scrape search results page for listing URLs
 */
async function scrapeSearchPage(searchUrl: string): Promise<string[]> {
  try {
    const html = await fetchWithRetry(searchUrl);
    const $ = cheerio.load(html);

    const listingUrls: string[] = [];

    // Find all listing links
    // Adjust selectors based on actual ClassicCars.com structure
    $('a[href*="/listings/view/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes('/view/')) {
        const fullUrl = href.startsWith('http') ? href : `https://classiccars.com${href}`;
        if (!listingUrls.includes(fullUrl)) {
          listingUrls.push(fullUrl);
        }
      }
    });

    console.log(`  Found ${listingUrls.length} listing URLs`);
    return listingUrls;
  } catch (error: any) {
    console.log(`  ❌ Error scraping search page: ${error.message}`);
    return [];
  }
}

/**
 * Main scraping function
 */
async function scrapeClassicCars(targetCount: number = 200) {
  console.log('🚗 ClassicCars.com Direct Scraper\n');
  console.log('='.repeat(60));
  console.log(`\nTarget: ${targetCount} vehicles (1930-1980, $20k-$200k)\n`);

  const vehicles: Vehicle[] = [];
  const baseSearchUrl = 'https://classiccars.com/listings/find/1930-1980/all-makes/all-models?price-min=20000&price-max=200000';

  let page = 1;
  let maxPages = 20; // Limit to prevent infinite loops

  while (vehicles.length < targetCount && page <= maxPages) {
    console.log(`\n📄 Page ${page}/${maxPages}`);

    const searchUrl = page === 1 ? baseSearchUrl : `${baseSearchUrl}&p=${page}`;

    // Get listing URLs from search page
    const listingUrls = await scrapeSearchPage(searchUrl);

    if (listingUrls.length === 0) {
      console.log('  No more listings found. Stopping.');
      break;
    }

    console.log(`\n🔍 Scraping ${listingUrls.length} listings from page ${page}...`);

    // Scrape each listing
    for (const url of listingUrls) {
      if (vehicles.length >= targetCount) break;

      console.log(`\n  [${vehicles.length + 1}/${targetCount}] ${url}`);

      const vehicle = await scrapeVehicleDetail(url);

      if (vehicle) {
        vehicles.push(vehicle);
        console.log(`  ✅ ${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.price}`);
      }

      // Delay between requests to be respectful
      await delay(2000 + Math.random() * 2000); // 2-4 seconds
    }

    page++;

    // Longer delay between pages
    if (vehicles.length < targetCount && page <= maxPages) {
      console.log(`\n⏳ Waiting before next page...`);
      await delay(5000);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Scraped ${vehicles.length} vehicles\n`);

  // Show distribution
  const makeCount: Record<string, number> = {};
  vehicles.forEach(v => {
    makeCount[v.make] = (makeCount[v.make] || 0) + 1;
  });

  console.log('📊 Distribution by make:');
  Object.entries(makeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([make, count]) => {
      console.log(`   ${make}: ${count}`);
    });

  // Save to file
  const filename = `data/scraped-${new Date().toISOString().split('T')[0]}.json`;
  writeFileSync(filename, JSON.stringify(vehicles, null, 2));
  console.log(`\n💾 Saved to: ${filename}\n`);

  return vehicles;
}

export { scrapeClassicCars, scrapeVehicleDetail, scrapeSearchPage };

// Run if executed directly
const targetCount = parseInt(process.argv[2] || '200');

scrapeClassicCars(targetCount)
  .then((vehicles) => {
    console.log(`✅ Complete! Scraped ${vehicles.length} vehicles.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
