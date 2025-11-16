#!/usr/bin/env tsx

/**
 * PostgreSQL Import Script
 *
 * Imports data from JSON export files into PostgreSQL database
 * with proper transformations and validation.
 *
 * Usage: tsx scripts/import-to-postgres.ts
 *
 * Prerequisites:
 * - PostgreSQL database running and accessible
 * - DATABASE_URL set to PostgreSQL connection string
 * - JSON export files in data/migration/ directory
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ ERROR: DATABASE_URL must be a PostgreSQL connection string');
  console.error('   Current value starts with:', DATABASE_URL.substring(0, 20));
  process.exit(1);
}

// Setup PostgreSQL connection
const pgConnection = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(pgConnection, { schema });

// Migration data directory
const MIGRATION_DIR = path.join(process.cwd(), 'data', 'migration');

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

/**
 * Transform SQLite timestamp (integer) to PostgreSQL timestamp
 */
function transformTimestamp(value: any): Date | null {
  if (!value) return null;

  // If already a Date object, return it
  if (value instanceof Date) return value;

  // If it's a number (SQLite timestamp in milliseconds)
  if (typeof value === 'number') {
    return new Date(value);
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

/**
 * Transform SQLite boolean (0/1) to PostgreSQL boolean
 */
function transformBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return false;
}

/**
 * Transform JSON fields (keep as-is if already parsed, parse if string)
 */
function transformJSON(value: any): any {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      log.warning(`Failed to parse JSON: ${value.substring(0, 50)}...`);
      return null;
    }
  }
  return value;
}

/**
 * Transform a single row of data for PostgreSQL compatibility
 */
function transformRow(row: any, tableSchema: any): any {
  const transformed: any = {};

  for (const [key, value] of Object.entries(row)) {
    // Skip undefined values
    if (value === undefined) continue;

    // Handle null values
    if (value === null) {
      transformed[key] = null;
      continue;
    }

    // Determine the column type from the schema
    const columnKey = Object.keys(tableSchema).find(k =>
      tableSchema[k].name === key
    );

    if (columnKey) {
      const column = tableSchema[columnKey];
      const columnType = column.dataType;

      // Transform based on column type
      if (columnType === 'date') {
        transformed[key] = transformTimestamp(value);
      } else if (columnType === 'boolean') {
        transformed[key] = transformBoolean(value);
      } else if (columnType === 'json') {
        transformed[key] = transformJSON(value);
      } else {
        transformed[key] = value;
      }
    } else {
      // If column not found in schema, keep original value
      transformed[key] = value;
    }
  }

  return transformed;
}

/**
 * Read JSON file from migration directory
 */
function readJSONFile(filename: string): any[] {
  const filePath = path.join(MIGRATION_DIR, filename);

  if (!fs.existsSync(filePath)) {
    log.warning(`File not found: ${filename}`);
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    log.error(`Failed to read ${filename}: ${error}`);
    return [];
  }
}

/**
 * Import data into a table with progress tracking
 */
async function importTable(
  tableName: string,
  tableSchema: any,
  filename: string,
  batchSize: number = 100
): Promise<{ imported: number; errors: number }> {
  log.info(`Importing ${tableName}...`);

  const data = readJSONFile(filename);

  if (data.length === 0) {
    log.warning(`  No data to import for ${tableName}`);
    return { imported: 0, errors: 0 };
  }

  let imported = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, Math.min(i + batchSize, data.length));

    try {
      // Transform each row
      const transformedBatch = batch.map(row => transformRow(row, tableSchema));

      // Insert batch
      await db.insert(tableSchema).values(transformedBatch);

      imported += batch.length;

      // Progress indicator
      const progress = Math.round((imported / data.length) * 100);
      process.stdout.write(`\r  Progress: ${progress}% (${imported}/${data.length})`);

    } catch (error) {
      errors += batch.length;
      log.error(`\n  Batch import failed (${i}-${i + batch.length}): ${error}`);

      // Try inserting rows individually to find the problematic one
      for (const row of batch) {
        try {
          const transformed = transformRow(row, tableSchema);
          await db.insert(tableSchema).values([transformed]);
          imported++;
          errors--;
        } catch (rowError) {
          log.error(`  Failed to import row: ${JSON.stringify(row).substring(0, 100)}...`);
          log.error(`  Error: ${rowError}`);
        }
      }
    }
  }

  console.log(''); // New line after progress
  log.success(`  Imported ${imported} rows${errors > 0 ? ` (${errors} errors)` : ''}`);

  return { imported, errors };
}

/**
 * Validate foreign key relationships
 */
async function validateForeignKeys(): Promise<boolean> {
  log.step('🔍 Validating Foreign Key Relationships');

  let isValid = true;

  // Check user references
  try {
    const orphanedConfigurations = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_configurations
      WHERE user_id IS NOT NULL
        AND user_id NOT IN (SELECT id FROM users)
    `);

    if (orphanedConfigurations.rows[0].count > 0) {
      log.error(`Found ${orphanedConfigurations.rows[0].count} orphaned user_configurations`);
      isValid = false;
    } else {
      log.success('user_configurations foreign keys valid');
    }
  } catch (error) {
    log.warning('Could not validate user_configurations (table may not exist)');
  }

  // Check userPreferences
  try {
    const orphanedPreferences = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_preferences
      WHERE user_id IS NOT NULL
        AND user_id NOT IN (SELECT id FROM users)
    `);

    if (orphanedPreferences.rows[0].count > 0) {
      log.error(`Found ${orphanedPreferences.rows[0].count} orphaned user_preferences`);
      isValid = false;
    } else {
      log.success('user_preferences foreign keys valid');
    }
  } catch (error) {
    log.warning('Could not validate user_preferences (table may not exist)');
  }

  // Check userItineraries
  try {
    const orphanedItineraries = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_itineraries
      WHERE user_id NOT IN (SELECT id FROM users)
         OR event_id NOT IN (SELECT id FROM car_show_events)
    `);

    if (orphanedItineraries.rows[0].count > 0) {
      log.error(`Found ${orphanedItineraries.rows[0].count} orphaned user_itineraries`);
      isValid = false;
    } else {
      log.success('user_itineraries foreign keys valid');
    }
  } catch (error) {
    log.warning('Could not validate user_itineraries (table may not exist)');
  }

  // Check eventComments
  try {
    const orphanedComments = await db.execute(`
      SELECT COUNT(*) as count
      FROM event_comments
      WHERE user_id NOT IN (SELECT id FROM users)
         OR event_id NOT IN (SELECT id FROM car_show_events)
    `);

    if (orphanedComments.rows[0].count > 0) {
      log.error(`Found ${orphanedComments.rows[0].count} orphaned event_comments`);
      isValid = false;
    } else {
      log.success('event_comments foreign keys valid');
    }
  } catch (error) {
    log.warning('Could not validate event_comments (table may not exist)');
  }

  // Check priceHistory
  try {
    const orphanedPrices = await db.execute(`
      SELECT COUNT(*) as count
      FROM price_history
      WHERE vehicle_id NOT IN (SELECT id FROM cars_for_sale)
    `);

    if (orphanedPrices.rows[0].count > 0) {
      log.error(`Found ${orphanedPrices.rows[0].count} orphaned price_history records`);
      isValid = false;
    } else {
      log.success('price_history foreign keys valid');
    }
  } catch (error) {
    log.warning('Could not validate price_history (table may not exist)');
  }

  return isValid;
}

/**
 * Validate data integrity after import
 */
async function validateDataIntegrity(): Promise<boolean> {
  log.step('🔍 Validating Data Integrity');

  let isValid = true;

  // Check for duplicate usernames
  try {
    const duplicateUsernames = await db.execute(`
      SELECT username, COUNT(*) as count
      FROM users
      GROUP BY username
      HAVING COUNT(*) > 1
    `);

    if (duplicateUsernames.rows.length > 0) {
      log.error(`Found ${duplicateUsernames.rows.length} duplicate usernames`);
      isValid = false;
    } else {
      log.success('No duplicate usernames');
    }
  } catch (error) {
    log.warning('Could not validate usernames (table may not exist)');
  }

  // Check for duplicate emails
  try {
    const duplicateEmails = await db.execute(`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicateEmails.rows.length > 0) {
      log.error(`Found ${duplicateEmails.rows.length} duplicate emails`);
      isValid = false;
    } else {
      log.success('No duplicate emails');
    }
  } catch (error) {
    log.warning('Could not validate emails (table may not exist)');
  }

  // Check for null required fields in users
  try {
    const nullUsers = await db.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE username IS NULL OR email IS NULL OR password IS NULL
    `);

    if (nullUsers.rows[0].count > 0) {
      log.error(`Found ${nullUsers.rows[0].count} users with null required fields`);
      isValid = false;
    } else {
      log.success('All users have required fields');
    }
  } catch (error) {
    log.warning('Could not validate user required fields (table may not exist)');
  }

  return isValid;
}

/**
 * Get table counts for verification
 */
async function getTableCounts(): Promise<void> {
  log.step('📊 Table Record Counts');

  const tables = [
    'users',
    'projects',
    'testimonials',
    'team_members',
    'companies',
    'newsletter_subscribers',
    'contact_submissions',
    'hero_content',
    'engineering_features',
    'market_data',
    'process_steps',
    'luxury_showcases',
    'research_articles',
    'engine_options',
    'transmission_options',
    'color_options',
    'wheel_options',
    'interior_options',
    'ai_options',
    'additional_options',
    'user_configurations',
    'user_preferences',
    'market_valuations',
    'builder_profiles',
    'technical_specifications',
    'event_venues',
    'build_guides',
    'investment_analytics',
    'vendor_partnerships',
    'car_show_events',
    'gateway_vehicles',
    'enhanced_vehicle_platforms',
    'enhanced_engine_options',
    'enhanced_transmission_options',
    'configurator_suspension_options',
    'configurator_rear_axle_options',
    'configurator_fuel_system_options',
    'enhanced_interior_options',
    'configurator_bodywork_options',
    'configurator_glass_options',
    'configurator_customer_configurations',
    'configurator_car_models',
    'simple_transmission_options',
    'configurator_color_options',
    'configurator_wheel_options',
    'configurator_interior_options',
    'cars_for_sale',
    'user_itineraries',
    'event_comments',
    'price_history',
  ];

  for (const table of tables) {
    try {
      const result = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const count = result.rows[0].count;
      if (count > 0) {
        log.info(`  ${table}: ${count} records`);
      }
    } catch (error) {
      // Table doesn't exist, skip
    }
  }
}

/**
 * Main import process
 */
async function main() {
  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════╗
║   PostgreSQL Data Import Script           ║
║   SQLite → PostgreSQL Migration            ║
╚════════════════════════════════════════════╝${colors.reset}
  `);

  log.info(`Database: ${DATABASE_URL.split('@')[1] || 'PostgreSQL'}`);
  log.info(`Migration directory: ${MIGRATION_DIR}`);

  // Check if migration directory exists
  if (!fs.existsSync(MIGRATION_DIR)) {
    log.error(`Migration directory not found: ${MIGRATION_DIR}`);
    log.info('Please run the export script first to generate migration files');
    process.exit(1);
  }

  const startTime = Date.now();
  let totalImported = 0;
  let totalErrors = 0;

  try {
    // Import in correct dependency order

    // Phase 1: Independent tables (no foreign keys)
    log.step('📦 Phase 1: Importing Independent Tables');

    const phase1Tables = [
      { name: 'users', schema: schema.users, file: 'users.json' },
      { name: 'projects', schema: schema.projects, file: 'projects.json' },
      { name: 'testimonials', schema: schema.testimonials, file: 'testimonials.json' },
      { name: 'team_members', schema: schema.teamMembers, file: 'team_members.json' },
      { name: 'companies', schema: schema.companies, file: 'companies.json' },
      { name: 'newsletter_subscribers', schema: schema.newsletterSubscribers, file: 'newsletter_subscribers.json' },
      { name: 'contact_submissions', schema: schema.contactSubmissions, file: 'contact_submissions.json' },
      { name: 'hero_content', schema: schema.heroContent, file: 'hero_content.json' },
      { name: 'engineering_features', schema: schema.engineeringFeatures, file: 'engineering_features.json' },
      { name: 'market_data', schema: schema.marketData, file: 'market_data.json' },
      { name: 'process_steps', schema: schema.processSteps, file: 'process_steps.json' },
      { name: 'research_articles', schema: schema.researchArticles, file: 'research_articles.json' },
      { name: 'engine_options', schema: schema.engineOptions, file: 'engine_options.json' },
      { name: 'transmission_options', schema: schema.transmissionOptions, file: 'transmission_options.json' },
      { name: 'color_options', schema: schema.colorOptions, file: 'color_options.json' },
      { name: 'wheel_options', schema: schema.wheelOptions, file: 'wheel_options.json' },
      { name: 'interior_options', schema: schema.interiorOptions, file: 'interior_options.json' },
      { name: 'ai_options', schema: schema.aiOptions, file: 'ai_options.json' },
      { name: 'additional_options', schema: schema.additionalOptions, file: 'additional_options.json' },
    ];

    for (const table of phase1Tables) {
      const result = await importTable(table.name, table.schema, table.file);
      totalImported += result.imported;
      totalErrors += result.errors;
    }

    // Phase 2: Tables with optional foreign keys or no dependencies
    log.step('📦 Phase 2: Importing Core Data Tables');

    const phase2Tables = [
      { name: 'luxury_showcases', schema: schema.luxuryShowcases, file: 'luxury_showcases.json' },
      { name: 'market_valuations', schema: schema.marketValuations, file: 'market_valuations.json' },
      { name: 'builder_profiles', schema: schema.builderProfiles, file: 'builder_profiles.json' },
      { name: 'technical_specifications', schema: schema.technicalSpecifications, file: 'technical_specifications.json' },
      { name: 'event_venues', schema: schema.eventVenues, file: 'event_venues.json' },
      { name: 'build_guides', schema: schema.buildGuides, file: 'build_guides.json' },
      { name: 'investment_analytics', schema: schema.investmentAnalytics, file: 'investment_analytics.json' },
      { name: 'vendor_partnerships', schema: schema.vendorPartnerships, file: 'vendor_partnerships.json' },
      { name: 'car_show_events', schema: schema.carShowEvents, file: 'car_show_events.json' },
      { name: 'cars_for_sale', schema: schema.carsForSale, file: 'cars_for_sale.json' },
      { name: 'gateway_vehicles', schema: schema.gatewayVehicles, file: 'gateway_vehicles.json' },
    ];

    for (const table of phase2Tables) {
      const result = await importTable(table.name, table.schema, table.file);
      totalImported += result.imported;
      totalErrors += result.errors;
    }

    // Phase 3: Enhanced configurator tables
    log.step('📦 Phase 3: Importing Configurator Data');

    const phase3Tables = [
      { name: 'enhanced_vehicle_platforms', schema: schema.enhancedVehiclePlatforms, file: 'enhanced_vehicle_platforms.json' },
      { name: 'enhanced_engine_options', schema: schema.enhancedEngineOptions, file: 'enhanced_engine_options.json' },
      { name: 'enhanced_transmission_options', schema: schema.enhancedTransmissionOptions, file: 'enhanced_transmission_options.json' },
      { name: 'configurator_suspension_options', schema: schema.configuratorSuspensionOptions, file: 'configurator_suspension_options.json' },
      { name: 'configurator_rear_axle_options', schema: schema.configuratorRearAxleOptions, file: 'configurator_rear_axle_options.json' },
      { name: 'configurator_fuel_system_options', schema: schema.configuratorFuelSystemOptions, file: 'configurator_fuel_system_options.json' },
      { name: 'enhanced_interior_options', schema: schema.enhancedInteriorOptions, file: 'enhanced_interior_options.json' },
      { name: 'configurator_bodywork_options', schema: schema.configuratorBodyworkOptions, file: 'configurator_bodywork_options.json' },
      { name: 'configurator_glass_options', schema: schema.configuratorGlassOptions, file: 'configurator_glass_options.json' },
      { name: 'configurator_car_models', schema: schema.configuratorCarModels, file: 'configurator_car_models.json' },
      { name: 'simple_transmission_options', schema: schema.simpleTransmissionOptions, file: 'simple_transmission_options.json' },
      { name: 'configurator_color_options', schema: schema.configuratorColorOptions, file: 'configurator_color_options.json' },
      { name: 'configurator_wheel_options', schema: schema.configuratorWheelOptions, file: 'configurator_wheel_options.json' },
      { name: 'configurator_interior_options', schema: schema.configuratorInteriorOptions, file: 'configurator_interior_options.json' },
    ];

    for (const table of phase3Tables) {
      const result = await importTable(table.name, table.schema, table.file);
      totalImported += result.imported;
      totalErrors += result.errors;
    }

    // Phase 4: Dependent tables (require foreign keys to exist)
    log.step('📦 Phase 4: Importing Dependent Tables');

    const phase4Tables = [
      { name: 'user_configurations', schema: schema.userConfigurations, file: 'user_configurations.json' },
      { name: 'user_preferences', schema: schema.userPreferences, file: 'user_preferences.json' },
      { name: 'user_itineraries', schema: schema.userItineraries, file: 'user_itineraries.json' },
      { name: 'event_comments', schema: schema.eventComments, file: 'event_comments.json' },
      { name: 'price_history', schema: schema.priceHistory, file: 'price_history.json' },
      { name: 'configurator_customer_configurations', schema: schema.configuratorCustomerConfigurations, file: 'configurator_customer_configurations.json' },
    ];

    for (const table of phase4Tables) {
      const result = await importTable(table.name, table.schema, table.file);
      totalImported += result.imported;
      totalErrors += result.errors;
    }

    // Validation
    const fkValid = await validateForeignKeys();
    const dataValid = await validateDataIntegrity();

    // Summary
    await getTableCounts();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log.step('📋 Import Summary');
    log.info(`Total records imported: ${totalImported}`);
    if (totalErrors > 0) {
      log.warning(`Total errors: ${totalErrors}`);
    }
    log.info(`Duration: ${duration}s`);

    if (fkValid && dataValid) {
      log.success('✅ All validations passed!');
    } else {
      log.warning('⚠️  Some validations failed. Please review the errors above.');
    }

    console.log(`\n${colors.green}${colors.bright}Import completed!${colors.reset}\n`);

  } catch (error) {
    log.error(`Fatal error during import: ${error}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await pgConnection.end();
  }
}

// Run the import
main().catch(console.error);
