/**
 * Check for Duplicate Cars
 *
 * Analyzes the database for duplicate entries
 */

import { db } from '../db';
import { carsForSale } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function checkDuplicates() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 DUPLICATE CARS ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Total counts
  const totalResult = await db.select({ count: sql<number>`COUNT(*)` }).from(carsForSale);
  const total = totalResult[0]?.count || 0;

  const uniqueStockNumbers = await db.select({
    count: sql<number>`COUNT(DISTINCT stock_number)`
  }).from(carsForSale);
  const unique = uniqueStockNumbers[0]?.count || 0;

  console.log('📊 Overall Statistics:');
  console.log(`   Total Cars: ${total}`);
  console.log(`   Unique Stock Numbers: ${unique}`);
  console.log(`   Potential Duplicates: ${total - unique}\n`);

  // Check for duplicate stock numbers
  console.log('🔢 Duplicate Stock Numbers:');
  const duplicateStocks = await db.select({
    stockNumber: carsForSale.stockNumber,
    count: sql<number>`COUNT(*)`
  })
    .from(carsForSale)
    .groupBy(carsForSale.stockNumber)
    .having(sql`COUNT(*) > 1`)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(20);

  if (duplicateStocks.length > 0) {
    console.log(`   Found ${duplicateStocks.length} stock numbers with duplicates:\n`);
    duplicateStocks.forEach(d => {
      console.log(`   ${d.stockNumber}: ${d.count} entries`);
    });
  } else {
    console.log('   ✅ No duplicate stock numbers found!');
  }

  // Check for duplicate year+make+model combinations in same location
  console.log('\n🚗 Duplicate Year/Make/Model/Location:');
  const duplicateCars = await db.select({
    year: carsForSale.year,
    make: carsForSale.make,
    model: carsForSale.model,
    city: carsForSale.locationCity,
    state: carsForSale.locationState,
    count: sql<number>`COUNT(*)`
  })
    .from(carsForSale)
    .groupBy(
      carsForSale.year,
      carsForSale.make,
      carsForSale.model,
      carsForSale.locationCity,
      carsForSale.locationState
    )
    .having(sql`COUNT(*) > 1`)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(20);

  if (duplicateCars.length > 0) {
    console.log(`   Found ${duplicateCars.length} car/location combinations with duplicates:\n`);
    duplicateCars.forEach(d => {
      console.log(`   ${d.year} ${d.make} ${d.model} (${d.city}, ${d.state}): ${d.count} entries`);
    });
  } else {
    console.log('   ✅ No duplicate car/location combinations found!');
  }

  // Check for same year+make+model (regardless of location)
  console.log('\n🔄 Same Year/Make/Model (different locations):');
  const sameCarDiffLocation = await db.select({
    year: carsForSale.year,
    make: carsForSale.make,
    model: carsForSale.model,
    count: sql<number>`COUNT(*)`
  })
    .from(carsForSale)
    .groupBy(carsForSale.year, carsForSale.make, carsForSale.model)
    .having(sql`COUNT(*) > 3`)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(15);

  if (sameCarDiffLocation.length > 0) {
    console.log(`   Top ${sameCarDiffLocation.length} most common car models:\n`);
    sameCarDiffLocation.forEach(d => {
      console.log(`   ${d.year} ${d.make} ${d.model}: ${d.count} listings`);
    });
    console.log('\n   ℹ️  These are likely different cars in different locations');
  }

  // Check for VIN duplicates
  console.log('\n🔑 Duplicate VINs:');
  const duplicateVins = await db.select({
    vin: carsForSale.vin,
    count: sql<number>`COUNT(*)`
  })
    .from(carsForSale)
    .where(sql`vin IS NOT NULL AND vin != ''`)
    .groupBy(carsForSale.vin)
    .having(sql`COUNT(*) > 1`)
    .limit(10);

  if (duplicateVins.length > 0) {
    console.log(`   Found ${duplicateVins.length} VINs with duplicates:\n`);
    duplicateVins.forEach(d => {
      console.log(`   ${d.vin}: ${d.count} entries`);
    });
  } else {
    console.log('   ✅ No duplicate VINs found (or no VINs recorded)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Summary
  const duplicatePercentage = ((total - unique) / total * 100).toFixed(2);

  console.log('📋 Summary:');
  if (total === unique) {
    console.log('   ✅ All cars have unique stock numbers!');
    console.log('   ✅ No true duplicates detected');
  } else {
    console.log(`   ⚠️  ${total - unique} cars (${duplicatePercentage}%) share stock numbers with others`);
    console.log('   💡 Some duplication may be intentional (same car listed in multiple locations)');
  }
  console.log();
}

checkDuplicates()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error checking duplicates:', error);
    process.exit(1);
  });
