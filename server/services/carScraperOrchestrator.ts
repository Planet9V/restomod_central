/**
 * Car Scraper Orchestrator
 * Coordinates Playwright scraping with database storage
 */

import { BotEvasionBrowser, CarListing } from './playwrightScraper.js';
import { getExtractor, getAllExtractors, SiteExtractor } from './carSiteExtractors.js';
import { db } from '../../db/index.js';
import { gatewayVehicles } from '../../shared/schema.js';

export interface ScrapeJob {
  id: string;
  query: string;
  sites: string[];
  maxListings?: number;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalFound: number;
  totalSaved: number;
  errors: string[];
}

export class CarScraperOrchestrator {
  private browser: BotEvasionBrowser;
  private jobs: Map<string, ScrapeJob> = new Map();

  constructor() {
    this.browser = new BotEvasionBrowser({
      headless: true,
      timeout: 30000
    });
  }

  /**
   * Start a new scraping job
   */
  async startScrapeJob(
    query: string,
    sites: string[] = ['all'],
    maxListings = 50
  ): Promise<ScrapeJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: ScrapeJob = {
      id: jobId,
      query,
      sites,
      maxListings,
      startTime: new Date(),
      status: 'pending',
      totalFound: 0,
      totalSaved: 0,
      errors: []
    };

    this.jobs.set(jobId, job);

    // Run job in background
    this.runJob(job).catch(error => {
      console.error(`Job ${jobId} failed:`, error);
      job.status = 'failed';
      job.errors.push(error.message);
      job.endTime = new Date();
    });

    return job;
  }

  /**
   * Execute a scraping job
   */
  private async runJob(job: ScrapeJob): Promise<void> {
    job.status = 'running';
    console.log(`🚀 Starting scrape job ${job.id}: "${job.query}"`);

    try {
      await this.browser.initialize();

      // Determine which extractors to use
      let extractors: SiteExtractor[];
      if (job.sites.includes('all')) {
        extractors = getAllExtractors();
      } else {
        extractors = job.sites
          .map(site => getExtractor(site))
          .filter(Boolean) as SiteExtractor[];
      }

      console.log(`📋 Using ${extractors.length} extractors: ${extractors.map(e => e.name).join(', ')}`);

      const allListings: Partial<CarListing>[] = [];

      // Scrape from each site
      for (const extractor of extractors) {
        try {
          console.log(`🔍 Scraping ${extractor.name}...`);

          const listings = await this.scrapesite(extractor, job.query, job.maxListings);
          allListings.push(...listings);

          console.log(`✅ Found ${listings.length} listings from ${extractor.name}`);

          // Random delay between sites
          await this.browser.randomDelay(3000, 8000);
        } catch (error: any) {
          console.error(`❌ Error scraping ${extractor.name}:`, error.message);
          job.errors.push(`${extractor.name}: ${error.message}`);
        }
      }

      job.totalFound = allListings.length;
      console.log(`📊 Total listings found: ${job.totalFound}`);

      // Save to database
      const saved = await this.saveToDatabase(allListings, job.id);
      job.totalSaved = saved;

      console.log(`💾 Saved ${saved} listings to database`);

      job.status = 'completed';
      job.endTime = new Date();

      console.log(`✨ Job ${job.id} completed successfully`);
    } catch (error: any) {
      console.error(`❌ Job ${job.id} failed:`, error);
      job.status = 'failed';
      job.errors.push(error.message);
      job.endTime = new Date();
    } finally {
      await this.browser.close();
    }
  }

  /**
   * Scrape a specific site
   */
  private async scrapeSite(
    extractor: SiteExtractor,
    query: string,
    maxListings: number
  ): Promise<Partial<CarListing>[]> {
    const page = await this.browser.createPage();
    const listings: Partial<CarListing>[] = [];

    try {
      const searchUrl = extractor.searchUrl(query, 1);
      console.log(`  → Navigating to: ${searchUrl}`);

      await this.browser.navigateWithRetry(page, searchUrl);

      // Mimic human behavior
      await this.browser.randomMouseMovement(page);
      await this.browser.scrollPage(page);

      // Extract listings from search results
      const searchListings = await extractor.extractListings(page);
      console.log(`  → Extracted ${searchListings.length} listings from search page`);

      // Limit to maxListings
      const limitedListings = searchListings.slice(0, maxListings);

      // Optionally fetch details for each listing (commented out to avoid too many requests)
      // for (const listing of limitedListings) {
      //   if (listing.url) {
      //     try {
      //       const detailPage = await this.browser.createPage();
      //       await this.browser.navigateWithRetry(detailPage, listing.url);
      //       const details = await extractor.extractDetails(detailPage, listing.url);
      //       listings.push({ ...listing, ...details });
      //       await detailPage.close();
      //       await this.browser.randomDelay(2000, 5000);
      //     } catch (error) {
      //       console.warn(`  ⚠️  Could not fetch details for ${listing.url}`);
      //       listings.push(listing);
      //     }
      //   }
      // }

      listings.push(...limitedListings);

    } finally {
      await page.close();
    }

    return listings;
  }

  /**
   * Save listings to database
   */
  private async saveToDatabase(
    listings: Partial<CarListing>[],
    jobId: string
  ): Promise<number> {
    let savedCount = 0;

    for (const listing of listings) {
      try {
        // Skip if missing required fields
        if (!listing.title || !listing.source) {
          continue;
        }

        // Generate stock number
        const stockNumber = `SC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Parse make/model from title if not already set
        if (listing.title && !listing.make) {
          const parts = listing.title.split(' ');
          if (parts.length >= 3 && listing.year) {
            listing.make = parts[1];
            listing.model = parts.slice(2).join(' ');
          }
        }

        await db.insert(gatewayVehicles).values({
          stockNumber,
          year: listing.year || 1970,
          make: listing.make || 'Unknown',
          model: listing.model || listing.title,
          price: listing.priceText || '$0',
          description: listing.description || listing.title,
          imageUrl: listing.images?.[0] || null,
          galleryImages: listing.images ? JSON.stringify(listing.images) : null,
          location: listing.location || 'United States',
          mileage: listing.mileage || null,
          engine: listing.engine || null,
          transmission: listing.transmission || null,
          exterior: listing.exteriorColor || null,
          interior: listing.interiorColor || null,
          vin: listing.vin || null,
          condition: listing.condition || 'Good',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        savedCount++;
      } catch (error: any) {
        // Likely duplicate or constraint error, skip
        console.warn(`  ⚠️  Could not save listing: ${error.message}`);
      }
    }

    return savedCount;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ScrapeJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ScrapeJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Quick scrape utility - scrapes and waits for completion
   */
  async quickScrape(
    query: string,
    sites: string[] = ['classiccars'],
    maxListings = 20
  ): Promise<{
    found: number;
    saved: number;
    errors: string[];
  }> {
    const job = await this.startScrapeJob(query, sites, maxListings);

    // Wait for completion (poll every 2 seconds)
    while (job.status === 'pending' || job.status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      found: job.totalFound,
      saved: job.totalSaved,
      errors: job.errors
    };
  }
}

// Singleton instance
let scraperInstance: CarScraperOrchestrator | null = null;

export function getCarScraper(): CarScraperOrchestrator {
  if (!scraperInstance) {
    scraperInstance = new CarScraperOrchestrator();
  }
  return scraperInstance;
}
