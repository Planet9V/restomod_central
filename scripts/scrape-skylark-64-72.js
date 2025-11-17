import { chromium } from 'playwright';
import fs from 'fs';

async function scrapeSkylarks() {
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
  const baseUrl = 'https://classiccars.com/listings/find?year-min=1964&year-max=1972&make=buick&model=skylark';

  // Scrape up to 3 pages to try to get 40 cars
  for (let pageNum = 1; pageNum <= 3; pageNum++) {
    const url = pageNum === 1 ? baseUrl : `${baseUrl}&page=${pageNum}`;
    console.log(`Scraping page ${pageNum}: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for dynamic content to load

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
          '.listing',
          '.vehicle-listing',
          '[class*="listing"]',
          '[class*="vehicle"]'
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
                        listing.querySelector('a[href*="/l/"]') ||
                        listing.querySelector('a');

            let stockNumber = '';
            let listingUrl = '';

            if (link) {
              listingUrl = link.href;
              const match = listingUrl.match(/\/(?:view|l)\/(\d+)/);
              if (match) {
                stockNumber = 'CC-SKYLARK-' + match[1];
              } else {
                // Fallback: generate a stock number
                stockNumber = 'CC-SKYLARK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
              }
            }

            // Extract year - look for 4-digit year in range 1964-1972
            const yearText = listing.textContent;
            const yearMatch = yearText.match(/\b(196[4-9]|197[0-2])\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : null;

            // Extract make and model
            const titleElement = listing.querySelector('h3, h2, .title, .vehicle-title, [class*="title"], [class*="name"]');
            const titleText = titleElement ? titleElement.textContent.trim() : '';

            // Parse title like "1967 Buick Skylark GS"
            const titleParts = titleText.split(' ').filter(p => p.length > 0);
            let make = 'Buick';
            let model = 'Skylark';

            // Try to extract full model with trim
            if (titleText.toLowerCase().includes('skylark')) {
              const modelMatch = titleText.match(/Skylark\s+(.+?)(?:\s|$)/i);
              if (modelMatch) {
                model = 'Skylark ' + modelMatch[1].trim();
              } else if (titleText.toLowerCase().includes('gs') || titleText.toLowerCase().includes('gran sport')) {
                model = 'Skylark GS';
              } else if (titleText.toLowerCase().includes('custom')) {
                model = 'Skylark Custom';
              }
            } else if (titleParts.length >= 3) {
              // Fallback parsing
              make = titleParts[1] || 'Buick';
              model = titleParts.slice(2).join(' ') || 'Skylark';
            }

            // Extract price
            const priceElement = listing.querySelector('.price, [class*="price"]');
            let price = 'Call for Price';
            if (priceElement) {
              const priceText = priceElement.textContent.trim();
              if (priceText && priceText !== '' && !priceText.toLowerCase().includes('call')) {
                price = priceText.replace(/\s+/g, ' ');
              }
            }

            // Extract location
            const locationElement = listing.querySelector('.location, [class*="location"]');
            const location = locationElement ? locationElement.textContent.trim() : '';

            // Extract dealer
            const dealerElement = listing.querySelector('.dealer, [class*="dealer"], [class*="seller"]');
            const dealer = dealerElement ? dealerElement.textContent.trim() : 'Classic Cars';

            // Extract image URL
            const imgElement = listing.querySelector('img');
            const imageUrl = imgElement ? (imgElement.src || imgElement.dataset.src || '') : '';

            if (stockNumber && year && year >= 1964 && year <= 1972) {
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

      // If we have enough cars, stop scraping
      if (allCars.length >= 40) {
        console.log(`Reached target of 40+ cars (${allCars.length} total), stopping...`);
        break;
      }

      // Add delay between pages
      if (pageNum < 3) {
        await page.waitForTimeout(3000);
      }
    } catch (error) {
      console.error(`Error on page ${pageNum}:`, error.message);
      // Continue to next page
    }
  }

  await browser.close();

  // Limit to 40 cars if we got more
  const finalCars = allCars.slice(0, 40);
  console.log(`\nTotal cars scraped: ${finalCars.length}`);
  return finalCars;
}

// Run the scraper
scrapeSkylarks()
  .then(cars => {
    const outputPath = '/home/user/restomod_central/data/scraped-skylark-64-72.json';
    fs.writeFileSync(outputPath, JSON.stringify(cars, null, 2));
    console.log(`\nSaved ${cars.length} cars to ${outputPath}`);
    console.log('\nSample data:');
    console.log(JSON.stringify(cars.slice(0, 3), null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
