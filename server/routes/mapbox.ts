/**
 * Mapbox API Routes
 *
 * Provides geocoding, directions, and map services to the frontend.
 * Acts as a proxy to Mapbox services with server-side API key protection.
 */

import { Router } from 'express';
import {
  geocodeAddress,
  reverseGeocode,
  getDirections,
  getTravelTimeMatrix,
  generateIsochrone,
  isConfigured,
  type Coordinates,
  type GeocodeResult,
  type Route,
  type TravelTimeMatrix,
  type Isochrone,
} from '../services/geospatial/mapboxService';

const router = Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Check if Mapbox is configured
 */
function requireMapbox(req: any, res: any, next: any) {
  if (!isConfigured()) {
    return res.status(503).json({
      error: 'Mapbox service unavailable',
      message: 'Mapbox is not configured. Contact administrator.',
    });
  }
  next();
}

// ============================================================================
// GEOCODING ROUTES
// ============================================================================

/**
 * GET /api/mapbox/geocode
 *
 * Geocode address to coordinates
 *
 * Query params:
 * - address: string (required)
 * - country: string (optional, ISO 3166-1 alpha-2 code)
 * - limit: number (optional, max results)
 *
 * @example
 * GET /api/mapbox/geocode?address=Barrett-Jackson,%20Scottsdale,%20AZ&country=US
 */
router.get('/geocode', requireMapbox, async (req, res) => {
  try {
    const { address, country, limit } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        error: 'Missing address parameter',
      });
    }

    const results: GeocodeResult[] = await geocodeAddress(address, {
      country: country as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      error: 'Geocoding failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/mapbox/reverse-geocode
 *
 * Reverse geocode coordinates to address
 *
 * Query params:
 * - lat: number (required)
 * - lng: number (required)
 * - types: string (optional, comma-separated)
 *
 * @example
 * GET /api/mapbox/reverse-geocode?lat=33.4942&lng=-111.9261
 */
router.get('/reverse-geocode', requireMapbox, async (req, res) => {
  try {
    const { lat, lng, types } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing lat or lng parameters',
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
      });
    }

    const results = await reverseGeocode(
      { latitude, longitude },
      {
        types: types ? (types as string).split(',') : undefined,
      }
    );

    res.json({
      results,
      count: results.length,
      address: results[0]?.placeName || null,
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      error: 'Reverse geocoding failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// DIRECTIONS ROUTES
// ============================================================================

/**
 * POST /api/mapbox/directions
 *
 * Get driving directions between two points
 *
 * Body:
 * - origin: { latitude: number, longitude: number }
 * - destination: { latitude: number, longitude: number }
 * - profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling' (optional)
 *
 * @example
 * POST /api/mapbox/directions
 * {
 *   "origin": { "latitude": 34.0522, "longitude": -118.2437 },
 *   "destination": { "latitude": 36.1699, "longitude": -115.1398 },
 *   "profile": "driving-traffic"
 * }
 */
router.post('/directions', requireMapbox, async (req, res) => {
  try {
    const { origin, destination, profile } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Missing origin or destination',
      });
    }

    if (!origin.latitude || !origin.longitude || !destination.latitude || !destination.longitude) {
      return res.status(400).json({
        error: 'Invalid coordinates',
      });
    }

    const route: Route = await getDirections(
      origin as Coordinates,
      destination as Coordinates,
      {
        profile: profile || 'driving-traffic',
        steps: true,
      }
    );

    res.json(route);
  } catch (error) {
    console.error('Directions error:', error);
    res.status(500).json({
      error: 'Failed to get directions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/mapbox/travel-time-matrix
 *
 * Calculate travel times between multiple origins and destinations
 *
 * Body:
 * - sources: Array<{ latitude: number, longitude: number }>
 * - destinations: Array<{ latitude: number, longitude: number }> (optional)
 * - profile: 'driving' | 'walking' | 'cycling' (optional)
 *
 * @example
 * POST /api/mapbox/travel-time-matrix
 * {
 *   "sources": [{ "latitude": 34.0522, "longitude": -118.2437 }],
 *   "destinations": [
 *     { "latitude": 36.1699, "longitude": -115.1398 },
 *     { "latitude": 37.7749, "longitude": -122.4194 }
 *   ],
 *   "profile": "driving"
 * }
 */
router.post('/travel-time-matrix', requireMapbox, async (req, res) => {
  try {
    const { sources, destinations, profile } = req.body;

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return res.status(400).json({
        error: 'Missing or invalid sources',
      });
    }

    const matrix: TravelTimeMatrix = await getTravelTimeMatrix(
      sources as Coordinates[],
      destinations as Coordinates[] | undefined,
      profile || 'driving'
    );

    res.json(matrix);
  } catch (error) {
    console.error('Travel time matrix error:', error);
    res.status(500).json({
      error: 'Failed to calculate travel time matrix',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// ISOCHRONE ROUTES
// ============================================================================

/**
 * POST /api/mapbox/isochrone
 *
 * Generate isochrone (area reachable within time)
 *
 * Body:
 * - center: { latitude: number, longitude: number }
 * - minutes: number
 * - profile: 'driving' | 'walking' | 'cycling' (optional)
 *
 * @example
 * POST /api/mapbox/isochrone
 * {
 *   "center": { "latitude": 34.0522, "longitude": -118.2437 },
 *   "minutes": 60,
 *   "profile": "driving"
 * }
 */
router.post('/isochrone', requireMapbox, async (req, res) => {
  try {
    const { center, minutes, profile } = req.body;

    if (!center || !minutes) {
      return res.status(400).json({
        error: 'Missing center or minutes',
      });
    }

    if (!center.latitude || !center.longitude) {
      return res.status(400).json({
        error: 'Invalid coordinates',
      });
    }

    const isochrone: Isochrone = await generateIsochrone(
      center as Coordinates,
      minutes,
      profile || 'driving'
    );

    res.json(isochrone);
  } catch (error) {
    console.error('Isochrone error:', error);
    res.status(500).json({
      error: 'Failed to generate isochrone',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// BATCH GEOCODING
// ============================================================================

/**
 * POST /api/mapbox/geocode/batch
 *
 * Batch geocode multiple addresses
 *
 * Body:
 * - addresses: string[]
 *
 * @example
 * POST /api/mapbox/geocode/batch
 * {
 *   "addresses": [
 *     "Barrett-Jackson, Scottsdale, AZ",
 *     "Mecum Auctions, Kissimmee, FL"
 *   ]
 * }
 */
router.post('/geocode/batch', requireMapbox, async (req, res) => {
  try {
    const { addresses } = req.body;

    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({
        error: 'Missing or invalid addresses array',
      });
    }

    const results = await Promise.all(
      addresses.map(async (address) => {
        try {
          const geocoded = await geocodeAddress(address, { limit: 1 });
          return {
            address,
            success: true,
            result: geocoded[0] || null,
          };
        } catch (error) {
          return {
            address,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    res.json({
      results,
      total: addresses.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });
  } catch (error) {
    console.error('Batch geocoding error:', error);
    res.status(500).json({
      error: 'Batch geocoding failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/mapbox/health
 *
 * Check Mapbox service status
 */
router.get('/health', (req, res) => {
  res.json({
    configured: isConfigured(),
    status: isConfigured() ? 'ok' : 'not_configured',
    message: isConfigured()
      ? 'Mapbox services are available'
      : 'Mapbox is not configured. Set MAPBOX_ACCESS_TOKEN in .env',
  });
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;
