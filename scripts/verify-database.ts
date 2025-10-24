import { db } from '../db';
import { carsForSale, priceHistory, carShowEvents } from '../shared/schema';
import { sql, isNotNull } from 'drizzle-orm';

async function verifyDatabase() {
  console.log('📊 Database Verification Report\n');
  console.log('='.repeat(60));

  // Vehicles
  const vehicleCount = await db.select({ count: sql<number>`count(*)` }).from(carsForSale);
  console.log(`\n🚗 Vehicles: ${vehicleCount[0].count}`);

  const vehiclesByMake = await db.select({
    make: carsForSale.make,
    count: sql<number>`count(*)`
  })
  .from(carsForSale)
  .groupBy(carsForSale.make)
  .orderBy(sql`count(*) DESC`);

  console.log('\n   By Make:');
  vehiclesByMake.forEach(row => {
    console.log(`   - ${row.make}: ${row.count}`);
  });

  // Price History
  const priceCount = await db.select({ count: sql<number>`count(*)` }).from(priceHistory);
  console.log(`\n📈 Price History Records: ${priceCount[0].count}`);

  // Events
  const eventCount = await db.select({ count: sql<number>`count(*)` }).from(carShowEvents);
  const eventsWithLinks = await db.select({ count: sql<number>`count(*)` })
    .from(carShowEvents)
    .where(isNotNull(carShowEvents.vehicleMakes));

  console.log(`\n📅 Events: ${eventCount[0].count}`);
  console.log(`   With cross-linking: ${eventsWithLinks[0].count}`);

  // Source types
  const sourceTypes = await db.select({
    sourceType: carsForSale.sourceType,
    count: sql<number>`count(*)`
  })
  .from(carsForSale)
  .groupBy(carsForSale.sourceType);

  console.log(`\n📍 Vehicle Sources:`);
  sourceTypes.forEach(row => {
    console.log(`   - ${row.sourceType}: ${row.count}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Database verification complete');

  process.exit(0);
}

verifyDatabase().catch(console.error);
