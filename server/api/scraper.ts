// ⚠️ DEVELOPMENT ENVIRONMENT - API ENDPOINTS FOR SCRAPING
// Scraping API Routes

import { Router } from 'express';
import { getMultiToolScraper, type ScrapeQuery } from '../services/multiToolScraper.js';
import { getBatchProcessor } from '../services/batchProcessor.js';
import { z } from 'zod';

const router = Router();

// Request validation schemas
const ScrapeRequestSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['vehicle', 'event', 'article', 'general']).default('general'),
  maxResults: z.number().int().positive().max(50).default(10),
  filters: z.record(z.any()).optional()
});

const BatchScrapeRequestSchema = z.object({
  queries: z.array(ScrapeRequestSchema).min(1).max(100)
});

/**
 * POST /api/scraper/scrape
 * Single scraping request with fallback chain
 */
router.post('/scrape', async (req, res) => {
  try {
    const validated = ScrapeRequestSchema.parse(req.body);

    console.log(`🔍 Scrape request: ${validated.query} (${validated.type})`);

    const scraper = getMultiToolScraper();
    const query: ScrapeQuery = {
      query: validated.query,
      type: validated.type,
      maxResults: validated.maxResults,
      filters: validated.filters
    };

    const result = await scraper.scrapeWithFallback(query);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'All scraping tools failed',
        metadata: result.metadata
      });
    }

    res.json({
      success: true,
      tool: result.tool,
      data: result.data,
      metadata: result.metadata
    });
  } catch (error: any) {
    console.error('Scrape error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scraper/batch
 * Batch scraping with processing pipeline
 */
router.post('/batch', async (req, res) => {
  try {
    const validated = BatchScrapeRequestSchema.parse(req.body);

    console.log(`📦 Batch scrape request: ${validated.queries.length} queries`);

    const processor = getBatchProcessor();
    const queries: ScrapeQuery[] = validated.queries.map(q => ({
      query: q.query,
      type: q.type,
      maxResults: q.maxResults,
      filters: q.filters
    }));

    const result = await processor.runBatchJob(queries);

    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Batch scrape error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scraper/stats
 * Get scraper statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const scraper = getMultiToolScraper();
    const stats = scraper.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scraper/jobs
 * List all batch jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const processor = getBatchProcessor();
    const jobs = processor.listJobs();

    res.json({
      success: true,
      jobs
    });
  } catch (error: any) {
    console.error('List jobs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scraper/jobs/:jobId
 * Get specific job status
 */
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const processor = getBatchProcessor();
    const job = processor.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error: any) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scraper/clear-cache
 * Clear deduplication cache
 */
router.post('/clear-cache', async (req, res) => {
  try {
    const processor = getBatchProcessor();
    processor.clearDeduplicationCache();

    res.json({
      success: true,
      message: 'Deduplication cache cleared'
    });
  } catch (error: any) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
