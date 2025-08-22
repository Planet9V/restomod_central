import { Router } from 'express';
import { db } from '@db';
import { userPreferences } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '@server/auth';

const userRouter = Router();

// All routes in this file are protected
userRouter.use(isAuthenticated);

// GET user preferences
userRouter.get('/preferences', async (req, res) => {
  const { userId } = res.locals.user;

  try {
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!preferences) {
      // Return default preferences if none are set
      return res.json({
        userId,
        homeLocation: {},
        preferredCategories: [],
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// UPDATE user preferences (manual upsert for SQLite)
userRouter.put('/preferences', async (req, res) => {
  const { userId } = res.locals.user;
  const { homeLocation, preferredCategories } = req.body;

  try {
    const existing = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
    });

    let result;
    if (existing) {
      // Update
      [result] = await db.update(userPreferences)
        .set({
          homeLocation,
          preferredCategories,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
    } else {
      // Insert
      [result] = await db.insert(userPreferences)
        .values({
          userId,
          homeLocation,
          preferredCategories,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default userRouter;
