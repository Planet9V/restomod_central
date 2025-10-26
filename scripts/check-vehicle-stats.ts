#!/usr/bin/env tsx
import { db } from '../db/index.js';
import { gatewayVehicles } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

async function checkStats() {
  console.log('📊 Vehicle Database Statistics\n');

  // Total count
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(gatewayVehicles);
  console.log(`Total Vehicles: ${totalResult[0].count}`);

  // Count by make
  const byMake = await db.select({
    make: gatewayVehicles.make,
    count: sql<number>`count(*)`
  })
  .from(gatewayVehicles)
  .groupBy(gatewayVehicles.make)
  .orderBy(sql`count(*) DESC`)
  .limit(10);

  console.log('\nTop 10 Makes:');
  byMake.forEach((row, i) => {
    console.log(`${i + 1}. ${row.make}: ${row.count} vehicles`);
  });

  // Count by year
  const byYear = await db.select({
    year: gatewayVehicles.year,
    count: sql<number>`count(*)`
  })
  .from(gatewayVehicles)
  .groupBy(gatewayVehicles.year)
  .orderBy(sql`count(*) DESC`)
  .limit(10);

  console.log('\nTop 10 Years:');
  byYear.forEach((row, i) => {
    console.log(`${i + 1}. ${row.year}: ${row.count} vehicles`);
  });

  // Count by condition
  const byCondition = await db.select({
    condition: gatewayVehicles.condition,
    count: sql<number>`count(*)`
  })
  .from(gatewayVehicles)
  .groupBy(gatewayVehicles.condition)
  .orderBy(sql`count(*) DESC`);

  console.log('\nBy Condition:');
  byCondition.forEach((row, i) => {
    console.log(`${i + 1}. ${row.condition}: ${row.count} vehicles`);
  });
}

checkStats()
  .then(() => {
    console.log('\n✅ Stats complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
