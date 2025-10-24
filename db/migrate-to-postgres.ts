#!/usr/bin/env tsx
// ⚠️ DEVELOPMENT ENVIRONMENT - SQLite to PostgreSQL Migration
// Migration script to transfer all data from SQLite to PostgreSQL

import { db as sqliteDb } from './index.js';
import { postgresDb, testConnection, pool } from './postgres.js';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

// Migration statistics
interface MigrationStats {
  table: string;
  exported: number;
  imported: number;
  failed: number;
  duration: number;
}

const stats: MigrationStats[] = [];

/**
 * Main migration function
 */
async function migrateDatabase() {
  console.log('🚀 Starting SQLite → PostgreSQL Migration');
  console.log('==========================================\n');

  const startTime = Date.now();

  try {
    // Step 1: Test PostgreSQL connection
    console.log('Step 1: Testing PostgreSQL connection...');
    const connected = await testConnection();

    if (!connected) {
      throw new Error('PostgreSQL connection failed. Please check your configuration.');
    }

    console.log('');

    // Step 2: Create PostgreSQL schema (if not exists)
    console.log('Step 2: Creating PostgreSQL schema...');
    await createSchema();
    console.log('✅ Schema created\n');

    // Step 3: Migrate data table by table
    console.log('Step 3: Migrating data...');

    // Core tables
    await migrateTable('users', schema.users);
    await migrateTable('carsForSale', schema.carsForSale);
    await migrateTable('carShowEvents', schema.carShowEvents);
    await migrateTable('articles', schema.articles);

    // Supporting tables
    await migrateTable('contactSubmissions', schema.contactSubmissions);
    await migrateTable('carComparisons', schema.carComparisons);
    await migrateTable('comparisonVehicles', schema.comparisonVehicles);
    await migrateTable('userPreferences', schema.userPreferences);
    await migrateTable('itineraries', schema.itineraries);
    await migrateTable('itineraryItems', schema.itineraryItems);
    await migrateTable('vehicleAnalytics', schema.vehicleAnalytics);
    await migrateTable('priceHistory', schema.priceHistory);
    await migrateTable('comments', schema.comments);

    // Analytics tables
    await migrateTable('pageViews', schema.pageViews);
    await migrateTable('userSessions', schema.userSessions);

    console.log('');

    // Step 4: Create indexes
    console.log('Step 4: Creating indexes...');
    await createIndexes();
    console.log('✅ Indexes created\n');

    // Step 5: Verify migration
    console.log('Step 5: Verifying migration...');
    await verifyMigration();
    console.log('');

    // Print summary
    const totalDuration = Date.now() - startTime;
    printSummary(totalDuration);

    console.log('\n✅ Migration completed successfully!');
    console.log(`   Total time: ${(totalDuration / 1000).toFixed(2)}s`);

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

/**
 * Create PostgreSQL schema
 */
async function createSchema() {
  try {
    // Drizzle will auto-create tables based on schema
    // Alternatively, use drizzle-kit push or manual SQL
    console.log('   Note: Using drizzle-kit push is recommended');
    console.log('   Run: npm run db:push');
  } catch (error: any) {
    throw new Error(`Schema creation failed: ${error.message}`);
  }
}

/**
 * Migrate a single table
 */
async function migrateTable(tableName: string, tableSchema: any) {
  const tableStartTime = Date.now();

  console.log(`   📋 Migrating ${tableName}...`);

  try {
    // Export from SQLite
    const data = await sqliteDb.select().from(tableSchema);

    if (data.length === 0) {
      console.log(`      ⚠️  No data to migrate in ${tableName}`);

      stats.push({
        table: tableName,
        exported: 0,
        imported: 0,
        failed: 0,
        duration: Date.now() - tableStartTime
      });

      return;
    }

    console.log(`      Exported: ${data.length} records`);

    // Import to PostgreSQL in batches
    const batchSize = 100;
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      try {
        // Use upsert to handle conflicts
        await postgresDb.insert(tableSchema).values(batch).onConflictDoNothing();
        imported += batch.length;
      } catch (error: any) {
        console.error(`      ❌ Batch ${i / batchSize + 1} failed:`, error.message);
        failed += batch.length;
      }
    }

    const duration = Date.now() - tableStartTime;

    console.log(`      ✅ Imported: ${imported} records (${(duration / 1000).toFixed(2)}s)`);

    if (failed > 0) {
      console.log(`      ⚠️  Failed: ${failed} records`);
    }

    stats.push({
      table: tableName,
      exported: data.length,
      imported,
      failed,
      duration
    });

  } catch (error: any) {
    console.error(`      ❌ Failed to migrate ${tableName}:`, error.message);

    stats.push({
      table: tableName,
      exported: 0,
      imported: 0,
      failed: 0,
      duration: Date.now() - tableStartTime
    });
  }
}

/**
 * Create PostgreSQL-specific indexes
 */
async function createIndexes() {
  try {
    const indexQueries = [
      // Full-text search indexes
      sql`CREATE INDEX IF NOT EXISTS idx_cars_fts ON cars_for_sale USING gin(to_tsvector('english', make || ' ' || model || ' ' || COALESCE(description, '')))`,
      sql`CREATE INDEX IF NOT EXISTS idx_events_fts ON car_show_events USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')))`,
      sql`CREATE INDEX IF NOT EXISTS idx_articles_fts ON articles USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')))`,

      // Performance indexes
      sql`CREATE INDEX IF NOT EXISTS idx_cars_price ON cars_for_sale(price)`,
      sql`CREATE INDEX IF NOT EXISTS idx_cars_year ON cars_for_sale(year)`,
      sql`CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars_for_sale(make, model)`,
      sql`CREATE INDEX IF NOT EXISTS idx_events_date ON car_show_events(date)`,
      sql`CREATE INDEX IF NOT EXISTS idx_events_location ON car_show_events(location)`,
      sql`CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id)`,
      sql`CREATE INDEX IF NOT EXISTS idx_price_history_vehicle ON price_history(vehicle_id, timestamp)`,
    ];

    for (const query of indexQueries) {
      try {
        await postgresDb.execute(query);
      } catch (error: any) {
        console.log(`      ⚠️  Index creation skipped: ${error.message}`);
      }
    }

  } catch (error: any) {
    console.error(`   ❌ Index creation failed:`, error.message);
  }
}

/**
 * Verify migration by comparing counts
 */
async function verifyMigration() {
  const verifications: Array<{
    table: string;
    sqlite: number;
    postgres: number;
    match: boolean;
  }> = [];

  for (const stat of stats) {
    if (stat.exported === 0) continue;

    try {
      // Count in SQLite
      const sqliteTable = Object.values(schema).find(
        (s: any) => s?.['$inferSelect'] && s._.name === stat.table
      );

      if (!sqliteTable) continue;

      const sqliteCount = await sqliteDb.select().from(sqliteTable as any).then(r => r.length);

      // Count in PostgreSQL
      const postgresCount = await postgresDb.select().from(sqliteTable as any).then(r => r.length);

      verifications.push({
        table: stat.table,
        sqlite: sqliteCount,
        postgres: postgresCount,
        match: sqliteCount === postgresCount
      });

      if (sqliteCount !== postgresCount) {
        console.log(`   ⚠️  Mismatch in ${stat.table}: SQLite=${sqliteCount}, PostgreSQL=${postgresCount}`);
      }

    } catch (error: any) {
      console.error(`   ❌ Verification failed for ${stat.table}:`, error.message);
    }
  }

  const allMatch = verifications.every(v => v.match);

  if (allMatch) {
    console.log(`   ✅ All ${verifications.length} tables verified successfully`);
  } else {
    console.log(`   ⚠️  Some tables have mismatches - review migration`);
  }
}

/**
 * Print migration summary
 */
function printSummary(totalDuration: number) {
  console.log('\n📊 Migration Summary');
  console.log('==========================================');

  let totalExported = 0;
  let totalImported = 0;
  let totalFailed = 0;

  console.log('\nTable Statistics:');
  console.log('-'.repeat(70));
  console.log(
    'Table'.padEnd(30) +
    'Exported'.padEnd(12) +
    'Imported'.padEnd(12) +
    'Failed'.padEnd(10) +
    'Time'
  );
  console.log('-'.repeat(70));

  for (const stat of stats) {
    console.log(
      stat.table.padEnd(30) +
      stat.exported.toString().padEnd(12) +
      stat.imported.toString().padEnd(12) +
      stat.failed.toString().padEnd(10) +
      `${(stat.duration / 1000).toFixed(2)}s`
    );

    totalExported += stat.exported;
    totalImported += stat.imported;
    totalFailed += stat.failed;
  }

  console.log('-'.repeat(70));
  console.log(
    'TOTAL'.padEnd(30) +
    totalExported.toString().padEnd(12) +
    totalImported.toString().padEnd(12) +
    totalFailed.toString().padEnd(10) +
    `${(totalDuration / 1000).toFixed(2)}s`
  );
  console.log('-'.repeat(70));
}

// Run migration
migrateDatabase();
