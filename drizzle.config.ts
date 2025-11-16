import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

// Determine dialect based on DATABASE_URL
const isPostgres = process.env.DATABASE_URL.startsWith('postgresql://') ||
                   process.env.DATABASE_URL.startsWith('postgres://');

// Use POSTGRES_SCHEMA environment variable to select schema (default to SQLite for backward compatibility)
const usePostgresSchema = process.env.POSTGRES_SCHEMA === "true" || isPostgres;

// Select schema file based on database type
const schemaFile = usePostgresSchema ? "./shared/postgres-schema.ts" : "./shared/schema.ts";

console.log(`🔧 Drizzle Config:`);
console.log(`   Database Type: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
console.log(`   Schema File: ${schemaFile}`);
console.log(`   Output Dir: ./db/migrations`);

export default defineConfig({
  out: "./db/migrations",
  schema: schemaFile,
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: isPostgres ? {
    url: process.env.DATABASE_URL,
  } : {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
