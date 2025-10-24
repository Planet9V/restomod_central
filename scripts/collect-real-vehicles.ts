/**
 * Real Vehicle Data Collection Script
 * Collects actual classic car listings from major websites
 *
 * Collection Date: October 24, 2025
 * Target: 500 vehicles (1930-1980, $10k+)
 * Sources: ClassicCars.com, Hemmings, Gateway, RK Motors, CycleTrader
 */

import { db } from '../db';
import { carsForSale } from '../shared/schema';

/**
 * Data Collection Methodology:
 *
 * Since direct API access is not available for most classic car websites,
 * this script uses a multi-phase approach:
 *
 * Phase 1: Web Search Discovery (Claude WebSearch)
 *   - Search for specific make/model/year combinations
 *   - Identify listing URLs from major sites
 *   - Collect basic metadata
 *
 * Phase 2: Detail Extraction (Claude WebFetch)
 *   - Fetch individual listing pages
 *   - Extract complete vehicle details
 *   - Parse descriptions, specs, pricing
 *   - Collect image URLs
 *
 * Phase 3: Data Validation
 *   - Verify price > $10,000
 *   - Confirm year 1930-1980 (or restomod)
 *   - Check data completeness
 *   - Validate seller information
 *
 * Phase 4: Database Import
 *   - Structure data for schema
 *   - Import to carsForSale table
 *   - Generate price history
 *   - Link to events
 */

interface RealVehicleListing {
  // Core Vehicle Data
  make: string;
  model: string;
  year: number;
  price: string;

  // Source & Metadata
  sourceType: 'gateway' | 'research' | 'import' | 'dealer' | 'auction';
  sourceName: string;
  sourceUrl: string;
  listingId: string;
  datePosted: Date | null;
  dateCollected: Date;

  // Location
  locationCity: string;
  locationState: string;
  locationRegion: 'south' | 'midwest' | 'west' | 'northeast' | 'southwest';

  // Vehicle Details
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  mileage: number | null;
  condition: string | null;
  bodyStyle: string | null;

  // Categorization
  category: string;
  investmentGrade: string | null;
  appreciationRate: string | null;
  marketTrend: string | null;

  // Content
  description: string;
  features: any | null;
  imageUrls: string[] | null;

  // Seller
  sellerType: 'dealer' | 'private' | 'auction';
  sellerName: string | null;
  sellerPhone: string | null;
  sellerEmail: string | null;
  sellerWebsite: string | null;

  // Additional
  vin: string | null;
  stockNumber: string | null;
  restomodDetails: string | null;
  documentationAvailable: boolean;
}

/**
 * Target Makes for Collection
 * Prioritized by popularity and market demand
 */
const TARGET_MAKES = [
  // American Muscle (40% - 200 vehicles)
  { make: 'Ford', models: ['Mustang', 'Bronco', 'F-100', 'Thunderbird', 'Galaxie', 'Fairlane'], count: 60 },
  { make: 'Chevrolet', models: ['Corvette', 'Camaro', 'Chevelle', 'Impala', 'Nova', 'El Camino', 'C10'], count: 60 },
  { make: 'Dodge', models: ['Charger', 'Challenger', 'Dart', 'Coronet', 'Super Bee'], count: 40 },
  { make: 'Pontiac', models: ['GTO', 'Firebird', 'Trans Am', 'LeMans', 'Catalina'], count: 40 },

  // Classic American (30% - 150 vehicles)
  { make: 'Plymouth', models: ['Road Runner', 'Barracuda', 'GTX', 'Duster', 'Fury'], count: 30 },
  { make: 'Buick', models: ['Skylark', 'Gran Sport', 'Riviera', 'Electra'], count: 25 },
  { make: 'Oldsmobile', models: ['442', 'Cutlass', 'Toronado', '98'], count: 25 },
  { make: 'Mercury', models: ['Cougar', 'Monterey', 'Cyclone'], count: 20 },
  { make: 'AMC', models: ['Javelin', 'AMX', 'Gremlin', 'Pacer'], count: 15 },
  { make: 'Chrysler', models: ['300', 'New Yorker', 'Imperial'], count: 15 },
  { make: 'Studebaker', models: ['Avanti', 'Hawk', 'Lark'], count: 10 },
  { make: 'Hudson', models: ['Hornet', 'Wasp'], count: 5 },
  { make: 'Packard', models: ['Caribbean', 'Clipper'], count: 5 },

  // Hot Rods & Customs (15% - 75 vehicles)
  { make: 'Ford', models: ['Model A', 'Model T', '1932 Coupe', '1940 Coupe'], count: 40 },
  { make: 'Chevrolet', models: ['Tri-Five', '1957 Bel Air', '1955 Nomad'], count: 35 },

  // European Classics (10% - 50 vehicles)
  { make: 'Porsche', models: ['911', '912', '356'], count: 15 },
  { make: 'Jaguar', models: ['E-Type', 'XK', 'Mark II'], count: 10 },
  { make: 'Mercedes-Benz', models: ['280SL', '300SL', '190SL'], count: 10 },
  { make: 'BMW', models: ['2002', '3.0CS', 'E9'], count: 10 },
  { make: 'Alfa Romeo', models: ['Spider', 'GTV', 'Giulia'], count: 5 },

  // Motorcycles (5% - 25 vehicles)
  { make: 'Harley-Davidson', models: ['Panhead', 'Knucklehead', 'Shovelhead'], count: 10 },
  { make: 'Triumph', models: ['Bonneville', 'TR6', 'Tiger'], count: 5 },
  { make: 'BSA', models: ['Lightning', 'Rocket', 'Gold Star'], count: 5 },
  { make: 'Norton', models: ['Commando', 'Atlas'], count: 3 },
  { make: 'Indian', models: ['Chief', 'Scout'], count: 2 },
];

/**
 * Data Collection Status Tracker
 */
interface CollectionStatus {
  targetTotal: number;
  collected: number;
  validated: number;
  imported: number;
  errors: number;
  startTime: Date;
  lastUpdate: Date;
}

const collectionStatus: CollectionStatus = {
  targetTotal: 500,
  collected: 0,
  validated: 0,
  imported: 0,
  errors: 0,
  startTime: new Date(),
  lastUpdate: new Date(),
};

/**
 * Determine US region from state
 */
function getRegionFromState(state: string): CollectionStatus['locationRegion'] {
  const regions: Record<string, typeof collectionStatus.locationRegion> = {
    'AL': 'south', 'AR': 'south', 'FL': 'south', 'GA': 'south', 'KY': 'south',
    'LA': 'south', 'MS': 'south', 'NC': 'south', 'SC': 'south', 'TN': 'south',
    'VA': 'south', 'WV': 'south',

    'IL': 'midwest', 'IN': 'midwest', 'IA': 'midwest', 'KS': 'midwest', 'MI': 'midwest',
    'MN': 'midwest', 'MO': 'midwest', 'NE': 'midwest', 'ND': 'midwest', 'OH': 'midwest',
    'SD': 'midwest', 'WI': 'midwest',

    'AK': 'west', 'CA': 'west', 'CO': 'west', 'HI': 'west', 'ID': 'west',
    'MT': 'west', 'NV': 'west', 'OR': 'west', 'UT': 'west', 'WA': 'west', 'WY': 'west',

    'CT': 'northeast', 'DE': 'northeast', 'ME': 'northeast', 'MD': 'northeast',
    'MA': 'northeast', 'NH': 'northeast', 'NJ': 'northeast', 'NY': 'northeast',
    'PA': 'northeast', 'RI': 'northeast', 'VT': 'northeast',

    'AZ': 'southwest', 'NM': 'southwest', 'OK': 'southwest', 'TX': 'southwest',
  };

  return regions[state.toUpperCase()] || 'south';
}

/**
 * Estimate investment grade from vehicle attributes
 */
function estimateInvestmentGrade(
  year: number,
  make: string,
  model: string,
  price: number,
  condition: string | null,
  mileage: number | null
): string {
  let score = 50; // Base score

  // Age factor (pre-1970 = premium)
  if (year < 1950) score += 20;
  else if (year < 1960) score += 15;
  else if (year < 1970) score += 10;
  else if (year < 1975) score += 5;

  // Desirability factor (iconic models)
  const iconicModels = ['Corvette', 'Mustang', 'GTO', 'Charger', 'Challenger', '911', 'E-Type'];
  if (iconicModels.some(m => model.includes(m))) score += 15;

  // Price factor (higher = better grade usually)
  if (price > 100000) score += 15;
  else if (price > 75000) score += 10;
  else if (price > 50000) score += 5;

  // Condition factor
  if (condition?.toLowerCase().includes('excellent') || condition?.toLowerCase().includes('show')) score += 10;
  else if (condition?.toLowerCase().includes('good')) score += 5;

  // Mileage factor
  if (mileage !== null) {
    if (mileage < 10000) score += 10;
    else if (mileage < 30000) score += 5;
    else if (mileage > 100000) score -= 10;
  }

  // Convert score to grade
  if (score >= 85) return 'A+';
  if (score >= 75) return 'A';
  if (score >= 65) return 'A-';
  if (score >= 55) return 'B+';
  if (score >= 45) return 'B';
  if (score >= 35) return 'B-';
  return 'C+';
}

/**
 * Calculate appreciation rate from investment grade
 */
function calculateAppreciationRate(investmentGrade: string): string {
  const rates: Record<string, number> = {
    'A+': 12.5,
    'A': 10.0,
    'A-': 8.0,
    'B+': 6.0,
    'B': 4.5,
    'B-': 3.0,
    'C+': 1.5,
    'C': 0.5,
  };

  return `${rates[investmentGrade] || 5.0}%`;
}

/**
 * Determine market trend from attributes
 */
function determineMarketTrend(
  year: number,
  investmentGrade: string,
  category: string
): 'rising' | 'stable' | 'declining' {
  // Pre-1970 muscle with high grades = rising
  if (year < 1970 && investmentGrade.startsWith('A') && category.includes('Muscle')) {
    return 'rising';
  }

  // Most classics are stable
  if (investmentGrade === 'A' || investmentGrade === 'B+') {
    return 'stable';
  }

  // High grades generally rising
  if (investmentGrade === 'A+') {
    return 'rising';
  }

  return 'stable';
}

/**
 * Main collection function
 *
 * NOTE: This is a framework. Actual data collection requires:
 * 1. Manual web searches for specific vehicles
 * 2. WebFetch to extract listing details
 * 3. Parsing of structured data
 * 4. Validation and cleanup
 *
 * For automated collection at scale, consider:
 * - CLASSIC.COM data partnership
 * - Dealer data feeds
 * - Licensed data providers
 * - Manual curation with research assistance
 */
async function collectRealVehicles() {
  console.log('🚗 Real Vehicle Data Collection System');
  console.log(`📅 Collection Date: ${new Date().toISOString()}`);
  console.log(`🎯 Target: ${collectionStatus.targetTotal} vehicles\n`);

  console.log('📋 Collection Strategy:');
  console.log('   Phase 1: Web search for specific make/model/year');
  console.log('   Phase 2: Extract listing details with WebFetch');
  console.log('   Phase 3: Validate and structure data');
  console.log('   Phase 4: Import to database\n');

  console.log('⚠️  Note: This script provides a FRAMEWORK for real data collection.');
  console.log('   Actual collection requires:');
  console.log('   - Web searches for each vehicle type');
  console.log('   - Individual listing extraction');
  console.log('   - Manual validation');
  console.log('   - Respect for website terms of service\n');

  console.log('🎯 Target Distribution:');
  for (const target of TARGET_MAKES) {
    if (target.count > 0) {
      console.log(`   ${target.make}: ${target.count} vehicles (${target.models.slice(0, 3).join(', ')}...)`);
    }
  }

  console.log('\n💡 Recommended Approach:');
  console.log('   1. Start with 50-100 vehicles manually');
  console.log('   2. Use this script as template');
  console.log('   3. Integrate with CLASSIC.COM data API');
  console.log('   4. Build automated pipeline');
  console.log('   5. Scale to 500+ vehicles\n');

  console.log('📚 Documentation: See docs/CLASSIC-CAR-WEBSITES-RESEARCH.md');
  console.log('   - Complete website analysis');
  console.log('   - Data field requirements');
  console.log('   - Collection methodology');
  console.log('   - Legal considerations\n');

  // Sample vehicle structure (for development/testing)
  const sampleVehicle: RealVehicleListing = {
    make: 'Chevrolet',
    model: 'Corvette Stingray',
    year: 1967,
    price: '89500',

    sourceType: 'dealer',
    sourceName: 'Gateway Classic Cars',
    sourceUrl: 'https://www.gatewayclassiccars.com/[listing-id]',
    listingId: 'GCC-12345',
    datePosted: new Date('2025-10-15'),
    dateCollected: new Date(),

    locationCity: 'St. Louis',
    locationState: 'Missouri',
    locationRegion: 'midwest',

    engine: '427 V8',
    transmission: '4-Speed Manual',
    drivetrain: 'RWD',
    exteriorColor: 'Rally Red',
    interiorColor: 'Black',
    mileage: 42000,
    condition: 'Excellent',
    bodyStyle: 'Coupe',

    category: 'Sports Cars',
    investmentGrade: 'A',
    appreciationRate: '10.0%',
    marketTrend: 'rising',

    description: 'Numbers matching 427/435 HP big-block Corvette. Frame-off restoration completed in 2023. NCRS Top Flight certified. Original Muncie M21 4-speed transmission. Factory side pipes, knock-off wheels. Documented with tank sticker and Protect-O-Plate. Show quality paint and chrome. Investment grade classic.',
    features: JSON.stringify([
      'Numbers Matching 427 V8',
      'NCRS Top Flight Certified',
      'Frame-Off Restoration',
      'Side Exhaust Pipes',
      'Knock-Off Wheels',
      'Power Windows',
      'Telescopic Steering',
      'Factory Air Conditioning'
    ]),
    imageUrls: JSON.stringify([
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ]),

    sellerType: 'dealer',
    sellerName: 'Gateway Classic Cars - St. Louis',
    sellerPhone: '(555) 123-4567',
    sellerEmail: 'sales@gatewayclassiccars.com',
    sellerWebsite: 'https://www.gatewayclassiccars.com',

    vin: null, // Often not disclosed in listings
    stockNumber: 'STL-12345',
    restomodDetails: null,
    documentationAvailable: true,
  };

  console.log('✅ Sample Vehicle Structure:');
  console.log(JSON.stringify(sampleVehicle, null, 2));

  console.log('\n🎯 Next Steps:');
  console.log('   1. Review sample vehicle structure');
  console.log('   2. Customize for your sources');
  console.log('   3. Begin manual collection (10-50 vehicles)');
  console.log('   4. Test database import');
  console.log('   5. Scale collection process');
}

// Run the collection system
collectRealVehicles()
  .catch(console.error)
  .finally(() => {
    console.log('\n📊 Collection Status:');
    console.log(`   Collected: ${collectionStatus.collected}`);
    console.log(`   Validated: ${collectionStatus.validated}`);
    console.log(`   Imported: ${collectionStatus.imported}`);
    console.log(`   Errors: ${collectionStatus.errors}`);
    process.exit(0);
  });
