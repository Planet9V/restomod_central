import { Router } from 'express';
import { db } from '@db';
import { userItineraries, carShowEvents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '@server/auth';

const itineraryRouter = Router();

// All routes in this file are protected
itineraryRouter.use(isAuthenticated);

// GET user's itinerary
itineraryRouter.get('/', async (req, res) => {
  const { userId } = res.locals.user;

  try {
    const itineraryItems = await db.select({
        event: carShowEvents
      })
      .from(userItineraries)
      .leftJoin(carShowEvents, eq(userItineraries.eventId, carShowEvents.id))
      .where(eq(userItineraries.userId, userId));

    const events = itineraryItems.map(item => item.event);
    res.json(events);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

// ADD event to itinerary
itineraryRouter.post('/', async (req, res) => {
  const { userId } = res.locals.user;
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId is required' });
  }

  try {
    // Check if it already exists
    const existing = await db.query.userItineraries.findFirst({
      where: and(
        eq(userItineraries.userId, userId),
        eq(userItineraries.eventId, eventId)
      )
    });

    if (existing) {
      return res.status(409).json({ message: 'Event already in itinerary' });
    }

    await db.insert(userItineraries).values({
      userId,
      eventId,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, message: 'Event added to itinerary' });
  } catch (error) {
    console.error('Error adding to itinerary:', error);
    res.status(500).json({ error: 'Failed to add event to itinerary' });
  }
});

// REMOVE event from itinerary
itineraryRouter.delete('/:eventId', async (req, res) => {
  const { userId } = res.locals.user;
  const eventId = parseInt(req.params.eventId, 10);

  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid eventId' });
  }

  try {
    await db.delete(userItineraries).where(
      and(
        eq(userItineraries.userId, userId),
        eq(userItineraries.eventId, eventId)
      )
    );

    res.status(200).json({ success: true, message: 'Event removed from itinerary' });
  } catch (error) {
    console.error('Error removing from itinerary:', error);
    res.status(500).json({ error: 'Failed to remove event from itinerary' });
  }
});

export default itineraryRouter;
