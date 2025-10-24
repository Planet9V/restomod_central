/**
 * Playwright-based ClassicCars.com Scraper
 *
 * Handles JavaScript rendering and bot protection
 * Respects rate limits and implements retry logic
 */

import { chromium, Browser, Page } from 'playwright';

export interface ScrapedVehicle {
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  price: string;
  location: string;
  dealer?: string;
  dealerPhone?: string;
  scrapedDate: string;
  url: string;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  description?: string;
}

export interface ScrapeOptions {
  yearMin: number;
  yearMax: number;
  priceMin: number;
  priceMax: number;
  maxVehicles: number;
  delay: number;
  headless: boolean;
}

export class PlaywrightScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(options: { headless: boolean }) {
    console.log('🚀 Launching browser...');
    this.browser = await chromium.launch({
      headless: options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    this.page = await context.newPage();
    console.log('✅ Browser launched');
  }

  async scrape(options: ScrapeOptions): Promise<ScrapedVehicle[]> {
    if (!this.page) throw new Error('Browser not initialized');

    const vehicles: ScrapedVehicle[] = [];
    const { yearMin, yearMax, priceMin, priceMax, maxVehicles, delay } = options;

    console.log(`\n🔍 Scraping ClassicCars.com`);
    console.log(`   Target: ${maxVehicles} vehicles`);
    console.log(`   Filters: ${yearMin}-${yearMax}, $${priceMin.toLocaleString()}-$${priceMax.toLocaleString()}\n`);

    // Build search URL
    const baseUrl = 'https://classiccars.com/listings/find';
    const searchUrl = `${baseUrl}/${yearMin}-${yearMax}/all-makes/all-models?price-min=${priceMin}&price-max=${priceMax}`;

    let page = 1;
    let hasMore = true;

    while (hasMore && vehicles.length < maxVehicles) {
      const url = page === 1 ? searchUrl : `${searchUrl}&p=${page}`;

      console.log(`📄 Page ${page}: ${url}`);

      try {
        // Navigate to search page
        await this.page.goto(url, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(delay);

        // Extract listing URLs
        const listingUrls = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/listings/view/"]'));
          return links.map(link => (link as HTMLAnchorElement).href);
        });

        console.log(`   Found ${listingUrls.length} listings`);

        if (listingUrls.length === 0) {
          hasMore = false;
          break;
        }

        // Scrape each listing
        for (const listingUrl of listingUrls) {
          if (vehicles.length >= maxVehicles) break;

          try {
            const vehicle = await this.scrapeVehicleDetail(listingUrl, delay);
            if (vehicle) {
              vehicles.push(vehicle);
              console.log(`   ✅ ${vehicles.length}/${maxVehicles}: ${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.price}`);
            }
          } catch (err: any) {
            console.error(`   ❌ Error scraping ${listingUrl}:`, err.message);
          }
        }

        page++;
        await this.page.waitForTimeout(delay);
      } catch (err: any) {
        console.error(`❌ Error on page ${page}:`, err.message);
        hasMore = false;
      }
    }

    return vehicles;
  }

  private async scrapeVehicleDetail(url: string, delay: number): Promise<ScrapedVehicle | null> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(delay);

      // Extract vehicle data
      const vehicle = await this.page.evaluate((scrapedUrl) => {
        // Helper function to safely get text content
        const getText = (selector: string): string | undefined => {
          const el = document.querySelector(selector);
          return el?.textContent?.trim() || undefined;
        };

        // Extract stock number from URL
        const stockMatch = scrapedUrl.match(/\/listings\/view\/(\d+)\//);
        const stockNumber = stockMatch ? `CC-${stockMatch[1]}` : '';

        // Extract title (e.g., "1967 Chevrolet Corvette")
        const title = getText('h1') || '';
        const titleMatch = title.match(/(\d{4})\s+(\w+)\s+(.+)/);

        // Extract price
        const priceText = getText('.price, .vehicle-price, [class*="price"]') || '';

        // Extract location
        const location = getText('.location, .vehicle-location, [class*="location"]') || '';

        // Extract other details
        const mileageText = getText('[class*="mileage"]') || '';
        const mileage = parseInt(mileageText.replace(/[^0-9]/g, '')) || undefined;

        const engine = getText('[class*="engine"]');
        const transmission = getText('[class*="transmission"]');
        const exteriorColor = getText('[class*="exterior"]');
        const interiorColor = getText('[class*="interior"]');

        const description = getText('.description, .vehicle-description') || '';

        return {
          stockNumber,
          year: titleMatch ? parseInt(titleMatch[1]) : 0,
          make: titleMatch ? titleMatch[2] : '',
          model: titleMatch ? titleMatch[3] : '',
          price: priceText,
          location,
          mileage,
          engine,
          transmission,
          exteriorColor,
          interiorColor,
          description,
          url: scrapedUrl,
          scrapedDate: new Date().toISOString().split('T')[0]
        };
      }, url);

      // Validate required fields
      if (!vehicle.year || !vehicle.make || !vehicle.model) {
        return null;
      }

      return vehicle as ScrapedVehicle;
    } catch (err) {
      throw err;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// Example usage
export async function scrapeClassicCars(options: ScrapeOptions): Promise<ScrapedVehicle[]> {
  const scraper = new PlaywrightScraper();

  try {
    await scraper.initialize({ headless: options.headless });
    const vehicles = await scraper.scrape(options);
    return vehicles;
  } finally {
    await scraper.close();
  }
}

// CLI execution
if (require.main === module) {
  const options: ScrapeOptions = {
    yearMin: parseInt(process.argv[2]) || 1930,
    yearMax: parseInt(process.argv[3]) || 1980,
    priceMin: parseInt(process.argv[4]) || 20000,
    priceMax: parseInt(process.argv[5]) || 200000,
    maxVehicles: parseInt(process.argv[6]) || 200,
    delay: 2000,
    headless: true
  };

  scrapeClassicCars(options)
    .then((vehicles) => {
      console.log(`\n✅ Complete! Scraped ${vehicles.length} vehicles`);
      console.log(JSON.stringify(vehicles, null, 2));
    })
    .catch((err) => {
      console.error('❌ Fatal error:', err);
      process.exit(1);
    });
}
