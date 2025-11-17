import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function scrapeGatewayClassicCars() {
  console.log('Launching browser...');
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
  const allCars: any[] = [];
  const targetCount = 40;

  try {
    const baseUrl = 'https://www.gatewayclassiccars.com/vehicles';
    console.log(`Navigating to: ${baseUrl}`);

    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for page to fully load
    await page.waitForTimeout(5000);

    console.log('Page loaded, checking for content...');

    // Take a screenshot for debugging
    await page.screenshot({ path: '/home/user/restomod_central/gateway-debug.png' });
    console.log('Screenshot saved to gateway-debug.png');

    console.log('Extracting listings...');

    // Extract car listings
    const cars = await page.evaluate((targetCount) => {
      const listings: any[] = [];

      // Try multiple selectors to find car listings
      const listingSelectors = [
        '.vehicle-card',
        '.listing-card',
        '[data-vehicle]',
        '.car-card',
        '.inventory-item',
        'article.vehicle',
        '.vehicle-listing',
        '[class*="vehicle"]',
        '[class*="listing"]'
      ];

      let listingElements: NodeListOf<Element> | null = null;
      let usedSelector = '';

      for (const selector of listingSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          listingElements = elements;
          usedSelector = selector;
          console.log(`Found ${elements.length} listings with selector: ${selector}`);
          break;
        }
      }

      // If no specific vehicle selector found, try to find any link containers
      if (!listingElements || listingElements.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="/vehicles/"]');
        console.log(`Found ${allLinks.length} vehicle links`);

        // Get parent containers of links
        const containers = new Set<Element>();
        allLinks.forEach(link => {
          let parent = link.parentElement;
          while (parent && parent !== document.body) {
            if (parent.querySelector('img')) {
              containers.add(parent);
              break;
            }
            parent = parent.parentElement;
          }
        });

        listingElements = document.querySelectorAll('div');
        console.log(`Analyzing ${listingElements.length} potential containers`);
      }

      if (listingElements) {
        let processed = 0;
        listingElements.forEach((listing) => {
          if (processed >= targetCount) return;

          try {
            // Find link to vehicle detail page
            const link = listing.querySelector('a[href*="/vehicles/"]') ||
                        listing.querySelector('a[href*="/inventory/"]') ||
                        listing.querySelector('a');

            if (!link) return;

            const listingUrl = (link as HTMLAnchorElement).href;
            if (!listingUrl || !listingUrl.includes('gateway')) return;

            // Extract stock number from URL or data attributes
            let stockNumber = '';
            const stockMatch = listingUrl.match(/\/vehicles?\/(\d+)/i) ||
                              listingUrl.match(/stock[=-](\d+)/i) ||
                              listingUrl.match(/id[=-](\d+)/i);

            if (stockMatch) {
              stockNumber = 'GCC-' + stockMatch[1];
            } else {
              // Try to find stock number in text
              const stockText = listing.textContent || '';
              const textMatch = stockText.match(/stock[#:\s]*(\d+)/i) ||
                               stockText.match(/\b(\d{4,6})\b/);
              if (textMatch) {
                stockNumber = 'GCC-' + textMatch[1];
              }
            }

            // Extract year - look for 4-digit year
            const allText = listing.textContent || '';
            const yearMatch = allText.match(/\b(19[2-9]\d|20[0-2]\d)\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : null;

            if (!year) return; // Skip if no year found

            // Extract title/make/model
            const titleElement = listing.querySelector('h1, h2, h3, h4, .title, [class*="title"]');
            let titleText = titleElement ? titleElement.textContent?.trim() : '';

            // If no title element, try to extract from text
            if (!titleText) {
              const linkText = link.textContent?.trim();
              if (linkText && linkText.length > 5) {
                titleText = linkText;
              }
            }

            // Parse title like "1967 Chevrolet Camaro" or "Chevrolet Camaro"
            let make = '';
            let model = '';

            if (titleText) {
              // Remove year from title if present
              titleText = titleText.replace(/\b19\d{2}\b|\b20\d{2}\b/g, '').trim();

              const titleParts = titleText.split(/\s+/).filter(p => p.length > 0);
              if (titleParts.length >= 2) {
                make = titleParts[0];
                model = titleParts.slice(1).join(' ');
              } else if (titleParts.length === 1) {
                make = titleParts[0];
              }
            }

            // Extract price
            const priceElement = listing.querySelector('.price, [class*="price"]') ||
                                listing.querySelector('[class*="cost"]');
            let price = 'Call for Price';

            if (priceElement) {
              const priceText = priceElement.textContent?.trim() || '';
              if (priceText && priceText !== '' && !priceText.toLowerCase().includes('call')) {
                price = priceText;
              }
            } else {
              // Try to find price in text
              const priceMatch = allText.match(/\$[\d,]+/);
              if (priceMatch) {
                price = priceMatch[0];
              }
            }

            // Extract location
            const locationElement = listing.querySelector('.location, [class*="location"]') ||
                                   listing.querySelector('[class*="city"]');
            let location = '';

            if (locationElement) {
              location = locationElement.textContent?.trim() || '';
            } else {
              // Try to find location in text (city, state pattern)
              const locationMatch = allText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+([A-Z]{2})/);
              if (locationMatch) {
                location = `${locationMatch[1]}, ${locationMatch[2]}`;
              }
            }

            // Construct dealer name
            const dealer = location ? `Gateway Classic Cars - ${location}` : 'Gateway Classic Cars';

            // Extract image URL
            const imgElement = listing.querySelector('img');
            let imageUrl = '';

            if (imgElement) {
              imageUrl = (imgElement as HTMLImageElement).src ||
                        (imgElement as any).dataset?.src ||
                        (imgElement as any)['data-src'] || '';

              // Handle relative URLs
              if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = 'https://www.gatewayclassiccars.com' + imageUrl;
              }
            }

            // Only add if we have minimal required data
            if (stockNumber && year) {
              listings.push({
                stockNumber,
                year,
                make: make || 'Unknown',
                model: model || 'Unknown',
                price,
                location,
                dealer,
                imageUrl,
                listingUrl
              });
              processed++;
            }
          } catch (err) {
            console.error('Error parsing listing:', err);
          }
        });
      }

      return listings;
    }, targetCount);

    console.log(`Extracted ${cars.length} cars from page`);
    allCars.push(...cars);

    // If we need more cars, try scrolling and loading more
    if (allCars.length < targetCount) {
      console.log(`Need ${targetCount - allCars.length} more cars, trying to load more...`);

      // Try clicking "Load More" button if it exists
      const loadMoreSelectors = [
        'button:has-text("Load More")',
        'button:has-text("Show More")',
        '.load-more',
        '[class*="load-more"]'
      ];

      for (const selector of loadMoreSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            console.log(`Found load more button: ${selector}`);
            await button.click();
            await page.waitForTimeout(2000);

            // Re-extract listings
            const moreCars = await page.evaluate((targetCount) => {
              // Same extraction logic as above...
              return [];
            }, targetCount);

            allCars.push(...moreCars);
            break;
          }
        } catch (err) {
          // Continue to next selector
        }
      }
    }

  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }

  // Limit to target count
  const finalCars = allCars.slice(0, targetCount);

  console.log(`\nTotal cars scraped: ${finalCars.length}`);
  return finalCars;
}

// Run the scraper
scrapeGatewayClassicCars()
  .then(cars => {
    const outputPath = '/home/user/restomod_central/data/scraped-gateway-newest.json';
    fs.writeFileSync(outputPath, JSON.stringify(cars, null, 2));
    console.log(`\n✓ Saved ${cars.length} cars to ${outputPath}`);

    if (cars.length > 0) {
      console.log('\nSample data (first 2 cars):');
      console.log(JSON.stringify(cars.slice(0, 2), null, 2));

      console.log('\n=== SUMMARY ===');
      console.log(`Total scraped: ${cars.length} cars`);
      console.log(`Years range: ${Math.min(...cars.map((c: any) => c.year))} - ${Math.max(...cars.map((c: any) => c.year))}`);
      console.log(`Unique makes: ${new Set(cars.map((c: any) => c.make)).size}`);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
