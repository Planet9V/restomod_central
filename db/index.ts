import "dotenv/config";
import * as schema from "@shared/schema";
import * as configuratorSchema from "@shared/configurator-schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to create an .env file?",
  );
}

// Support both SQLite and PostgreSQL based on DATABASE_URL
const isPostgres = process.env.DATABASE_URL.startsWith('postgresql://') ||
                   process.env.DATABASE_URL.startsWith('postgres://');

let db: any;

if (isPostgres) {
  // PostgreSQL setup
  const { drizzle: drizzlePg } = await import('drizzle-orm/postgres-js');
  const postgres = (await import('postgres')).default;

  const pgConnection = postgres(process.env.DATABASE_URL, {
    max: 10, // connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
  });

  db = drizzlePg(pgConnection, { schema: { ...schema, ...configuratorSchema } });
} else {
  // SQLite setup (legacy)
  const Database = (await import('better-sqlite3')).default;
  const { drizzle: drizzleSqlite } = await import('drizzle-orm/better-sqlite3');

  const sqlite = new Database(process.env.DATABASE_URL);
  db = drizzleSqlite(sqlite, { schema: { ...schema, ...configuratorSchema } });
}

export { db };