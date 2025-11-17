/**
 * Daily Import Progress Report
 *
 * Shows current status of car imports toward 1000 goal
 *
 * Usage:
 *   npm run cars:report
 *   tsx scripts/daily-report.ts
 */

import { db } from '../db';
import { carsForSale } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function dailyReport() {
  console.log('\n');
  console.log('🚗  CLASSIC CARS IMPORT PROGRESS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Total count
  const totalResult = await db.select({ count: sql<number>`COUNT(*)` }).from(carsForSale);
  const total = totalResult[0]?.count || 0;
  const goal = 1000;
  const percentage = (total / goal) * 100;

  console.log(`📊 Total Imported: ${total} / ${goal} (${percentage.toFixed(1)}%)`);

  // Progress bar
  const barLength = 50;
  const filledLength = Math.floor((total / goal) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  console.log(`📈 Progress: [${bar}] ${percentage.toFixed(1)}%\n`);

  // By source
  try {
    const bySource = await db.select({
      source: carsForSale.sourceName,
      count: sql<number>`COUNT(*)`
    })
      .from(carsForSale)
      .groupBy(carsForSale.sourceName)
      .orderBy(sql`COUNT(*) DESC`);

    if (bySource.length > 0) {
      console.log('By Source:');
      bySource.forEach(s => {
        const pct = ((s.count / total) * 100).toFixed(1);
        const miniBar = '█'.repeat(Math.floor(s.count / 10)) + '░'.repeat(Math.max(0, 10 - Math.floor(s.count / 10)));
        console.log(`  ${(s.source || 'Unknown').padEnd(30)} ${String(s.count).padStart(4)} ${miniBar} ${pct}%`);
      });
    }
  } catch (error) {
    console.log('By Source: Unable to fetch (table may be empty)');
  }

  // By category
  try {
    const byCategory = await db.select({
      category: carsForSale.category,
      count: sql<number>`COUNT(*)`
    })
      .from(carsForSale)
      .groupBy(carsForSale.category)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    if (byCategory.length > 0) {
      console.log('\nBy Category:');
      byCategory.forEach(c => {
        const pct = ((c.count / total) * 100).toFixed(1);
        console.log(`  ${(c.category || 'Unknown').padEnd(25)} ${String(c.count).padStart(4)} (${pct}%)`);
      });
    }
  } catch (error) {
    console.log('\nBy Category: Unable to fetch');
  }

  // By region
  try {
    const byRegion = await db.select({
      region: carsForSale.locationRegion,
      count: sql<number>`COUNT(*)`
    })
      .from(carsForSale)
      .groupBy(carsForSale.locationRegion)
      .orderBy(sql`COUNT(*) DESC`);

    if (byRegion.length > 0) {
      console.log('\nBy Region:');
      byRegion.forEach(r => {
        const pct = ((r.count / total) * 100).toFixed(1);
        console.log(`  ${(r.region || 'Unknown').padEnd(15)} ${String(r.count).padStart(4)} (${pct}%)`);
      });
    }
  } catch (error) {
    console.log('\nBy Region: Unable to fetch');
  }

  // By decade
  try {
    const byDecade = await db.select({
      decade: sql<string>`(year / 10) * 10`,
      count: sql<number>`COUNT(*)`
    })
      .from(carsForSale)
      .groupBy(sql`(year / 10) * 10`)
      .orderBy(sql`(year / 10) * 10`);

    if (byDecade.length > 0) {
      console.log('\nBy Decade:');
      byDecade.forEach(d => {
        const pct = ((d.count / total) * 100).toFixed(1);
        console.log(`  ${d.decade}s${' '.repeat(10)} ${String(d.count).padStart(4)} (${pct}%)`);
      });
    }
  } catch (error) {
    console.log('\nBy Decade: Unable to fetch');
  }

  // Price range analysis
  try {
    const avgPrice = await db.select({
      avg: sql<number>`AVG(CAST(REPLACE(REPLACE(price, '$', ''), ',', '') AS INTEGER))`
    }).from(carsForSale);

    const avgPriceNum = avgPrice[0]?.avg || 0;
    if (avgPriceNum > 0) {
      console.log('\nPrice Analysis:');
      console.log(`  Average Price: $${avgPriceNum.toLocaleString()}`);
    }
  } catch (error) {
    // Price parsing may fail for "Call for Price" entries
  }

  // Statistics
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const remaining = goal - total;
  const daysAtCurrentRate = Math.ceil(remaining / 50); // Assuming 50 cars/day

  console.log(`\n📅 ${new Date().toLocaleDateString()} Report`);
  console.log(`\n🎯 Target: ${remaining} more cars needed`);
  console.log(`📆 ETA: ${daysAtCurrentRate} days at 50 cars/day`);
  console.log(`⏰ Projected Completion: ${new Date(Date.now() + daysAtCurrentRate * 24 * 60 * 60 * 1000).toLocaleDateString()}`);

  if (total >= goal) {
    console.log('\n🎉🎉🎉 GOAL REACHED! Congratulations! 🎉🎉🎉');
  } else if (percentage >= 75) {
    console.log('\n🔥 Almost there! Keep going!');
  } else if (percentage >= 50) {
    console.log('\n💪 Halfway there! Great progress!');
  } else if (percentage >= 25) {
    console.log('\n📈 Good start! Keep importing!');
  } else {
    console.log('\n🚀 Just getting started! Let\'s go!');
  }

  console.log('\n📋 Next Steps:');
  if (total < 300) {
    console.log('   → Focus on ClassicCars.com (muscle cars, Corvettes, Mustangs)');
    console.log('   → Target: 300 cars from ClassicCars.com');
  } else if (total < 600) {
    console.log('   → Move to Hemmings.com (Chevrolet, Ford, Dodge)');
    console.log('   → Target: 300 cars from Hemmings');
  } else if (total < 900) {
    console.log('   → Diversify with BringATrailer, Gateway, eBay');
    console.log('   → Target: 300 cars from multiple sources');
  } else if (total < 1000) {
    console.log('   → Fill gaps in makes/models/regions');
    console.log('   → Target: Final 100 cars for completion');
  } else {
    console.log('   → Quality check and data enhancement');
    console.log('   → Consider expanding to 2000+ cars');
  }

  console.log('\n');
}

dailyReport()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  });
