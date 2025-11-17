/**
 * Import Scraped Vehicle Batch
 *
 * Imports vehicles from a JSON file scraped via Playwright MCP or other methods
 *
 * Usage:
 *   npm run import:batch data/scraped-batch1.json
 *   tsx scripts/import-scraped-batch.ts data/scraped-batch1.json
 */

import { readFileSync } from 'fs';
import { db } from '../db';
import { carsForSale } from '../shared/schema';
import type { InsertCarForSale } from '../shared/schema';

// Helper functions
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

function categorizeVehicle(make: string, model: string): string {
  const modelLower = model.toLowerCase();

  if (
    modelLower.includes('camaro') || modelLower.includes('chevelle') ||
    modelLower.includes('mustang') || modelLower.includes('gt500') ||
    modelLower.includes('charger') || modelLower.includes('challenger') ||
    modelLower.includes('cuda') || modelLower.includes('gto')
  ) {
    return 'Muscle Cars';
  }

  if (modelLower.includes('corvette') || modelLower.includes('cobra')) {
    return 'Sports Cars';
  }

  if (make.toLowerCase().includes('cadillac') || make.toLowerCase().includes('lincoln')) {
    return 'Luxury Cars';
  }

  return 'Classic Cars';
}

async function importBatch(filename: string) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦  Importing Scraped Vehicle Batch');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📂 File: ${filename}`);

  // Read JSON file
  let vehicles: any[];
  try {
    const rawData = readFileSync(filename, 'utf-8');
    vehicles = JSON.parse(rawData);
  } catch (error: any) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }

  console.log(`📊 Found ${vehicles.length} vehicles to import\n`);

  let imported = 0;
  let duplicates = 0;
  let errors = 0;

  for (const vehicle of vehicles) {
    try {
      // Parse location if it's a single string
      let city = vehicle.locationCity || vehicle.location?.split(',')[0]?.trim();
      let state = vehicle.locationState || vehicle.location?.split(',')[1]?.trim();

      // Build insert object
      const now = new Date();
      const car: InsertCarForSale = {
        stockNumber: vehicle.stockNumber || `AUTO-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        year: parseInt(vehicle.year),
        make: vehicle.make,
        model: vehicle.model,
        price: vehicle.price,
        sourceType: vehicle.sourceType || 'import',
        sourceName: vehicle.sourceName || 'Web Scraping',
        locationCity: city,
        locationState: state,
        locationRegion: extractLocationRegion(state),
        category: vehicle.category || categorizeVehicle(vehicle.make, vehicle.model),
        condition: vehicle.condition || 'Good',
        mileage: vehicle.mileage ? parseInt(vehicle.mileage) : undefined,
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
        investmentGrade: vehicle.investmentGrade,
        marketTrend: vehicle.marketTrend,
        scrapedAt: new Date(),
        createdAt: now,
        updatedAt: now
      };

      // Validate required fields
      if (!car.year || !car.make || !car.model) {
        console.log(`⚠️  Skipped: Missing required fields`);
        errors++;
        continue;
      }

      // Insert
      await db.insert(carsForSale).values(car);
      console.log(`✅ ${car.year} ${car.make} ${car.model} - ${car.price || 'N/A'}`);
      imported++;

    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint')) {
        console.log(`⏭️  Skipped duplicate: ${vehicle.stockNumber || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}`);
        duplicates++;
      } else {
        console.error(`❌ Error: ${error.message}`);
        errors++;
      }
    }
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊  Import Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Duplicates: ${duplicates}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📦 Total Processed: ${vehicles.length}\n`);

  if (imported > 0) {
    console.log('🎉 Success! Next steps:');
    console.log('   1. Check database: sqlite3 db/local.db "SELECT COUNT(*) FROM cars_for_sale;"');
    console.log('   2. View cars: npm run dev → http://localhost:5000/cars-for-sale\n');
  }
}

// CLI
const filename = process.argv[2];

if (!filename) {
  console.error('❌ Error: No filename provided\n');
  console.log('Usage:');
  console.log('  npm run import:batch data/scraped-batch1.json');
  console.log('  tsx scripts/import-scraped-batch.ts data/scraped-batch1.json\n');
  process.exit(1);
}

importBatch(filename)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
