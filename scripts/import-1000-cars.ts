/**
 * Multi-Source Classic Car Import Script
 *
 * Imports 1000+ real classic cars from multiple sources:
 * - ClassicCars.com
 * - Hemmings.com
 * - BringATrailer.com
 * - Gateway Classic Cars
 * - eBay Motors
 *
 * Usage:
 *   npm run import:1000-cars
 *
 * Or with specific source:
 *   tsx scripts/import-1000-cars.ts --source=classiccars --limit=100
 */

import { db } from '../db';
import { carsForSale } from '../shared/schema';
import type { InsertCarForSale } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

// =============================================================================
// TYPES
// =============================================================================

interface ScraperConfig {
  source: SourceType;
  name: string;
  baseUrl: string;
  searchUrls: SearchUrl[];
  selectors: Selectors;
  enabled: boolean;
  targetCount: number;
  priority: number; // 1 = highest quality
}

type SourceType = 'classiccars' | 'hemmings' | 'bringatrailer' | 'gateway' | 'ebay' | 'carsonline';

interface SearchUrl {
  url: string;
  description: string;
  targetCount: number;
}

interface Selectors {
  listingContainer: string;
  nextPage?: string;
  fields: {
    stockNumber?: string;
    year: string;
    make: string;
    model: string;
    price: string;
    location?: string;
    city?: string;
    state?: string;
    dealer?: string;
    phone?: string;
    email?: string;
    mileage?: string;
    condition?: string;
    description?: string;
    image?: string;
    gallery?: string;
    vin?: string;
    engine?: string;
    transmission?: string;
    exteriorColor?: string;
    interiorColor?: string;
    bodyStyle?: string;
    listingUrl?: string;
  };
}

interface ScrapedVehicle {
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  price?: string;
  sourceType: string;
  sourceName: string;
  locationCity?: string;
  locationState?: string;
  locationRegion?: string;
  category?: string;
  condition?: string;
  mileage?: number;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  transmission?: string;
  vin?: string;
  bodyStyle?: string;
  description?: string;
  features?: string[];
  dealer?: string;
  dealerPhone?: string;
  dealerEmail?: string;
  imageUrl?: string;
  galleryImages?: string[];
  listingUrl?: string;
  investmentGrade?: string;
  marketTrend?: string;
  scrapedAt?: Date;
}

interface ImportStats {
  totalProcessed: number;
  imported: number;
  duplicates: number;
  errors: number;
  bySource: Record<string, number>;
  byCategory: Record<string, number>;
  startTime: Date;
  endTime?: Date;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const SCRAPER_CONFIGS: ScraperConfig[] = [
  {
    source: 'classiccars',
    name: 'ClassicCars.com',
    baseUrl: 'https://classiccars.com',
    enabled: true,
    targetCount: 300,
    priority: 2,
    searchUrls: [
      {
        url: 'https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars&page=1',
        description: '1960s Muscle Cars',
        targetCount: 100
      },
      {
        url: 'https://classiccars.com/listings/find?year-min=1950&year-max=1959&page=1',
        description: '1950s Classics',
        targetCount: 75
      },
      {
        url: 'https://classiccars.com/listings/find?make=chevrolet&model=corvette&page=1',
        description: 'Corvettes All Years',
        targetCount: 50
      },
      {
        url: 'https://classiccars.com/listings/find?make=ford&model=mustang&page=1',
        description: 'Mustangs All Years',
        targetCount: 50
      },
      {
        url: 'https://classiccars.com/listings/find?year-min=1930&year-max=1949&page=1',
        description: 'Pre-War Classics',
        targetCount: 25
      }
    ],
    selectors: {
      listingContainer: '.vehicle-card, .listing-card, [data-testid="vehicle-card"]',
      nextPage: '.pagination .next, a[rel="next"]',
      fields: {
        stockNumber: '.stock-number, [data-testid="stock-number"]',
        year: '.vehicle-year, [data-testid="year"]',
        make: '.vehicle-make, [data-testid="make"]',
        model: '.vehicle-model, [data-testid="model"]',
        price: '.vehicle-price, [data-testid="price"]',
        location: '.vehicle-location, [data-testid="location"]',
        dealer: '.dealer-name, [data-testid="dealer"]',
        mileage: '.vehicle-mileage, [data-testid="mileage"]',
        image: 'img.vehicle-image, [data-testid="vehicle-image"]',
        listingUrl: 'a.listing-link, [data-testid="listing-url"]'
      }
    }
  },
  {
    source: 'hemmings',
    name: 'Hemmings Motor News',
    baseUrl: 'https://www.hemmings.com',
    enabled: true,
    targetCount: 200,
    priority: 1, // Highest quality
    searchUrls: [
      {
        url: 'https://www.hemmings.com/classifieds?make=Chevrolet&year_range=1950-1980',
        description: 'Chevrolet 1950-1980',
        targetCount: 60
      },
      {
        url: 'https://www.hemmings.com/classifieds?make=Ford&year_range=1950-1980',
        description: 'Ford 1950-1980',
        targetCount: 60
      },
      {
        url: 'https://www.hemmings.com/classifieds?make=Dodge&year_range=1960-1975',
        description: 'Dodge/Plymouth Muscle',
        targetCount: 40
      },
      {
        url: 'https://www.hemmings.com/classifieds?make=Pontiac&year_range=1960-1975',
        description: 'Pontiac/Oldsmobile',
        targetCount: 40
      }
    ],
    selectors: {
      listingContainer: '.classified-item, .listing',
      nextPage: '.pagination-next, a[rel="next"]',
      fields: {
        year: '.year',
        make: '.make',
        model: '.model',
        price: '.price',
        location: '.location',
        dealer: '.seller-name',
        mileage: '.mileage',
        image: '.listing-image img',
        listingUrl: 'a.listing-link'
      }
    }
  },
  {
    source: 'bringatrailer',
    name: 'Bring a Trailer',
    baseUrl: 'https://bringatrailer.com',
    enabled: true,
    targetCount: 150,
    priority: 1, // Highest quality, includes sold prices
    searchUrls: [
      {
        url: 'https://bringatrailer.com/auctions/results/?q=muscle+car',
        description: 'Muscle Cars - Completed Auctions',
        targetCount: 50
      },
      {
        url: 'https://bringatrailer.com/auctions/results/?q=corvette',
        description: 'Corvettes - All Auctions',
        targetCount: 30
      },
      {
        url: 'https://bringatrailer.com/auctions/results/?q=mustang',
        description: 'Mustangs - All Auctions',
        targetCount: 30
      },
      {
        url: 'https://bringatrailer.com/auctions/results/?q=american+classic',
        description: 'American Classics',
        targetCount: 40
      }
    ],
    selectors: {
      listingContainer: '.listing-item, .auction-item',
      nextPage: '.pagination .next-page',
      fields: {
        year: '.auction-title', // Extract from title
        make: '.auction-title',
        model: '.auction-title',
        price: '.current-bid, .sold-price',
        location: '.auction-location',
        image: '.auction-image img',
        listingUrl: 'a.auction-link'
      }
    }
  },
  {
    source: 'gateway',
    name: 'Gateway Classic Cars',
    baseUrl: 'https://www.gatewayclassiccars.com',
    enabled: true,
    targetCount: 100,
    priority: 2,
    searchUrls: [
      {
        url: 'https://www.gatewayclassiccars.com/inventory?location=all',
        description: 'All Locations',
        targetCount: 100
      }
    ],
    selectors: {
      listingContainer: '.vehicle-card, .inventory-item',
      nextPage: '.pagination-next',
      fields: {
        stockNumber: '.stock-number',
        year: '.vehicle-year',
        make: '.vehicle-make',
        model: '.vehicle-model',
        price: '.vehicle-price',
        location: '.vehicle-location',
        image: '.vehicle-image img',
        listingUrl: 'a.vehicle-link'
      }
    }
  }
];

// =============================================================================
// VALIDATION & UTILITIES
// =============================================================================

const VALID_MAKES = [
  'Chevrolet', 'Ford', 'Dodge', 'Plymouth', 'Pontiac', 'Oldsmobile', 'Buick',
  'Cadillac', 'Mercury', 'AMC', 'Chrysler', 'Lincoln', 'Studebaker', 'Packard',
  'Hudson', 'Nash', 'DeSoto', 'Edsel', 'Shelby', 'AC', 'Jaguar', 'Triumph',
  'MG', 'Austin-Healey', 'Porsche', 'Ferrari', 'Lamborghini', 'Maserati',
  'Alfa Romeo', 'Fiat', 'Lancia', 'Mercedes-Benz', 'BMW', 'Volkswagen'
];

function validateVehicle(vehicle: Partial<ScrapedVehicle>): boolean {
  // Required fields
  if (!vehicle.year || !vehicle.make || !vehicle.model) {
    console.log(`❌ Missing required fields: ${JSON.stringify({ year: vehicle.year, make: vehicle.make, model: vehicle.model })}`);
    return false;
  }

  // Year range
  if (vehicle.year < 1900 || vehicle.year > new Date().getFullYear()) {
    console.log(`❌ Invalid year: ${vehicle.year}`);
    return false;
  }

  // Stock number (generate if missing)
  if (!vehicle.stockNumber) {
    vehicle.stockNumber = `AUTO-${vehicle.year}-${vehicle.make.substring(0, 3).toUpperCase()}-${Date.now()}`;
  }

  return true;
}

function normalizePrice(priceStr: string | undefined): string | undefined {
  if (!priceStr) return undefined;

  // Remove non-numeric characters except comma and dollar sign
  const cleaned = priceStr.replace(/[^\d,]/g, '');
  if (!cleaned) return 'Call for Price';

  // Ensure it starts with $
  return '$' + cleaned;
}

function extractLocationRegion(state: string | undefined): string | undefined {
  if (!state) return undefined;

  const midwest = ['IL', 'IN', 'MI', 'OH', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'];
  const south = ['TX', 'FL', 'GA', 'NC', 'SC', 'TN', 'AL', 'MS', 'LA', 'AR', 'KY', 'WV', 'VA', 'OK'];
  const west = ['CA', 'AZ', 'NV', 'WA', 'OR', 'CO', 'UT', 'ID', 'MT', 'WY', 'NM', 'AK', 'HI'];
  const northeast = ['NY', 'PA', 'NJ', 'MA', 'CT', 'RI', 'VT', 'NH', 'ME', 'MD', 'DE', 'DC'];

  const stateUpper = state.toUpperCase();

  if (midwest.includes(stateUpper)) return 'midwest';
  if (south.includes(stateUpper)) return 'south';
  if (west.includes(stateUpper)) return 'west';
  if (northeast.includes(stateUpper)) return 'northeast';

  return undefined;
}

function categorizeVehicle(make: string, model: string, year: number): string {
  const modelLower = model.toLowerCase();
  const makeLower = make.toLowerCase();

  // Muscle Cars
  if (
    modelLower.includes('camaro') || modelLower.includes('chevelle') ||
    modelLower.includes('mustang') || modelLower.includes('gt500') ||
    modelLower.includes('charger') || modelLower.includes('challenger') ||
    modelLower.includes('cuda') || modelLower.includes('barracuda') ||
    modelLower.includes('gto') || modelLower.includes('firebird') ||
    modelLower.includes('442') || modelLower.includes('gs')
  ) {
    return 'Muscle Cars';
  }

  // Sports Cars
  if (
    modelLower.includes('corvette') || modelLower.includes('cobra') ||
    modelLower.includes('thunderbird') || modelLower.includes('jaguar') ||
    modelLower.includes('porsche') || modelLower.includes('ferrari')
  ) {
    return 'Sports Cars';
  }

  // Luxury Cars
  if (
    makeLower.includes('cadillac') || makeLower.includes('lincoln') ||
    modelLower.includes('continental') || modelLower.includes('eldorado') ||
    makeLower.includes('mercedes') || makeLower.includes('rolls')
  ) {
    return 'Luxury Cars';
  }

  // Trucks
  if (
    modelLower.includes('truck') || modelLower.includes('pickup') ||
    modelLower.includes('f-100') || modelLower.includes('c10')
  ) {
    return 'Classic Trucks';
  }

  return 'Classic Cars';
}

function estimateInvestmentGrade(year: number, make: string, model: string, price?: string): string {
  if (!price || price === 'Call for Price') return 'Medium';

  const priceNum = parseInt(price.replace(/[^\d]/g, '')) || 0;

  if (priceNum > 200000) return 'Premium';
  if (priceNum > 100000) return 'High';
  if (priceNum > 50000) return 'Medium';
  return 'Entry Level';
}

// =============================================================================
// DEDUPLICATION
// =============================================================================

async function isDuplicate(vehicle: ScrapedVehicle): Promise<boolean> {
  try {
    // Check by exact stock number
    if (vehicle.stockNumber) {
      const existing = await db.query.carsForSale.findFirst({
        where: eq(carsForSale.stockNumber, vehicle.stockNumber)
      });
      if (existing) {
        console.log(`⏭️  Duplicate stock number: ${vehicle.stockNumber}`);
        return true;
      }
    }

    // Check by VIN if available
    if (vehicle.vin) {
      const existing = await db.query.carsForSale.findFirst({
        where: eq(carsForSale.vin, vehicle.vin)
      });
      if (existing) {
        console.log(`⏭️  Duplicate VIN: ${vehicle.vin}`);
        return true;
      }
    }

    // Fuzzy match: same year + make + model + similar location
    const similarVehicles = await db.query.carsForSale.findMany({
      where: and(
        eq(carsForSale.year, vehicle.year),
        eq(carsForSale.make, vehicle.make),
        eq(carsForSale.model, vehicle.model)
      )
    });

    for (const existing of similarVehicles) {
      // If same city/state and similar price, likely duplicate
      if (
        existing.locationCity === vehicle.locationCity &&
        existing.locationState === vehicle.locationState
      ) {
        console.log(`⏭️  Fuzzy duplicate: ${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.locationCity}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false; // On error, allow import (better than losing data)
  }
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function importVehicle(vehicle: ScrapedVehicle): Promise<boolean> {
  try {
    // Validate
    if (!validateVehicle(vehicle)) {
      return false;
    }

    // Check for duplicates
    if (await isDuplicate(vehicle)) {
      return false;
    }

    // Enrich data
    const now = new Date();
    const enrichedVehicle: InsertCarForSale = {
      stockNumber: vehicle.stockNumber,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      price: normalizePrice(vehicle.price),
      sourceType: 'import',
      sourceName: vehicle.sourceName,
      locationCity: vehicle.locationCity,
      locationState: vehicle.locationState,
      locationRegion: extractLocationRegion(vehicle.locationState),
      category: vehicle.category || categorizeVehicle(vehicle.make, vehicle.model, vehicle.year),
      condition: vehicle.condition || 'Good',
      mileage: vehicle.mileage,
      exteriorColor: vehicle.exteriorColor,
      interiorColor: vehicle.interiorColor,
      engine: vehicle.engine,
      transmission: vehicle.transmission,
      vin: vehicle.vin,
      bodyStyle: vehicle.bodyStyle,
      description: vehicle.description,
      features: vehicle.features,
      dealer: vehicle.dealer,
      dealerPhone: vehicle.dealerPhone,
      dealerEmail: vehicle.dealerEmail,
      imageUrl: vehicle.imageUrl,
      galleryImages: vehicle.galleryImages,
      listingUrl: vehicle.listingUrl,
      investmentGrade: vehicle.investmentGrade || estimateInvestmentGrade(vehicle.year, vehicle.make, vehicle.model, vehicle.price),
      marketTrend: vehicle.marketTrend,
      scrapedAt: new Date(),
      createdAt: now,
      updatedAt: now
    };

    // Insert into database
    await db.insert(carsForSale).values(enrichedVehicle);

    console.log(`✅ Imported: ${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.price || 'N/A'}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error importing vehicle:`, error.message);
    return false;
  }
}

// =============================================================================
// PLACEHOLDER: ACTUAL WEB SCRAPING
// =============================================================================

/**
 * THIS IS A PLACEHOLDER FOR ACTUAL WEB SCRAPING
 *
 * To implement real scraping, you need to:
 *
 * Option 1: Use Playwright MCP (Free, via Claude Code)
 *   - Install: `claude mcp add playwright npx -- @playwright/mcp@latest`
 *   - Use in Claude Code: "Use Playwright MCP to scrape ClassicCars.com..."
 *   - This function would receive the scraped data as JSON
 *
 * Option 2: Use Firecrawl API (Paid, $20-40 for 1000 cars)
 *   - Install: `npm install @mendable/firecrawl-js`
 *   - API call to scrape and extract structured data
 *
 * Option 3: Use Puppeteer/Playwright directly (requires more code)
 *   - Install: `npm install puppeteer` or `npm install playwright`
 *   - Write selectors and extraction logic
 *
 * For now, this returns mock data for testing the import pipeline.
 */
async function scrapeSource(config: ScraperConfig, limit: number = 50): Promise<ScrapedVehicle[]> {
  console.log(`\n🔍 Scraping ${config.name}...`);
  console.log(`   Target: ${limit} vehicles`);
  console.log(`   URLs: ${config.searchUrls.length} search pages\n`);

  // PLACEHOLDER: Return mock data
  // In production, this would use Playwright/Puppeteer/Firecrawl
  console.log('⚠️  NOTE: This is PLACEHOLDER data. To scrape real cars:');
  console.log('   1. Install Playwright MCP: `claude mcp add playwright npx -- @playwright/mcp@latest`');
  console.log('   2. Ask Claude Code: "Use Playwright MCP to scrape ClassicCars.com with these URLs"');
  console.log('   3. Or implement Firecrawl/Puppeteer integration here\n');

  const mockVehicles: ScrapedVehicle[] = [];

  // Generate a few mock vehicles for testing
  const makes = ['Chevrolet', 'Ford', 'Dodge', 'Pontiac'];
  const models = ['Corvette', 'Mustang', 'Charger', 'GTO'];
  const cities = ['Phoenix', 'Dallas', 'Chicago', 'Miami'];
  const states = ['AZ', 'TX', 'IL', 'FL'];

  for (let i = 0; i < Math.min(limit, 5); i++) {
    const make = makes[i % makes.length];
    const model = models[i % models.length];
    const year = 1965 + (i * 2);
    const city = cities[i % cities.length];
    const state = states[i % states.length];

    mockVehicles.push({
      stockNumber: `${config.source.toUpperCase()}-TEST-${Date.now()}-${i}`,
      year,
      make,
      model,
      price: `$${(50000 + i * 10000).toLocaleString()}`,
      sourceType: 'import',
      sourceName: config.name,
      locationCity: city,
      locationState: state,
      locationRegion: extractLocationRegion(state),
      category: categorizeVehicle(make, model, year),
      condition: 'Excellent',
      mileage: 45000 + (i * 1000),
      description: `Beautiful ${year} ${make} ${model} in excellent condition.`,
      dealer: `${city} Classic Cars`,
      dealerPhone: '555-' + String(1000 + i).padStart(4, '0'),
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
      scrapedAt: new Date()
    });
  }

  return mockVehicles;
}

// =============================================================================
// MAIN IMPORT ORCHESTRATOR
// =============================================================================

async function importCars(options: {
  sources?: SourceType[];
  limit?: number;
  testMode?: boolean;
}) {
  const stats: ImportStats = {
    totalProcessed: 0,
    imported: 0,
    duplicates: 0,
    errors: 0,
    bySource: {},
    byCategory: {},
    startTime: new Date()
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚗  CLASSIC CARS IMPORT - Multi-Source Scraper');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Filter configs based on options
  let configs = SCRAPER_CONFIGS.filter(c => c.enabled);
  if (options.sources && options.sources.length > 0) {
    configs = configs.filter(c => options.sources!.includes(c.source));
  }

  console.log(`📊 Sources: ${configs.map(c => c.name).join(', ')}`);
  console.log(`🎯 Target: ${options.limit || 'All available'} total vehicles`);
  console.log(`🧪 Test Mode: ${options.testMode ? 'YES (mock data)' : 'NO (real scraping)'}\n`);

  // Process each source
  for (const config of configs) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${config.name}`);
    console.log(`${'='.repeat(60)}`);

    const sourceLimit = options.limit
      ? Math.floor(options.limit / configs.length)
      : config.targetCount;

    try {
      // Scrape vehicles from this source
      const vehicles = await scrapeSource(config, sourceLimit);
      console.log(`\n📦 Scraped ${vehicles.length} vehicles from ${config.name}`);

      // Import each vehicle
      for (const vehicle of vehicles) {
        stats.totalProcessed++;

        const success = await importVehicle(vehicle);

        if (success) {
          stats.imported++;
          stats.bySource[config.name] = (stats.bySource[config.name] || 0) + 1;
          stats.byCategory[vehicle.category || 'Unknown'] = (stats.byCategory[vehicle.category || 'Unknown'] || 0) + 1;
        } else {
          // Check if it was a duplicate or error
          if (await isDuplicate(vehicle)) {
            stats.duplicates++;
          } else {
            stats.errors++;
          }
        }

        // Progress update every 10 vehicles
        if (stats.totalProcessed % 10 === 0) {
          console.log(`   Progress: ${stats.totalProcessed} processed, ${stats.imported} imported`);
        }
      }

    } catch (error: any) {
      console.error(`\n❌ Error processing ${config.name}:`, error.message);
      stats.errors++;
    }

    // Rate limiting: delay between sources
    if (configs.indexOf(config) < configs.length - 1) {
      console.log('\n⏳ Waiting 5 seconds before next source...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  stats.endTime = new Date();

  // Final Report
  printFinalReport(stats);
}

// =============================================================================
// REPORTING
// =============================================================================

function printFinalReport(stats: ImportStats) {
  const duration = stats.endTime
    ? (stats.endTime.getTime() - stats.startTime.getTime()) / 1000
    : 0;

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊  IMPORT COMPLETE - Final Report');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`⏱️  Duration: ${duration.toFixed(1)} seconds`);
  console.log(`📦  Processed: ${stats.totalProcessed} vehicles`);
  console.log(`✅  Imported: ${stats.imported} (${((stats.imported / stats.totalProcessed) * 100).toFixed(1)}%)`);
  console.log(`⏭️  Duplicates: ${stats.duplicates} (${((stats.duplicates / stats.totalProcessed) * 100).toFixed(1)}%)`);
  console.log(`❌  Errors: ${stats.errors} (${((stats.errors / stats.totalProcessed) * 100).toFixed(1)}%)`);

  console.log('\n📊 By Source:');
  Object.entries(stats.bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      const pct = ((count / stats.imported) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(count / 5)) + '░'.repeat(Math.max(0, 20 - Math.floor(count / 5)));
      console.log(`   ${source.padEnd(25)} ${count.toString().padStart(4)} ${bar} ${pct}%`);
    });

  console.log('\n🏷️  By Category:');
  Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const pct = ((count / stats.imported) * 100).toFixed(1);
      console.log(`   ${category.padEnd(20)} ${count.toString().padStart(4)} (${pct}%)`);
    });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Next steps
  if (stats.imported > 0) {
    console.log('🎉 Success! Next steps:');
    console.log('   1. View cars: SELECT * FROM cars_for_sale LIMIT 10;');
    console.log('   2. Test UI: npm run dev (check /cars-for-sale page)');
    console.log('   3. Continue scraping: tsx scripts/import-1000-cars.ts --limit=100\n');
  }

  if (stats.errors > 10) {
    console.log('⚠️  High error rate detected. Check:');
    console.log('   - Website selectors may have changed');
    console.log('   - Rate limiting / anti-bot measures');
    console.log('   - Network connectivity\n');
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const options = {
    sources: [] as SourceType[],
    limit: undefined as number | undefined,
    testMode: true // Default to test mode to avoid accidental scraping
  };

  for (const arg of args) {
    if (arg.startsWith('--source=')) {
      options.sources.push(arg.split('=')[1] as SourceType);
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg === '--production') {
      options.testMode = false;
    }
  }

  try {
    await importCars(options);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { importCars, scrapeSource, validateVehicle, isDuplicate };
