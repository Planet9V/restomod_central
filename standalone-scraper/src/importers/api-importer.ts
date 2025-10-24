/**
 * API-based Vehicle Importer
 *
 * Sends scraped vehicle data to Restomod Central API
 * Handles authentication, validation, and error handling
 */

import axios, { AxiosError } from 'axios';
import { ScrapedVehicle } from '../scrapers/playwright-scraper';

export interface APIImportOptions {
  apiUrl: string;
  apiKey: string;
  vehicles: ScrapedVehicle[];
  batchSize?: number;
}

export interface ImportResult {
  success: boolean;
  summary: {
    total: number;
    imported: number;
    skipped: number;
    errors: number;
  };
  imported?: any[];
  skipped?: any[];
  errors?: any[];
}

/**
 * Transform scraped vehicle to API format
 */
function transformVehicle(scraped: ScrapedVehicle) {
  // Parse location
  const locationParts = (scraped.location || '').split(',').map(s => s.trim());
  const city = locationParts[0] || undefined;
  const state = locationParts[1] || undefined;

  // Determine region from state
  const northeastStates = ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'];
  const southStates = ['MD', 'DE', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'KY', 'TN', 'AL', 'MS', 'AR', 'LA', 'OK', 'TX'];
  const midwestStates = ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'];
  const westStates = ['MT', 'WY', 'CO', 'NM', 'ID', 'UT', 'NV', 'AZ', 'WA', 'OR', 'CA', 'AK', 'HI'];

  let region = undefined;
  if (state && northeastStates.includes(state)) region = 'northeast';
  else if (state && southStates.includes(state)) region = 'south';
  else if (state && midwestStates.includes(state)) region = 'midwest';
  else if (state && westStates.includes(state)) region = 'west';

  // Determine category based on year and make
  let category = 'Classic Cars';
  if (scraped.year >= 1964 && scraped.year <= 1974) {
    category = 'Muscle Cars';
  } else if (['Porsche', 'Jaguar', 'Ferrari', 'Mercedes-Benz'].includes(scraped.make)) {
    category = 'Sports Cars';
  }

  // Determine condition based on price
  let condition = 'Good';
  const priceNum = parseInt((scraped.price || '').replace(/[^0-9]/g, '')) || 0;
  if (priceNum > 150000) condition = 'Excellent';
  else if (priceNum > 80000) condition = 'Very Good';
  else if (priceNum < 30000) condition = 'Driver';

  return {
    make: scraped.make,
    model: scraped.model,
    year: scraped.year,
    price: scraped.price,
    sourceType: 'import' as const,
    sourceName: `ClassicCars.com scrape - ${scraped.scrapedDate}`,
    locationCity: city,
    locationState: state,
    locationRegion: region,
    category,
    condition,
    mileage: scraped.mileage,
    exteriorColor: scraped.exteriorColor,
    interiorColor: scraped.interiorColor,
    engine: scraped.engine,
    transmission: scraped.transmission,
    description: scraped.description,
    stockNumber: scraped.stockNumber,
  };
}

/**
 * Import vehicles via REST API
 */
export async function importViaAPI(options: APIImportOptions): Promise<ImportResult> {
  const { apiUrl, apiKey, vehicles, batchSize = 50 } = options;

  console.log(`\n📡 Importing ${vehicles.length} vehicles via API`);
  console.log(`   API: ${apiUrl}`);
  console.log(`   Batch size: ${batchSize}\n`);

  const allResults: ImportResult[] = [];

  // Process in batches
  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(vehicles.length / batchSize);

    console.log(`📦 Batch ${batchNum}/${totalBatches}: Importing ${batch.length} vehicles...`);

    try {
      const transformedVehicles = batch.map(transformVehicle);

      const response = await axios.post<ImportResult>(
        apiUrl,
        {
          vehicles: transformedVehicles,
          apiKey: apiKey
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = response.data;
      allResults.push(result);

      console.log(`   ✅ Imported: ${result.summary.imported}`);
      console.log(`   ⏭️  Skipped: ${result.summary.skipped}`);
      console.log(`   ❌ Errors: ${result.summary.errors}\n`);

      // Log details if there were issues
      if (result.skipped && result.skipped.length > 0) {
        console.log('   Skipped vehicles:');
        result.skipped.forEach((s: any) => {
          console.log(`      - ${s.vehicle?.stockNumber}: ${s.reason}`);
        });
      }

      if (result.errors && result.errors.length > 0) {
        console.log('   Errors:');
        result.errors.forEach((e: any) => {
          console.log(`      - ${e.vehicle?.stockNumber}: ${e.error}`);
        });
      }

      // Small delay between batches
      if (i + batchSize < vehicles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error(`   ❌ API Error:`, axiosError.response?.status, axiosError.response?.data);
      } else {
        console.error(`   ❌ Error:`, error);
      }
    }
  }

  // Aggregate results
  const totalResult: ImportResult = {
    success: true,
    summary: {
      total: vehicles.length,
      imported: allResults.reduce((sum, r) => sum + r.summary.imported, 0),
      skipped: allResults.reduce((sum, r) => sum + r.summary.skipped, 0),
      errors: allResults.reduce((sum, r) => sum + r.summary.errors, 0)
    }
  };

  console.log(`\n✅ Import Complete!`);
  console.log(`   Total: ${totalResult.summary.total}`);
  console.log(`   Imported: ${totalResult.summary.imported}`);
  console.log(`   Skipped: ${totalResult.summary.skipped}`);
  console.log(`   Errors: ${totalResult.summary.errors}\n`);

  return totalResult;
}

// CLI execution
if (require.main === module) {
  const fs = require('fs');

  const jsonFile = process.argv[2];
  const apiUrl = process.env.SCRAPER_API_URL || 'http://localhost:5000/api/cars/import';
  const apiKey = process.env.SCRAPER_API_KEY || 'dev-key-replace-in-production';

  if (!jsonFile) {
    console.error('Usage: tsx api-importer.ts <vehicles.json>');
    process.exit(1);
  }

  const vehicles = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

  importViaAPI({ apiUrl, apiKey, vehicles })
    .then((result) => {
      process.exit(result.summary.errors > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('❌ Fatal error:', err);
      process.exit(1);
    });
}
