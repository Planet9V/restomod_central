/**
 * Database Status Check
 * Validates Phase 5 cross-linking data population
 */

import { db } from './db';
import { carShowEvents, carsForSale } from './shared/schema';
import { sql, isNotNull } from 'drizzle-orm';

async function checkDatabaseStatus() {
  console.log('=== DATABASE STATUS CHECK ===\n');

  // Check car show events
  const totalEvents = await db.select({ count: sql<number>`count(*)` })
    .from(carShowEvents);
  console.log(`📅 Total Car Show Events: ${totalEvents[0].count}`);

  // Check events with cross-linking data
  const eventsWithVehicleData = await db.select({ count: sql<number>`count(*)` })
    .from(carShowEvents)
    .where(isNotNull(carShowEvents.vehicleMakes));
  console.log(`🔗 Events with vehicle cross-link data: ${eventsWithVehicleData[0].count}`);

  // Check vehicles for sale
  const totalVehicles = await db.select({ count: sql<number>`count(*)` })
    .from(carsForSale);
  console.log(`🚗 Total Vehicles for Sale: ${totalVehicles[0].count}`);

  // Sample event with cross-link data
  const sampleEvent = await db.query.carShowEvents.findFirst({
    where: isNotNull(carShowEvents.vehicleMakes)
  });

  if (sampleEvent) {
    console.log('\n📋 Sample Event with Cross-Link Data:');
    console.log(`   Name: ${sampleEvent.eventName}`);
    console.log(`   Vehicle Makes: ${sampleEvent.vehicleMakes}`);
    console.log(`   Vehicle Models: ${sampleEvent.vehicleModels}`);
    console.log(`   Primary Focus: ${sampleEvent.primaryVehicleFocus}`);
    console.log(`   Expected Attendance: ${sampleEvent.expectedAttendanceMin} - ${sampleEvent.expectedAttendanceMax}`);
  } else {
    console.log('\n⚠️  No events have cross-linking data yet!');
  }

  // Sample vehicles
  const sampleVehicles = await db.query.carsForSale.findMany({
    limit: 5
  });

  console.log('\n🚙 Sample Vehicles for Sale:');
  sampleVehicles.forEach((v, i) => {
    console.log(`   ${i + 1}. ${v.year} ${v.make} ${v.model} - ${v.price || 'Price N/A'} (${v.locationCity || 'Location N/A'}, ${v.locationState || ''})`);
  });

  // Check event categories
  const eventCategories = await db.select({
    category: carShowEvents.eventCategory,
    count: sql<number>`count(*)`
  })
    .from(carShowEvents)
    .groupBy(carShowEvents.eventCategory);

  console.log('\n📊 Events by Category:');
  eventCategories.forEach(cat => {
    console.log(`   ${cat.category || 'No category'}: ${cat.count}`);
  });

  // Check vehicle makes distribution
  const vehicleMakes = await db.select({
    make: carsForSale.make,
    count: sql<number>`count(*)`
  })
    .from(carsForSale)
    .groupBy(carsForSale.make)
    .limit(10);

  console.log('\n🏭 Top 10 Vehicle Makes:');
  vehicleMakes.forEach(m => {
    console.log(`   ${m.make}: ${m.count}`);
  });

  console.log('\n=== END OF STATUS CHECK ===');
}

checkDatabaseStatus().catch(console.error).finally(() => process.exit(0));
