#!/usr/bin/env tsx

/**
 * PostgreSQL Migration Generator
 *
 * This script generates Drizzle migrations for PostgreSQL setup
 * It includes pgvector extension installation and all table definitions
 *
 * Usage:
 *   POSTGRES_SCHEMA=true DATABASE_URL=postgresql://... npm run db:generate
 *
 * Or using this script directly:
 *   DATABASE_URL=postgresql://... tsx scripts/generate-postgres-migration.ts
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = "./db/migrations";
const POSTGRES_EXTENSIONS_SQL = `
-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

`;

const POSTGRES_VECTOR_COLUMNS_SQL = `
-- Add pgvector columns to cars_for_sale
ALTER TABLE cars_for_sale ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE cars_for_sale ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Add pgvector columns to car_show_events
ALTER TABLE car_show_events ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE car_show_events ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create vector indexes for similarity search
CREATE INDEX IF NOT EXISTS idx_cars_embedding ON cars_for_sale USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_events_embedding ON car_show_events USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_cars_search ON cars_for_sale USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_events_search ON car_show_events USING gin(search_vector);

`;

const POSTGRES_TRIGGERS_SQL = `
-- Function to auto-update search_vector for cars_for_sale
CREATE OR REPLACE FUNCTION update_cars_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.make, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search_vector on INSERT/UPDATE
DROP TRIGGER IF EXISTS cars_search_vector_update ON cars_for_sale;
CREATE TRIGGER cars_search_vector_update
BEFORE INSERT OR UPDATE ON cars_for_sale
FOR EACH ROW
EXECUTE FUNCTION update_cars_search_vector();

-- Function to auto-update search_vector for car_show_events
CREATE OR REPLACE FUNCTION update_events_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.event_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search_vector on INSERT/UPDATE
DROP TRIGGER IF EXISTS events_search_vector_update ON car_show_events;
CREATE TRIGGER events_search_vector_update
BEFORE INSERT OR UPDATE ON car_show_events
FOR EACH ROW
EXECUTE FUNCTION update_events_search_vector();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cars_updated_at ON cars_for_sale;
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars_for_sale
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON car_show_events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON car_show_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON ai_chat_conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON ai_chat_conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON scraping_schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON scraping_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

`;

async function main() {
  console.log("🚀 PostgreSQL Migration Generator");
  console.log("================================\n");

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL environment variable is not set");
    console.log("\nPlease set DATABASE_URL to your PostgreSQL connection string:");
    console.log('  export DATABASE_URL="postgresql://user:password@localhost:5432/database"');
    process.exit(1);
  }

  // Check if it's a PostgreSQL URL
  const isPostgres = process.env.DATABASE_URL.startsWith("postgresql://") ||
                     process.env.DATABASE_URL.startsWith("postgres://");

  if (!isPostgres) {
    console.error("❌ Error: DATABASE_URL must be a PostgreSQL connection string");
    console.log(`   Current: ${process.env.DATABASE_URL}`);
    process.exit(1);
  }

  console.log("✅ PostgreSQL connection string detected");
  console.log(`   Database: ${process.env.DATABASE_URL.split("@")[1]}\n`);

  // Set POSTGRES_SCHEMA env var to use postgres-schema.ts
  process.env.POSTGRES_SCHEMA = "true";

  // Ensure migrations directory exists
  if (!existsSync(MIGRATIONS_DIR)) {
    console.log("📁 Creating migrations directory...");
    mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }

  console.log("📝 Generating Drizzle migration from postgres-schema.ts...\n");

  try {
    // Run drizzle-kit generate
    const output = execSync("npx drizzle-kit generate", {
      encoding: "utf-8",
      env: {
        ...process.env,
        POSTGRES_SCHEMA: "true",
      },
    });

    console.log(output);

    // Find the most recent migration file
    const fs = require("fs");
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f: string) => f.endsWith(".sql"))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log("⚠️  No migration files found. This might mean no schema changes were detected.");
      console.log("    Or this is the first migration - check the migrations directory.\n");
      return;
    }

    const latestMigration = files[0];
    const migrationPath = join(MIGRATIONS_DIR, latestMigration);

    console.log(`\n📄 Latest migration: ${latestMigration}`);
    console.log("🔧 Enhancing migration with PostgreSQL extensions and triggers...\n");

    // Read the generated migration
    let migrationContent = readFileSync(migrationPath, "utf-8");

    // Prepend PostgreSQL extensions at the beginning
    migrationContent = POSTGRES_EXTENSIONS_SQL + "\n" + migrationContent;

    // Append vector columns and indexes after table creation
    migrationContent = migrationContent + "\n" + POSTGRES_VECTOR_COLUMNS_SQL;

    // Append triggers and functions
    migrationContent = migrationContent + "\n" + POSTGRES_TRIGGERS_SQL;

    // Write the enhanced migration back
    writeFileSync(migrationPath, migrationContent, "utf-8");

    console.log("✅ Migration enhanced successfully!");
    console.log("\n📋 Migration includes:");
    console.log("   ✓ PostgreSQL extensions (vector, pg_trgm, uuid-ossp)");
    console.log("   ✓ All core tables from postgres-schema.ts");
    console.log("   ✓ pgvector embedding columns (1536 dimensions)");
    console.log("   ✓ Full-text search tsvector columns");
    console.log("   ✓ Vector similarity search indexes (IVFFlat)");
    console.log("   ✓ Full-text search GIN indexes");
    console.log("   ✓ Auto-update triggers for search_vector");
    console.log("   ✓ Auto-update triggers for updated_at");
    console.log("\n🎉 Migration is ready to run!");
    console.log("\n📚 Next steps:");
    console.log("   1. Review the migration file:");
    console.log(`      cat ${migrationPath}`);
    console.log("   2. Apply the migration:");
    console.log("      npm run db:migrate");
    console.log("   3. Verify the database:");
    console.log("      npm run db:studio");
    console.log("");

  } catch (error: any) {
    console.error("❌ Error generating migration:");
    console.error(error.message);

    if (error.stdout) {
      console.log("\nOutput:", error.stdout);
    }
    if (error.stderr) {
      console.log("\nError output:", error.stderr);
    }

    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
