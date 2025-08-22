import { Router } from 'express';
import { db } from '@db';
import { eventComments, users } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { isAuthenticated } from '@server/auth';

const commentsRouter = Router();

// GET all comments for a specific event
commentsRouter.get('/event/:eventId', async (req, res) => {
  const eventId = parseInt(req.params.eventId, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  try {
    const comments = await db.select({
        id: eventComments.id,
        content: eventComments.content,
        createdAt: eventComments.createdAt,
        user: {
            id: users.id,
            username: users.username,
        }
    })
    .from(eventComments)
    .leftJoin(users, eq(eventComments.userId, users.id))
    .where(eq(eventComments.eventId, eventId))
    .orderBy(desc(eventComments.createdAt));

    res.json(comments);
  } catch (error) {
    console.error(`Error fetching comments for event ${eventId}:`, error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST a new comment to an event
commentsRouter.post('/event/:eventId', isAuthenticated, async (req, res) => {
  const { userId } = res.locals.user;
  const eventId = parseInt(req.params.eventId, 10);
  const { content } = req.body;

  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  try {
    const [newComment] = await db.insert(eventComments).values({
      content,
      eventId,
      userId,
      createdAt: new Date(),
    }).returning();

    // Fetch the comment with user info to return to the client
    const result = await db.select({
        id: eventComments.id,
        content: eventComments.content,
        createdAt: eventComments.createdAt,
        user: {
            id: users.id,
            username: users.username,
        }
    })
    .from(eventComments)
    .leftJoin(users, eq(eventComments.userId, users.id))
    .where(eq(eventComments.id, newComment.id));

    res.status(201).json(result[0]);
  } catch (error) {
    console.error(`Error posting comment for event ${eventId}:`, error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

export default commentsRouter;
