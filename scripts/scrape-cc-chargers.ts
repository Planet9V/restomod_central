import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface ScrapedCar {
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

async function scrapeClassicCarsChargers() {
  console.log('🚀 Starting ClassicCars.com Dodge Charger scraper...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();
  const allCars: ScrapedCar[] = [];
  const baseUrl = 'https://classiccars.com/listings/find?make=dodge&model=charger';

  try {
    // Scrape 2 pages to get ~40 cars
    for (let pageNum = 1; pageNum <= 2; pageNum++) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}&page=${pageNum}`;

      console.log(`📄 Scraping page ${pageNum}: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

      // Wait for listings to load
      await page.waitForSelector('.item', { timeout: 30000 }).catch(() => {
        console.log('⚠️  Trying alternative selector...');
      });

      // Extract car listings
      const cars = await page.evaluate(() => {
        const listings: any[] = [];

        // Try multiple selectors as ClassicCars.com structure may vary
        const carElements = document.querySelectorAll('.item, .listing-item, [data-listing]');

        carElements.forEach((element) => {
          try {
            // Extract stock number
            const stockNumberEl = element.querySelector('.stock-number, [data-stock], .listing-id');
            const stockNumber = stockNumberEl?.textContent?.trim() || '';

            // Extract year, make, model from title
            const titleEl = element.querySelector('.title, .listing-title, h3, h4');
            const titleText = titleEl?.textContent?.trim() || '';

            // Parse title like "1969 Dodge Charger"
            const titleMatch = titleText.match(/(\d{4})\s+([\w\s]+?)\s+([\w\s]+?)(?:\s|$)/);
            const year = titleMatch ? parseInt(titleMatch[1]) : 0;
            const make = titleMatch ? titleMatch[2].trim() : 'Dodge';
            const model = titleMatch ? titleMatch[3].trim() : 'Charger';

            // Extract price
            const priceEl = element.querySelector('.price, .listing-price, [data-price]');
            const price = priceEl?.textContent?.trim().replace(/\s+/g, ' ') || '$0';

            // Extract location
            const locationEl = element.querySelector('.location, .dealer-location, [data-location]');
            const location = locationEl?.textContent?.trim() || '';

            // Extract dealer
            const dealerEl = element.querySelector('.dealer, .dealer-name, [data-dealer]');
            const dealer = dealerEl?.textContent?.trim() || 'Unknown Dealer';

            // Extract image
            const imageEl = element.querySelector('img');
            const imageUrl = imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || '';

            // Extract listing URL
            const linkEl = element.querySelector('a');
            const listingUrl = linkEl?.getAttribute('href') || '';
            const fullUrl = listingUrl.startsWith('http')
              ? listingUrl
              : `https://classiccars.com${listingUrl}`;

            // Only add if we have minimum required data
            if (year > 1900 && fullUrl && price !== '$0') {
              listings.push({
                stockNumber,
                year,
                make,
                model,
                price,
                location,
                dealer,
                imageUrl,
                listingUrl: fullUrl
              });
            }
          } catch (err) {
            console.error('Error extracting listing:', err);
          }
        });

        return listings;
      });

      console.log(`   ✅ Found ${cars.length} cars on page ${pageNum}`);
      allCars.push(...cars);

      // Brief delay between pages
      if (pageNum < 2) {
        await page.waitForTimeout(2000);
      }
    }

  } catch (error) {
    console.error('❌ Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }

  // Save to JSON file
  const outputPath = '/home/user/restomod_central/data/scraped-cc-chargers.json';
  writeFileSync(outputPath, JSON.stringify(allCars, null, 2));

  console.log('\n✅ Scraping complete!');
  console.log('='.repeat(60));
  console.log(`📊 Total cars scraped: ${allCars.length}`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log('\n📋 Summary:');

  // Show distribution by year
  const yearCounts: Record<number, number> = {};
  allCars.forEach(car => {
    yearCounts[car.year] = (yearCounts[car.year] || 0) + 1;
  });

  console.log('   Years represented:');
  Object.entries(yearCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([year, count]) => {
      console.log(`      ${year}: ${count} cars`);
    });

  // Show price range
  const prices = allCars
    .map(car => parseInt(car.price.replace(/[^0-9]/g, '')))
    .filter(p => p > 0)
    .sort((a, b) => a - b);

  if (prices.length > 0) {
    console.log(`\n   Price range:`);
    console.log(`      Low: $${prices[0].toLocaleString()}`);
    console.log(`      High: $${prices[prices.length - 1].toLocaleString()}`);
    console.log(`      Average: $${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length).toLocaleString()}`);
  }

  console.log('\n');

  return allCars;
}

// Run the scraper
scrapeClassicCarsChargers()
  .then(cars => {
    console.log(`✨ Successfully scraped ${cars.length} Dodge Chargers!`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Scraping failed:', error);
    process.exit(1);
  });
