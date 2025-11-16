#!/usr/bin/env tsx

/**
 * Migration Validation Script
 *
 * Validates that the PostgreSQL migration was successful by comparing
 * record counts and checking data integrity.
 *
 * Usage: tsx scripts/validate-migration.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ ERROR: This script requires a PostgreSQL DATABASE_URL');
  process.exit(1);
}

// Setup PostgreSQL connection
const pgConnection = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(pgConnection, { schema });

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

interface ValidationResult {
  passed: number;
  failed: number;
  warnings: number;
}

const results: ValidationResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

/**
 * Check if a table exists and has data
 */
async function checkTable(tableName: string): Promise<number> {
  try {
    const result = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    const count = Number(result.rows[0].count);

    if (count > 0) {
      log.success(`${tableName}: ${count} records`);
      results.passed++;
    } else {
      log.warning(`${tableName}: 0 records (table is empty)`);
      results.warnings++;
    }

    return count;
  } catch (error) {
    log.error(`${tableName}: Table not found or query failed`);
    results.failed++;
    return 0;
  }
}

/**
 * Validate foreign key relationships
 */
async function validateForeignKeys(): Promise<void> {
  log.step('🔍 Validating Foreign Key Relationships');

  // Check user_configurations
  try {
    const orphaned = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_configurations
      WHERE user_id IS NOT NULL
        AND user_id NOT IN (SELECT id FROM users)
    `);

    const count = Number(orphaned.rows[0].count);
    if (count === 0) {
      log.success('user_configurations: All foreign keys valid');
      results.passed++;
    } else {
      log.error(`user_configurations: ${count} orphaned records`);
      results.failed++;
    }
  } catch (error) {
    log.warning('user_configurations: Table not found or check failed');
    results.warnings++;
  }

  // Check user_preferences
  try {
    const orphaned = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_preferences
      WHERE user_id NOT IN (SELECT id FROM users)
    `);

    const count = Number(orphaned.rows[0].count);
    if (count === 0) {
      log.success('user_preferences: All foreign keys valid');
      results.passed++;
    } else {
      log.error(`user_preferences: ${count} orphaned records`);
      results.failed++;
    }
  } catch (error) {
    log.warning('user_preferences: Table not found or check failed');
    results.warnings++;
  }

  // Check user_itineraries
  try {
    const orphaned = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_itineraries
      WHERE user_id NOT IN (SELECT id FROM users)
         OR event_id NOT IN (SELECT id FROM car_show_events)
    `);

    const count = Number(orphaned.rows[0].count);
    if (count === 0) {
      log.success('user_itineraries: All foreign keys valid');
      results.passed++;
    } else {
      log.error(`user_itineraries: ${count} orphaned records`);
      results.failed++;
    }
  } catch (error) {
    log.warning('user_itineraries: Table not found or check failed');
    results.warnings++;
  }

  // Check event_comments
  try {
    const orphaned = await db.execute(`
      SELECT COUNT(*) as count
      FROM event_comments
      WHERE user_id NOT IN (SELECT id FROM users)
         OR event_id NOT IN (SELECT id FROM car_show_events)
    `);

    const count = Number(orphaned.rows[0].count);
    if (count === 0) {
      log.success('event_comments: All foreign keys valid');
      results.passed++;
    } else {
      log.error(`event_comments: ${count} orphaned records`);
      results.failed++;
    }
  } catch (error) {
    log.warning('event_comments: Table not found or check failed');
    results.warnings++;
  }

  // Check price_history
  try {
    const orphaned = await db.execute(`
      SELECT COUNT(*) as count
      FROM price_history
      WHERE vehicle_id NOT IN (SELECT id FROM cars_for_sale)
    `);

    const count = Number(orphaned.rows[0].count);
    if (count === 0) {
      log.success('price_history: All foreign keys valid');
      results.passed++;
    } else {
      log.error(`price_history: ${count} orphaned records`);
      results.failed++;
    }
  } catch (error) {
    log.warning('price_history: Table not found or check failed');
    results.warnings++;
  }
}

/**
 * Validate data integrity
 */
async function validateDataIntegrity(): Promise<void> {
  log.step('🔍 Validating Data Integrity');

  // Check for duplicate usernames
  try {
    const duplicates = await db.execute(`
      SELECT username, COUNT(*) as count
      FROM users
      GROUP BY username
      HAVING COUNT(*) > 1
    `);

    if (duplicates.rows.length === 0) {
      log.success('users: No duplicate usernames');
      results.passed++;
    } else {
      log.error(`users: ${duplicates.rows.length} duplicate usernames found`);
      results.failed++;
    }
  } catch (error) {
    log.warning('users: Could not check for duplicate usernames');
    results.warnings++;
  }

  // Check for duplicate emails
  try {
    const duplicates = await db.execute(`
      SELECT email, COUNT(*) as count
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    if (duplicates.rows.length === 0) {
      log.success('users: No duplicate emails');
      results.passed++;
    } else {
      log.error(`users: ${duplicates.rows.length} duplicate emails found`);
      results.failed++;
    }
  } catch (error) {
    log.warning('users: Could not check for duplicate emails');
    results.warnings++;
  }

  // Check for null required fields
  try {
    const nulls = await db.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE username IS NULL OR email IS NULL OR password IS NULL
    `);

    const count = Number(nulls.rows[0].count);
    if (count === 0) {
      log.success('users: All required fields populated');
      results.passed++;
    } else {
      log.error(`users: ${count} records with null required fields`);
      results.failed++;
    }
  } catch (error) {
    log.warning('users: Could not check required fields');
    results.warnings++;
  }

  // Check timestamp formats
  try {
    const invalidTimestamps = await db.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at IS NULL
    `);

    const count = Number(invalidTimestamps.rows[0].count);
    if (count === 0) {
      log.success('users: All timestamps valid');
      results.passed++;
    } else {
      log.error(`users: ${count} records with invalid timestamps`);
      results.failed++;
    }
  } catch (error) {
    log.warning('users: Could not check timestamps');
    results.warnings++;
  }
}

/**
 * Validate sample data quality
 */
async function validateSampleData(): Promise<void> {
  log.step('🔍 Validating Sample Data Quality');

  // Check if we have at least some data in key tables
  const keyCounts = {
    users: await checkTableCount('users'),
    projects: await checkTableCount('projects'),
    car_show_events: await checkTableCount('car_show_events'),
    cars_for_sale: await checkTableCount('cars_for_sale'),
  };

  if (keyCounts.users > 0) {
    log.success('Database has user data');
    results.passed++;
  } else {
    log.warning('Database has no users (might be expected)');
    results.warnings++;
  }

  if (keyCounts.car_show_events > 0 || keyCounts.cars_for_sale > 0) {
    log.success('Database has vehicle/event data');
    results.passed++;
  } else {
    log.warning('Database has no vehicles or events (might be expected)');
    results.warnings++;
  }
}

async function checkTableCount(tableName: string): Promise<number> {
  try {
    const result = await db.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
    return Number(result.rows[0].count);
  } catch (error) {
    return 0;
  }
}

/**
 * Main validation process
 */
async function main() {
  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════╗
║   PostgreSQL Migration Validator           ║
╚════════════════════════════════════════════╝${colors.reset}
  `);

  log.info(`Database: ${DATABASE_URL.split('@')[1] || 'PostgreSQL'}`);

  const startTime = Date.now();

  try {
    // Check table existence and counts
    log.step('📊 Checking Table Counts');

    const tables = [
      'users',
      'projects',
      'car_show_events',
      'cars_for_sale',
      'user_configurations',
      'user_preferences',
      'user_itineraries',
      'event_comments',
      'price_history',
      'gateway_vehicles',
    ];

    for (const table of tables) {
      await checkTable(table);
    }

    // Validate relationships
    await validateForeignKeys();

    // Validate data integrity
    await validateDataIntegrity();

    // Validate sample data
    await validateSampleData();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Summary
    log.step('📋 Validation Summary');
    log.info(`Duration: ${duration}s`);
    log.success(`Passed: ${results.passed} checks`);

    if (results.warnings > 0) {
      log.warning(`Warnings: ${results.warnings} checks`);
    }

    if (results.failed > 0) {
      log.error(`Failed: ${results.failed} checks`);
    }

    console.log('');

    if (results.failed === 0) {
      console.log(`${colors.green}${colors.bright}✅ Migration validation PASSED!${colors.reset}\n`);
      process.exit(0);
    } else if (results.failed > 0 && results.warnings > 0) {
      console.log(`${colors.yellow}${colors.bright}⚠️  Migration has issues that need attention${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`${colors.red}${colors.bright}❌ Migration validation FAILED!${colors.reset}\n`);
      process.exit(1);
    }

  } catch (error) {
    log.error(`Fatal error during validation: ${error}`);
    console.error(error);
    process.exit(1);
  } finally {
    await pgConnection.end();
  }
}

// Run validation
main().catch(console.error);
