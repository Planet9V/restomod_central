/**
 * Parallel Batch Import - Import Multiple JSON Files Concurrently
 *
 * Imports multiple scraped JSON files in parallel for maximum speed
 *
 * Usage:
 *   npm run import:parallel data/*.json
 *   tsx scripts/parallel-batch-import.ts data/batch1.json data/batch2.json data/batch3.json
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

interface ImportResult {
  filename: string;
  imported: number;
  duplicates: number;
  errors: number;
  duration: number;
}

async function importSingleBatch(filename: string): Promise<ImportResult> {
  const startTime = Date.now();
  let imported = 0;
  let duplicates = 0;
  let errors = 0;

  try {
    console.log(`📂 [${filename}] Starting import...`);

    const rawData = readFileSync(filename, 'utf-8');
    const vehicles = JSON.parse(rawData);

    console.log(`📦 [${filename}] Found ${vehicles.length} vehicles`);

    for (const vehicle of vehicles) {
      try {
        let city = vehicle.locationCity || vehicle.location?.split(',')[0]?.trim();
        let state = vehicle.locationState || vehicle.location?.split(',')[1]?.trim();

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

        if (!car.year || !car.make || !car.model) {
          errors++;
          continue;
        }

        await db.insert(carsForSale).values(car);
        imported++;

      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint')) {
          duplicates++;
        } else {
          errors++;
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${filename}] Complete: ${imported} imported, ${duplicates} duplicates, ${errors} errors (${(duration / 1000).toFixed(1)}s)`);

    return { filename, imported, duplicates, errors, duration };

  } catch (error: any) {
    console.error(`❌ [${filename}] Error: ${error.message}`);
    return { filename, imported, duplicates, errors, duration: Date.now() - startTime };
  }
}

async function parallelImport(filenames: string[]) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ PARALLEL BATCH IMPORT - Maximum Speed Mode');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📊 Files to import: ${filenames.length}`);
  console.log(`🔥 Parallel workers: ${filenames.length} (one per file)`);
  console.log(`⏱️  Starting parallel import...\n`);

  const startTime = Date.now();

  // Import all files in parallel
  const results = await Promise.all(
    filenames.map(filename => importSingleBatch(filename))
  );

  const totalDuration = (Date.now() - startTime) / 1000;

  // Aggregate results
  const totals = results.reduce((acc, result) => ({
    imported: acc.imported + result.imported,
    duplicates: acc.duplicates + result.duplicates,
    errors: acc.errors + result.errors
  }), { imported: 0, duplicates: 0, errors: 0 });

  // Final report
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊  PARALLEL IMPORT COMPLETE - Final Report');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`⏱️  Total Duration: ${totalDuration.toFixed(1)}s`);
  console.log(`📂  Files Processed: ${filenames.length}`);
  console.log(`✅  Total Imported: ${totals.imported}`);
  console.log(`⏭️  Total Duplicates: ${totals.duplicates}`);
  console.log(`❌  Total Errors: ${totals.errors}`);

  const avgTimePerFile = totalDuration / filenames.length;
  const speedup = results.reduce((sum, r) => sum + r.duration, 0) / 1000 / totalDuration;

  console.log(`\n⚡ Performance:`);
  console.log(`   Average time per file: ${avgTimePerFile.toFixed(1)}s`);
  console.log(`   Parallel speedup: ${speedup.toFixed(1)}x faster than sequential`);
  console.log(`   Import rate: ${(totals.imported / totalDuration).toFixed(1)} cars/second\n`);

  console.log('📋 Per-File Results:');
  results.forEach(r => {
    const successRate = ((r.imported / (r.imported + r.duplicates + r.errors)) * 100).toFixed(1);
    console.log(`   ${r.filename.split('/').pop()?.padEnd(30)} ✅ ${r.imported.toString().padStart(4)} (${successRate}%) - ${(r.duration / 1000).toFixed(1)}s`);
  });

  console.log('\n🎉 Next steps:');
  console.log('   1. Check progress: npm run cars:report');
  console.log('   2. View cars: npm run dev → http://localhost:5000/cars-for-sale');
  console.log('   3. Import more batches: npm run import:parallel data/*.json\n');
}

// CLI
const filenames = process.argv.slice(2);

if (filenames.length === 0) {
  console.error('❌ Error: No files provided\n');
  console.log('Usage:');
  console.log('  npm run import:parallel data/batch1.json data/batch2.json data/batch3.json');
  console.log('  tsx scripts/parallel-batch-import.ts data/*.json\n');
  console.log('Example:');
  console.log('  # Import all JSON files in data/ directory in parallel:');
  console.log('  npm run import:parallel data/*.json\n');
  process.exit(1);
}

parallelImport(filenames)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
