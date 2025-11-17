/**
 * VIN Decoder API Endpoints
 *
 * Provides frontend access to NHTSA VIN decoding service
 * for auto-filling car listing forms.
 */

import { Router } from 'express';
import {
  decodeVIN,
  validateVIN,
  batchDecodeVINs,
  enrichCarData,
  type DecodedVehicle,
  type VinValidation,
} from '@server/services/automotive/nhtsaService';

const vinRouter = Router();

/**
 * POST /api/vin/decode
 * Decode a single VIN and return vehicle data
 *
 * Request body:
 * {
 *   "vin": "1G1YY32G965107737",
 *   "modelYear": 1996 // optional
 * }
 */
vinRouter.post('/decode', async (req, res) => {
  try {
    const { vin, modelYear } = req.body;

    if (!vin) {
      return res.status(400).json({
        error: 'VIN is required',
        details: 'Please provide a 17-character VIN'
      });
    }

    // Decode VIN using NHTSA service
    const decoded = await decodeVIN(vin, modelYear);

    // Return decoded data
    res.json({
      success: true,
      data: decoded,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('VIN decode error:', error);
    res.status(500).json({
      error: 'Failed to decode VIN',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vin/validate
 * Validate VIN format without API call (offline check)
 *
 * Request body:
 * {
 *   "vin": "1G1YY32G965107737"
 * }
 */
vinRouter.post('/validate', async (req, res) => {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({
        error: 'VIN is required'
      });
    }

    // Validate VIN (offline check)
    const validation = validateVIN(vin);

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('VIN validation error:', error);
    res.status(500).json({
      error: 'Failed to validate VIN',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vin/batch
 * Decode multiple VINs at once (max 50)
 *
 * Request body:
 * {
 *   "vins": ["1G1YY32G965107737", "7F03Z102345"]
 * }
 */
vinRouter.post('/batch', async (req, res) => {
  try {
    const { vins } = req.body;

    if (!vins || !Array.isArray(vins)) {
      return res.status(400).json({
        error: 'VINs array is required'
      });
    }

    if (vins.length === 0) {
      return res.status(400).json({
        error: 'At least one VIN is required'
      });
    }

    if (vins.length > 50) {
      return res.status(400).json({
        error: 'Maximum 50 VINs allowed per batch'
      });
    }

    // Batch decode VINs
    const decoded = await batchDecodeVINs(vins);

    res.json({
      success: true,
      data: decoded,
      count: decoded.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch VIN decode error:', error);
    res.status(500).json({
      error: 'Failed to decode VINs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/vin/enrich
 * Enrich existing car data with NHTSA information
 *
 * Request body:
 * {
 *   "vin": "1G1YY32G965107737",
 *   "existingData": {
 *     "price": 85000,
 *     "condition": "Excellent"
 *   }
 * }
 */
vinRouter.post('/enrich', async (req, res) => {
  try {
    const { vin, existingData = {} } = req.body;

    if (!vin) {
      return res.status(400).json({
        error: 'VIN is required'
      });
    }

    // Enrich car data
    const enriched = await enrichCarData(vin, existingData);

    res.json({
      success: true,
      data: enriched,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('VIN enrich error:', error);
    res.status(500).json({
      error: 'Failed to enrich car data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default vinRouter;
