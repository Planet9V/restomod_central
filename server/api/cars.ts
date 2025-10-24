import { Router } from 'express';
import { getGatewayVehicles } from '@server/storage';
import { db } from '@server/db';
import { carsForSale } from '@shared/schema';

const carsRouter = Router();

carsRouter.get('/', async (req, res) => {
  const { make, category, priceMin, priceMax, year, search } = req.query;

  const filters = {
    make: make as string | undefined,
    category: category as string | undefined,
    priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
    priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
    year: year ? parseInt(year as string, 10) : undefined,
    search: search as string | undefined,
  };

  try {
    const vehicleList = await getGatewayVehicles(filters);
    res.json(vehicleList);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

/**
 * POST /api/cars/import
 * Bulk import vehicles from external scraper
 *
 * Request body:
 * {
 *   vehicles: Array<{
 *     make: string,
 *     model: string,
 *     year: number,
 *     price?: string,
 *     sourceType: 'import' | 'research' | 'gateway',
 *     sourceName: string,
 *     stockNumber?: string,
 *     locationCity?: string,
 *     locationState?: string,
 *     // ... other optional fields
 *   }>
 * }
 */
carsRouter.post('/import', async (req, res) => {
  try {
    const { vehicles, apiKey } = req.body;

    // Simple API key authentication (in production, use proper auth)
    const expectedApiKey = process.env.SCRAPER_API_KEY || 'dev-key-replace-in-production';
    if (apiKey !== expectedApiKey) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }

    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({ error: 'Invalid request: vehicles array required' });
    }

    const imported: any[] = [];
    const skipped: any[] = [];
    const errors: any[] = [];

    for (const vehicle of vehicles) {
      try {
        // Validate required fields
        if (!vehicle.make || !vehicle.model || !vehicle.year) {
          skipped.push({
            vehicle,
            reason: 'Missing required fields: make, model, or year'
          });
          continue;
        }

        // Check for duplicate stock number
        if (vehicle.stockNumber) {
          const existing = await db.query.carsForSale.findFirst({
            where: (cars, { eq }) => eq(cars.stockNumber, vehicle.stockNumber)
          });

          if (existing) {
            skipped.push({
              vehicle,
              reason: `Duplicate stock number: ${vehicle.stockNumber}`
            });
            continue;
          }
        }

        // Insert vehicle
        const result = await db.insert(carsForSale).values({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          sourceType: vehicle.sourceType || 'import',
          sourceName: vehicle.sourceName || 'External scraper import',
          locationCity: vehicle.locationCity,
          locationState: vehicle.locationState,
          locationRegion: vehicle.locationRegion,
          category: vehicle.category,
          condition: vehicle.condition,
          mileage: vehicle.mileage,
          exteriorColor: vehicle.exteriorColor,
          interiorColor: vehicle.interiorColor,
          engine: vehicle.engine,
          transmission: vehicle.transmission,
          investmentGrade: vehicle.investmentGrade,
          appreciationRate: vehicle.appreciationRate,
          marketTrend: vehicle.marketTrend,
          valuationConfidence: vehicle.valuationConfidence,
          imageUrl: vehicle.imageUrl,
          description: vehicle.description,
          features: vehicle.features ? JSON.stringify(vehicle.features) : null,
          stockNumber: vehicle.stockNumber,
          vin: vehicle.vin,
          researchNotes: vehicle.researchNotes,
          marketData: vehicle.marketData ? JSON.stringify(vehicle.marketData) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();

        imported.push(result[0]);
      } catch (err: any) {
        errors.push({
          vehicle,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      summary: {
        total: vehicles.length,
        imported: imported.length,
        skipped: skipped.length,
        errors: errors.length
      },
      imported,
      skipped,
      errors
    });
  } catch (error: any) {
    console.error('Error importing vehicles:', error);
    res.status(500).json({ error: 'Failed to import vehicles', details: error.message });
  }
});

export default carsRouter;
