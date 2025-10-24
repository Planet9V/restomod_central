/**
 * Phase 2 Task 2.6: Price Trends API
 * Endpoints for accessing price history and appreciation data
 */

import { Router, Request, Response } from 'express';
import { priceTrendService } from '../services/priceTrendService';

const router = Router();

/**
 * GET /api/price-trends/:vehicleId
 * Get appreciation data for a specific vehicle
 * Query params: timeframe (months, default 12)
 */
router.get('/:vehicleId', async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId);
    const timeframe = parseInt(req.query.timeframe as string) || 12;

    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }

    const trends = await priceTrendService.calculateAppreciation(vehicleId, timeframe);

    if (!trends) {
      return res.status(404).json({
        error: 'Insufficient price history data',
        message: 'Need at least 2 price data points to calculate trends'
      });
    }

    res.json(trends);
  } catch (error) {
    console.error('Error in /price-trends/:vehicleId:', error);
    res.status(500).json({ error: 'Failed to fetch price trends' });
  }
});

/**
 * GET /api/price-trends/make-model/:make/:model
 * Get price trend history for a specific make/model combination
 */
router.get('/make-model/:make/:model', async (req: Request, res: Response) => {
  try {
    const { make, model } = req.params;

    if (!make || !model) {
      return res.status(400).json({ error: 'Make and model are required' });
    }

    const trends = await priceTrendService.calculateMakeModelTrends(make, model);

    if (trends.length === 0) {
      return res.status(404).json({
        error: 'No price history found',
        message: `No price data available for ${make} ${model}`
      });
    }

    res.json({
      make,
      model,
      dataPoints: trends.length,
      history: trends
    });
  } catch (error) {
    console.error('Error in /price-trends/make-model:', error);
    res.status(500).json({ error: 'Failed to fetch make-model trends' });
  }
});

/**
 * GET /api/price-trends/recent
 * Get recent price changes across all vehicles
 * Query params: limit (default 20)
 */
router.get('/recent/changes', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const changes = await priceTrendService.getRecentPriceChanges(limit);

    res.json({
      count: changes.length,
      changes
    });
  } catch (error) {
    console.error('Error in /price-trends/recent:', error);
    res.status(500).json({ error: 'Failed to fetch recent price changes' });
  }
});

export default router;
