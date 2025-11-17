import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface VehicleListing {
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

async function scrapeHemmingsDodge() {
  const url = 'https://www.hemmings.com/classifieds?make=Dodge&year_range=1965-1975';
  const targetCount = 40;

  console.log('\n🚗 Scraping Hemmings.com - Dodge 1965-1975');
  console.log('='.repeat(60));
  console.log(`URL: ${url}`);
  console.log(`Target: ${targetCount} vehicles\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const vehicles: VehicleListing[] = [];

  try {
    console.log('🌐 Loading page...');
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });

    // Wait for listings to load
    await page.waitForTimeout(3000);

    // Try different selectors for Hemmings listings
    const possibleSelectors = [
      '.listing-card',
      '.vehicle-listing',
      '.classified-listing',
      'article.listing',
      '[data-testid="listing"]',
      '.listing-item',
      '.search-result',
      'div[class*="listing"]',
      'div[class*="vehicle"]'
    ];

    let listingSelector = '';
    for (const selector of possibleSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        listingSelector = selector;
        console.log(`✅ Found ${count} listings using selector: ${selector}`);
        break;
      }
    }

    if (!listingSelector) {
      // Try to extract listings from the page content
      console.log('⚠️  No standard listing selector found, analyzing page structure...');

      // Get all links that might be vehicle listings
      const listings = await page.evaluate(() => {
        const results: any[] = [];

        // Look for vehicle listing patterns in the page
        const links = Array.from(document.querySelectorAll('a[href*="/classifieds/"]'));
        const vehicleLinks = links.filter(link => {
          const href = (link as HTMLAnchorElement).href;
          return href.includes('/classifieds/') && !href.endsWith('/classifieds');
        });

        const uniqueLinks = new Set<string>();

        vehicleLinks.forEach((link) => {
          const anchor = link as HTMLAnchorElement;
          const href = anchor.href;

          if (uniqueLinks.has(href)) return;
          uniqueLinks.add(href);

          // Try to find associated data
          const container = anchor.closest('div, article, li') || anchor;
          const text = container.textContent || '';

          // Extract year (1965-1975)
          const yearMatch = text.match(/\b(196[5-9]|197[0-5])\b/);

          // Extract price
          const priceMatch = text.match(/\$[\d,]+/) || text.match(/Call/i);

          // Extract location (City, State pattern)
          const locationMatch = text.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})/);

          if (yearMatch) {
            results.push({
              url: href,
              text: text.trim().substring(0, 200),
              year: yearMatch[1],
              price: priceMatch ? priceMatch[0] : 'Call for Price',
              location: locationMatch ? `${locationMatch[1]}, ${locationMatch[2]}` : 'Unknown',
              imgSrc: container.querySelector('img')?.src || ''
            });
          }
        });

        return results;
      });

      console.log(`📋 Found ${listings.length} potential vehicle listings`);

      // Process each listing
      for (let i = 0; i < Math.min(listings.length, targetCount); i++) {
        const listing = listings[i];

        // Extract model from text
        const text = listing.text;
        const makeIndex = text.toLowerCase().indexOf('dodge');
        let model = 'Unknown';

        if (makeIndex !== -1) {
          const afterMake = text.substring(makeIndex + 5).trim();
          const modelMatch = afterMake.match(/^([A-Za-z0-9\s\-]+)/);
          if (modelMatch) {
            model = modelMatch[1].trim().split(/\s{2,}|[\n\r]/)[0];
          }
        }

        // Extract stock number from URL
        const stockMatch = listing.url.match(/\/(\d+)$/);
        const stockNumber = stockMatch ? stockMatch[1] : `HEM-${i + 1}`;

        vehicles.push({
          stockNumber,
          year: parseInt(listing.year),
          make: 'Dodge',
          model,
          price: listing.price,
          location: listing.location,
          dealer: 'Hemmings Seller',
          imageUrl: listing.imgSrc,
          listingUrl: listing.url
        });

        console.log(`   ${i + 1}. ${listing.year} Dodge ${model} - ${listing.price}`);
      }
    } else {
      // Use the found selector to extract listings
      const listingCount = await page.locator(listingSelector).count();
      const itemsToScrape = Math.min(listingCount, targetCount);

      console.log(`📊 Extracting ${itemsToScrape} vehicles...\n`);

      for (let i = 0; i < itemsToScrape; i++) {
        const listing = page.locator(listingSelector).nth(i);

        try {
          // Extract data from the listing
          const listingData = await listing.evaluate((el) => {
            const getText = (selector: string) => {
              const element = el.querySelector(selector);
              return element?.textContent?.trim() || '';
            };

            const getAttr = (selector: string, attr: string) => {
              const element = el.querySelector(selector);
              return element?.getAttribute(attr) || '';
            };

            const getAllText = () => el.textContent?.trim() || '';

            return {
              text: getAllText(),
              href: getAttr('a', 'href') || (el as HTMLAnchorElement).href,
              imgSrc: getAttr('img', 'src'),
              html: el.innerHTML
            };
          });

          // Parse the listing data
          const text = listingData.text;

          // Extract year
          const yearMatch = text.match(/\b(196[5-9]|197[0-5])\b/);
          const year = yearMatch ? parseInt(yearMatch[1]) : 1970;

          // Extract model
          const makeIndex = text.toLowerCase().indexOf('dodge');
          let model = 'Unknown';
          if (makeIndex !== -1) {
            const afterMake = text.substring(makeIndex + 5).trim();
            const modelMatch = afterMake.match(/^([A-Za-z0-9\s\-]+)/);
            if (modelMatch) {
              model = modelMatch[1].trim().split(/\s{2,}|[\n\r]/)[0];
            }
          }

          // Extract price
          const priceMatch = text.match(/\$[\d,]+/) || text.match(/Call/i);
          const price = priceMatch ? priceMatch[0] : 'Call for Price';

          // Extract location
          const locationMatch = text.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})/);
          const location = locationMatch ? `${locationMatch[1]}, ${locationMatch[2]}` : 'Unknown';

          // Extract stock number from URL
          const fullUrl = listingData.href.startsWith('http')
            ? listingData.href
            : `https://www.hemmings.com${listingData.href}`;

          const stockMatch = fullUrl.match(/\/(\d+)$/);
          const stockNumber = stockMatch ? stockMatch[1] : `HEM-${i + 1}`;

          vehicles.push({
            stockNumber,
            year,
            make: 'Dodge',
            model,
            price,
            location,
            dealer: 'Hemmings Seller',
            imageUrl: listingData.imgSrc,
            listingUrl: fullUrl
          });

          console.log(`   ${i + 1}. ${year} Dodge ${model} - ${price}`);
        } catch (error) {
          console.error(`   ❌ Error extracting listing ${i + 1}:`, error);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
  } finally {
    await browser.close();
  }

  // Save to file
  const outputPath = '/home/user/restomod_central/data/scraped-hem-dodge.json';
  fs.writeFileSync(outputPath, JSON.stringify(vehicles, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Scraping complete!`);
  console.log(`📊 Total scraped: ${vehicles.length} vehicles`);
  console.log(`💾 Saved to: ${outputPath}\n`);

  // Print summary
  if (vehicles.length > 0) {
    const yearCounts: Record<number, number> = {};
    vehicles.forEach(v => {
      yearCounts[v.year] = (yearCounts[v.year] || 0) + 1;
    });

    console.log('📈 Year distribution:');
    Object.entries(yearCounts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([year, count]) => {
        console.log(`   ${year}: ${count} vehicles`);
      });
  }

  return vehicles;
}

// Run the scraper
scrapeHemmingsDodge()
  .then(vehicles => {
    console.log(`\n🎉 Successfully scraped ${vehicles.length} Dodge vehicles from Hemmings.com\n`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  });
