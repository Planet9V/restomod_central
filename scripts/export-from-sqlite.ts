#!/usr/bin/env tsx

/**
 * SQLite Export Script
 *
 * Exports all data from SQLite database to JSON files
 * for migration to PostgreSQL.
 *
 * Usage: tsx scripts/export-from-sqlite.ts
 *
 * Prerequisites:
 * - SQLite database exists at db/local.db
 * - DATABASE_URL set to SQLite connection string (or will use default)
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import * as fs from 'fs';
import * as path from 'path';

// Database connection
const DATABASE_PATH = process.env.DATABASE_URL || './db/local.db';

if (DATABASE_PATH.startsWith('postgresql://') || DATABASE_PATH.startsWith('postgres://')) {
  console.error('❌ ERROR: This script is for SQLite export only');
  console.error('   DATABASE_URL appears to be PostgreSQL');
  process.exit(1);
}

// Setup SQLite connection
const sqlite = new Database(DATABASE_PATH);
const db = drizzle(sqlite, { schema });

// Export directory
const EXPORT_DIR = path.join(process.cwd(), 'data', 'migration');

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
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
 * Export table data to JSON file
 */
async function exportTable(
  tableName: string,
  tableSchema: any,
  filename: string
): Promise<number> {
  log.info(`Exporting ${tableName}...`);

  try {
    // Query all data from table
    const data = await db.select().from(tableSchema);

    if (data.length === 0) {
      log.warning(`  No data found in ${tableName}`);
      return 0;
    }

    // Write to JSON file
    const filePath = path.join(EXPORT_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    log.success(`  Exported ${data.length} records to ${filename}`);
    return data.length;

  } catch (error) {
    log.error(`  Failed to export ${tableName}: ${error}`);
    return 0;
  }
}

/**
 * Main export process
 */
async function main() {
  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════╗
║   SQLite Data Export Script                ║
║   Preparing for PostgreSQL Migration       ║
╚════════════════════════════════════════════╝${colors.reset}
  `);

  log.info(`Database: ${DATABASE_PATH}`);
  log.info(`Export directory: ${EXPORT_DIR}`);

  // Create export directory if it doesn't exist
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
    log.success('Created export directory');
  }

  const startTime = Date.now();
  let totalRecords = 0;

  try {
    // Export all tables in dependency order

    // Phase 1: Independent tables
    log.step('📦 Phase 1: Exporting Independent Tables');

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
      totalRecords += await exportTable(table.name, table.schema, table.file);
    }

    // Phase 2: Core data tables
    log.step('📦 Phase 2: Exporting Core Data Tables');

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
      totalRecords += await exportTable(table.name, table.schema, table.file);
    }

    // Phase 3: Configurator tables
    log.step('📦 Phase 3: Exporting Configurator Data');

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
      totalRecords += await exportTable(table.name, table.schema, table.file);
    }

    // Phase 4: Dependent tables
    log.step('📦 Phase 4: Exporting Dependent Tables');

    const phase4Tables = [
      { name: 'user_configurations', schema: schema.userConfigurations, file: 'user_configurations.json' },
      { name: 'user_preferences', schema: schema.userPreferences, file: 'user_preferences.json' },
      { name: 'user_itineraries', schema: schema.userItineraries, file: 'user_itineraries.json' },
      { name: 'event_comments', schema: schema.eventComments, file: 'event_comments.json' },
      { name: 'price_history', schema: schema.priceHistory, file: 'price_history.json' },
      { name: 'configurator_customer_configurations', schema: schema.configuratorCustomerConfigurations, file: 'configurator_customer_configurations.json' },
    ];

    for (const table of phase4Tables) {
      totalRecords += await exportTable(table.name, table.schema, table.file);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Summary
    log.step('📋 Export Summary');
    log.info(`Total records exported: ${totalRecords}`);
    log.info(`Duration: ${duration}s`);
    log.info(`Files saved to: ${EXPORT_DIR}`);

    console.log(`\n${colors.green}${colors.bright}Export completed!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Set up PostgreSQL database`);
    console.log(`  2. Update DATABASE_URL to PostgreSQL connection string`);
    console.log(`  3. Run: tsx scripts/import-to-postgres.ts\n`);

  } catch (error) {
    log.error(`Fatal error during export: ${error}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    sqlite.close();
  }
}

// Run the export
main().catch(console.error);
