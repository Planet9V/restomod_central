/**
 * Cars API Routes - SPEC_02_API_ENDPOINTS.md
 * Advanced car search with filters, pagination, sorting
 *
 * Endpoints:
 * - GET /api/cars - Search cars with advanced filters
 * - GET /api/cars/:id - Get detailed car information
 * - GET /api/cars/featured - Get featured cars
 * - POST /api/cars - Create car (admin only)
 * - PUT /api/cars/:id - Update car (admin only)
 * - DELETE /api/cars/:id - Soft delete car (admin only)
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { carsForSale } from '@shared/schema';
import { eq, and, gte, lte, like, or, sql, desc, asc, inArray } from 'drizzle-orm';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

/**
 * Validation Schemas
 */

const carSearchSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Filters
  make: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.coerce.number().int().min(1900).max(2100).optional(),
  yearMax: z.coerce.number().int().min(1900).max(2100).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),

  // Location filters
  location_state: z.string().optional(),
  location_city: z.string().optional(),
  location_country: z.string().optional(),

  // Vehicle specs
  engine: z.string().optional(),
  transmission: z.string().optional(),
  drive_type: z.string().optional(),
  body_style: z.string().optional(),
  exterior_color: z.string().optional(),
  condition: z.string().optional(),

  // Investment & status
  investmentGrade: z.string().optional(), // Comma-separated: A+,A,A-
  status: z.enum(['active', 'sold', 'pending', 'archived']).default('active'),
  featured: z.coerce.boolean().optional(),

  // Sorting
  sortBy: z.enum(['price', 'year', 'created_at', 'updated_at', 'make', 'model']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Full-text search
  search: z.string().optional(),
});

const createCarSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(2100),
  price: z.number().min(0),
  vin: z.string().optional(),
  stockNumber: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  bodyStyle: z.string().optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  locationCountry: z.string().default('USA'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  imageUrl: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).optional(),
  description: z.string().optional(),
  features: z.record(z.boolean()).optional(),
  modifications: z.array(z.string()).optional(),
  condition: z.string().optional(),
  restorationLevel: z.string().optional(),
  sourceType: z.string().default('manual'),
  sourceName: z.string().default('Admin Import'),
  sourceUrl: z.string().url().optional(),
  status: z.enum(['active', 'sold', 'pending', 'archived']).default('active'),
  featured: z.boolean().default(false),
});

const updateCarSchema = createCarSchema.partial();

/**
 * GET /api/cars
 * Search and filter car listings with pagination
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const params = carSearchSchema.parse(req.query);

    // Build WHERE conditions
    const conditions: any[] = [];

    // Status filter
    if (params.status) {
      conditions.push(eq(carsForSale.status, params.status));
    }

    // Make filter
    if (params.make) {
      conditions.push(eq(carsForSale.make, params.make));
    }

    // Model filter
    if (params.model) {
      conditions.push(eq(carsForSale.model, params.model));
    }

    // Year range
    if (params.yearMin) {
      conditions.push(gte(carsForSale.year, params.yearMin));
    }
    if (params.yearMax) {
      conditions.push(lte(carsForSale.year, params.yearMax));
    }

    // Price range
    if (params.priceMin) {
      conditions.push(gte(carsForSale.price, params.priceMin.toString()));
    }
    if (params.priceMax) {
      conditions.push(lte(carsForSale.price, params.priceMax.toString()));
    }

    // Location filters
    if (params.location_state) {
      conditions.push(eq(carsForSale.locationState, params.location_state));
    }
    if (params.location_city) {
      conditions.push(eq(carsForSale.locationCity, params.location_city));
    }
    if (params.location_country) {
      conditions.push(eq(carsForSale.locationCountry, params.location_country));
    }

    // Vehicle specs
    if (params.engine) {
      conditions.push(like(carsForSale.engine, `%${params.engine}%`));
    }
    if (params.transmission) {
      conditions.push(like(carsForSale.transmission, `%${params.transmission}%`));
    }
    if (params.drive_type) {
      conditions.push(eq(carsForSale.drivetrain, params.drive_type));
    }
    if (params.body_style) {
      conditions.push(eq(carsForSale.bodyStyle, params.body_style));
    }
    if (params.exterior_color) {
      conditions.push(like(carsForSale.exteriorColor, `%${params.exterior_color}%`));
    }
    if (params.condition) {
      conditions.push(eq(carsForSale.condition, params.condition));
    }

    // Featured filter
    if (params.featured !== undefined) {
      conditions.push(eq(carsForSale.featured, params.featured));
    }

    // Investment grade filter (comma-separated values)
    if (params.investmentGrade) {
      const grades = params.investmentGrade.split(',').map(g => g.trim());
      conditions.push(inArray(carsForSale.investmentGrade, grades));
    }

    // Full-text search (search in make, model, description)
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          like(carsForSale.make, searchTerm),
          like(carsForSale.model, searchTerm),
          like(carsForSale.description, searchTerm),
          like(carsForSale.vin, searchTerm)
        )
      );
    }

    // Combine all conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(carsForSale)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / params.limit);

    // Determine sort column
    let sortColumn;
    switch (params.sortBy) {
      case 'price':
        sortColumn = carsForSale.price;
        break;
      case 'year':
        sortColumn = carsForSale.year;
        break;
      case 'make':
        sortColumn = carsForSale.make;
        break;
      case 'model':
        sortColumn = carsForSale.model;
        break;
      case 'updated_at':
        sortColumn = carsForSale.updatedAt;
        break;
      default:
        sortColumn = carsForSale.createdAt;
    }

    // Build ORDER BY
    const orderBy = params.sortOrder === 'asc'
      ? asc(sortColumn)
      : desc(sortColumn);

    // Execute query with pagination
    const cars = await db
      .select()
      .from(carsForSale)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);

    // Return paginated results
    return res.status(200).json({
      success: true,
      data: {
        cars: cars.map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          imageUrl: car.imageUrl,
          locationCity: car.locationCity,
          locationState: car.locationState,
          locationCountry: car.locationCountry,
          investmentGrade: car.investmentGrade,
          appreciationRate: car.appreciationRate,
          featured: car.featured,
          status: car.status,
          condition: car.condition,
          mileage: car.mileage,
          exteriorColor: car.exteriorColor,
          engine: car.engine,
          transmission: car.transmission,
          bodyStyle: car.bodyStyle,
          createdAt: car.createdAt,
        }))
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

    console.error('Car search error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to search cars'
      }
    });
  }
});

/**
 * GET /api/cars/featured
 * Get featured car listings
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const cars = await db
      .select()
      .from(carsForSale)
      .where(and(
        eq(carsForSale.featured, true),
        eq(carsForSale.status, 'active')
      ))
      .orderBy(desc(carsForSale.createdAt))
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: { cars }
    });

  } catch (error) {
    console.error('Featured cars error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch featured cars'
      }
    });
  }
});

/**
 * GET /api/cars/:id
 * Get detailed car information
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const carId = parseInt(req.params.id);

    if (isNaN(carId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid car ID'
        }
      });
    }

    const car = await db.query.carsForSale.findFirst({
      where: eq(carsForSale.id, carId)
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

    // TODO: Add related data:
    // - priceHistory from price_history table
    // - similarCars based on make/model/year
    // - upcomingEvents from car_show_events
    // - viewCount increment (add analytics later)

    return res.status(200).json({
      success: true,
      data: { car }
    });

  } catch (error) {
    console.error('Get car error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get car details'
      }
    });
  }
});

/**
 * POST /api/cars
 * Create new car listing (admin only)
 */
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = createCarSchema.parse(req.body);

    const [newCar] = await db.insert(carsForSale).values({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return res.status(201).json({
      success: true,
      data: { car: newCar }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid car data',
          details: error.errors
        }
      });
    }

    console.error('Create car error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create car'
      }
    });
  }
});

/**
 * PUT /api/cars/:id
 * Update car listing (admin only)
 */
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const carId = parseInt(req.params.id);

    if (isNaN(carId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid car ID'
        }
      });
    }

    const validatedData = updateCarSchema.parse(req.body);

    const [updatedCar] = await db
      .update(carsForSale)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(carsForSale.id, carId))
      .returning();

    if (!updatedCar) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Car not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: { car: updatedCar }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid car data',
          details: error.errors
        }
      });
    }

    console.error('Update car error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update car'
      }
    });
  }
});

/**
 * DELETE /api/cars/:id
 * Soft delete car listing (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const carId = parseInt(req.params.id);

    if (isNaN(carId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid car ID'
        }
      });
    }

    // Soft delete - set status to 'archived'
    const [deletedCar] = await db
      .update(carsForSale)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(carsForSale.id, carId))
      .returning();

    if (!deletedCar) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Car not found'
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Car archived successfully',
      data: { car: deletedCar }
    });

  } catch (error) {
    console.error('Delete car error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete car'
      }
    });
  }
});

export default router;
