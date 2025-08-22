import { Router } from 'express';
import { getCarShowEvents } from '@server/storage';
import { maybeIsAuthenticated } from '@server/auth';

const eventsRouter = Router();

eventsRouter.get('/', maybeIsAuthenticated, async (req, res) => {
  const { eventType, state, category, featured, status, search, limit } = req.query;
  const userId = res.locals.user?.userId;

  const filters = {
    userId,
    eventType: eventType as string | undefined,
    state: state as string | undefined,
    category: category as string | undefined,
    featured: featured ? featured === 'true' : undefined,
    status: status as string | undefined,
    search: search as string | undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  };

  try {
    const eventList = await getCarShowEvents(filters);
    res.json(eventList);
  } catch (error) {
    console.error('Error fetching car show events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

eventsRouter.get('/:id/nearby-cars', async (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    const event = await getCarShowEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.state) {
      return res.json([]);
    }

    const nearbyCars = await getCarsByState(event.state);
    res.json(nearbyCars);
  } catch (error) {
    console.error('Error fetching nearby cars:', error);
    res.status(500).json({ error: 'Failed to fetch nearby cars' });
  }
});

export default eventsRouter;
