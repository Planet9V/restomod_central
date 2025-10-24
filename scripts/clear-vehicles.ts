import { db } from '../db';
import { carsForSale } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function clearVehicles() {
  console.log('🗑️  Clearing existing vehicles...');

  const countResult = await db.select({ count: sql<number>`count(*)` }).from(carsForSale);
  const currentCount = countResult[0].count;

  console.log(`   Current vehicles: ${currentCount}`);

  await db.delete(carsForSale);

  console.log('✅ All vehicles cleared');
  process.exit(0);
}

clearVehicles().catch(console.error);
