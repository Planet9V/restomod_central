# Database Migrations Guide

This directory contains database migration files for the Luxury Classic Car Marketplace platform.

## 🗂️ Migration System

We use **Drizzle ORM** with **Drizzle Kit** for database migrations, supporting both:
- **SQLite** (legacy, current development)
- **PostgreSQL 15+** (production, with pgvector support)

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [PostgreSQL Setup](#postgresql-setup)
3. [Generating Migrations](#generating-migrations)
4. [Running Migrations](#running-migrations)
5. [Migration Files](#migration-files)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### For SQLite (Current Development)

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio to view database
npm run db:studio
```

### For PostgreSQL (Production)

```bash
# 1. Set PostgreSQL connection
export DATABASE_URL="postgresql://user:password@localhost:5432/database"

# 2. Generate PostgreSQL migration
POSTGRES_SCHEMA=true npm run db:generate
# Or use the helper script:
tsx scripts/generate-postgres-migration.ts

# 3. Apply migrations
npm run db:migrate

# 4. Verify with Drizzle Studio
npm run db:studio
```

---

## 🐘 PostgreSQL Setup

### Prerequisites

1. **PostgreSQL 15+** installed and running
2. **pgvector extension** available (for AI embeddings)
3. **Database created** with proper permissions

### Installation Steps

#### 1. Install PostgreSQL and Extensions

**On Ubuntu/Debian:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql-15 postgresql-contrib

# Install pgvector
cd /tmp
git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

**On macOS:**
```bash
# Install PostgreSQL
brew install postgresql@15

# Install pgvector
brew install pgvector
```

**Using Docker:**
```bash
docker run -d \
  --name postgres-restomod \
  -e POSTGRES_USER=neocoder \
  -e POSTGRES_PASSWORD=neocoder123 \
  -e POSTGRES_DB=neocoder \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

#### 2. Create Database and User

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE restomod_marketplace;
CREATE USER restomod_user WITH PASSWORD 'secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE restomod_marketplace TO restomod_user;

-- Connect to the database
\c restomod_marketplace

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions
\dx
```

#### 3. Configure Environment

Create `.env` file or update existing one:

```bash
# PostgreSQL Production
DATABASE_URL="postgresql://restomod_user:secure_password_here@localhost:5432/restomod_marketplace"

# For schema selection
POSTGRES_SCHEMA=true
```

Or use the provided `.env.postgres` template:

```bash
cp .env.postgres .env
# Edit .env with your actual credentials
```

---

## 🔧 Generating Migrations

### Using the Helper Script (Recommended)

The `generate-postgres-migration.ts` script automatically:
- Validates PostgreSQL connection
- Generates migration from `postgres-schema.ts`
- Adds pgvector extension setup
- Includes full-text search triggers
- Adds auto-update timestamp triggers

```bash
# Set your PostgreSQL connection
export DATABASE_URL="postgresql://user:password@localhost:5432/database"

# Run the generator
tsx scripts/generate-postgres-migration.ts
```

### Manual Generation

```bash
# For PostgreSQL (uses shared/postgres-schema.ts)
POSTGRES_SCHEMA=true DATABASE_URL=postgresql://... npm run db:generate

# For SQLite (uses shared/schema.ts)
DATABASE_URL=./db/local.db npm run db:generate
```

### What Gets Generated

The migration will include:

1. **PostgreSQL Extensions**
   - `vector` - pgvector for AI embeddings
   - `pg_trgm` - Trigram indexing for fuzzy search
   - `uuid-ossp` - UUID generation

2. **Core Tables** (from `postgres-schema.ts`)
   - `users` - User authentication and profiles
   - `cars_for_sale` - Vehicle listings with investment analysis
   - `car_show_events` - Automotive events with geolocation
   - `user_bookmarks` - Saved cars and events
   - `admin_settings` - System configuration
   - `scraping_schedules` - Automated scraping jobs
   - `scraping_logs` - Scraping execution history
   - `ai_chat_conversations` - AI chat history
   - `ai_chat_messages` - Individual chat messages
   - `price_history` - Price tracking for trend analysis
   - `user_activity_log` - Audit trail
   - `email_notifications` - Email tracking

3. **Vector Columns**
   - `embedding vector(1536)` - OpenAI ada-002 embeddings
   - `search_vector tsvector` - Full-text search

4. **Indexes**
   - B-tree indexes on frequently queried columns
   - IVFFlat indexes for vector similarity search
   - GIN indexes for full-text search
   - Composite indexes for common query patterns

5. **Triggers & Functions**
   - Auto-update `search_vector` on INSERT/UPDATE
   - Auto-update `updated_at` timestamp
   - Full-text search weight configuration

---

## ▶️ Running Migrations

### Apply All Pending Migrations

```bash
# Using npm script
npm run db:migrate

# Or directly with Drizzle Kit
npx drizzle-kit migrate
```

### Verify Migration Status

```bash
# Check migration history in the database
psql $DATABASE_URL -c "SELECT * FROM drizzle.__drizzle_migrations;"

# View schema
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\d cars_for_sale"  # Describe table
```

### Push Schema (Development Only)

⚠️ **Warning:** This bypasses migrations and directly pushes schema changes. Use only in development!

```bash
npm run db:push
```

---

## 📄 Migration Files

### File Naming Convention

Drizzle Kit generates migration files with this pattern:
```
XXXX_adjective_noun.sql
```

Example:
```
0000_amazing_marvel_apes.sql
0001_classy_sumo.sql
0002_eager_prodigy.sql
```

### Migration File Structure

Each migration file contains:

```sql
-- Enable extensions (first migration only)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables
CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "username" varchar(100) UNIQUE NOT NULL,
  -- ... more columns
);

-- Create indexes
CREATE INDEX "idx_users_email" ON "users" ("email");

-- Add vector columns
ALTER TABLE "cars_for_sale" ADD COLUMN "embedding" vector(1536);

-- Create triggers
CREATE TRIGGER cars_search_vector_update
BEFORE INSERT OR UPDATE ON cars_for_sale
FOR EACH ROW
EXECUTE FUNCTION update_cars_search_vector();
```

### Metadata

Migration metadata is stored in:
```
db/migrations/meta/
```

This directory tracks migration history and schema snapshots.

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. "relation already exists" Error

**Problem:** Trying to run migrations on a database that already has tables.

**Solution:**
```bash
# Option A: Drop and recreate (development only!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Option B: Skip to specific migration
# Edit the __drizzle_migrations table manually
```

#### 2. "extension vector does not exist"

**Problem:** pgvector extension not installed.

**Solution:**
```bash
# Install pgvector (see PostgreSQL Setup section)
# Then enable in database:
psql $DATABASE_URL -c "CREATE EXTENSION vector;"
```

#### 3. "type vector does not exist" in Drizzle

**Problem:** pgvector columns can't be defined in Drizzle schema directly.

**Solution:** Our migration script adds vector columns via raw SQL:
```sql
ALTER TABLE cars_for_sale ADD COLUMN embedding vector(1536);
```

#### 4. Migration Conflict

**Problem:** Multiple developers creating migrations simultaneously.

**Solution:**
```bash
# Pull latest migrations
git pull origin main

# Delete your local migration
rm db/migrations/XXXX_your_migration.sql

# Regenerate after pulling
npm run db:generate
```

#### 5. Schema Drift

**Problem:** Database schema doesn't match migration files.

**Solution:**
```bash
# Generate a new migration to sync
npm run db:generate

# Review the diff carefully
cat db/migrations/XXXX_latest.sql

# Apply if correct
npm run db:migrate
```

---

## ✅ Best Practices

### 1. Always Review Generated Migrations

Before applying:
```bash
# View the migration SQL
cat db/migrations/XXXX_latest_migration.sql

# Check for unexpected changes
git diff db/migrations/
```

### 2. Test Migrations in Development First

```bash
# Use a development database
export DATABASE_URL="postgresql://localhost:5432/restomod_dev"

# Apply migration
npm run db:migrate

# Verify schema
npm run db:studio
```

### 3. Backup Before Production Migrations

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migration
npm run db:migrate

# If issues occur, restore:
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

### 4. One Migration Per Feature

Keep migrations focused:
- ✅ Good: One migration for "Add price_history table"
- ❌ Bad: One migration for "Add 5 new tables and modify 3 existing ones"

### 5. Never Modify Applied Migrations

Once a migration is applied to production:
- ❌ Don't edit the migration file
- ✅ Create a new migration to make changes

### 6. Document Complex Migrations

Add comments to explain:
```sql
-- Migration: Add vector search capabilities
-- Reason: Enable AI-powered car recommendations
-- Dependencies: Requires pgvector extension

CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE cars_for_sale ADD COLUMN embedding vector(1536);
```

---

## 📊 Schema Reference

See detailed table schemas in:
- **Specification:** `docs/SPEC_01_DATABASE_SCHEMA.md`
- **PostgreSQL Schema:** `shared/postgres-schema.ts`
- **SQLite Schema:** `shared/schema.ts`

---

## 🔐 Security Notes

### Protect Sensitive Data

1. **Never commit .env files** with real credentials
2. **Use encrypted values** for API keys in `admin_settings`
3. **Enable SSL** in production:
   ```bash
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

### Database User Permissions

Production database user should have:
- ✅ SELECT, INSERT, UPDATE, DELETE on tables
- ✅ USAGE on sequences
- ❌ DROP, TRUNCATE (use separate admin user)

---

## 📞 Support

### Getting Help

1. **Check the spec:** `docs/SPEC_01_DATABASE_SCHEMA.md`
2. **Review schema:** `shared/postgres-schema.ts`
3. **Drizzle Docs:** https://orm.drizzle.team/docs/overview
4. **pgvector Docs:** https://github.com/pgvector/pgvector

### Common Commands Reference

```bash
# Generate migration
npm run db:generate
tsx scripts/generate-postgres-migration.ts

# Apply migrations
npm run db:migrate

# Open database studio
npm run db:studio

# Push schema (dev only)
npm run db:push

# View PostgreSQL schema
psql $DATABASE_URL -c "\d+"

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

---

**Last Updated:** 2025-11-16
**Database Version:** PostgreSQL 15+
**pgvector Version:** 0.5.1+
**Drizzle ORM Version:** 0.44.7+
