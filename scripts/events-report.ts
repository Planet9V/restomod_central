/**
 * Car Show Events Report
 *
 * Shows statistics about imported events
 *
 * Usage:
 *   npm run events:report
 *   tsx scripts/events-report.ts
 */

import { db } from '../db';
import { carShowEvents } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function eventsReport() {
  console.log('\n');
  console.log('🎪  CAR SHOW EVENTS REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Total count
  const totalResult = await db.select({ count: sql<number>`COUNT(*)` }).from(carShowEvents);
  const total = totalResult[0]?.count || 0;

  console.log(`📊 Total Events: ${total}\n`);

  // By event type
  try {
    const byType = await db.select({
      eventType: carShowEvents.eventType,
      count: sql<number>`COUNT(*)`
    })
      .from(carShowEvents)
      .groupBy(carShowEvents.eventType)
      .orderBy(sql`COUNT(*) DESC`);

    if (byType.length > 0) {
      console.log('By Event Type:');
      byType.forEach(t => {
        const pct = ((t.count / total) * 100).toFixed(1);
        console.log(`  ${(t.eventType || 'Unknown').padEnd(15)} ${String(t.count).padStart(3)} (${pct}%)`);
      });
      console.log();
    }
  } catch (error) {
    console.error('Error fetching by type:', error);
  }

  // By category
  try {
    const byCategory = await db.select({
      category: carShowEvents.eventCategory,
      count: sql<number>`COUNT(*)`
    })
      .from(carShowEvents)
      .groupBy(carShowEvents.eventCategory)
      .orderBy(sql`COUNT(*) DESC`);

    if (byCategory.length > 0) {
      console.log('By Category:');
      byCategory.forEach(c => {
        const pct = ((c.count / total) * 100).toFixed(1);
        console.log(`  ${(c.category || 'Unknown').padEnd(15)} ${String(c.count).padStart(3)} (${pct}%)`);
      });
      console.log();
    }
  } catch (error) {
    console.error('Error fetching by category:', error);
  }

  // By state
  try {
    const byState = await db.select({
      state: carShowEvents.state,
      count: sql<number>`COUNT(*)`
    })
      .from(carShowEvents)
      .groupBy(carShowEvents.state)
      .orderBy(sql`COUNT(*) DESC`);

    if (byState.length > 0) {
      console.log('By State:');
      byState.forEach(s => {
        const pct = ((s.count / total) * 100).toFixed(1);
        console.log(`  ${(s.state || 'Unknown').padEnd(15)} ${String(s.count).padStart(3)} (${pct}%)`);
      });
      console.log();
    }
  } catch (error) {
    console.error('Error fetching by state:', error);
  }

  // Featured events
  try {
    const featuredResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(carShowEvents)
      .where(sql`featured = 1`);
    const featuredCount = featuredResult[0]?.count || 0;

    console.log(`⭐ Featured Events: ${featuredCount}\n`);
  } catch (error) {
    console.error('Error fetching featured:', error);
  }

  // Upcoming events (2026 and beyond)
  try {
    const upcomingResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(carShowEvents)
      .where(sql`start_date >= datetime('2026-01-01')`);
    const upcomingCount = upcomingResult[0]?.count || 0;

    console.log(`📅 Upcoming 2026 Events: ${upcomingCount}\n`);
  } catch (error) {
    console.error('Error fetching upcoming:', error);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 Next Steps:');
  console.log('   → View events: npm run dev → http://localhost:5000/events');
  console.log('   → Add more events: Create new JSON and run npm run import:events --file=<filename>');
  console.log('   → Check event details: Browse the events page in your browser\n');
}

eventsReport()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  });
