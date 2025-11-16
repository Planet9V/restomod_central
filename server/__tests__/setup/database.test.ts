import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  setupTestDatabase,
  teardownTestDatabase,
  getTestDb,
  isPostgresDatabase,
  seedTestData,
  cleanupTestData,
  checkPgVectorExtension,
  getTableRowCounts,
  verifyForeignKeyConstraints,
  getAllTableNames,
} from '../utils/testDb';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

describe('Database Migration Validation', () => {
  let db: any;
  const isPostgres = isPostgresDatabase();

  beforeAll(async () => {
    // Setup test database connection
    db = await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup and close connections
    await teardownTestDatabase();
  });

  describe('Database Connection', () => {
    it('should successfully connect to the database', () => {
      expect(db).toBeDefined();
      expect(db).not.toBeNull();
    });

    it('should detect correct database type', () => {
      const dbType = isPostgres ? 'PostgreSQL' : 'SQLite';
      console.log(`Connected to ${dbType} database`);
      expect(typeof isPostgres).toBe('boolean');
    });

    it('should be able to execute raw SQL queries', async () => {
      const result = await db.execute(sql`SELECT 1 as test`);
      expect(result).toBeDefined();

      if (isPostgres) {
        expect(result.rows).toBeDefined();
        expect(result.rows.length).toBeGreaterThan(0);
      } else {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PostgreSQL Extension - pgvector', () => {
    it('should have pgvector extension installed (PostgreSQL only)', async () => {
      if (!isPostgres) {
        console.log('Skipping pgvector test - SQLite database detected');
        return;
      }

      const hasExtension = await checkPgVectorExtension(db);
      expect(hasExtension).toBe(true);
    });

    it('should be able to query vector extension version (PostgreSQL only)', async () => {
      if (!isPostgres) {
        console.log('Skipping vector version test - SQLite database detected');
        return;
      }

      try {
        const result = await db.execute(sql`
          SELECT extversion FROM pg_extension WHERE extname = 'vector'
        `);

        expect(result.rows).toBeDefined();
        expect(result.rows.length).toBeGreaterThan(0);
        console.log(`pgvector version: ${result.rows[0]?.extversion}`);
      } catch (error) {
        throw new Error(`Failed to query pgvector version: ${error}`);
      }
    });
  });

  describe('Database Schema - Table Existence', () => {
    it('should have all core tables created', async () => {
      const requiredTables = [
        'users',
        'projects',
        'testimonials',
        'car_show_events',
        'cars_for_sale',
        'gateway_vehicles',
        'research_articles',
        'user_configurations',
      ];

      for (const tableName of requiredTables) {
        try {
          const result = await db.execute(
            sql.raw(`SELECT 1 FROM ${tableName} LIMIT 1`)
          );
          expect(result).toBeDefined();
          console.log(`✓ Table exists: ${tableName}`);
        } catch (error) {
          throw new Error(`Table ${tableName} does not exist: ${error}`);
        }
      }
    });

    it('should have enhanced configurator tables created', async () => {
      const configuratorTables = [
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
      ];

      for (const tableName of configuratorTables) {
        try {
          const result = await db.execute(
            sql.raw(`SELECT 1 FROM ${tableName} LIMIT 1`)
          );
          expect(result).toBeDefined();
          console.log(`✓ Configurator table exists: ${tableName}`);
        } catch (error) {
          throw new Error(`Configurator table ${tableName} does not exist: ${error}`);
        }
      }
    });

    it('should have market research tables created', async () => {
      const researchTables = [
        'market_valuations',
        'builder_profiles',
        'technical_specifications',
        'event_venues',
        'build_guides',
        'investment_analytics',
        'vendor_partnerships',
      ];

      for (const tableName of researchTables) {
        try {
          const result = await db.execute(
            sql.raw(`SELECT 1 FROM ${tableName} LIMIT 1`)
          );
          expect(result).toBeDefined();
          console.log(`✓ Research table exists: ${tableName}`);
        } catch (error) {
          throw new Error(`Research table ${tableName} does not exist: ${error}`);
        }
      }
    });
  });

  describe('Database Schema - Data Integrity', () => {
    it('should get accurate row counts for all tables', async () => {
      const counts = await getTableRowCounts(db);

      expect(counts).toBeDefined();
      expect(typeof counts).toBe('object');

      // Log all table counts
      console.log('\n=== Table Row Counts ===');
      const sortedTables = Object.keys(counts).sort();
      for (const table of sortedTables) {
        const count = counts[table];
        if (count >= 0) {
          console.log(`${table}: ${count} rows`);
        } else {
          console.log(`${table}: ERROR counting rows`);
        }
      }

      // Verify no errors in counting
      const errorTables = Object.entries(counts)
        .filter(([_, count]) => count === -1)
        .map(([table]) => table);

      expect(errorTables.length).toBe(0);
    });

    it('should verify foreign key constraints are valid', async () => {
      const { valid, errors } = await verifyForeignKeyConstraints(db);

      if (!valid) {
        console.error('Foreign key constraint errors:');
        errors.forEach(error => console.error(`  - ${error}`));
      }

      expect(valid).toBe(true);
      expect(errors.length).toBe(0);
    });
  });

  describe('Data Operations - CRUD', () => {
    let seededCounts: Record<string, number> = {};

    it('should successfully seed test data', async () => {
      seededCounts = await seedTestData(db);

      expect(seededCounts).toBeDefined();
      expect(seededCounts.users).toBe(1);
      expect(seededCounts.carShowEvents).toBe(1);
      expect(seededCounts.carsForSale).toBe(1);

      console.log('✓ Test data seeded successfully:', seededCounts);
    });

    it('should be able to query seeded data', async () => {
      // Query test user
      const users = await db.select()
        .from(schema.users)
        .where(sql`username = 'test_user'`);

      expect(users).toBeDefined();
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('test@example.com');

      // Query test car show event
      const events = await db.select()
        .from(schema.carShowEvents)
        .where(sql`event_slug = 'test-car-show'`);

      expect(events).toBeDefined();
      expect(events.length).toBe(1);
      expect(events[0].eventName).toBe('Test Car Show');

      // Query test car
      const cars = await db.select()
        .from(schema.carsForSale)
        .where(sql`source_type = 'test'`);

      expect(cars).toBeDefined();
      expect(cars.length).toBe(1);
      expect(cars[0].make).toBe('Ford');
    });

    it('should be able to update seeded data', async () => {
      // Update test user email
      await db.update(schema.users)
        .set({ email: 'updated_test@example.com' })
        .where(sql`username = 'test_user'`);

      // Verify update
      const users = await db.select()
        .from(schema.users)
        .where(sql`username = 'test_user'`);

      expect(users[0].email).toBe('updated_test@example.com');
    });

    it('should be able to delete seeded data', async () => {
      await cleanupTestData(db);

      // Verify deletion
      const users = await db.select()
        .from(schema.users)
        .where(sql`username = 'test_user'`);

      expect(users.length).toBe(0);
      console.log('✓ Test data cleaned up successfully');
    });
  });

  describe('Vector Functionality (PostgreSQL only)', () => {
    it('should support vector operations if extension is available', async () => {
      if (!isPostgres) {
        console.log('Skipping vector operations test - SQLite database detected');
        return;
      }

      const hasExtension = await checkPgVectorExtension(db);
      if (!hasExtension) {
        console.warn('⚠ pgvector extension not installed, skipping vector tests');
        return;
      }

      try {
        // Test basic vector operations
        const result = await db.execute(sql`
          SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector as distance
        `);

        expect(result.rows).toBeDefined();
        expect(result.rows.length).toBeGreaterThan(0);
        expect(result.rows[0].distance).toBeDefined();
        console.log(`✓ Vector distance calculation successful: ${result.rows[0].distance}`);
      } catch (error) {
        throw new Error(`Vector operations failed: ${error}`);
      }
    });

    it('should be able to create vector columns if needed', async () => {
      if (!isPostgres) {
        console.log('Skipping vector column test - SQLite database detected');
        return;
      }

      const hasExtension = await checkPgVectorExtension(db);
      if (!hasExtension) {
        console.warn('⚠ pgvector extension not installed, skipping vector column test');
        return;
      }

      try {
        // Create a temporary test table with vector column
        await db.execute(sql`
          CREATE TEMPORARY TABLE IF NOT EXISTS test_vectors (
            id SERIAL PRIMARY KEY,
            embedding vector(384)
          )
        `);

        // Insert a test vector
        await db.execute(sql`
          INSERT INTO test_vectors (embedding)
          VALUES ('[${Array(384).fill(0).join(',')}]'::vector)
        `);

        // Query the vector
        const result = await db.execute(sql`
          SELECT id, embedding FROM test_vectors LIMIT 1
        `);

        expect(result.rows).toBeDefined();
        expect(result.rows.length).toBe(1);
        console.log('✓ Vector column operations successful');

        // Clean up temporary table
        await db.execute(sql`DROP TABLE IF EXISTS test_vectors`);
      } catch (error) {
        throw new Error(`Vector column test failed: ${error}`);
      }
    });
  });

  describe('Database Health Check', () => {
    it('should have no orphaned records', async () => {
      // Check for user_configurations without valid users
      const orphanedConfigs = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM user_configurations uc
        WHERE NOT EXISTS (
          SELECT 1 FROM users u WHERE u.id = uc.user_id
        )
      `);

      const orphanCount = isPostgres
        ? parseInt(orphanedConfigs.rows[0]?.count || '0')
        : orphanedConfigs[0]?.count || 0;

      expect(orphanCount).toBe(0);
      console.log('✓ No orphaned user configurations found');
    });

    it('should have consistent timestamp data', async () => {
      // Check for records with future timestamps (data quality check)
      const futureRecords = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM car_show_events
        WHERE created_at > CURRENT_TIMESTAMP + INTERVAL '1 day'
      `);

      const futureCount = isPostgres
        ? parseInt(futureRecords.rows?.[0]?.count || '0')
        : 0; // SQLite doesn't support INTERVAL

      if (isPostgres) {
        expect(futureCount).toBe(0);
        console.log('✓ No records with invalid future timestamps');
      }
    });

    it('should have valid JSON data in JSON columns', async () => {
      // Sample check on a table with JSON columns
      const result = await db.select()
        .from(schema.carsForSale)
        .limit(5);

      for (const car of result) {
        if (car.features) {
          expect(() => {
            if (typeof car.features === 'string') {
              JSON.parse(car.features);
            }
          }).not.toThrow();
        }
      }

      console.log('✓ JSON data validation passed');
    });
  });

  describe('Migration Validation Summary', () => {
    it('should generate migration summary report', async () => {
      const counts = await getTableRowCounts(db);
      const { valid: constraintsValid } = await verifyForeignKeyConstraints(db);
      const hasVector = isPostgres ? await checkPgVectorExtension(db) : false;

      const totalRecords = Object.values(counts).reduce((sum, count) => sum + (count > 0 ? count : 0), 0);
      const totalTables = Object.keys(counts).length;

      console.log('\n=================================');
      console.log('DATABASE MIGRATION SUMMARY');
      console.log('=================================');
      console.log(`Database Type: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
      console.log(`Total Tables: ${totalTables}`);
      console.log(`Total Records: ${totalRecords}`);
      console.log(`Foreign Keys Valid: ${constraintsValid ? 'YES' : 'NO'}`);

      if (isPostgres) {
        console.log(`pgvector Extension: ${hasVector ? 'INSTALLED' : 'NOT INSTALLED'}`);
      }

      console.log('=================================\n');

      // Final validation assertions
      expect(totalTables).toBeGreaterThan(0);
      expect(constraintsValid).toBe(true);
      if (isPostgres) {
        expect(hasVector).toBe(true);
      }
    });
  });
});
