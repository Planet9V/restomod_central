# PostgreSQL + pgvector Setup Guide

Complete guide for setting up PostgreSQL with pgvector for RestoMod Central's semantic search capabilities.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [PostgreSQL Setup Options](#postgresql-setup-options)
4. [pgvector Installation](#pgvector-installation)
5. [Environment Configuration](#environment-configuration)
6. [Database Migrations](#database-migrations)
7. [Data Import](#data-import)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

RestoMod Central uses PostgreSQL with the pgvector extension to enable:
- **Semantic search** for vehicles using AI-powered embeddings
- **Scalable storage** for growing vehicle inventory
- **Advanced querying** with full-text search and vector similarity
- **Production-ready** infrastructure with ACID compliance

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] OpenAI API key (for embeddings)
- [ ] Anthropic API key (for AI chat)
- [ ] PostgreSQL account (Neon, Supabase, or local)

---

## PostgreSQL Setup Options

### Option 1: Neon (Recommended for Production)

**Why Neon?**
- Serverless PostgreSQL with autoscaling
- Built-in pgvector support
- Free tier available
- Excellent for production workloads

**Setup Steps:**

1. **Create Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub or email
   - Verify your email

2. **Create Database**
   ```bash
   # Via Neon Console:
   # 1. Click "New Project"
   # 2. Name: "restomod-central"
   # 3. Region: Choose closest to your users
   # 4. PostgreSQL version: 15+
   ```

3. **Get Connection String**
   ```bash
   # Format:
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

   # Example:
   postgresql://alex:AbC123xyz@ep-cool-mountain-123456.us-east-2.aws.neon.tech/restomod_central?sslmode=require
   ```

4. **Enable pgvector**
   - Neon has pgvector pre-installed
   - Run this in Neon SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Option 2: Supabase (Good for MVP)

**Why Supabase?**
- Free tier with PostgreSQL + pgvector
- Built-in authentication
- Real-time subscriptions
- Dashboard for database management

**Setup Steps:**

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: "restomod-central"
   - Generate a strong database password
   - Choose a region

2. **Get Connection String**
   ```bash
   # Go to: Settings > Database > Connection String
   # Format:
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

   # Example:
   postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

3. **Enable pgvector**
   - Go to SQL Editor in Supabase Dashboard
   - Run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Option 3: Local PostgreSQL

**Why Local?**
- Full control and privacy
- No internet dependency
- Free to use
- Good for development

**Setup Steps:**

1. **Install PostgreSQL**
   ```bash
   # macOS (Homebrew)
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows
   # Download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   # Login as postgres user
   sudo -u postgres psql

   # Create database and user
   CREATE DATABASE restomod_central;
   CREATE USER restomod_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE restomod_central TO restomod_user;
   \q
   ```

3. **Connection String**
   ```bash
   postgresql://restomod_user:your_secure_password@localhost:5432/restomod_central
   ```

---

## pgvector Installation

### For Neon/Supabase
pgvector is pre-installed. Just enable the extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### For Local PostgreSQL

1. **Install pgvector**
   ```bash
   # macOS (Homebrew)
   brew install pgvector

   # Ubuntu/Debian
   sudo apt install postgresql-15-pgvector

   # From source (if not available in package manager)
   git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
   cd pgvector
   make
   sudo make install
   ```

2. **Enable Extension**
   ```bash
   psql -U restomod_user -d restomod_central
   ```
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   \dx  -- List extensions to verify
   ```

3. **Verify Installation**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

---

## Environment Configuration

### Step 1: Copy Example Configuration

```bash
# Copy the example file
cp .env.postgres.example .env

# Or manually create .env file
nano .env
```

### Step 2: Configure Database URL

Update `.env` with your PostgreSQL connection string:

```bash
# For Neon
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# For Supabase
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# For Local
DATABASE_URL=postgresql://restomod_user:password@localhost:5432/restomod_central
```

### Step 3: Add API Keys

```bash
# OpenAI API Key (for embeddings)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Anthropic API Key (for AI chat)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Step 4: Configure pgvector

```bash
# Enable pgvector
PGVECTOR_ENABLED=true

# Vector dimensions (OpenAI text-embedding-3-small uses 1536)
VECTOR_DIMENSIONS=1536

# OpenAI embedding model
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### Step 5: Set Environment

```bash
# For local development
NODE_ENV=development

# For production
NODE_ENV=production
```

### Complete Example `.env` File

```bash
# PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/restomod_central

# pgvector Configuration
PGVECTOR_ENABLED=true
VECTOR_DIMENSIONS=1536

# OpenAI for Embeddings
OPENAI_API_KEY=sk-proj-abc123...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_RATE_LIMIT=60

# Anthropic for AI Chat
ANTHROPIC_API_KEY=sk-ant-api03-xyz789...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Redis (Optional - for job queue)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# Environment
NODE_ENV=development
PORT=5000

# Feature Flags
ENABLE_SEMANTIC_SEARCH=true
ENABLE_AI_CHAT=true
ENABLE_SCRAPING=false

# Logging
LOG_LEVEL=info
LOG_FORMAT=pretty
```

---

## Database Migrations

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Database Migrations

```bash
# Generate migrations from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Verify migrations
npm run db:studio
```

### Step 3: Verify Schema

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Expected tables:
# - vehicles
# - vehicle_embeddings (for pgvector)
# - events
# - marketplace_listings
# - users (if auth is configured)
```

### Manual Migration (if needed)

```sql
-- Create pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vehicle_embeddings table
CREATE TABLE IF NOT EXISTS vehicle_embeddings (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  model_version TEXT DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for similarity search
CREATE INDEX IF NOT EXISTS vehicle_embeddings_idx
ON vehicle_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on vehicle_id for faster lookups
CREATE INDEX IF NOT EXISTS vehicle_embeddings_vehicle_id_idx
ON vehicle_embeddings(vehicle_id);
```

---

## Data Import

### Option 1: Import from SQLite (Migration)

If you have existing SQLite data:

```bash
# Create a migration script
node scripts/migrate-sqlite-to-postgres.js
```

**Migration Script** (`scripts/migrate-sqlite-to-postgres.js`):

```javascript
import Database from 'better-sqlite3';
import pkg from 'pg';
const { Client } = pkg;

async function migrate() {
  // Connect to SQLite
  const sqlite = new Database('./db/local.db');

  // Connect to PostgreSQL
  const pg = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await pg.connect();

  try {
    // Get all vehicles from SQLite
    const vehicles = sqlite.prepare('SELECT * FROM vehicles').all();

    console.log(`Migrating ${vehicles.length} vehicles...`);

    // Insert into PostgreSQL
    for (const vehicle of vehicles) {
      await pg.query(
        `INSERT INTO vehicles (id, make, model, year, price, description, image_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
         make = EXCLUDED.make,
         model = EXCLUDED.model,
         year = EXCLUDED.year,
         price = EXCLUDED.price,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url`,
        [
          vehicle.id,
          vehicle.make,
          vehicle.model,
          vehicle.year,
          vehicle.price,
          vehicle.description,
          vehicle.image_url,
          vehicle.created_at
        ]
      );
    }

    console.log('Migration complete!');
  } finally {
    await pg.end();
    sqlite.close();
  }
}

migrate().catch(console.error);
```

Run migration:

```bash
node scripts/migrate-sqlite-to-postgres.js
```

### Option 2: Import from CSV

```bash
# Create import script
node scripts/import-vehicles-csv.js
```

### Option 3: Seed with Sample Data

```bash
# Run seed script
npm run db:seed
```

---

## Verification

### Step 1: Verify Database Connection

```bash
# Test connection
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => console.log('✓ Connected to PostgreSQL'))
  .catch(err => console.error('✗ Connection failed:', err))
  .finally(() => client.end());
"
```

### Step 2: Verify pgvector Extension

```sql
-- Connect to database
psql $DATABASE_URL

-- Check extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test vector operations
SELECT '[1,2,3]'::vector;
```

### Step 3: Verify Tables

```sql
-- List all tables
\dt

-- Check vehicles table
SELECT COUNT(*) FROM vehicles;

-- Check embeddings table
SELECT COUNT(*) FROM vehicle_embeddings;
```

### Step 4: Test Semantic Search

```bash
# Run test query
npm run test:search
```

---

## Troubleshooting

### Connection Issues

**Problem:** `ECONNREFUSED` or `Connection timeout`

**Solutions:**
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Verify PostgreSQL is running (local)
pg_isready

# Check firewall/network (cloud)
ping ep-xxx.region.aws.neon.tech

# Test with psql
psql $DATABASE_URL
```

### pgvector Extension Not Found

**Problem:** `extension "vector" is not available`

**Solutions:**
```bash
# Check PostgreSQL version (needs 12+)
psql -c "SELECT version();"

# Install pgvector (local)
brew install pgvector  # macOS
sudo apt install postgresql-15-pgvector  # Ubuntu

# Enable extension
psql $DATABASE_URL -c "CREATE EXTENSION vector;"
```

### Migration Failures

**Problem:** `relation "vehicles" already exists`

**Solutions:**
```bash
# Drop and recreate (CAREFUL: loses data!)
npm run db:drop
npm run db:migrate

# Or manually:
psql $DATABASE_URL -c "DROP TABLE IF EXISTS vehicles CASCADE;"
npm run db:migrate
```

### SSL/TLS Issues

**Problem:** `self signed certificate in certificate chain`

**Solutions:**
```bash
# Add sslmode to connection string
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Or disable SSL for local dev (NOT for production)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=disable"
```

### API Key Issues

**Problem:** `OpenAI API key invalid`

**Solutions:**
```bash
# Verify API key format
echo $OPENAI_API_KEY  # Should start with sk-proj-

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Regenerate key at: https://platform.openai.com/api-keys
```

---

## Best Practices

### Security

1. **Never commit `.env` to git**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use environment variables in production**
   - Set via hosting provider dashboard
   - Use secrets management (Vercel, Railway, etc.)

3. **Rotate API keys regularly**
   - OpenAI: Every 90 days
   - Database passwords: Every 6 months

4. **Use read-only database users for read operations**

### Performance

1. **Use connection pooling**
   ```javascript
   import { Pool } from 'pg';
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,  // max connections
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Index frequently queried columns**
   ```sql
   CREATE INDEX idx_vehicles_make ON vehicles(make);
   CREATE INDEX idx_vehicles_year ON vehicles(year);
   ```

3. **Use prepared statements**
   ```javascript
   // Good
   db.query('SELECT * FROM vehicles WHERE id = $1', [id]);

   // Bad (SQL injection risk)
   db.query(`SELECT * FROM vehicles WHERE id = ${id}`);
   ```

### Monitoring

1. **Monitor query performance**
   ```sql
   -- Enable query logging
   ALTER DATABASE restomod_central SET log_statement = 'all';

   -- View slow queries
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Monitor database size**
   ```sql
   SELECT pg_size_pretty(pg_database_size('restomod_central'));
   ```

3. **Set up alerts** (Neon/Supabase dashboards)
   - Database size limits
   - Connection pool exhaustion
   - Query performance degradation

### Backups

1. **Automated backups** (Neon/Supabase)
   - Enable point-in-time recovery
   - Set retention period (7-30 days)

2. **Manual backups**
   ```bash
   # Export database
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

   # Restore from backup
   psql $DATABASE_URL < backup-20250116.sql
   ```

3. **Export embeddings separately**
   ```bash
   # Backup embeddings table
   psql $DATABASE_URL -c "COPY vehicle_embeddings TO STDOUT" > embeddings-backup.csv
   ```

---

## Next Steps

After completing this setup:

1. ✅ **Verify connection** - Test database connectivity
2. ✅ **Run migrations** - Create tables and indexes
3. ✅ **Import data** - Load vehicles into PostgreSQL
4. ✅ **Generate embeddings** - Create vector embeddings for semantic search
5. ✅ **Test search** - Verify semantic search is working
6. 📖 **Read AI Chat Setup** - See `SPEC_04_AI_CHAT_SYSTEM.md`
7. 🚀 **Deploy to production** - See deployment guide

---

## Resources

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Supabase Documentation](https://supabase.com/docs)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [pgvector documentation](https://github.com/pgvector/pgvector#installation)
3. Search existing [GitHub issues](https://github.com/yourusername/restomod-central/issues)
4. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, PostgreSQL version, Node version)

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Maintained by:** RestoMod Central Team
