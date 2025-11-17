/**
 * BringATrailer.com Corvette Scraper
 * Scrapes Corvette auction listings from BringATrailer.com
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ScrapedCar {
  stockNumber: string;  // auction ID
  year: number;
  make: string;
  model: string;
  price: string;        // sold/current bid
  location: string;
  imageUrl: string;
  listingUrl: string;
}

async function scrapeBATCorvettes(targetCount: number = 30): Promise<ScrapedCar[]> {
  console.log('🚗 Starting BringATrailer.com Corvette Scraper');
  console.log(`🎯 Target: ${targetCount} Corvettes\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const scrapedCars: ScrapedCar[] = [];
  let pageNum = 1;

  try {
    while (scrapedCars.length < targetCount) {
      const url = `https://bringatrailer.com/auctions/results/?q=corvette&page=${pageNum}`;
      console.log(`\n📄 Scraping page ${pageNum}...`);
      console.log(`   URL: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for listings to load
      await page.waitForSelector('.auctions-item, .listing-item, .result-item, article', { timeout: 10000 }).catch(() => {
        console.log('   ⚠️  Listing selector not found, trying alternative approach...');
      });

      // Extract listing data using multiple strategies
      const listings = await page.evaluate(() => {
        const results: any[] = [];

        // Strategy 1: Try common BaT class names
        const selectors = [
          '.auctions-item',
          '.listing-item',
          '.result-item',
          'article.listing',
          'article[class*="listing"]',
          'div[class*="auction"]',
          'div[class*="result"]'
        ];

        let elements: Element[] = [];
        for (const selector of selectors) {
          elements = Array.from(document.querySelectorAll(selector));
          if (elements.length > 0) {
            console.log(`Found ${elements.length} listings with selector: ${selector}`);
            break;
          }
        }

        elements.forEach((element) => {
          try {
            // Extract data from the listing element
            const titleEl = element.querySelector('h3, h2, .title, [class*="title"]');
            const linkEl = element.querySelector('a[href*="/listing/"]') || element.querySelector('a');
            const priceEl = element.querySelector('.price, [class*="price"], [class*="bid"]');
            const imgEl = element.querySelector('img');
            const locationEl = element.querySelector('.location, [class*="location"]');

            if (!titleEl || !linkEl) return;

            const titleText = titleEl.textContent?.trim() || '';
            const href = (linkEl as HTMLAnchorElement).href || '';

            // Parse title for year/make/model (e.g., "1967 Chevrolet Corvette Sting Ray Coupe")
            const yearMatch = titleText.match(/\b(19\d{2}|20\d{2})\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 0;

            // Extract auction ID from URL
            const urlMatch = href.match(/\/listing\/([^\/]+)/);
            const auctionId = urlMatch ? urlMatch[1] : '';

            // Extract price
            let price = priceEl?.textContent?.trim() || 'Not available';
            // Clean up price text (remove extra whitespace, newlines)
            price = price.replace(/\s+/g, ' ').trim();

            // Extract location
            const location = locationEl?.textContent?.trim() || '';

            // Extract image
            const imageUrl = (imgEl as HTMLImageElement)?.src ||
                           (imgEl as HTMLImageElement)?.dataset?.src || '';

            results.push({
              title: titleText,
              year: year,
              url: href,
              auctionId: auctionId,
              price: price,
              location: location,
              imageUrl: imageUrl
            });
          } catch (err) {
            console.error('Error parsing listing:', err);
          }
        });

        return results;
      });

      console.log(`   Found ${listings.length} listings on page ${pageNum}`);

      // Process listings
      for (const listing of listings) {
        if (scrapedCars.length >= targetCount) break;

        // Parse the title to extract make and model
        const title = listing.title;
        const corvette = parseCorvetteTitle(title);

        if (corvette && listing.year > 0) {
          const car: ScrapedCar = {
            stockNumber: listing.auctionId || `BAT-${Date.now()}-${scrapedCars.length}`,
            year: listing.year,
            make: 'Chevrolet',
            model: corvette.model,
            price: listing.price || 'Not available',
            location: listing.location || 'Location not specified',
            imageUrl: listing.imageUrl || '',
            listingUrl: listing.url
          };

          scrapedCars.push(car);
          console.log(`   ✅ ${car.year} ${car.make} ${car.model} - ${car.price}`);
        }
      }

      // Check if we should continue to next page
      if (listings.length === 0) {
        console.log('\n⚠️  No more listings found. Stopping.');
        break;
      }

      if (scrapedCars.length < targetCount) {
        pageNum++;
        await page.waitForTimeout(2000); // Polite delay between pages
      }
    }

  } catch (error) {
    console.error('❌ Error during scraping:', error);
  } finally {
    await browser.close();
  }

  return scrapedCars.slice(0, targetCount);
}

function parseCorvetteTitle(title: string): { model: string } | null {
  // Clean up the title
  const cleaned = title.trim();

  // Check if it's a Corvette
  if (!cleaned.toLowerCase().includes('corvette')) {
    return null;
  }

  // Extract model variant (Sting Ray, Stingray, Z06, C1, C2, etc.)
  let model = 'Corvette';

  // Common Corvette variants
  const variants = [
    'Sting Ray',
    'Stingray',
    'Z06',
    'ZR1',
    'Grand Sport',
    'C1',
    'C2',
    'C3',
    'C4',
    'C5',
    'C6',
    'C7',
    'C8',
    'Convertible',
    'Coupe',
    'Roadster'
  ];

  for (const variant of variants) {
    const regex = new RegExp(variant, 'i');
    if (regex.test(cleaned)) {
      model = `Corvette ${variant}`;
      break;
    }
  }

  return { model };
}

async function saveCarsToFile(cars: ScrapedCar[], filePath: string) {
  const dir = path.dirname(filePath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save to JSON file
  fs.writeFileSync(filePath, JSON.stringify(cars, null, 2));
  console.log(`\n💾 Saved ${cars.length} cars to: ${filePath}`);
}

// Main execution
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('  BRINGATRAILER.COM CORVETTE SCRAPER');
    console.log('='.repeat(60));

    const targetCount = 30;
    const outputPath = '/home/user/restomod_central/data/scraped-bat-corvettes.json';

    const cars = await scrapeBATCorvettes(targetCount);

    if (cars.length === 0) {
      console.log('\n❌ No Corvettes were scraped. The site structure may have changed.');
      console.log('   Please check the website and update selectors if needed.');
      process.exit(1);
    }

    await saveCarsToFile(cars, outputPath);

    // Generate summary
    console.log('\n' + '='.repeat(60));
    console.log('  SCRAPING SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n✅ Successfully scraped ${cars.length} Corvettes`);
    console.log(`📁 Output file: ${outputPath}`);

    // Price statistics
    const withPrices = cars.filter(c => c.price && c.price !== 'Not available' && !c.price.includes('No Reserve'));
    console.log(`💰 Cars with price info: ${withPrices.length}`);

    // Year distribution
    const yearCounts: Record<number, number> = {};
    cars.forEach(car => {
      yearCounts[car.year] = (yearCounts[car.year] || 0) + 1;
    });

    console.log('\n📊 Year Distribution:');
    Object.entries(yearCounts)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([year, count]) => {
        console.log(`   ${year}: ${count} cars`);
      });

    console.log('\n🎉 Scraping completed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  }
}

// Run the scraper
main();
