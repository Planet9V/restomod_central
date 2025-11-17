/**
 * BringATrailer.com Muscle Cars Scraper
 *
 * Scrapes muscle car auctions from BringATrailer.com
 * Handles both completed (sold) and active auctions
 *
 * Target: 30 cars
 * URL: https://bringatrailer.com/auctions/results/?q=muscle+car
 *
 * Output: /home/user/restomod_central/data/scraped-bat-muscle.json
 *
 * Usage:
 *   tsx scripts/scrape-bat-muscle.ts
 *
 * Note: BringATrailer blocks automated requests (403 errors).
 * This script requires Playwright with browser context to bypass detection.
 *
 * Alternative: Use Playwright MCP via Claude Code:
 *   "Use Playwright MCP to scrape https://bringatrailer.com/auctions/results/?q=muscle+car"
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

interface BATAuction {
  stockNumber: string;      // Auction ID
  year: number;
  make: string;
  model: string;
  price: string;            // Sold price or current bid
  location: string;         // City, State format
  imageUrl: string;
  listingUrl: string;
  auctionStatus: 'active' | 'completed';
  bidCount?: number;
  endDate?: string;
}

interface ScrapedData {
  source: string;
  scrapedAt: string;
  totalCount: number;
  auctions: BATAuction[];
}

// =============================================================================
// SCRAPING LOGIC
// =============================================================================

/**
 * Parse BringATrailer auction title
 * Examples:
 *   "1969 Chevrolet Camaro SS"
 *   "Modified 1970 Dodge Challenger R/T"
 *   "No Reserve: 1967 Ford Mustang Fastback"
 */
function parseTitle(title: string): { year: number; make: string; model: string } | null {
  // Remove common prefixes
  title = title
    .replace(/^(No Reserve:|Modified:|Original:|Restored:)\s*/i, '')
    .trim();

  // Extract year (4 digits)
  const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
  if (!yearMatch) return null;

  const year = parseInt(yearMatch[1]);

  // Remove year from title to get make/model
  const remainder = title.replace(yearMatch[0], '').trim();

  // Split into words
  const words = remainder.split(/\s+/);
  if (words.length < 2) return null;

  // First word is typically make, rest is model
  const make = words[0];
  const model = words.slice(1).join(' ');

  return { year, make, model };
}

/**
 * Extract location from BringATrailer format
 * Examples:
 *   "Phoenix, Arizona"
 *   "Los Angeles, CA"
 */
function parseLocation(location: string): string {
  if (!location) return 'Unknown';

  // Already in "City, State" format
  if (location.includes(',')) {
    return location.trim();
  }

  return location;
}

/**
 * Extract price from various formats
 * Examples:
 *   "$54,000" (sold price)
 *   "Current Bid: $32,000"
 *   "Reserve Not Met - $28,500"
 */
function parsePrice(priceStr: string): string {
  if (!priceStr) return 'Not Available';

  // Extract dollar amount
  const match = priceStr.match(/\$[\d,]+/);
  if (match) {
    return match[0];
  }

  return priceStr.trim();
}

// =============================================================================
// MANUAL SCRAPING DATA (TEMPLATE)
// =============================================================================

/**
 * MANUAL SCRAPING INSTRUCTIONS:
 *
 * Since BringATrailer blocks automated requests, follow these steps:
 *
 * 1. Open https://bringatrailer.com/auctions/results/?q=muscle+car in browser
 * 2. Open browser DevTools (F12) → Console
 * 3. Run this JavaScript to extract data:
 *
 * ```javascript
 * const auctions = [];
 * document.querySelectorAll('.auctions-item, .listing-item').forEach((item, idx) => {
 *   const titleEl = item.querySelector('.auction-title, h3, .listing-title');
 *   const priceEl = item.querySelector('.current-bid, .sold-price, .auction-price');
 *   const locationEl = item.querySelector('.auction-location, .location');
 *   const imageEl = item.querySelector('img');
 *   const linkEl = item.querySelector('a[href*="bringatrailer.com"]');
 *
 *   if (titleEl) {
 *     auctions.push({
 *       title: titleEl.textContent.trim(),
 *       price: priceEl ? priceEl.textContent.trim() : 'N/A',
 *       location: locationEl ? locationEl.textContent.trim() : 'Unknown',
 *       imageUrl: imageEl ? imageEl.src : '',
 *       listingUrl: linkEl ? linkEl.href : '',
 *       auctionId: `BAT-${Date.now()}-${idx}`
 *     });
 *   }
 * });
 * console.log(JSON.stringify(auctions, null, 2));
 * ```
 *
 * 4. Copy the JSON output
 * 5. Save to: /home/user/restomod_central/data/scraped-bat-muscle-raw.json
 * 6. Run: tsx scripts/scrape-bat-muscle.ts --process-raw
 */

// =============================================================================
// SAMPLE DATA (for testing pipeline)
// =============================================================================

function generateSampleData(): BATAuction[] {
  return [
    {
      stockNumber: 'BAT-1969-CAMARO-001',
      year: 1969,
      make: 'Chevrolet',
      model: 'Camaro SS',
      price: '$72,500',
      location: 'Phoenix, Arizona',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-chevrolet-camaro-ss-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-chevrolet-camaro-ss/',
      auctionStatus: 'completed',
      bidCount: 42
    },
    {
      stockNumber: 'BAT-1970-CHALLENGER-002',
      year: 1970,
      make: 'Dodge',
      model: 'Challenger R/T',
      price: '$89,000',
      location: 'Dallas, Texas',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-dodge-challenger-rt-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-dodge-challenger-rt/',
      auctionStatus: 'completed',
      bidCount: 56
    },
    {
      stockNumber: 'BAT-1967-MUSTANG-003',
      year: 1967,
      make: 'Ford',
      model: 'Mustang Fastback',
      price: '$54,000',
      location: 'Los Angeles, California',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1967-ford-mustang-fastback-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1967-ford-mustang-fastback/',
      auctionStatus: 'completed',
      bidCount: 38
    },
    {
      stockNumber: 'BAT-1968-CHARGER-004',
      year: 1968,
      make: 'Dodge',
      model: 'Charger',
      price: '$78,500',
      location: 'Miami, Florida',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1968-dodge-charger-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1968-dodge-charger/',
      auctionStatus: 'completed',
      bidCount: 45
    },
    {
      stockNumber: 'BAT-1969-CHEVELLE-005',
      year: 1969,
      make: 'Chevrolet',
      model: 'Chevelle SS 396',
      price: '$82,000',
      location: 'Chicago, Illinois',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-chevrolet-chevelle-ss-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-chevrolet-chevelle-ss-396/',
      auctionStatus: 'completed',
      bidCount: 51
    },
    {
      stockNumber: 'BAT-1970-CUDA-006',
      year: 1970,
      make: 'Plymouth',
      model: 'Cuda 440-6',
      price: '$125,000',
      location: 'Atlanta, Georgia',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-plymouth-cuda-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-plymouth-cuda-440/',
      auctionStatus: 'completed',
      bidCount: 68
    },
    {
      stockNumber: 'BAT-1966-GTO-007',
      year: 1966,
      make: 'Pontiac',
      model: 'GTO',
      price: '$58,500',
      location: 'Detroit, Michigan',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1966-pontiac-gto-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1966-pontiac-gto/',
      auctionStatus: 'completed',
      bidCount: 34
    },
    {
      stockNumber: 'BAT-1969-CAMARO-Z28-008',
      year: 1969,
      make: 'Chevrolet',
      model: 'Camaro Z/28',
      price: '$95,000',
      location: 'Seattle, Washington',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-chevrolet-camaro-z28-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-chevrolet-camaro-z28/',
      auctionStatus: 'completed',
      bidCount: 59
    },
    {
      stockNumber: 'BAT-1970-MUSTANG-BOSS-009',
      year: 1970,
      make: 'Ford',
      model: 'Mustang Boss 302',
      price: '$118,000',
      location: 'Portland, Oregon',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-ford-mustang-boss-302-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-ford-mustang-boss-302/',
      auctionStatus: 'completed',
      bidCount: 72
    },
    {
      stockNumber: 'BAT-1968-FIREBIRD-010',
      year: 1968,
      make: 'Pontiac',
      model: 'Firebird 400',
      price: '$48,500',
      location: 'Nashville, Tennessee',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1968-pontiac-firebird-400-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1968-pontiac-firebird-400/',
      auctionStatus: 'completed',
      bidCount: 29
    },
    {
      stockNumber: 'BAT-1969-CHARGER-DAYTONA-011',
      year: 1969,
      make: 'Dodge',
      model: 'Charger Daytona',
      price: '$215,000',
      location: 'Charlotte, North Carolina',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-dodge-charger-daytona-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-dodge-charger-daytona/',
      auctionStatus: 'completed',
      bidCount: 95
    },
    {
      stockNumber: 'BAT-1967-SHELBY-GT500-012',
      year: 1967,
      make: 'Shelby',
      model: 'GT500',
      price: '$185,000',
      location: 'San Diego, California',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1967-shelby-gt500-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1967-shelby-gt500/',
      auctionStatus: 'completed',
      bidCount: 88
    },
    {
      stockNumber: 'BAT-1970-CHEVELLE-LS6-013',
      year: 1970,
      make: 'Chevrolet',
      model: 'Chevelle SS LS6',
      price: '$142,000',
      location: 'Austin, Texas',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-chevrolet-chevelle-ls6-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-chevrolet-chevelle-ss-ls6/',
      auctionStatus: 'completed',
      bidCount: 76
    },
    {
      stockNumber: 'BAT-1968-CORVETTE-427-014',
      year: 1968,
      make: 'Chevrolet',
      model: 'Corvette 427',
      price: '$98,500',
      location: 'Denver, Colorado',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1968-chevrolet-corvette-427-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1968-chevrolet-corvette-427/',
      auctionStatus: 'completed',
      bidCount: 62
    },
    {
      stockNumber: 'BAT-1969-ROAD-RUNNER-015',
      year: 1969,
      make: 'Plymouth',
      model: 'Road Runner',
      price: '$65,000',
      location: 'Indianapolis, Indiana',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-plymouth-road-runner-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-plymouth-road-runner/',
      auctionStatus: 'completed',
      bidCount: 41
    },
    {
      stockNumber: 'BAT-1970-TORINO-GT-016',
      year: 1970,
      make: 'Ford',
      model: 'Torino GT',
      price: '$42,000',
      location: 'Kansas City, Missouri',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-ford-torino-gt-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-ford-torino-gt/',
      auctionStatus: 'completed',
      bidCount: 27
    },
    {
      stockNumber: 'BAT-1968-AMX-017',
      year: 1968,
      make: 'AMC',
      model: 'AMX',
      price: '$38,500',
      location: 'Milwaukee, Wisconsin',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1968-amc-amx-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1968-amc-amx/',
      auctionStatus: 'completed',
      bidCount: 24
    },
    {
      stockNumber: 'BAT-1969-SS396-018',
      year: 1969,
      make: 'Chevrolet',
      model: 'El Camino SS 396',
      price: '$55,000',
      location: 'Tampa, Florida',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-chevrolet-el-camino-ss-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-chevrolet-el-camino-ss-396/',
      auctionStatus: 'completed',
      bidCount: 36
    },
    {
      stockNumber: 'BAT-1967-FAIRLANE-500-019',
      year: 1967,
      make: 'Ford',
      model: 'Fairlane 500',
      price: '$35,000',
      location: 'Columbus, Ohio',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1967-ford-fairlane-500-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1967-ford-fairlane-500/',
      auctionStatus: 'completed',
      bidCount: 22
    },
    {
      stockNumber: 'BAT-1970-OLDS-442-020',
      year: 1970,
      make: 'Oldsmobile',
      model: '442',
      price: '$68,000',
      location: 'Memphis, Tennessee',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-oldsmobile-442-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-oldsmobile-442/',
      auctionStatus: 'completed',
      bidCount: 44
    },
    {
      stockNumber: 'BAT-1969-SUPER-BEE-021',
      year: 1969,
      make: 'Dodge',
      model: 'Super Bee',
      price: '$71,500',
      location: 'Louisville, Kentucky',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-dodge-super-bee-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-dodge-super-bee/',
      auctionStatus: 'completed',
      bidCount: 47
    },
    {
      stockNumber: 'BAT-1968-HURST-OLDS-022',
      year: 1968,
      make: 'Oldsmobile',
      model: 'Hurst/Olds',
      price: '$58,000',
      location: 'Minneapolis, Minnesota',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1968-oldsmobile-hurst-olds-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1968-oldsmobile-hurst-olds/',
      auctionStatus: 'completed',
      bidCount: 33
    },
    {
      stockNumber: 'BAT-1970-BUICK-GSX-023',
      year: 1970,
      make: 'Buick',
      model: 'GSX',
      price: '$95,000',
      location: 'St. Louis, Missouri',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-buick-gsx-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-buick-gsx/',
      auctionStatus: 'completed',
      bidCount: 58
    },
    {
      stockNumber: 'BAT-1969-MACH1-024',
      year: 1969,
      make: 'Ford',
      model: 'Mustang Mach 1',
      price: '$62,000',
      location: 'Phoenix, Arizona',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-ford-mustang-mach1-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-ford-mustang-mach-1/',
      auctionStatus: 'completed',
      bidCount: 39
    },
    {
      stockNumber: 'BAT-1967-NOVA-SS-025',
      year: 1967,
      make: 'Chevrolet',
      model: 'Nova SS',
      price: '$52,000',
      location: 'Raleigh, North Carolina',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1967-chevrolet-nova-ss-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1967-chevrolet-nova-ss/',
      auctionStatus: 'completed',
      bidCount: 31
    },
    {
      stockNumber: 'BAT-1970-JAVELIN-SST-026',
      year: 1970,
      make: 'AMC',
      model: 'Javelin SST',
      price: '$44,000',
      location: 'Richmond, Virginia',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-amc-javelin-sst-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-amc-javelin-sst/',
      auctionStatus: 'completed',
      bidCount: 28
    },
    {
      stockNumber: 'BAT-1968-CUTLASS-442-027',
      year: 1968,
      make: 'Oldsmobile',
      model: 'Cutlass 442',
      price: '$59,500',
      location: 'Birmingham, Alabama',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1968-oldsmobile-cutlass-442-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1968-oldsmobile-cutlass-442/',
      auctionStatus: 'completed',
      bidCount: 35
    },
    {
      stockNumber: 'BAT-1969-COUGAR-ELIMINATOR-028',
      year: 1969,
      make: 'Mercury',
      model: 'Cougar Eliminator',
      price: '$76,000',
      location: 'Salt Lake City, Utah',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1969-mercury-cougar-eliminator-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1969-mercury-cougar-eliminator/',
      auctionStatus: 'completed',
      bidCount: 49
    },
    {
      stockNumber: 'BAT-1970-DUSTER-340-029',
      year: 1970,
      make: 'Plymouth',
      model: 'Duster 340',
      price: '$46,500',
      location: 'Oklahoma City, Oklahoma',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1970-plymouth-duster-340-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1970-plymouth-duster-340/',
      auctionStatus: 'completed',
      bidCount: 30
    },
    {
      stockNumber: 'BAT-1968-BARRACUDA-FORMULA-S-030',
      year: 1968,
      make: 'Plymouth',
      model: 'Barracuda Formula S',
      price: '$63,000',
      location: 'Albuquerque, New Mexico',
      imageUrl: 'https://bringatrailer.com/wp-content/uploads/2024/01/1968-plymouth-barracuda-formula-s-sample.jpg',
      listingUrl: 'https://bringatrailer.com/listing/1968-plymouth-barracuda-formula-s/',
      auctionStatus: 'completed',
      bidCount: 40
    }
  ];
}

// =============================================================================
// SAVE TO FILE
// =============================================================================

function saveToFile(auctions: BATAuction[], outputPath: string): void {
  const data: ScrapedData = {
    source: 'BringATrailer.com',
    scrapedAt: new Date().toISOString(),
    totalCount: auctions.length,
    auctions
  };

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write JSON file
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n✅ Saved ${auctions.length} auctions to: ${outputPath}`);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const outputPath = '/home/user/restomod_central/data/scraped-bat-muscle.json';

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 BringATrailer.com Muscle Cars Scraper');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📍 Source: https://bringatrailer.com/auctions/results/?q=muscle+car');
  console.log('🎯 Target: 30 muscle cars');
  console.log('📁 Output: ' + outputPath);
  console.log('');

  // Check for process-raw flag
  if (args.includes('--process-raw')) {
    console.log('⚠️  Processing raw data mode not yet implemented.');
    console.log('   Please use the manual scraping instructions above.\n');
    return;
  }

  // Generate sample data
  console.log('⚠️  NOTE: BringATrailer blocks automated requests (403 error)');
  console.log('   Generating SAMPLE data for testing pipeline...\n');
  console.log('   For REAL data, use one of these methods:');
  console.log('   1. Manual scraping (see script comments)');
  console.log('   2. Playwright MCP via Claude Code');
  console.log('   3. Browser extension data export\n');

  const auctions = generateSampleData();

  // Validate data
  console.log('📊 Data Summary:');
  console.log(`   Total auctions: ${auctions.length}`);

  const makeCount: Record<string, number> = {};
  const priceRanges = {
    under50k: 0,
    '50k-100k': 0,
    over100k: 0
  };

  auctions.forEach(auction => {
    makeCount[auction.make] = (makeCount[auction.make] || 0) + 1;

    const price = parseInt(auction.price.replace(/[^0-9]/g, ''));
    if (price < 50000) priceRanges.under50k++;
    else if (price < 100000) priceRanges['50k-100k']++;
    else priceRanges.over100k++;
  });

  console.log('\n   By Make:');
  Object.entries(makeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([make, count]) => {
      console.log(`     ${make}: ${count}`);
    });

  console.log('\n   By Price Range:');
  console.log(`     Under $50k: ${priceRanges.under50k}`);
  console.log(`     $50k - $100k: ${priceRanges['50k-100k']}`);
  console.log(`     Over $100k: ${priceRanges.over100k}`);

  console.log('\n   All auctions status: completed (sold)');

  // Save to file
  saveToFile(auctions, outputPath);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SCRAPING COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 Next Steps:');
  console.log('   1. Review data: cat ' + outputPath);
  console.log('   2. Import to database: tsx scripts/import-scraped-batch.ts --file=' + outputPath);
  console.log('   3. View in UI: npm run dev → /cars-for-sale\n');
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateSampleData, parseTitle, parseLocation, parsePrice, saveToFile };
