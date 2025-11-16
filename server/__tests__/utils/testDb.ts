import "dotenv/config";
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import * as configuratorSchema from '@shared/configurator-schema';
import { sql } from 'drizzle-orm';

// Determine if we're using PostgreSQL or SQLite based on DATABASE_URL
const isPostgres = process.env.DATABASE_URL?.startsWith('postgresql://') ||
                   process.env.DATABASE_URL?.startsWith('postgres://');

// Test database connection and instance
let testDb: any;
let testConnection: any;

/**
 * Setup test database connection
 * Creates a separate connection for testing to avoid affecting production data
 */
export async function setupTestDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set for testing');
  }

  if (isPostgres) {
    // PostgreSQL setup for testing
    testConnection = postgres(process.env.DATABASE_URL, {
      max: 1, // Single connection for tests
      idle_timeout: 10,
      connect_timeout: 10,
    });

    testDb = drizzlePg(testConnection, {
      schema: { ...schema, ...configuratorSchema }
    });
  } else {
    // SQLite setup for testing
    testConnection = new Database(process.env.DATABASE_URL);
    testDb = drizzleSqlite(testConnection, {
      schema: { ...schema, ...configuratorSchema }
    });
  }

  return testDb;
}

/**
 * Teardown test database connection
 * Properly closes connections to prevent memory leaks
 */
export async function teardownTestDatabase() {
  try {
    if (isPostgres && testConnection) {
      await testConnection.end();
    } else if (testConnection) {
      testConnection.close();
    }
  } catch (error) {
    console.error('Error closing test database connection:', error);
  }
}

/**
 * Get test database instance
 */
export function getTestDb() {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.');
  }
  return testDb;
}

/**
 * Check if database is PostgreSQL
 */
export function isPostgresDatabase() {
  return isPostgres;
}

/**
 * Seed test data for database validation
 * Returns counts of seeded records for validation
 */
export async function seedTestData(db: any) {
  const seededCounts: Record<string, number> = {};

  try {
    // Seed a test user
    const testUsers = await db.insert(schema.users).values({
      username: 'test_user',
      email: 'test@example.com',
      password: 'hashed_password_test',
      isAdmin: false,
      createdAt: new Date(),
    }).returning();
    seededCounts.users = testUsers.length;

    // Seed a test car show event
    const testEvents = await db.insert(schema.carShowEvents).values({
      eventName: 'Test Car Show',
      eventSlug: 'test-car-show',
      venue: 'Test Venue',
      city: 'Test City',
      state: 'TX',
      startDate: new Date('2025-06-01'),
      eventType: 'car_show',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    seededCounts.carShowEvents = testEvents.length;

    // Seed a test car for sale
    const testCars = await db.insert(schema.carsForSale).values({
      make: 'Ford',
      model: 'Mustang',
      year: 1967,
      price: '45000',
      sourceType: 'test',
      sourceName: 'Test Import',
      category: 'Muscle Cars',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    seededCounts.carsForSale = testCars.length;

    return seededCounts;
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

/**
 * Clean up test data
 * Removes all test records from database
 */
export async function cleanupTestData(db: any) {
  try {
    // Delete test records (cascade will handle relations)
    await db.delete(schema.users).where(sql`username = 'test_user'`);
    await db.delete(schema.carShowEvents).where(sql`event_slug = 'test-car-show'`);
    await db.delete(schema.carsForSale).where(sql`source_type = 'test'`);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
}

/**
 * Get all table names from schema
 */
export function getAllTableNames(): string[] {
  const allSchemas = { ...schema, ...configuratorSchema };
  return Object.keys(allSchemas).filter(key => {
    const value = allSchemas[key as keyof typeof allSchemas];
    return value && typeof value === 'object' && 'tableName' in value;
  });
}

/**
 * Check if pgvector extension is installed (PostgreSQL only)
 */
export async function checkPgVectorExtension(db: any): Promise<boolean> {
  if (!isPostgres) {
    return false;
  }

  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as extension_exists
    `);

    return result.rows?.[0]?.extension_exists || false;
  } catch (error) {
    console.error('Error checking pgvector extension:', error);
    return false;
  }
}

/**
 * Get table row counts
 */
export async function getTableRowCounts(db: any): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const allSchemas = { ...schema, ...configuratorSchema };

  for (const [key, value] of Object.entries(allSchemas)) {
    if (value && typeof value === 'object' && 'tableName' in value) {
      const tableName = (value as any).tableName;
      try {
        const result = await db.execute(
          sql.raw(`SELECT COUNT(*) as count FROM ${tableName}`)
        );
        counts[tableName] = isPostgres
          ? parseInt(result.rows?.[0]?.count || '0')
          : result[0]?.count || 0;
      } catch (error) {
        console.error(`Error counting rows in ${tableName}:`, error);
        counts[tableName] = -1; // Indicate error
      }
    }
  }

  return counts;
}

/**
 * Verify foreign key constraints
 */
export async function verifyForeignKeyConstraints(db: any): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!isPostgres) {
    // For SQLite, check PRAGMA foreign_key_check
    try {
      const result = await db.execute(sql`PRAGMA foreign_key_check`);
      if (result && result.length > 0) {
        errors.push(`Foreign key violations found: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      errors.push(`Error checking foreign keys: ${error}`);
    }
  } else {
    // For PostgreSQL, verify constraint existence
    try {
      const result = await db.execute(sql`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      `);

      // Constraints exist is a good sign
      if (!result.rows || result.rows.length === 0) {
        errors.push('No foreign key constraints found in database');
      }
    } catch (error) {
      errors.push(`Error verifying constraints: ${error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
