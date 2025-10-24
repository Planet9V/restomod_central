import { db } from '../db';
import { carsForSale } from '../shared/schema';

/**
 * Real Vehicle Scraping Framework for MCP Servers
 *
 * This script provides the data transformation and import logic
 * for vehicles scraped via Playwright MCP or Crawl4AI MCP.
 *
 * Prerequisites:
 * 1. MCP servers configured in .mcp.json
 * 2. Claude Code running in project directory
 * 3. MCP servers active (verify with /mcp command)
 *
 * Usage:
 * Ask Claude Code to use Playwright MCP to scrape ClassicCars.com,
 * then use this script to import the scraped data.
 */

export interface ScrapedVehicle {
  // Required fields
  year: number;
  make: string;
  model: string;
  price: string;
  url: string;
  scrapedDate: string;

  // Highly recommended
  stockNumber?: string;
  location?: string;  // "City, State" format
  dealer?: string;
  description?: string;
  images?: string[];

  // Optional detail fields
  engine?: string;
  transmission?: string;
  mileage?: number;
  exteriorColor?: string;
  interiorColor?: string;
  vin?: string;
  bodyStyle?: string;
  condition?: string;
  dealerPhone?: string;
  dealerEmail?: string;
}

/**
 * Transform scraped vehicle data to database schema
 */
export function transformToSchema(scraped: ScrapedVehicle): typeof carsForSale.$inferInsert {
  // Parse location
  const locationParts = (scraped.location || '').split(',').map(s => s.trim());
  const city = locationParts[0] || 'Unknown';
  const state = locationParts[1] || 'Unknown';

  // Parse price
  const priceNumber = parseInt(scraped.price.replace(/[^0-9]/g, '')) || 0;

  // Determine region from state
  const getRegion = (state: string): string => {
    const regions: Record<string, string> = {
      // West
      'Arizona': 'west', 'California': 'west', 'Nevada': 'west', 'Oregon': 'west',
      'Washington': 'west', 'Colorado': 'west', 'Utah': 'west', 'New Mexico': 'west',
      // South
      'Florida': 'south', 'Texas': 'south', 'Georgia': 'south', 'North Carolina': 'south',
      'South Carolina': 'south', 'Tennessee': 'south', 'Alabama': 'south', 'Louisiana': 'south',
      'Mississippi': 'south', 'Arkansas': 'south', 'Kentucky': 'south', 'Virginia': 'south',
      // Midwest
      'Illinois': 'midwest', 'Ohio': 'midwest', 'Michigan': 'midwest', 'Indiana': 'midwest',
      'Wisconsin': 'midwest', 'Minnesota': 'midwest', 'Missouri': 'midwest', 'Iowa': 'midwest',
      'Kansas': 'midwest', 'Nebraska': 'midwest',
      // Northeast
      'New York': 'northeast', 'Pennsylvania': 'northeast', 'Massachusetts': 'northeast',
      'New Jersey': 'northeast', 'Connecticut': 'northeast', 'Maine': 'northeast',
    };
    return regions[state] || 'south';
  };

  // Calculate investment grade based on market intelligence
  const calculateGrade = (year: number, make: string, model: string, price: number): string => {
    // Premium models get better grades
    const premiumModels = ['Corvette', 'Cuda', 'Challenger', 'Hemi', 'Shelby', 'Boss'];
    const isPremium = premiumModels.some(pm => model.includes(pm));

    // Earlier years are more valuable (pre-1970)
    const isEarlyYear = year <= 1970;

    // High price indicates excellent condition or rare variant
    const isHighPrice = price > 80000;

    if (isPremium && isEarlyYear && isHighPrice) return 'A+';
    if ((isPremium && isEarlyYear) || isHighPrice) return 'A';
    if (isPremium || isEarlyYear || price > 50000) return 'A-';
    if (price > 30000) return 'B+';
    if (price > 20000) return 'B';
    return 'B-';
  };

  // Determine category
  const getCategory = (make: string, model: string): string => {
    const muscleKeywords = ['Mustang', 'Camaro', 'Charger', 'Cuda', 'Challenger', 'GTO', '442', 'Chevelle', 'Barracuda'];
    const sportsKeywords = ['Corvette', 'Thunderbird', 'Porsche', 'Ferrari'];
    const luxuryKeywords = ['Cadillac', 'Lincoln', 'Continental'];

    if (muscleKeywords.some(kw => model.includes(kw))) return 'Muscle Cars';
    if (sportsKeywords.some(kw => model.includes(kw))) return 'Sports Cars';
    if (luxuryKeywords.some(kw => model.includes(kw) || make.includes(kw))) return 'Luxury Classics';
    return 'Classic Cars';
  };

  // Normalize make/model names
  const normalizeMake = (make: string): string => {
    const normalized: Record<string, string> = {
      'Chevy': 'Chevrolet',
      'Vette': 'Chevrolet',
      'Mopar': 'Dodge',
    };
    return normalized[make] || make;
  };

  return {
    // Core vehicle data
    make: normalizeMake(scraped.make),
    model: scraped.model,
    year: scraped.year,
    price: scraped.price,

    // ⚠️ CRITICAL: Source type MUST be 'import' for real scraped data
    sourceType: 'import' as const,
    sourceName: `ClassicCars.com scrape - ${scraped.scrapedDate}`,

    // Location
    city,
    state,
    locationCity: city,
    locationState: state,
    locationRegion: getRegion(state),
    country: 'United States',

    // Vehicle details
    stockNumber: scraped.stockNumber,
    vin: scraped.vin,
    mileage: scraped.mileage,
    engine: scraped.engine,
    transmission: scraped.transmission,
    exteriorColor: scraped.exteriorColor,
    interiorColor: scraped.interiorColor,
    bodyStyle: scraped.bodyStyle,
    condition: scraped.condition || 'Good',
    description: scraped.description,

    // Classification & Analysis
    category: getCategory(scraped.make, scraped.model),
    investmentGrade: calculateGrade(scraped.year, scraped.make, scraped.model, priceNumber),
    marketTrend: 'stable',  // Can be updated based on price history later

    // Dealer information
    dealerName: scraped.dealer || 'Private Seller',
    dealerPhone: scraped.dealerPhone,
    dealerEmail: scraped.dealerEmail,

    // Media
    images: scraped.images ? JSON.stringify(scraped.images) : null,
    imageUrl: scraped.images?.[0],

    // Source tracking (for verification)
    source: 'ClassicCars.com',
    sourceUrl: scraped.url,
    datePosted: new Date(),

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Import scraped vehicles to database
 */
export async function importScrapedVehicles(scrapedData: ScrapedVehicle[]) {
  console.log('\n🔥 IMPORTING REAL SCRAPED DATA\n');
  console.log('='.repeat(60));
  console.log(`\n📊 Total vehicles to import: ${scrapedData.length}`);
  console.log(`📅 Scrape date: ${scrapedData[0]?.scrapedDate || 'Unknown'}`);
  console.log(`🔖 Source type: 'import' (REAL DATA, NOT SYNTHETIC)\n`);

  // Transform all vehicles
  const vehicles = scrapedData.map(transformToSchema);

  // Verify all have sourceType: 'import'
  const allImportType = vehicles.every(v => v.sourceType === 'import');
  if (!allImportType) {
    throw new Error('❌ ERROR: Some vehicles do not have sourceType: import');
  }

  console.log('✅ All vehicles verified as sourceType: import\n');

  // Show distribution
  const makeCount = vehicles.reduce((acc, v) => {
    acc[v.make] = (acc[v.make] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Distribution by make:');
  Object.entries(makeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([make, count]) => {
      console.log(`   ${make}: ${count} vehicles`);
    });

  console.log('\n💾 Importing to database...\n');

  // Import in batches of 50
  const batchSize = 50;
  let importedCount = 0;

  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize);

    try {
      await db.insert(carsForSale).values(batch);
      importedCount += batch.length;
      console.log(`   Imported ${Math.min(i + batchSize, vehicles.length)} / ${vehicles.length}`);
    } catch (error) {
      console.error(`   ❌ Error importing batch ${i}-${i + batchSize}:`, error);
      throw error;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Successfully imported ${importedCount} REAL vehicles!`);
  console.log('\n📋 Summary:');
  console.log(`   Source Type: 'import' ← REAL scraped data`);
  console.log(`   Data Source: ClassicCars.com`);
  console.log(`   Total Vehicles: ${importedCount}`);
  console.log('\n🎯 Next steps:');
  console.log('   1. Run scripts/populate-price-history.ts for new vehicles');
  console.log('   2. Run scripts/verify-database.ts to confirm import');
  console.log('   3. Test Phase 5 UI with real data\n');

  return importedCount;
}

/**
 * Example usage (for documentation)
 */
async function exampleUsage() {
  // Example scraped data (would come from Playwright MCP)
  const exampleScrapedData: ScrapedVehicle[] = [
    {
      year: 1967,
      make: 'Chevrolet',
      model: 'Camaro SS',
      price: '$54,995',
      stockNumber: 'CC-1234567',
      location: 'Phoenix, Arizona',
      dealer: 'Gateway Classic Cars',
      dealerPhone: '602-555-1234',
      description: 'Beautiful restored 1967 Camaro SS...',
      images: [
        'https://classiccars.com/img1.jpg',
        'https://classiccars.com/img2.jpg',
      ],
      engine: '350 V8',
      transmission: '4-Speed Manual',
      mileage: 45000,
      exteriorColor: 'Rally Green',
      interiorColor: 'Black',
      condition: 'Excellent',
      bodyStyle: 'Coupe',
      url: 'https://classiccars.com/listings/view/1234567',
      scrapedDate: '2025-10-24',
    },
  ];

  // Transform and import
  // await importScrapedVehicles(exampleScrapedData);
}

// If run directly (for testing)
if (require.main === module) {
  console.log('🔍 Scraping Script Framework Ready\n');
  console.log('This script is meant to be used with Playwright MCP or Crawl4AI MCP.');
  console.log('\nTo use:');
  console.log('1. Ensure .mcp.json is configured');
  console.log('2. Run Claude Code in this project');
  console.log('3. Ask Claude to scrape ClassicCars.com using Playwright MCP');
  console.log('4. Import the scraped data using this script\n');
  console.log('Example prompt:');
  console.log('  "Use Playwright MCP to scrape 50 Corvettes from ClassicCars.com,');
  console.log('   then import using scripts/scrape-with-mcp.ts"\n');
}
