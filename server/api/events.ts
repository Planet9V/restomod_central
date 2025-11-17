/**
 * Events API Routes - SPEC_02_API_ENDPOINTS.md Section 4
 * Car show events with map view and geolocation support
 *
 * Endpoints:
 * - GET /api/events - Search events with advanced filters
 * - GET /api/events/map - Map view with geolocation
 * - GET /api/events/upcoming - Get upcoming events
 * - GET /api/events/:id - Get detailed event information
 * - GET /api/events/:id/nearby-cars - Get cars near event location
 * - POST /api/events - Create event (admin only)
 * - PUT /api/events/:id - Update event (admin only)
 * - DELETE /api/events/:id - Soft delete event (admin only)
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { carShowEvents, carsForSale } from '@shared/schema';
import { eq, and, gte, lte, like, or, sql, desc, asc, inArray } from 'drizzle-orm';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/authMiddleware';
import { getCarShowEventById, getCarsByState } from '@server/storage';

const router = Router();

/**
 * Validation Schemas
 */

const eventSearchSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Location filters
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  // Event filters
  eventType: z.string().optional(), // Comma-separated: car_show,concours
  category: z.string().optional(), // Event category filter
  eventCategory: z.string().optional(), // Alias for category
  featured: z.coerce.boolean().optional(),

  // Date range filters
  dateFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  dateTo: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),

  // Sorting
  sortBy: z.enum(['start_date', 'created_at', 'event_name']).default('start_date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Full-text search
  search: z.string().optional(),
});

const mapViewSchema = z.object({
  // Geographic bounds: SW lat, SW lng, NE lat, NE lng
  bounds: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/).optional(),

  // Filters
  eventType: z.string().optional(),
  dateFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  dateTo: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

const upcomingEventsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const createEventSchema = z.object({
  // Required fields
  eventName: z.string().min(1, 'Event name is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  startDate: z.string().datetime().or(z.string()),
  eventType: z.enum(['auction', 'car_show', 'concours', 'cruise_in', 'swap_meet']),

  // Optional core fields
  eventSlug: z.string().optional(),
  venue: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  country: z.string().default('USA'),
  zipCode: z.string().optional(),
  endDate: z.string().datetime().or(z.string()).optional(),

  // Event details
  eventCategory: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),

  // Organizer information
  organizerName: z.string().optional(),
  organizerContact: z.string().optional(),
  organizerEmail: z.string().email().optional(),
  organizerPhone: z.string().optional(),

  // Pricing & registration
  entryFeeSpectator: z.string().optional(),
  entryFeeParticipant: z.string().optional(),
  registrationDeadline: z.string().datetime().or(z.string()).optional(),

  // Capacity & attendance
  capacity: z.number().int().min(0).optional(),
  expectedAttendance: z.number().int().min(0).optional(),
  expectedAttendanceMin: z.number().int().min(0).optional(),
  expectedAttendanceMax: z.number().int().min(0).optional(),

  // Features & amenities (JSON arrays as strings)
  features: z.string().optional(),
  amenities: z.string().optional(),
  vehicleRequirements: z.string().optional(),
  judgingClasses: z.string().optional(),
  awards: z.string().optional(),

  // Venue details
  parkingInfo: z.string().optional(),
  foodVendors: z.boolean().default(false),
  swapMeet: z.boolean().default(false),
  liveMusic: z.boolean().default(false),
  kidsActivities: z.boolean().default(false),

  // Additional info
  weatherContingency: z.string().optional(),
  specialNotes: z.string().optional(),
  imageUrl: z.string().url().optional(),

  // Vehicle focus
  vehicleMakes: z.string().optional(), // JSON array as string
  vehicleModels: z.string().optional(), // JSON array as string
  primaryVehicleFocus: z.enum(['make', 'model', 'category', 'era', 'general']).optional(),

  // Administrative
  featured: z.boolean().default(false),
  status: z.enum(['active', 'cancelled', 'postponed', 'completed']).default('active'),
  sourceUrl: z.string().url().optional(),
  dataSource: z.string().default('manual'),
});

const updateEventSchema = createEventSchema.partial();

/**
 * Helper function to generate event slug
 */
function generateSlug(eventName: string, city: string, year: number): string {
  const baseSlug = eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  return `${baseSlug}-${citySlug}-${year}`;
}

/**
 * Helper function to parse date range bounds
 */
function parseDateBounds(dateFrom?: string, dateTo?: string) {
  const bounds: { dateFrom?: Date; dateTo?: Date } = {};

  if (dateFrom) {
    bounds.dateFrom = new Date(dateFrom);
  }

  if (dateTo) {
    bounds.dateTo = new Date(dateTo);
  }

  return bounds;
}

/**
 * GET /api/events
 * Search and filter events with pagination
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const params = eventSearchSchema.parse(req.query);

    // Build WHERE conditions
    const conditions: any[] = [];

    // City filter
    if (params.city) {
      conditions.push(eq(carShowEvents.city, params.city));
    }

    // State filter
    if (params.state) {
      conditions.push(eq(carShowEvents.state, params.state));
    }

    // Country filter
    if (params.country) {
      conditions.push(eq(carShowEvents.country, params.country));
    }

    // Event type filter (comma-separated values)
    if (params.eventType) {
      const types = params.eventType.split(',').map(t => t.trim());
      conditions.push(inArray(carShowEvents.eventType, types));
    }

    // Event category filter (support both 'category' and 'eventCategory')
    const categoryParam = params.category || params.eventCategory;
    if (categoryParam) {
      conditions.push(eq(carShowEvents.eventCategory, categoryParam));
    }

    // Featured filter
    if (params.featured !== undefined) {
      conditions.push(eq(carShowEvents.featured, params.featured));
    }

    // Date range filters
    const dateBounds = parseDateBounds(params.dateFrom, params.dateTo);
    if (dateBounds.dateFrom) {
      conditions.push(gte(carShowEvents.startDate, dateBounds.dateFrom));
    }
    if (dateBounds.dateTo) {
      conditions.push(lte(carShowEvents.startDate, dateBounds.dateTo));
    }

    // Full-text search (search in event name and description)
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          like(carShowEvents.eventName, searchTerm),
          like(carShowEvents.description, searchTerm),
          like(carShowEvents.city, searchTerm),
          like(carShowEvents.organizerName, searchTerm)
        )
      );
    }

    // Combine all conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(carShowEvents)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / params.limit);

    // Determine sort column
    let sortColumn;
    switch (params.sortBy) {
      case 'start_date':
        sortColumn = carShowEvents.startDate;
        break;
      case 'event_name':
        sortColumn = carShowEvents.eventName;
        break;
      default:
        sortColumn = carShowEvents.createdAt;
    }

    // Build ORDER BY
    const orderBy = params.sortOrder === 'asc'
      ? asc(sortColumn)
      : desc(sortColumn);

    // Execute query with pagination
    const events = await db
      .select()
      .from(carShowEvents)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    // Format response to match spec
    const formattedEvents = events.map(event => ({
      id: event.id,
      eventName: event.eventName,
      startDate: event.startDate,
      endDate: event.endDate,
      city: event.city,
      state: event.state,
      country: event.country,
      venueName: event.venueName,
      eventType: event.eventType,
      eventCategory: event.eventCategory,
      entryFeeSpectator: event.entryFeeSpectator,
      expectedAttendanceMin: event.expectedAttendanceMin,
      expectedAttendanceMax: event.expectedAttendanceMax,
      imageUrl: event.imageUrl,
      featured: event.featured,
      // Note: latitude/longitude not in schema - would need migration
    }));

    // Return paginated results
    return res.status(200).json({
      success: true,
      data: {
        events: formattedEvents
      },
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages
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

    console.error('Event search error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to search events'
      }
    });
  }
});

/**
 * GET /api/events/map
 * Get events with geolocation for map view (minimal data)
 */
router.get('/map', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const params = mapViewSchema.parse(req.query);

    // Build WHERE conditions
    const conditions: any[] = [];

    // Geographic bounds filter
    // NOTE: This requires latitude/longitude fields in schema
    // Currently not implemented in carShowEvents table
    if (params.bounds) {
      const [swLat, swLng, neLat, neLng] = params.bounds.split(',').map(Number);

      // TODO: Add when latitude/longitude are added to schema
      // conditions.push(gte(carShowEvents.latitude, swLat));
      // conditions.push(lte(carShowEvents.latitude, neLat));
      // conditions.push(gte(carShowEvents.longitude, swLng));
      // conditions.push(lte(carShowEvents.longitude, neLng));
    }

    // Event type filter
    if (params.eventType) {
      conditions.push(eq(carShowEvents.eventType, params.eventType));
    }

    // Date range filters
    const dateBounds = parseDateBounds(params.dateFrom, params.dateTo);
    if (dateBounds.dateFrom) {
      conditions.push(gte(carShowEvents.startDate, dateBounds.dateFrom));
    }
    if (dateBounds.dateTo) {
      conditions.push(lte(carShowEvents.startDate, dateBounds.dateTo));
    }

    // Only show active events on map
    conditions.push(eq(carShowEvents.status, 'active'));

    // Combine all conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute query - return minimal data for map markers
    const events = await db
      .select({
        id: carShowEvents.id,
        eventName: carShowEvents.eventName,
        startDate: carShowEvents.startDate,
        eventType: carShowEvents.eventType,
        eventCategory: carShowEvents.eventCategory,
        city: carShowEvents.city,
        state: carShowEvents.state,
        // Note: Would include latitude/longitude here when added to schema
      })
      .from(carShowEvents)
      .where(whereClause)
      .orderBy(asc(carShowEvents.startDate));

    return res.status(200).json({
      success: true,
      data: {
        events: events.map(event => ({
          id: event.id,
          eventName: event.eventName,
          startDate: event.startDate,
          eventType: event.eventType,
          eventCategory: event.eventCategory,
          city: event.city,
          state: event.state,
          // TODO: Add when schema is updated
          // latitude: event.latitude,
          // longitude: event.longitude,
        }))
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

    console.error('Map view error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch map data'
      }
    });
  }
});

/**
 * GET /api/events/upcoming
 * Get upcoming events (start_date >= today)
 */
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const params = upcomingEventsSchema.parse(req.query);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await db
      .select()
      .from(carShowEvents)
      .where(
        and(
          gte(carShowEvents.startDate, today),
          eq(carShowEvents.status, 'active')
        )
      )
      .orderBy(asc(carShowEvents.startDate))
      .limit(params.limit);

    return res.status(200).json({
      success: true,
      data: {
        events: events.map(event => ({
          id: event.id,
          eventName: event.eventName,
          eventSlug: event.eventSlug,
          startDate: event.startDate,
          endDate: event.endDate,
          city: event.city,
          state: event.state,
          venueName: event.venueName,
          eventType: event.eventType,
          eventCategory: event.eventCategory,
          imageUrl: event.imageUrl,
          featured: event.featured,
        }))
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

    console.error('Upcoming events error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch upcoming events'
      }
    });
  }
});

/**
 * GET /api/events/:id
 * Get detailed event information
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid event ID'
        }
      });
    }

    const event = await db.query.carShowEvents.findFirst({
      where: eq(carShowEvents.id, eventId)
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

    // Find matching cars based on event's vehicle focus
    let matchingCars: any[] = [];

    if (event.vehicleMakes || event.vehicleModels) {
      const carConditions: any[] = [];

      // Parse vehicle makes (stored as JSON string)
      if (event.vehicleMakes) {
        try {
          const makes = JSON.parse(event.vehicleMakes);
          if (Array.isArray(makes) && makes.length > 0) {
            carConditions.push(inArray(carsForSale.make, makes));
          }
        } catch (e) {
          console.error('Error parsing vehicleMakes:', e);
        }
      }

      // Parse vehicle models (stored as JSON string)
      if (event.vehicleModels) {
        try {
          const models = JSON.parse(event.vehicleModels);
          if (Array.isArray(models) && models.length > 0) {
            carConditions.push(inArray(carsForSale.model, models));
          }
        } catch (e) {
          console.error('Error parsing vehicleModels:', e);
        }
      }

      if (carConditions.length > 0) {
        matchingCars = await db
          .select({
            id: carsForSale.id,
            make: carsForSale.make,
            model: carsForSale.model,
            year: carsForSale.year,
            price: carsForSale.price,
            imageUrl: carsForSale.imageUrl,
            locationCity: carsForSale.locationCity,
            locationState: carsForSale.locationState,
          })
          .from(carsForSale)
          .where(or(...carConditions))
          .limit(10);
      }
    }

    // Find nearby events (same state, within 30 days)
    const eventDate = new Date(event.startDate);
    const dateRangeStart = new Date(eventDate);
    dateRangeStart.setDate(dateRangeStart.getDate() - 30);
    const dateRangeEnd = new Date(eventDate);
    dateRangeEnd.setDate(dateRangeEnd.getDate() + 30);

    const nearbyEvents = await db
      .select({
        id: carShowEvents.id,
        eventName: carShowEvents.eventName,
        eventSlug: carShowEvents.eventSlug,
        startDate: carShowEvents.startDate,
        city: carShowEvents.city,
        state: carShowEvents.state,
        eventType: carShowEvents.eventType,
        imageUrl: carShowEvents.imageUrl,
      })
      .from(carShowEvents)
      .where(
        and(
          eq(carShowEvents.state, event.state),
          gte(carShowEvents.startDate, dateRangeStart),
          lte(carShowEvents.startDate, dateRangeEnd),
          sql`${carShowEvents.id} != ${eventId}`,
          eq(carShowEvents.status, 'active')
        )
      )
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        event,
        matchingCars,
        nearbyEvents
      }
    });

  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get event details'
      }
    });
  }
});

/**
 * GET /api/events/:id/nearby-cars
 * Get cars near event location (legacy endpoint for backward compatibility)
 */
router.get('/:id/nearby-cars', async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id, 10);

  if (isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid event ID'
      }
    });
  }

  try {
    const event = await getCarShowEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    if (!event.state) {
      return res.json({
        success: true,
        data: { cars: [] }
      });
    }

    const nearbyCars = await getCarsByState(event.state);
    return res.json({
      success: true,
      data: { cars: nearbyCars }
    });
  } catch (error) {
    console.error('Error fetching nearby cars:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch nearby cars'
      }
    });
  }
});

/**
 * POST /api/events
 * Create new event (admin only)
 */
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = createEventSchema.parse(req.body);

    // Generate slug if not provided
    const startDate = new Date(validatedData.startDate);
    const eventSlug = validatedData.eventSlug || generateSlug(
      validatedData.eventName,
      validatedData.city,
      startDate.getFullYear()
    );

    // Set venue to venueName if not provided
    const venue = validatedData.venue || validatedData.venueName || validatedData.city;

    const [newEvent] = await db.insert(carShowEvents).values({
      ...validatedData,
      eventSlug,
      venue,
      startDate: new Date(validatedData.startDate),
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      registrationDeadline: validatedData.registrationDeadline
        ? new Date(validatedData.registrationDeadline)
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return res.status(201).json({
      success: true,
      data: { event: newEvent }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid event data',
          details: error.errors
        }
      });
    }

    console.error('Create event error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create event'
      }
    });
  }
});

/**
 * PUT /api/events/:id
 * Update event (admin only)
 */
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid event ID'
        }
      });
    }

    const validatedData = updateEventSchema.parse(req.body);

    // Prepare update data with proper date conversions
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Convert date strings to Date objects if present
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }
    if (validatedData.registrationDeadline) {
      updateData.registrationDeadline = new Date(validatedData.registrationDeadline);
    }

    const [updatedEvent] = await db
      .update(carShowEvents)
      .set(updateData)
      .where(eq(carShowEvents.id, eventId))
      .returning();

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: { event: updatedEvent }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid event data',
          details: error.errors
        }
      });
    }

    console.error('Update event error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update event'
      }
    });
  }
});

/**
 * DELETE /api/events/:id
 * Soft delete event (admin only) - set status to 'cancelled'
 */
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid event ID'
        }
      });
    }

    // Soft delete - set status to 'cancelled' (schema doesn't have 'archived' status)
    const [deletedEvent] = await db
      .update(carShowEvents)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(carShowEvents.id, eventId))
      .returning();

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event archived successfully',
      data: { event: deletedEvent }
    });

  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete event'
      }
    });
  }
});

export default router;
