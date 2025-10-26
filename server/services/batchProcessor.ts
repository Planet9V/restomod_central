// ⚠️ DEVELOPMENT ENVIRONMENT
// Batch Processing Pipeline for Scraped Data
// Stages: Collection → Validation → Processing → Import

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { z } from 'zod';
import { getMultiToolScraper, type ScrapeQuery } from './multiToolScraper.js';

// =====================================
// Validation Schemas
// =====================================

const VehicleDataSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  description: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(2030).optional(),
  price: z.number().positive().optional(),
  location: z.string().optional(),
  imageUrl: z.string().url().optional(),
  content: z.string().optional(),
  source: z.string(),
  scrapedAt: z.string().datetime()
});

const EventDataSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  venue: z.string().optional(),
  imageUrl: z.string().url().optional(),
  content: z.string().optional(),
  source: z.string(),
  scrapedAt: z.string().datetime()
});

const ArticleDataSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  publishedDate: z.string().optional(),
  imageUrl: z.string().url().optional(),
  content: z.string().optional(),
  source: z.string(),
  scrapedAt: z.string().datetime()
});

// =====================================
// Types
// =====================================

export type DataType = 'vehicle' | 'event' | 'article';

export interface BatchJob {
  id: string;
  queries: ScrapeQuery[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  results?: BatchResult;
  error?: string;
}

export interface BatchResult {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  totalResults: number;
  validResults: number;
  invalidResults: number;
  duplicates: number;
  imported: number;
  processingTime: number;
  files: {
    raw: string;
    validated: string;
    processed: string;
  };
}

// =====================================
// Batch Processor Class
// =====================================

export class BatchProcessor {
  private dataDir: string;
  private jobs: Map<string, BatchJob> = new Map();
  private seenHashes: Set<string> = new Set();

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
  }

  /**
   * Initialize data directories
   */
  async initialize(): Promise<void> {
    const dirs = [
      path.join(this.dataDir, 'raw'),
      path.join(this.dataDir, 'validated'),
      path.join(this.dataDir, 'processed'),
      path.join(this.dataDir, 'imported'),
      path.join(this.dataDir, 'failed')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }

    console.log('📁 Batch processor data directories initialized');
  }

  /**
   * Create and run a batch job
   */
  async runBatchJob(queries: ScrapeQuery[]): Promise<BatchResult> {
    const jobId = this.generateJobId();
    const startTime = Date.now();

    const job: BatchJob = {
      id: jobId,
      queries,
      status: 'pending',
    };

    this.jobs.set(jobId, job);

    console.log(`📦 Starting batch job ${jobId} with ${queries.length} queries`);

    try {
      job.status = 'running';
      job.startedAt = new Date().toISOString();

      // Stage 1: Collection
      console.log('🔍 Stage 1: Collection - Running queries...');
      const collectionResults = await this.stageCollection(queries);

      // Stage 2: Validation
      console.log('✅ Stage 2: Validation - Validating data...');
      const validationResults = await this.stageValidation(collectionResults);

      // Stage 3: Processing (Deduplication & Enrichment)
      console.log('⚙️  Stage 3: Processing - Deduplicating and enriching...');
      const processingResults = await this.stageProcessing(validationResults);

      // Stage 4: Save results
      console.log('💾 Stage 4: Saving processed data...');
      const savedFiles = await this.saveResults(jobId, {
        raw: collectionResults,
        validated: validationResults,
        processed: processingResults
      });

      const processingTime = Date.now() - startTime;

      const result: BatchResult = {
        totalQueries: queries.length,
        successfulQueries: collectionResults.successful,
        failedQueries: collectionResults.failed,
        totalResults: collectionResults.data.length,
        validResults: validationResults.valid.length,
        invalidResults: validationResults.invalid.length,
        duplicates: processingResults.duplicates,
        imported: 0, // Will be set by import stage
        processingTime,
        files: savedFiles
      };

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.results = result;

      console.log(`✅ Batch job ${jobId} completed in ${processingTime}ms`);
      console.log(`   Collected: ${result.totalResults} | Valid: ${result.validResults} | Duplicates: ${result.duplicates}`);

      return result;
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date().toISOString();

      console.error(`❌ Batch job ${jobId} failed:`, error);
      throw error;
    }
  }

  /**
   * Stage 1: Collection - Scrape data from all sources
   */
  private async stageCollection(queries: ScrapeQuery[]): Promise<{
    successful: number;
    failed: number;
    data: any[];
  }> {
    const scraper = getMultiToolScraper();
    const allResults: any[] = [];
    let successful = 0;
    let failed = 0;

    for (const query of queries) {
      try {
        const result = await scraper.scrapeWithFallback(query);

        if (result.success && result.data.length > 0) {
          allResults.push(...result.data);
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to scrape query: ${query.query}`, error);
        failed++;
      }
    }

    return { successful, failed, data: allResults };
  }

  /**
   * Stage 2: Validation - Validate data against schemas
   */
  private async stageValidation(collectionResults: {
    data: any[];
  }): Promise<{
    valid: any[];
    invalid: any[];
  }> {
    const valid: any[] = [];
    const invalid: any[] = [];

    for (const item of collectionResults.data) {
      try {
        const validatedItem = this.validateItem(item);
        valid.push(validatedItem);
      } catch (error: any) {
        invalid.push({
          ...item,
          validationError: error.message
        });
      }
    }

    return { valid, invalid };
  }

  /**
   * Validate a single item based on its type
   */
  private validateItem(item: any): any {
    const type = item.type || 'article';

    switch (type) {
      case 'vehicle':
        return VehicleDataSchema.parse(item);
      case 'event':
        return EventDataSchema.parse(item);
      case 'article':
        return ArticleDataSchema.parse(item);
      default:
        // Try to infer type and validate
        if (item.make || item.model || item.year) {
          return VehicleDataSchema.parse({ ...item, type: 'vehicle' });
        } else if (item.date || item.venue) {
          return EventDataSchema.parse({ ...item, type: 'event' });
        } else {
          return ArticleDataSchema.parse({ ...item, type: 'article' });
        }
    }
  }

  /**
   * Stage 3: Processing - Deduplicate and enrich data
   */
  private async stageProcessing(validationResults: {
    valid: any[];
  }): Promise<{
    deduplicated: any[];
    duplicates: number;
  }> {
    const deduplicated: any[] = [];
    let duplicates = 0;

    for (const item of validationResults.valid) {
      const hash = this.generateHash(item);

      if (this.seenHashes.has(hash)) {
        duplicates++;
        continue;
      }

      this.seenHashes.add(hash);

      // Enrich data
      const enriched = await this.enrichItem(item);
      deduplicated.push(enriched);
    }

    return { deduplicated, duplicates };
  }

  /**
   * Generate hash for deduplication
   */
  private generateHash(item: any): string {
    const hashInput = `${item.title}|${item.url}|${item.type}`;
    return createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Enrich item with additional data
   */
  private async enrichItem(item: any): Promise<any> {
    const enriched = { ...item };

    // Add unique ID
    enriched.id = this.generateJobId();

    // Add processing metadata
    enriched.processedAt = new Date().toISOString();

    // Type-specific enrichment
    if (item.type === 'vehicle') {
      // Calculate investment grade (placeholder - implement actual logic)
      enriched.investmentGrade = this.calculateInvestmentGrade(item);

      // Extract make/model if not present
      if (!enriched.make || !enriched.model) {
        const extracted = this.extractMakeModel(item.title);
        enriched.make = enriched.make || extracted.make;
        enriched.model = enriched.model || extracted.model;
      }

      // Extract year if not present
      if (!enriched.year) {
        enriched.year = this.extractYear(item.title);
      }
    }

    if (item.type === 'event') {
      // Parse date if present
      if (enriched.date && typeof enriched.date === 'string') {
        try {
          enriched.parsedDate = new Date(enriched.date).toISOString();
        } catch (e) {
          // Keep original date string
        }
      }
    }

    return enriched;
  }

  /**
   * Calculate investment grade for vehicles
   */
  private calculateInvestmentGrade(vehicle: any): string {
    // Simple placeholder logic - replace with actual calculation from routes.ts
    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

    // Score based on available data
    let score = 50;

    if (vehicle.year && vehicle.year < 1970) score += 20;
    if (vehicle.year && vehicle.year >= 1970 && vehicle.year < 1990) score += 10;
    if (vehicle.price && vehicle.price > 50000) score += 15;
    if (vehicle.price && vehicle.price < 20000) score -= 10;

    // Map score to grade
    const index = Math.floor((100 - score) / 10);
    return grades[Math.min(index, grades.length - 1)];
  }

  /**
   * Extract make and model from title
   */
  private extractMakeModel(title: string): { make?: string; model?: string } {
    const makes = [
      'Ford', 'Chevrolet', 'Chevy', 'Dodge', 'Plymouth', 'Pontiac',
      'Oldsmobile', 'Buick', 'Cadillac', 'Mercury', 'Lincoln',
      'Porsche', 'Ferrari', 'Lamborghini', 'Corvette', 'Mustang',
      'Camaro', 'Challenger', 'Charger', 'GTO'
    ];

    const lowerTitle = title.toLowerCase();

    for (const make of makes) {
      if (lowerTitle.includes(make.toLowerCase())) {
        // Try to extract model (words after make)
        const regex = new RegExp(`${make}\\s+(\\w+)`, 'i');
        const match = title.match(regex);

        return {
          make: make,
          model: match ? match[1] : undefined
        };
      }
    }

    return {};
  }

  /**
   * Extract year from title
   */
  private extractYear(title: string): number | undefined {
    const yearMatch = title.match(/\b(19\d{2}|20[0-2]\d)\b/);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
    return undefined;
  }

  /**
   * Save results to files
   */
  private async saveResults(
    jobId: string,
    data: {
      raw: any;
      validated: any;
      processed: any;
    }
  ): Promise<{ raw: string; validated: string; processed: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const files = {
      raw: path.join(this.dataDir, 'raw', `${jobId}_${timestamp}_raw.json`),
      validated: path.join(this.dataDir, 'validated', `${jobId}_${timestamp}_validated.json`),
      processed: path.join(this.dataDir, 'processed', `${jobId}_${timestamp}_processed.json`)
    };

    await fs.writeFile(files.raw, JSON.stringify(data.raw, null, 2));
    await fs.writeFile(files.validated, JSON.stringify(data.validated, null, 2));
    await fs.writeFile(files.processed, JSON.stringify(data.processed, null, 2));

    console.log(`💾 Results saved:`);
    console.log(`   Raw: ${files.raw}`);
    console.log(`   Validated: ${files.validated}`);
    console.log(`   Processed: ${files.processed}`);

    return files;
  }

  /**
   * Load processed data from file for import
   */
  async loadProcessedData(filePath: string): Promise<any[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data.deduplicated || [];
  }

  /**
   * Get job status
   */
  getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * List all jobs
   */
  listJobs(): BatchJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Clear deduplication cache
   */
  clearDeduplicationCache(): void {
    this.seenHashes.clear();
    console.log('🧹 Deduplication cache cleared');
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
let processorInstance: BatchProcessor | null = null;

export function getBatchProcessor(): BatchProcessor {
  if (!processorInstance) {
    processorInstance = new BatchProcessor();
    processorInstance.initialize().catch(console.error);
  }
  return processorInstance;
}
