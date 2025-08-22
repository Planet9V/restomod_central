import { Router } from 'express';
import { db } from '@db';
import { carShowEvents } from '@shared/schema';
import { sql, count, desc } from 'drizzle-orm';

const analyticsRouter = Router();

analyticsRouter.get('/events', async (req, res) => {
  try {
    // Events by State
    const eventsByState = await db
      .select({
        state: carShowEvents.state,
        count: count(carShowEvents.id),
      })
      .from(carShowEvents)
      .groupBy(carShowEvents.state)
      .orderBy(desc(count(carShowEvents.id)));

    // Events by Category
    const eventsByCategory = await db
      .select({
        category: carShowEvents.eventCategory,
        count: count(carShowEvents.id),
      })
      .from(carShowEvents)
      .groupBy(carShowEvents.eventCategory)
      .orderBy(desc(count(carShowEvents.id)))
      .limit(10); // Top 10 categories

    // Events over time (by month)
    // Note: SQLite date functions are tricky with Drizzle. This is a simplified example.
    // A more robust solution might need raw SQL or better date handling.
    const eventsByMonth = await db
      .select({
        // The strftime function is specific to SQLite
        month: sql<string>`strftime('%Y-%m', car_show_events.start_date)`,
        count: count(carShowEvents.id),
      })
      .from(carShowEvents)
      .groupBy(sql`strftime('%Y-%m', car_show_events.start_date)`)
      .orderBy(sql`strftime('%Y-%m', car_show_events.start_date)`);

    res.json({
      eventsByState,
      eventsByCategory,
      eventsByMonth,
    });

  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ error: 'Failed to fetch event analytics' });
  }
});

export default analyticsRouter;
