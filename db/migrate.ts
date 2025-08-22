import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

try {
  migrate(db, { migrationsFolder: './db/migrations' });
  console.log("Migrations applied successfully!");
} catch (error) {
  console.error("Error applying migrations:", error);
  process.exit(1);
}
