/**
 * Scrape ClassicCars.com Corvettes
 *
 * Scrapes Corvette listings from ClassicCars.com using Playwright
 *
 * Usage:
 *   tsx scripts/scrape-cc-corvettes.ts
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface VehicleListing {
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  price: string;
  location: string;
  dealer?: string;
  imageUrl?: string;
  listingUrl: string;
}

async function scrapeCorvettes(targetCount: number = 40, pages: number = 2) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚗  Scraping ClassicCars.com Corvettes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ]
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const allVehicles: VehicleListing[] = [];
  const baseUrl = 'https://classiccars.com/listings/find?make=chevrolet&model=corvette';

  try {
    for (let pageNum = 1; pageNum <= pages; pageNum++) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}&page=${pageNum}`;
      console.log(`\n📄 Scraping page ${pageNum}: ${url}`);

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Give time for dynamic content to load
      await page.waitForTimeout(5000);

      // Take a screenshot for debugging
      if (pageNum === 1) {
        await page.screenshot({ path: 'debug-corvettes.png', fullPage: false });
        console.log('   📸 Screenshot saved to debug-corvettes.png');
      }

      // Get page title to verify we're on the right page
      const title = await page.title();
      console.log(`   📄 Page title: ${title}`);

      // Try to detect if we hit a captcha or block page
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.toLowerCase().includes('captcha') || bodyText.toLowerCase().includes('access denied')) {
        console.log('   ⚠️  Warning: May have hit captcha or access block');
      }

      // Debug: Check what's on the page
      const debugInfo = await page.evaluate(() => {
        const allLinks = document.querySelectorAll('a');
        const viewLinks = Array.from(allLinks).filter(a => a.href.includes('/listings/view/'));
        return {
          totalLinks: allLinks.length,
          viewLinks: viewLinks.length,
          sampleClasses: Array.from(document.querySelectorAll('div[class], article[class]'))
            .slice(0, 20)
            .map(el => el.className)
            .filter(c => c)
        };
      });
      console.log(`   🔍 Debug: ${debugInfo.totalLinks} total links, ${debugInfo.viewLinks} listing links`);

      // Extract listings from the page
      const vehicles = await page.evaluate(() => {
        const listings: any[] = [];

        // Try multiple selectors to find listing cards
        const cardSelectors = [
          '.listing-card',
          '.vehicle-card',
          '[data-testid="listing-card"]',
          '.result-item',
          'article[class*="listing"]',
          'div[class*="vehicle-card"]',
          'a[href*="/listings/view/"]'
        ];

        let cards: Element[] = [];
        for (const selector of cardSelectors) {
          cards = Array.from(document.querySelectorAll(selector));
          if (cards.length > 0) {
            break;
          }
        }

        // If still no cards found, try to find all links to listing pages
        if (cards.length === 0) {
          const links = Array.from(document.querySelectorAll('a[href*="/listings/view/"]'));
          const uniqueLinks = new Map();

          links.forEach(link => {
            const href = (link as HTMLAnchorElement).href;
            const match = href.match(/\/listings\/view\/(\d+)/);
            if (match && !uniqueLinks.has(match[1])) {
              uniqueLinks.set(match[1], link.closest('article, div[class*="card"], div[class*="listing"]') || link);
            }
          });

          cards = Array.from(uniqueLinks.values()) as Element[];
        }

        cards.forEach((card) => {
          try {
            // Find the listing URL
            const linkElement = card.querySelector('a[href*="/listings/view/"]') as HTMLAnchorElement;
            if (!linkElement) return;

            const listingUrl = linkElement.href;
            const stockMatch = listingUrl.match(/\/listings\/view\/(\d+)/);
            if (!stockMatch) return;

            const stockNumber = `CC-${stockMatch[1]}`;

            // Extract year, make, model from title or text
            const titleElement = card.querySelector('h2, h3, h4, .title, [class*="title"]');
            const titleText = titleElement?.textContent?.trim() || '';

            // Parse title like "1967 Chevrolet Corvette Stingray"
            const yearMatch = titleText.match(/\b(19\d{2}|20\d{2})\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 0;

            let make = 'Chevrolet';
            let model = 'Corvette';

            // Extract model variant if present
            const modelMatch = titleText.match(/Corvette\s+(.+?)(?:\s|$)/i);
            if (modelMatch) {
              model = `Corvette ${modelMatch[1].trim()}`;
            } else if (titleText.toLowerCase().includes('corvette')) {
              model = 'Corvette';
            }

            // Extract price
            const priceElement = card.querySelector('[class*="price"], .price');
            let price = priceElement?.textContent?.trim() || 'Call for Price';

            // Clean up price
            if (price && !price.includes('Call') && !price.includes('$')) {
              price = `$${price}`;
            }

            // Extract location
            const locationElement = card.querySelector('[class*="location"], .location, [class*="dealer"]');
            let location = locationElement?.textContent?.trim() || '';

            // Clean location to "City, State" format
            if (location) {
              const locParts = location.split(',').map(p => p.trim()).filter(p => p);
              if (locParts.length >= 2) {
                location = `${locParts[locParts.length - 2]}, ${locParts[locParts.length - 1]}`;
              }
            }

            // Extract dealer
            const dealerElement = card.querySelector('[class*="dealer"], [class*="seller"]');
            const dealer = dealerElement?.textContent?.trim();

            // Extract image
            const imgElement = card.querySelector('img');
            const imageUrl = imgElement?.src || imgElement?.getAttribute('data-src') || undefined;

            if (year && listingUrl) {
              listings.push({
                stockNumber,
                year,
                make,
                model,
                price,
                location: location || 'Unknown',
                dealer,
                imageUrl,
                listingUrl
              });
            }
          } catch (err) {
            console.error('Error extracting listing:', err);
          }
        });

        return listings;
      });

      console.log(`   ✅ Found ${vehicles.length} vehicles on page ${pageNum}`);

      vehicles.forEach((v: any) => {
        console.log(`      • ${v.year} ${v.make} ${v.model} - ${v.price}`);
      });

      allVehicles.push(...vehicles);

      if (allVehicles.length >= targetCount) {
        console.log(`\n✅ Reached target of ${targetCount} vehicles`);
        break;
      }

      // Add delay between pages to be respectful
      if (pageNum < pages) {
        console.log('   ⏳ Waiting 2 seconds before next page...');
        await page.waitForTimeout(2000);
      }
    }

  } catch (error: any) {
    console.error(`\n❌ Error during scraping: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }

  // Limit to target count
  const finalVehicles = allVehicles.slice(0, targetCount);

  return finalVehicles;
}

async function main() {
  try {
    const vehicles = await scrapeCorvettes(40, 2);

    // Save to file
    const outputPath = join(process.cwd(), 'data', 'scraped-cc-corvettes.json');
    writeFileSync(outputPath, JSON.stringify(vehicles, null, 2));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊  Scraping Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Total scraped: ${vehicles.length} vehicles`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log('\n🎉 Success! Import with:');
    console.log(`   npm run import:batch ${outputPath}\n`);

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
