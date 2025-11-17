/**
 * Hemmings.com Ford 1960-1980 Scraper
 *
 * Scrapes Ford vehicles from Hemmings classifieds using Playwright
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

interface ScrapedVehicle {
  stockNumber?: string;
  year: number;
  make: string;
  model: string;
  price: string;
  location?: string;
  dealer?: string;
  imageUrl?: string;
  listingUrl: string;
}

async function scrapeHemmingsFord(targetCount: number = 50): Promise<ScrapedVehicle[]> {
  console.log('🚀 Starting Hemmings.com Ford scraper...\n');
  console.log(`Target: ${targetCount} vehicles`);
  console.log(`URL: https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980\n`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--ignore-certificate-errors'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  const vehicles: ScrapedVehicle[] = [];
  let pageNum = 1;

  try {
    while (vehicles.length < targetCount) {
      const url = pageNum === 1
        ? 'https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980'
        : `https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980&page=${pageNum}`;

      console.log(`📄 Fetching page ${pageNum}...`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for listings to load
      await page.waitForSelector('.listing-card, .vehicle-card, .result-item, article, [class*="listing"]', {
        timeout: 10000
      }).catch(() => {
        console.log('⚠️  Could not find listing selector, trying alternative...');
      });

      // Extract vehicle data from the page
      const pageVehicles = await page.evaluate(() => {
        const listings: any[] = [];

        // Try multiple selectors to find listing cards
        const selectors = [
          '.listing-card',
          '.vehicle-card',
          '.result-item',
          'article[class*="listing"]',
          '[class*="classifieds-item"]',
          '[data-testid*="listing"]'
        ];

        let listingElements: NodeListOf<Element> | null = null;

        for (const selector of selectors) {
          listingElements = document.querySelectorAll(selector);
          if (listingElements.length > 0) {
            console.log(`Found ${listingElements.length} listings with selector: ${selector}`);
            break;
          }
        }

        if (!listingElements || listingElements.length === 0) {
          // Fallback: try to find any article or div that looks like a listing
          const allArticles = document.querySelectorAll('article, div[class*="card"], div[class*="item"]');
          listingElements = Array.from(allArticles).filter(el => {
            const text = el.textContent || '';
            return text.includes('$') && (text.match(/19\d{2}|20\d{2}/) !== null);
          }) as any;
        }

        if (!listingElements) return [];

        listingElements.forEach((card) => {
          try {
            // Extract data using multiple strategies
            const getText = (selectors: string[]): string => {
              for (const sel of selectors) {
                const el = card.querySelector(sel);
                if (el?.textContent?.trim()) return el.textContent.trim();
              }
              return '';
            };

            const getAttr = (selectors: string[], attr: string): string => {
              for (const sel of selectors) {
                const el = card.querySelector(sel);
                const value = el?.getAttribute(attr);
                if (value) return value;
              }
              return '';
            };

            // Extract title/heading
            const title = getText([
              'h2', 'h3', 'h4',
              '.title', '.heading', '.vehicle-title',
              '[class*="title"]', '[class*="heading"]'
            ]);

            // Extract year from title or dedicated field
            const yearMatch = title.match(/\b(19[6-7]\d|198\d)\b/) ||
                            card.textContent?.match(/\b(19[6-7]\d|198\d)\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 0;

            // Extract model from title (everything after year)
            let model = title.replace(/^\d{4}\s*/, '').replace(/^Ford\s*/i, '').trim();
            if (!model) {
              model = getText(['.model', '[class*="model"]']) || 'Unknown';
            }

            // Extract price
            const price = getText([
              '.price', '.asking-price', '[class*="price"]',
              'span:has-text("$")', 'div:has-text("$")'
            ]) || card.textContent?.match(/\$[\d,]+/)?.[0] || 'Call for Price';

            // Extract location
            const location = getText([
              '.location', '.seller-location', '[class*="location"]',
              'span:has-text(",")', 'div:has-text(",")'
            ]);

            // Extract dealer
            const dealer = getText([
              '.dealer', '.seller', '.dealer-name', '[class*="dealer"]', '[class*="seller"]'
            ]);

            // Extract image
            const imageUrl = getAttr([
              'img', 'img[class*="vehicle"]', 'img[class*="listing"]'
            ], 'src') || getAttr(['img'], 'data-src');

            // Extract listing URL
            const linkEl = card.querySelector('a[href*="/classifieds/"], a[href*="/listing/"], a');
            const listingUrl = linkEl?.getAttribute('href') || '';
            const fullUrl = listingUrl.startsWith('http')
              ? listingUrl
              : `https://www.hemmings.com${listingUrl}`;

            // Extract stock number from URL or listing
            const stockNumber = listingUrl.match(/\/(\d+)/)?.[1] ||
                              getText(['.stock', '[class*="stock"]']);

            if (year >= 1960 && year <= 1980 && model && fullUrl) {
              listings.push({
                stockNumber,
                year,
                make: 'Ford',
                model,
                price,
                location,
                dealer,
                imageUrl,
                listingUrl: fullUrl
              });
            }
          } catch (err) {
            console.error('Error parsing listing:', err);
          }
        });

        return listings;
      });

      console.log(`   Found ${pageVehicles.length} vehicles on page ${pageNum}`);

      if (pageVehicles.length === 0) {
        console.log('⚠️  No more vehicles found, stopping...');
        break;
      }

      vehicles.push(...pageVehicles);

      console.log(`   Total scraped: ${vehicles.length} / ${targetCount}`);

      if (vehicles.length >= targetCount) {
        break;
      }

      // Check if there's a next page
      const hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector('a[rel="next"], .next-page, [class*="next"]');
        return !!nextButton;
      });

      if (!hasNextPage) {
        console.log('📄 No more pages available');
        break;
      }

      pageNum++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('❌ Error during scraping:', error);
  } finally {
    await browser.close();
  }

  // Trim to target count
  const finalVehicles = vehicles.slice(0, targetCount);

  console.log(`\n✅ Scraping complete!`);
  console.log(`   Total vehicles: ${finalVehicles.length}`);

  return finalVehicles;
}

async function main() {
  const targetCount = 50;
  const outputFile = '/home/user/restomod_central/data/scraped-hem-ford.json';

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁  Hemmings.com Ford 1960-1980 Scraper');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const vehicles = await scrapeHemmingsFord(targetCount);

  if (vehicles.length === 0) {
    console.error('\n❌ No vehicles scraped. Please check the website structure.');
    process.exit(1);
  }

  // Save to file
  writeFileSync(outputFile, JSON.stringify(vehicles, null, 2));

  console.log(`\n💾 Saved to: ${outputFile}`);
  console.log('\n📊 Summary:');
  console.log(`   Total scraped: ${vehicles.length} vehicles`);
  console.log(`   Year range: ${Math.min(...vehicles.map(v => v.year))} - ${Math.max(...vehicles.map(v => v.year))}`);
  console.log(`   Make: Ford`);

  // Show model distribution
  const modelCounts = vehicles.reduce((acc, v) => {
    acc[v.model] = (acc[v.model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`\n📋 Top models scraped:`);
  Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([model, count]) => {
      console.log(`   ${model}: ${count}`);
    });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
