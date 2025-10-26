/**
 * API endpoints for Playwright-based car scraping
 */

import { Router } from 'express';
import { getCarScraper } from '../services/carScraperOrchestrator.js';
import { z } from 'zod';

const router = Router();

// Validation schema
const ScrapeRequestSchema = z.object({
  query: z.string().min(1),
  sites: z.array(z.string()).default(['all']),
  maxListings: z.number().int().positive().max(100).default(20)
});

/**
 * POST /api/playwright-scraper/scrape
 * Start a new scraping job
 */
router.post('/scrape', async (req, res) => {
  try {
    const validated = ScrapeRequestSchema.parse(req.body);

    console.log(`🔍 Starting Playwright scrape: "${validated.query}"`);

    const scraper = getCarScraper();
    const job = await scraper.startScrapeJob(
      validated.query,
      validated.sites,
      validated.maxListings
    );

    res.json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Scraping job started. Use /status/:jobId to check progress.'
    });
  } catch (error: any) {
    console.error('Playwright scrape error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/playwright-scraper/status/:jobId
 * Get job status
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const scraper = getCarScraper();
    const job = scraper.getJobStatus(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job: {
        id: job.id,
        query: job.query,
        sites: job.sites,
        status: job.status,
        totalFound: job.totalFound,
        totalSaved: job.totalSaved,
        startTime: job.startTime,
        endTime: job.endTime,
        errors: job.errors,
        duration: job.endTime ? job.endTime.getTime() - job.startTime.getTime() : null
      }
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/playwright-scraper/jobs
 * Get all jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const scraper = getCarScraper();
    const jobs = scraper.getAllJobs();

    res.json({
      success: true,
      jobs: jobs.map(job => ({
        id: job.id,
        query: job.query,
        sites: job.sites,
        status: job.status,
        totalFound: job.totalFound,
        totalSaved: job.totalSaved,
        startTime: job.startTime,
        endTime: job.endTime
      })),
      total: jobs.length
    });
  } catch (error: any) {
    console.error('Jobs list error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/playwright-scraper/quick-scrape
 * Quick scrape - waits for completion
 */
router.post('/quick-scrape', async (req, res) => {
  try {
    const validated = ScrapeRequestSchema.parse(req.body);

    console.log(`⚡ Quick scrape: "${validated.query}"`);

    const scraper = getCarScraper();
    const result = await scraper.quickScrape(
      validated.query,
      validated.sites,
      validated.maxListings
    );

    res.json({
      success: true,
      query: validated.query,
      sites: validated.sites,
      found: result.found,
      saved: result.saved,
      errors: result.errors
    });
  } catch (error: any) {
    console.error('Quick scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
