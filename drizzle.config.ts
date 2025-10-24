import { defineConfig } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables");
}

// Determine dialect based on DATABASE_URL
const isPostgres = process.env.DATABASE_URL.startsWith('postgresql://') ||
                   process.env.DATABASE_URL.startsWith('postgres://');

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: isPostgres ? {
    url: process.env.DATABASE_URL,
  } : {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
});
