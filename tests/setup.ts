import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const DB_FILE = 'test.db';
const DB_PATH = path.join(process.cwd(), 'db', DB_FILE);

async function setup() {
  console.log('🚀 Initiating global test setup...');

  // 1. Ensure the 'db' directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 2. Delete old test database file if it exists
  if (fs.existsSync(DB_PATH)) {
    console.log(`🗑️ Deleting old test database: ${DB_PATH}`);
    fs.unlinkSync(DB_PATH);
  }

  try {
    // 3. Set environment variable for test database
    process.env.DATABASE_URL = `db/${DB_FILE}`;
    console.log(`🔧 Set DATABASE_URL to: ${process.env.DATABASE_URL}`);

    // 4. Run database migrations
    console.log('Applying database migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log('✅ Migrations applied successfully.');

    // 5. Run data seeding scripts
    console.log('🌱 Seeding database with test data...');
    execSync('tsx scripts/import-cars-for-sale.ts', { stdio: 'inherit' });
    execSync('tsx scripts/import-southern-eastern-comprehensive.ts', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully.');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }

  console.log('🎉 Global test setup complete.');
}

async function teardown() {
  console.log('🧹 Tearing down global test setup...');
  if (fs.existsSync(DB_PATH)) {
    console.log(`🗑️ Deleting test database: ${DB_PATH}`);
    fs.unlinkSync(DB_PATH);
  }
  console.log('🎉 Global teardown complete.');
}

export { setup, teardown };
