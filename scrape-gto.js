import { chromium } from 'playwright';
import fs from 'fs';

async function scrapeClassicCarsGTO() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--ignore-certificate-errors',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const allCars = [];
  const baseUrl = 'https://classiccars.com/listings/find?make=pontiac&model=gto';

  // Scrape pages until we have 40 cars
  for (let pageNum = 1; pageNum <= 3; pageNum++) {
    const url = pageNum === 1 ? baseUrl : `${baseUrl}&page=${pageNum}`;
    console.log(`Scraping page ${pageNum}: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for dynamic content to load
    } catch (error) {
      console.log(`Error loading page ${pageNum}, retrying...`);
      await page.waitForTimeout(2000);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
    }

    // Extract car listings from the page
    const cars = await page.evaluate(() => {
      const listings = [];

      // Try multiple selectors to find car listings
      const listingSelectors = [
        '.listing-card',
        '.vehicle-card',
        '[data-testid="listing-card"]',
        '.search-result',
        'article',
        '.listing'
      ];

      let listingElements = [];
      for (const selector of listingSelectors) {
        listingElements = document.querySelectorAll(selector);
        if (listingElements.length > 0) {
          console.log(`Found ${listingElements.length} listings with selector: ${selector}`);
          break;
        }
      }

      listingElements.forEach((listing) => {
        try {
          // Extract stock number from link or data attribute
          const link = listing.querySelector('a[href*="/listings/view/"]') ||
                      listing.querySelector('a[href*="/listings/"]') ||
                      listing.querySelector('a');

          let stockNumber = '';
          let listingUrl = '';

          if (link) {
            listingUrl = link.href;
            const match = listingUrl.match(/\/view\/(\d+)/);
            if (match) {
              stockNumber = 'CC-' + match[1];
            }
          }

          // Extract year - look for 4-digit year
          const yearText = listing.textContent;
          const yearMatch = yearText.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
          const year = yearMatch ? parseInt(yearMatch[1]) : null;

          // Extract make and model
          const titleElement = listing.querySelector('h3, h2, .title, .vehicle-title, [class*="title"]');
          const titleText = titleElement ? titleElement.textContent.trim() : '';

          // Parse title like "1967 Pontiac GTO"
          const titleParts = titleText.split(' ').filter(p => p.length > 0);
          let make = 'Pontiac';
          let model = 'GTO';

          if (titleParts.length >= 3) {
            make = titleParts[1];
            model = titleParts.slice(2).join(' ');
          } else if (titleParts.length === 2) {
            make = titleParts[1];
          }

          // Extract price
          const priceElement = listing.querySelector('.price, [class*="price"]');
          let price = 'Call for Price';
          if (priceElement) {
            const priceText = priceElement.textContent.trim();
            if (priceText && priceText !== '' && !priceText.toLowerCase().includes('call')) {
              price = priceText;
            }
          }

          // Extract location
          const locationElement = listing.querySelector('.location, [class*="location"]');
          const location = locationElement ? locationElement.textContent.trim() : '';

          // Extract dealer
          const dealerElement = listing.querySelector('.dealer, [class*="dealer"], [class*="seller"]');
          const dealer = dealerElement ? dealerElement.textContent.trim() : '';

          // Extract image URL
          const imgElement = listing.querySelector('img');
          const imageUrl = imgElement ? (imgElement.src || imgElement.dataset.src) : '';

          if (stockNumber && year) {
            listings.push({
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
          }
        } catch (err) {
          console.error('Error parsing listing:', err);
        }
      });

      return listings;
    });

    console.log(`Found ${cars.length} cars on page ${pageNum}`);
    allCars.push(...cars);

    // Stop if we have 40 or more cars
    if (allCars.length >= 40) {
      console.log(`Reached target of 40 cars (have ${allCars.length})`);
      break;
    }

    // Add delay between pages
    if (pageNum < 3) {
      await page.waitForTimeout(2000);
    }
  }

  await browser.close();

  console.log(`\nTotal cars scraped: ${allCars.length}`);
  return allCars.slice(0, 40); // Limit to 40 cars
}

// Run the scraper
scrapeClassicCarsGTO()
  .then(cars => {
    const outputPath = '/home/user/restomod_central/data/scraped-cc-gto.json';
    fs.writeFileSync(outputPath, JSON.stringify(cars, null, 2));
    console.log(`\nSaved ${cars.length} cars to ${outputPath}`);
    console.log('\nSample data:');
    console.log(JSON.stringify(cars.slice(0, 2), null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
