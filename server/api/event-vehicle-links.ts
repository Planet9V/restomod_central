/**
 * Phase 5: Event-Vehicle Cross-Linking API
 * Endpoints to connect events and vehicles for optimal user experience
 */

import { Router, Request, Response } from 'express';
import { eventVehicleMatchingService } from '../services/eventVehicleMatchingService';

const router = Router();

/**
 * GET /api/event-vehicle-links/events/:eventId/vehicles
 * Get vehicles that match a specific event
 * Query params:
 *   - limit: number of vehicles to return (default 12)
 */
router.get('/events/:eventId/vehicles', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const limit = parseInt(req.query.limit as string) || 12;

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }

    const matches = await eventVehicleMatchingService.getVehiclesForEvent(eventId, limit);

    res.json({
      success: true,
      total: matches.length,
      vehicles: matches.map(m => ({
        ...m.vehicle,
        matchType: m.matchType,
        matchScore: m.matchScore,
        distance: m.distance
      }))
    });
  } catch (error) {
    console.error('Error fetching vehicles for event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles for event'
    });
  }
});

/**
 * GET /api/event-vehicle-links/vehicles/:vehicleId/events
 * Get events where you might see similar vehicles
 * Query params:
 *   - limit: number of events to return (default 6)
 */
router.get('/vehicles/:vehicleId/events', async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const limit = parseInt(req.query.limit as string) || 6;

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID'
      });
    }

    const matches = await eventVehicleMatchingService.getEventsForVehicle(vehicleId, limit);

    res.json({
      success: true,
      total: matches.length,
      events: matches.map(m => ({
        ...m.event,
        matchType: m.matchType,
        matchScore: m.matchScore,
        daysUntilEvent: m.daysUntilEvent
      }))
    });
  } catch (error) {
    console.error('Error fetching events for vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events for vehicle'
    });
  }
});

/**
 * GET /api/event-vehicle-links/makes/:make/stats
 * Get statistics for a specific make (for hub pages)
 */
router.get('/makes/:make/stats', async (req: Request, res: Response) => {
  try {
    const make = req.params.make;

    if (!make) {
      return res.status(400).json({
        success: false,
        error: 'Make parameter is required'
      });
    }

    const stats = await eventVehicleMatchingService.getMakeStatistics(make);

    res.json({
      success: true,
      make,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching make statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch make statistics'
    });
  }
});

/**
 * GET /api/event-vehicle-links/makes/:make/events
 * Get upcoming events for a specific make (for hub pages)
 */
router.get('/makes/:make/events', async (req: Request, res: Response) => {
  try {
    const make = req.params.make;
    const limit = parseInt(req.query.limit as string) || 6;

    if (!make) {
      return res.status(400).json({
        success: false,
        error: 'Make parameter is required'
      });
    }

    const events = await eventVehicleMatchingService.getEventsForMake(make, limit);

    res.json({
      success: true,
      make,
      total: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching events for make:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events for make'
    });
  }
});

export default router;
