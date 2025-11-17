/**
 * ClassicCars.com 1950s Classics Scraper
 *
 * Scrapes 40 vehicles (2 pages) from ClassicCars.com 1950s listings
 *
 * Usage:
 *   npm install puppeteer
 *   tsx scripts/scrape-cc-50s-classics.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface ScrapedVehicle {
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  price: string;
  location: string;
  dealer: string;
  imageUrl: string;
  listingUrl: string;
}

async function scrapeClassicCars50s() {
  console.log('\n🚗 Scraping ClassicCars.com 1950s Classics\n');
  console.log('Target: 40 vehicles across 2 pages\n');

  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch (error) {
    console.error('❌ Puppeteer not installed. Installing...\n');
    const { execSync } = await import('child_process');
    execSync('npm install puppeteer', { stdio: 'inherit' });
    puppeteer = await import('puppeteer');
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set user agent to avoid bot detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const allVehicles: ScrapedVehicle[] = [];
  const baseUrl = 'https://classiccars.com/listings/find?year-min=1950&year-max=1959';

  try {
    // Scrape 2 pages
    for (let pageNum = 1; pageNum <= 2; pageNum++) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}&page=${pageNum}`;

      console.log(`📄 Scraping page ${pageNum}...`);
      console.log(`   URL: ${url}\n`);

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for listings to load
      await page.waitForSelector('.listing-item, .vehicle-card, [data-testid="listing"]', { timeout: 10000 }).catch(() => {
        console.log('   Using alternative selectors...');
      });

      // Extract vehicle data
      const vehicles = await page.evaluate(() => {
        const results: any[] = [];

        // Try multiple possible selectors
        const listings = document.querySelectorAll('.listing-item, .vehicle-card, [data-testid="listing"], .search-result');

        listings.forEach((listing) => {
          try {
            // Extract year, make, model from title
            const titleEl = listing.querySelector('h3, h4, .title, .vehicle-title, [data-testid="vehicle-title"]');
            const title = titleEl?.textContent?.trim() || '';

            // Parse title like "1957 Chevrolet Bel Air"
            const titleMatch = title.match(/(\d{4})\s+([A-Za-z\-]+)\s+(.+)/);

            if (!titleMatch) return;

            const year = parseInt(titleMatch[1]);
            const make = titleMatch[2];
            const model = titleMatch[3];

            // Extract price
            const priceEl = listing.querySelector('.price, .vehicle-price, [data-testid="price"]');
            const price = priceEl?.textContent?.trim() || 'Call for Price';

            // Extract location
            const locationEl = listing.querySelector('.location, .dealer-location, [data-testid="location"]');
            const location = locationEl?.textContent?.trim() || 'Location Unknown';

            // Extract dealer
            const dealerEl = listing.querySelector('.dealer, .dealer-name, [data-testid="dealer"]');
            const dealer = dealerEl?.textContent?.trim() || 'Private Seller';

            // Extract image
            const imgEl = listing.querySelector('img');
            const imageUrl = imgEl?.src || imgEl?.getAttribute('data-src') || '';

            // Extract listing URL
            const linkEl = listing.querySelector('a');
            let listingUrl = linkEl?.href || '';
            if (listingUrl && !listingUrl.startsWith('http')) {
              listingUrl = 'https://classiccars.com' + listingUrl;
            }

            // Extract stock number from URL
            const stockMatch = listingUrl.match(/\/view\/(\d+)/);
            const stockNumber = stockMatch ? `CC-${stockMatch[1]}` : `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            results.push({
              stockNumber,
              year,
              make,
              model,
              price,
              location,
              dealer,
              imageUrl,
              listingUrl
            });
          } catch (err) {
            console.error('Error parsing listing:', err);
          }
        });

        return results;
      });

      console.log(`   ✅ Found ${vehicles.length} vehicles on page ${pageNum}\n`);
      allVehicles.push(...vehicles);

      // Delay between pages to avoid rate limiting
      if (pageNum < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

  } catch (error) {
    console.error('❌ Error during scraping:', error);
  } finally {
    await browser.close();
  }

  // Save results
  const outputPath = join(process.cwd(), 'data', 'scraped-cc-classics-50s.json');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📊 Scraping Summary:\n`);
  console.log(`   Total vehicles scraped: ${allVehicles.length}`);
  console.log(`   Pages scraped: 2`);
  console.log(`   Output file: ${outputPath}\n`);

  // Show breakdown by decade
  const makeCount: Record<string, number> = {};
  allVehicles.forEach(v => {
    makeCount[v.make] = (makeCount[v.make] || 0) + 1;
  });

  console.log('   Distribution by make:');
  Object.entries(makeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([make, count]) => {
      console.log(`     ${make}: ${count} vehicles`);
    });

  // Save to file
  writeFileSync(outputPath, JSON.stringify(allVehicles, null, 2));

  console.log('\n✅ Data saved successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Next steps:');
  console.log('  1. Import to database: npm run import:batch data/scraped-cc-classics-50s.json');
  console.log('  2. Verify import: tsx scripts/verify-database.ts');
  console.log('  3. View in UI: npm run dev\n');

  return allVehicles;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeClassicCars50s()
    .then(vehicles => {
      console.log(`\n🎉 Successfully scraped ${vehicles.length} vehicles!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Scraping failed:', error);
      process.exit(1);
    });
}

export { scrapeClassicCars50s, ScrapedVehicle };
