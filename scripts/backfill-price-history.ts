/**
 * Phase 2 Task 2.7: Backfill Price History
 * Populates price history for all existing vehicles in the database
 * that don't yet have price history records
 */

import { db } from "../db";
import { carsForSale, priceHistory } from "../shared/schema";
import { notInArray, sql } from "drizzle-orm";

async function backfillPriceHistory(): Promise<{ success: boolean; backfilled: number; skipped: number; errors: number }> {
  console.log('📊 BACKFILLING PRICE HISTORY FOR EXISTING VEHICLES\n');

  let backfilled = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Get all vehicles from carsForSale
    const allVehicles = await db.select().from(carsForSale);
    console.log(`Found ${allVehicles.length} total vehicles in database`);

    // Get vehicle IDs that already have price history
    const existingHistoryQuery = await db
      .select({ vehicleId: priceHistory.vehicleId })
      .from(priceHistory)
      .groupBy(priceHistory.vehicleId);

    const vehiclesWithHistory = new Set(existingHistoryQuery.map(h => h.vehicleId));
    console.log(`${vehiclesWithHistory.size} vehicles already have price history\n`);

    // Process each vehicle
    for (const vehicle of allVehicles) {
      try {
        // Skip if vehicle already has price history
        if (vehiclesWithHistory.has(vehicle.id)) {
          skipped++;
          continue;
        }

        // Skip if vehicle has no price
        if (!vehicle.price) {
          console.log(`⚠️  Skipping ${vehicle.year} ${vehicle.make} ${vehicle.model} - no price data`);
          skipped++;
          continue;
        }

        // Create initial price history record
        await db.insert(priceHistory).values({
          vehicleId: vehicle.id,
          price: vehicle.price,
          sourceType: 'import',
          sourceName: vehicle.sourceName || 'Unknown Source',
          recordedDate: vehicle.createdAt || new Date(),
          createdAt: new Date()
        });

        backfilled++;

        if (backfilled % 50 === 0) {
          console.log(`✅ Backfilled ${backfilled} price history records...`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Failed to backfill ${vehicle.year} ${vehicle.make} ${vehicle.model}:`, error);
      }
    }

    console.log('\n🎉 PRICE HISTORY BACKFILL COMPLETE!\n');
    console.log(`📊 RESULTS SUMMARY:`);
    console.log(`• Total Vehicles: ${allVehicles.length}`);
    console.log(`• Backfilled: ${backfilled}`);
    console.log(`• Already Had History: ${vehiclesWithHistory.size}`);
    console.log(`• Skipped (no price): ${skipped - vehiclesWithHistory.size}`);
    console.log(`• Errors: ${errors}`);
    console.log(`• Success Rate: ${Math.round((backfilled / (allVehicles.length - vehiclesWithHistory.size)) * 100)}%\n`);

    // Verify final counts
    const finalHistoryCount = await db
      .select({ count: sql<number>`count(distinct ${priceHistory.vehicleId})` })
      .from(priceHistory);

    console.log(`✅ Total vehicles now with price history: ${finalHistoryCount[0].count}`);

    return {
      success: true,
      backfilled,
      skipped,
      errors
    };

  } catch (error) {
    console.error('❌ BACKFILL FAILED:', error);
    return {
      success: false,
      backfilled,
      skipped,
      errors: errors + 1
    };
  }
}

// Run the backfill
backfillPriceHistory()
  .then((result) => {
    console.log('\n🎯 Backfill process completed:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Backfill process failed:', error);
    process.exit(1);
  });
