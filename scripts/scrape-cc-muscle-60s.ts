/**
 * Scrape ClassicCars.com 1960s Muscle Cars
 *
 * Scrapes muscle car listings from the 1960s (1960-1969) from ClassicCars.com using Playwright
 *
 * Usage:
 *   tsx scripts/scrape-cc-muscle-60s.ts
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

async function scrapeMuscle60s(targetCount: number = 40, pages: number = 2) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚗  Scraping ClassicCars.com 1960s Muscle Cars');
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
  const baseUrl = 'https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars';

  try {
    for (let pageNum = 1; pageNum <= pages; pageNum++) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}&page=${pageNum}`;
      console.log(`\n📄 Scraping page ${pageNum}: ${url}`);

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Give time for dynamic content to load
      await page.waitForTimeout(5000);

      // Check if we can access the page
      const pageTitle = await page.title();
      console.log(`   Page title: ${pageTitle}`);

      // Save a screenshot and HTML for debugging if needed
      if (pageNum === 1) {
        const bodyHTML = await page.evaluate(() => document.body.innerHTML);
        if (bodyHTML.toLowerCase().includes('access denied') || bodyHTML.toLowerCase().includes('blocked')) {
          console.log('   ⚠️  Page appears to be blocked');
          writeFileSync('/home/user/restomod_central/debug-page.html', bodyHTML);
        }
      }

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
            console.log(`Found ${cards.length} cards with selector: ${selector}`);
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

            // Parse title like "1967 Chevrolet Camaro SS"
            const yearMatch = titleText.match(/\b(19[6-9]\d)\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 0;

            // Extract make and model from title
            let make = '';
            let model = '';

            // Remove year from title and split
            const withoutYear = titleText.replace(/\b(19[6-9]\d)\b/, '').trim();
            const parts = withoutYear.split(/\s+/).filter(p => p.length > 0);

            if (parts.length >= 2) {
              make = parts[0];
              model = parts.slice(1).join(' ');
            } else if (parts.length === 1) {
              make = parts[0];
            }

            // Extract price
            const priceElement = card.querySelector('[class*="price"], .price');
            let price = priceElement?.textContent?.trim() || 'Call for Price';

            // Clean up price
            if (price && !price.toLowerCase().includes('call') && !price.includes('$')) {
              price = `$${price}`;
            } else if (!price || price === '') {
              price = 'Call for Price';
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

            // Only add if year is in the 1960s and we have required data
            if (year >= 1960 && year <= 1969 && listingUrl) {
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
    const vehicles = await scrapeMuscle60s(40, 2);

    // Save to file
    const outputPath = join(process.cwd(), 'data', 'scraped-cc-muscle-60s.json');
    writeFileSync(outputPath, JSON.stringify(vehicles, null, 2));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊  Scraping Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Total scraped: ${vehicles.length} vehicles`);
    console.log(`💾 Saved to: ${outputPath}`);

    // Show year distribution
    const yearCounts: Record<number, number> = {};
    vehicles.forEach(v => {
      yearCounts[v.year] = (yearCounts[v.year] || 0) + 1;
    });

    console.log('\n📅 Year Distribution:');
    Object.entries(yearCounts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([year, count]) => {
        console.log(`   ${year}: ${count} cars`);
      });

    // Show make distribution
    const makeCounts: Record<string, number> = {};
    vehicles.forEach(v => {
      makeCounts[v.make] = (makeCounts[v.make] || 0) + 1;
    });

    console.log('\n🏭 Make Distribution:');
    Object.entries(makeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([make, count]) => {
        console.log(`   ${make}: ${count} cars`);
      });

    console.log('\n🎉 Success!\n');

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
