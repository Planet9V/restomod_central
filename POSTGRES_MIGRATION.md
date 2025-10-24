# PostgreSQL Migration Guide

## ⚠️ DEVELOPMENT ENVIRONMENT - HARDCODED CREDENTIALS
**This configuration includes hardcoded database credentials for development.**
**DO NOT use these credentials in production.**

---

## Overview

Complete migration from SQLite to PostgreSQL with minimal downtime, preserving all data and improving scalability.

---

## PostgreSQL Database Configuration

### Connection Details (DEVELOPMENT)

```typescript
// db/postgres-config.ts

export const POSTGRES_CONFIG = {
  // ⚠️ DEVELOPMENT CREDENTIALS - HARDCODED FOR CONVENIENCE
  host: process.env.POSTGRES_HOST || 'YOUR_POSTGRES_HOST_HERE',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'restomod_dev',
  user: process.env.POSTGRES_USER || 'restomod_user',
  password: process.env.POSTGRES_PASSWORD || 'DEV_PASSWORD_123',
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Connection pool settings
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Timeout after 2s
};

// Warn if using default development credentials
if (POSTGRES_CONFIG.password === 'DEV_PASSWORD_123') {
  console.warn('⚠️  WARNING: Using default development database password!');
  console.warn('   Set POSTGRES_PASSWORD environment variable for production.');
}

export const ENVIRONMENT = 'DEVELOPMENT';
```

---

## Migration Strategy

### Phase 1: Schema Migration

```
SQLite → PostgreSQL Schema Conversion

CHANGES NEEDED:
1. Integer auto-increment → SERIAL
2. TEXT with JSON mode → JSONB
3. INTEGER timestamps → TIMESTAMP WITH TIME ZONE
4. BOOLEAN mode integers → BOOLEAN
5. Add indexes for foreign keys
6. Add full-text search (tsvector)
```

### Phase 2: Data Migration

```
1. Export SQLite data to JSON
2. Transform data format
3. Validate transformed data
4. Import to PostgreSQL in batches
5. Verify data integrity
6. Update indexes and statistics
```

### Phase 3: Application Update

```
1. Update Drizzle ORM configuration
2. Update connection pooling
3. Update queries (if needed)
4. Test all API endpoints
5. Deploy new version
```

---

## Step-by-Step Migration

### Step 1: Install PostgreSQL Dependencies

```bash
npm install pg drizzle-orm@latest
npm install --save-dev @types/pg
```

### Step 2: Create PostgreSQL Schema

```typescript
// shared/postgres-schema.ts

import {
  pgTable, serial, text, integer, boolean,
  timestamp, jsonb, varchar, index
} from 'drizzle-orm/pg-core';

// Users table (PostgreSQL version)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

// Cars for sale (PostgreSQL version with full-text search)
export const carsForSale = pgTable('cars_for_sale', {
  id: serial('id').primaryKey(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),
  price: varchar('price', { length: 50 }),
  description: text('description'),
  imageUrl: text('image_url'),

  // Location
  locationCity: varchar('location_city', { length: 100 }),
  locationState: varchar('location_state', { length: 2 }),
  locationRegion: varchar('location_region', { length: 50 }),
  locationCountry: varchar('location_country', { length: 100 }),

  // Classification
  category: varchar('category', { length: 100 }),
  condition: varchar('condition', { length: 50 }),
  investmentGrade: varchar('investment_grade', { length: 10 }),

  // Source tracking
  sourceName: varchar('source_name', { length: 100 }),
  sourceUrl: text('source_url'),
  stockNumber: varchar('stock_number', { length: 100 }),
  dataHash: varchar('data_hash', { length: 64 }).unique(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Full-text search vector (PostgreSQL native)
  searchVector: text('search_vector'), // tsvector type
}, (table) => ({
  makeIdx: index('make_idx').on(table.make),
  modelIdx: index('model_idx').on(table.model),
  yearIdx: index('year_idx').on(table.year),
  categoryIdx: index('category_idx').on(table.category),
  regionIdx: index('region_idx').on(table.locationRegion),
  gradeIdx: index('grade_idx').on(table.investmentGrade),
  hashIdx: index('hash_idx').on(table.dataHash),
  // Full-text search index
  searchIdx: index('search_idx').using('gin', table.searchVector),
}));

// Car show events (PostgreSQL version)
export const carShowEvents = pgTable('car_show_events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),

  // Location with geo-coordinates
  locationName: text('location_name'),
  locationCity: varchar('location_city', { length: 100 }),
  locationState: varchar('location_state', { length: 2 }),
  locationCountry: varchar('location_country', { length: 100 }),
  latitude: varchar('latitude', { length: 20 }),
  longitude: varchar('longitude', { length: 20 }),

  // Event details
  website: text('website'),
  ticketUrl: text('ticket_url'),
  imageUrl: text('image_url'),
  eventType: varchar('event_type', { length: 50 }),
  featured: boolean('featured').default(false),

  // Source tracking
  sourceName: varchar('source_name', { length: 100 }),
  sourceUrl: text('source_url'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('event_date_idx').on(table.startDate),
  cityIdx: index('event_city_idx').on(table.locationCity),
  typeIdx: index('event_type_idx').on(table.eventType),
}));

// Research articles (PostgreSQL version)
export const researchArticles = pgTable('research_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').$type<string[]>(),
  imageUrl: text('image_url'),
  author: varchar('author', { length: 100 }),
  readTime: integer('read_time'),
  featured: boolean('featured').default(false),
  publishedAt: timestamp('published_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('article_slug_idx').on(table.slug),
  categoryIdx: index('article_category_idx').on(table.category),
  publishedIdx: index('article_published_idx').on(table.publishedAt),
}));

// ... Additional tables following same pattern
```

### Step 3: Create Full-Text Search Function

```sql
-- db/migrations/create_fts.sql

-- Function to automatically update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.make, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector on insert/update
CREATE TRIGGER cars_search_vector_trigger
BEFORE INSERT OR UPDATE ON cars_for_sale
FOR EACH ROW
EXECUTE FUNCTION update_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX cars_search_idx ON cars_for_sale USING gin(to_tsvector('english', search_vector));
```

### Step 4: Data Export from SQLite

```typescript
// scripts/export-sqlite-data.ts

import Database from 'better-sqlite3';
import fs from 'fs/promises';
import path from 'path';

async function exportSQLiteData() {
  const sqlite = new Database('./db/local.db');
  const exportDir = './data/migration';

  await fs.mkdir(exportDir, { recursive: true });

  // Export vehicles
  console.log('Exporting vehicles...');
  const vehicles = sqlite.prepare('SELECT * FROM cars_for_sale').all();
  await fs.writeFile(
    path.join(exportDir, 'vehicles.json'),
    JSON.stringify(vehicles, null, 2)
  );
  console.log(`✅ Exported ${vehicles.length} vehicles`);

  // Export events
  console.log('Exporting events...');
  const events = sqlite.prepare('SELECT * FROM car_show_events').all();
  await fs.writeFile(
    path.join(exportDir, 'events.json'),
    JSON.stringify(events, null, 2)
  );
  console.log(`✅ Exported ${events.length} events`);

  // Export articles
  console.log('Exporting articles...');
  const articles = sqlite.prepare('SELECT * FROM research_articles').all();
  await fs.writeFile(
    path.join(exportDir, 'articles.json'),
    JSON.stringify(articles, null, 2)
  );
  console.log(`✅ Exported ${articles.length} articles`);

  // Export users
  console.log('Exporting users...');
  const users = sqlite.prepare('SELECT * FROM users').all();
  await fs.writeFile(
    path.join(exportDir, 'users.json'),
    JSON.stringify(users, null, 2)
  );
  console.log(`✅ Exported ${users.length} users`);

  sqlite.close();
  console.log('🎉 Export complete!');
}

exportSQLiteData().catch(console.error);
```

### Step 5: Transform Data for PostgreSQL

```typescript
// scripts/transform-data.ts

import fs from 'fs/promises';
import path from 'path';

async function transformData() {
  const migrationDir = './data/migration';

  // Transform vehicles
  console.log('Transforming vehicles...');
  const vehicles = JSON.parse(
    await fs.readFile(path.join(migrationDir, 'vehicles.json'), 'utf-8')
  );

  const transformedVehicles = vehicles.map(v => ({
    ...v,
    // Convert SQLite timestamp (ms) to PostgreSQL timestamp
    created_at: new Date(v.created_at).toISOString(),
    updated_at: v.updated_at ? new Date(v.updated_at).toISOString() : new Date().toISOString(),
    // Parse JSON fields
    gallery_images: typeof v.gallery_images === 'string'
      ? JSON.parse(v.gallery_images)
      : v.gallery_images,
  }));

  await fs.writeFile(
    path.join(migrationDir, 'vehicles_transformed.json'),
    JSON.stringify(transformedVehicles, null, 2)
  );
  console.log(`✅ Transformed ${transformedVehicles.length} vehicles`);

  // Transform other tables similarly...
}

transformData().catch(console.error);
```

### Step 6: Import Data to PostgreSQL

```typescript
// scripts/import-to-postgres.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import * as schema from '../shared/postgres-schema';

async function importToPostgres() {
  // Create connection pool
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    max: 20,
  });

  const db = drizzle(pool, { schema });
  const migrationDir = './data/migration';

  try {
    // Import users first (for foreign key dependencies)
    console.log('Importing users...');
    const users = JSON.parse(
      await fs.readFile(path.join(migrationDir, 'users_transformed.json'), 'utf-8')
    );

    for (const user of users) {
      await db.insert(schema.users).values(user).onConflictDoNothing();
    }
    console.log(`✅ Imported ${users.length} users`);

    // Import vehicles in batches
    console.log('Importing vehicles...');
    const vehicles = JSON.parse(
      await fs.readFile(path.join(migrationDir, 'vehicles_transformed.json'), 'utf-8')
    );

    const BATCH_SIZE = 100;
    for (let i = 0; i < vehicles.length; i += BATCH_SIZE) {
      const batch = vehicles.slice(i, i + BATCH_SIZE);

      await db.transaction(async (tx) => {
        for (const vehicle of batch) {
          await tx.insert(schema.carsForSale)
            .values(vehicle)
            .onConflictDoNothing();
        }
      });

      console.log(`Imported ${Math.min(i + BATCH_SIZE, vehicles.length)}/${vehicles.length} vehicles`);
    }
    console.log(`✅ Imported ${vehicles.length} vehicles`);

    // Import events
    console.log('Importing events...');
    const events = JSON.parse(
      await fs.readFile(path.join(migrationDir, 'events_transformed.json'), 'utf-8')
    );

    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);

      await db.transaction(async (tx) => {
        for (const event of batch) {
          await tx.insert(schema.carShowEvents)
            .values(event)
            .onConflictDoNothing();
        }
      });

      console.log(`Imported ${Math.min(i + BATCH_SIZE, events.length)}/${events.length} events`);
    }
    console.log(`✅ Imported ${events.length} events`);

    // Verify counts
    const vehicleCount = await db.select({ count: sql`count(*)` })
      .from(schema.carsForSale);
    const eventCount = await db.select({ count: sql`count(*)` })
      .from(schema.carShowEvents);

    console.log(`\n✅ Migration complete!`);
    console.log(`   Vehicles: ${vehicleCount[0].count}`);
    console.log(`   Events: ${eventCount[0].count}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

importToPostgres().catch(console.error);
```

---

## Update Database Configuration

### New Database Connection

```typescript
// db/index.ts (PostgreSQL version)

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/postgres-schema';
import * as configuratorSchema from '@shared/configurator-schema';

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'restomod_dev',
  user: process.env.POSTGRES_USER || 'restomod_user',
  password: process.env.POSTGRES_PASSWORD || 'DEV_PASSWORD_123',
  ssl: process.env.POSTGRES_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,

  // Pool configuration
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

// Create Drizzle instance
export const db = drizzle(pool, {
  schema: { ...schema, ...configuratorSchema }
});

// Export pool for manual queries if needed
export { pool };

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing PostgreSQL connection pool...');
  await pool.end();
  process.exit(0);
});
```

### Drizzle Configuration Update

```typescript
// drizzle.config.ts (PostgreSQL version)

import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/*.ts",
  out: "./db/migrations",
  driver: "pg", // Changed from "better-sqlite" to "pg"
  dbCredentials: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "restomod_user",
    password: process.env.POSTGRES_PASSWORD || "DEV_PASSWORD_123",
    database: process.env.POSTGRES_DB || "restomod_dev",
  },
} satisfies Config;
```

---

## PostgreSQL-Specific Optimizations

### Full-Text Search (PostgreSQL Native)

```typescript
// server/services/postgres-search-service.ts

import { db } from '@db';
import { carsForSale } from '@shared/postgres-schema';
import { sql } from 'drizzle-orm';

export class PostgresSearchService {
  async searchVehicles(query: string, limit: number = 50) {
    const startTime = Date.now();

    // PostgreSQL full-text search with ranking
    const results = await db.select()
      .from(carsForSale)
      .where(
        sql`to_tsvector('english', ${carsForSale.searchVector}) @@ plainto_tsquery('english', ${query})`
      )
      .orderBy(
        sql`ts_rank(to_tsvector('english', ${carsForSale.searchVector}), plainto_tsquery('english', ${query})) DESC`
      )
      .limit(limit);

    const queryTime = Date.now() - startTime;

    return {
      results,
      total: results.length,
      queryTime,
      engine: 'PostgreSQL FTS'
    };
  }

  // Autocomplete using trigram similarity
  async autocomplete(prefix: string, limit: number = 10) {
    // Requires pg_trgm extension
    const results = await db.select({
      make: carsForSale.make,
      model: carsForSale.model,
    })
      .from(carsForSale)
      .where(
        sql`similarity(${carsForSale.make} || ' ' || ${carsForSale.model}, ${prefix}) > 0.3`
      )
      .orderBy(
        sql`similarity(${carsForSale.make} || ' ' || ${carsForSale.model}, ${prefix}) DESC`
      )
      .limit(limit);

    return results;
  }
}
```

### PostgreSQL Extensions Setup

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- Trigram similarity for autocomplete
CREATE EXTENSION IF NOT EXISTS btree_gin;    -- Additional indexing options
CREATE EXTENSION IF NOT EXISTS pg_stat_statements; -- Query performance tracking
```

---

## Connection Pooling Best Practices

```typescript
// server/middleware/db-middleware.ts

export const databaseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add connection info to response locals
  res.locals.dbPool = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };

  next();
};

// Health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    res.json({
      status: 'healthy',
      timestamp: result.rows[0].now,
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup SQLite database
- [ ] Set up PostgreSQL database (already done)
- [ ] Install PostgreSQL dependencies
- [ ] Create PostgreSQL schema
- [ ] Test PostgreSQL connection

### Migration
- [ ] Export SQLite data to JSON
- [ ] Transform data for PostgreSQL
- [ ] Validate transformed data
- [ ] Import users (for FK dependencies)
- [ ] Import vehicles in batches
- [ ] Import events in batches
- [ ] Import articles in batches
- [ ] Import all other tables

### Post-Migration
- [ ] Verify data counts match
- [ ] Test full-text search
- [ ] Test all API endpoints
- [ ] Update application configuration
- [ ] Run performance tests
- [ ] Create database indexes
- [ ] Update VACUUM and ANALYZE
- [ ] Deploy updated application

### Rollback Plan
- [ ] Keep SQLite backup for 30 days
- [ ] Document rollback procedure
- [ ] Test rollback in staging environment

---

## Performance Comparison

### Before (SQLite with FTS5)
- Search query: ~50ms
- Concurrent connections: 1
- Max database size: ~2GB recommended
- Backup: File copy

### After (PostgreSQL with native FTS)
- Search query: ~20-40ms
- Concurrent connections: 20+
- Max database size: Practically unlimited
- Backup: pg_dump, continuous archiving

---

## Environment Variables

### Required for PostgreSQL

```bash
# .env.production
POSTGRES_HOST=your-postgres-host.com
POSTGRES_PORT=5432
POSTGRES_DB=restomod_production
POSTGRES_USER=restomod_prod_user
POSTGRES_PASSWORD=STRONG_SECURE_PASSWORD_HERE
POSTGRES_SSL=true
```

### Development (Hardcoded)

```bash
# .env.development (or hardcoded in code)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=restomod_dev
POSTGRES_USER=restomod_user
POSTGRES_PASSWORD=DEV_PASSWORD_123
POSTGRES_SSL=false
```

---

## Troubleshooting

### Connection Issues
```bash
# Test PostgreSQL connection
psql -h YOUR_HOST -p 5432 -U restomod_user -d restomod_dev

# Check if PostgreSQL is accepting connections
pg_isready -h YOUR_HOST -p 5432
```

### Performance Issues
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE cars_for_sale;

-- Rebuild indexes
REINDEX TABLE cars_for_sale;
```

---

## Next Steps

1. Run migration scripts (see above)
2. Update Docker configuration (see DOCKER_SETUP.md)
3. Test all endpoints
4. Deploy to production

---

## Related Documentation

- [BATCH_PROCESSING_PIPELINE.md](./BATCH_PROCESSING_PIPELINE.md) - Data import pipelines
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker configuration
- [SCRAPING_ARCHITECTURE.md](./SCRAPING_ARCHITECTURE.md) - Data collection
