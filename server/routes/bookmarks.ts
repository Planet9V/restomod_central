/**
 * Bookmarks API Routes - SPEC_02_API_ENDPOINTS.md
 * User bookmark system for cars and events
 *
 * Endpoints:
 * - GET /api/bookmarks - Get user's bookmarks with optional filtering
 * - POST /api/bookmarks - Create new bookmark
 * - DELETE /api/bookmarks/:id - Remove bookmark
 * - GET /api/bookmarks/cars - Get bookmarked cars with full details
 * - GET /api/bookmarks/events - Get bookmarked events with full details
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { userBookmarks, carsForSale, carShowEvents } from '../../shared/postgres-schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

/**
 * Validation Schemas
 */

// Schema for creating a bookmark
const createBookmarkSchema = z.object({
  itemType: z.enum(['car', 'event'], {
    errorMap: () => ({ message: 'Item type must be either "car" or "event"' })
  }),
  itemId: z.number().int().positive('Item ID must be a positive integer'),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});

// Schema for getting bookmarks with filters
const getBookmarksSchema = z.object({
  itemType: z.enum(['car', 'event', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * GET /api/bookmarks
 * Get user's bookmarks with optional type filter
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const params = getBookmarksSchema.parse(req.query);

    // Build WHERE conditions
    const conditions: any[] = [eq(userBookmarks.userId, userId)];

    // Filter by item type if specified
    if (params.itemType !== 'all') {
      conditions.push(eq(userBookmarks.itemType, params.itemType));
    }

    const whereClause = and(...conditions);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userBookmarks)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / params.limit);

    // Fetch bookmarks with pagination
    const bookmarks = await db
      .select()
      .from(userBookmarks)
      .where(whereClause)
      .orderBy(desc(userBookmarks.createdAt))
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    // Return minimal bookmark information
    return res.status(200).json({
      success: true,
      data: {
        bookmarks: bookmarks.map(bookmark => ({
          id: bookmark.id,
          itemType: bookmark.itemType,
          itemId: bookmark.itemId,
          notes: bookmark.notes,
          createdAt: bookmark.createdAt,
        })),
        count: bookmarks.length,
      },
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors
        }
      });
    }

    console.error('Get bookmarks error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch bookmarks'
      }
    });
  }
});

/**
 * POST /api/bookmarks
 * Create new bookmark
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const validatedData = createBookmarkSchema.parse(req.body);

    // Check if bookmark already exists
    const existingBookmark = await db.query.userBookmarks.findFirst({
      where: and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.itemType, validatedData.itemType),
        eq(userBookmarks.itemId, validatedData.itemId)
      )
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_BOOKMARKED',
          message: 'This item is already bookmarked'
        }
      });
    }

    // Verify that the item exists
    if (validatedData.itemType === 'car') {
      const car = await db.query.carsForSale.findFirst({
        where: eq(carsForSale.id, validatedData.itemId)
      });

      if (!car) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Car not found'
          }
        });
      }
    } else if (validatedData.itemType === 'event') {
      const event = await db.query.carShowEvents.findFirst({
        where: eq(carShowEvents.id, validatedData.itemId)
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Event not found'
          }
        });
      }
    }

    // Create bookmark
    const [newBookmark] = await db.insert(userBookmarks).values({
      userId,
      itemType: validatedData.itemType,
      itemId: validatedData.itemId,
      notes: validatedData.notes || null,
      createdAt: new Date(),
    }).returning();

    return res.status(201).json({
      success: true,
      data: {
        bookmark: {
          id: newBookmark.id,
          itemType: newBookmark.itemType,
          itemId: newBookmark.itemId,
          notes: newBookmark.notes,
          createdAt: newBookmark.createdAt,
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid bookmark data',
          details: error.errors
        }
      });
    }

    console.error('Create bookmark error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create bookmark'
      }
    });
  }
});

/**
 * DELETE /api/bookmarks/:id
 * Remove bookmark (only if it belongs to the authenticated user)
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const bookmarkId = parseInt(req.params.id);

    if (isNaN(bookmarkId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid bookmark ID'
        }
      });
    }

    // Check if bookmark exists and belongs to user
    const bookmark = await db.query.userBookmarks.findFirst({
      where: eq(userBookmarks.id, bookmarkId)
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Bookmark not found'
        }
      });
    }

    // Verify ownership
    if (bookmark.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own bookmarks'
        }
      });
    }

    // Delete bookmark
    await db.delete(userBookmarks)
      .where(eq(userBookmarks.id, bookmarkId));

    return res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Delete bookmark error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete bookmark'
      }
    });
  }
});

/**
 * GET /api/bookmarks/cars
 * Get bookmarked cars with full details (with JOIN)
 */
router.get('/cars', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userBookmarks)
      .where(and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.itemType, 'car')
      ));

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Fetch bookmarked cars with JOIN
    const bookmarkedCars = await db
      .select({
        bookmark: userBookmarks,
        car: carsForSale,
      })
      .from(userBookmarks)
      .innerJoin(carsForSale, eq(userBookmarks.itemId, carsForSale.id))
      .where(and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.itemType, 'car')
      ))
      .orderBy(desc(userBookmarks.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Format response
    const cars = bookmarkedCars.map(({ bookmark, car }) => ({
      bookmarkId: bookmark.id,
      bookmarkNotes: bookmark.notes,
      bookmarkedAt: bookmark.createdAt,
      ...car,
    }));

    return res.status(200).json({
      success: true,
      data: {
        cars,
        count: cars.length,
      },
      meta: {
        page,
        limit,
        total,
        totalPages,
      }
    });

  } catch (error) {
    console.error('Get bookmarked cars error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch bookmarked cars'
      }
    });
  }
});

/**
 * GET /api/bookmarks/events
 * Get bookmarked events with full details (with JOIN)
 */
router.get('/events', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userBookmarks)
      .where(and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.itemType, 'event')
      ));

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Fetch bookmarked events with JOIN
    const bookmarkedEvents = await db
      .select({
        bookmark: userBookmarks,
        event: carShowEvents,
      })
      .from(userBookmarks)
      .innerJoin(carShowEvents, eq(userBookmarks.itemId, carShowEvents.id))
      .where(and(
        eq(userBookmarks.userId, userId),
        eq(userBookmarks.itemType, 'event')
      ))
      .orderBy(desc(userBookmarks.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Format response
    const events = bookmarkedEvents.map(({ bookmark, event }) => ({
      bookmarkId: bookmark.id,
      bookmarkNotes: bookmark.notes,
      bookmarkedAt: bookmark.createdAt,
      ...event,
    }));

    return res.status(200).json({
      success: true,
      data: {
        events,
        count: events.length,
      },
      meta: {
        page,
        limit,
        total,
        totalPages,
      }
    });

  } catch (error) {
    console.error('Get bookmarked events error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch bookmarked events'
      }
    });
  }
});

export default router;
