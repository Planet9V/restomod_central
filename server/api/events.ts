import { Router } from 'express';
import { getCarShowEvents } from '@server/storage';

const eventsRouter = Router();

eventsRouter.get('/', async (req, res) => {
  const { eventType, state, category, featured, status, search, limit } = req.query;

  const filters = {
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

export default eventsRouter;
