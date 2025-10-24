# Batch Processing & Data Pipeline Architecture

## ⚠️ DEVELOPMENT ENVIRONMENT
**This is a development configuration with hardcoded credentials for rapid testing.**

---

## Overview

Automated data pipeline for collecting, processing, and importing automotive data into PostgreSQL database with robust error handling and monitoring.

---

## Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATA PIPELINE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STAGE 1: Collection                                             │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Multi-Tool Scraper                                 │        │
│  │  - Apify, Brave, Tavily, Perplexity, Jina         │        │
│  │  - Rate limiting & retries                         │        │
│  │  - Proxy rotation                                  │        │
│  └─────────────────┬───────────────────────────────────┘        │
│                    │                                              │
│                    ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Raw JSON Storage                                   │        │
│  │  /data/raw/YYYY-MM-DD/{type}/{tool}_NNN.json      │        │
│  └─────────────────┬───────────────────────────────────┘        │
│                    │                                              │
│  STAGE 2: Validation & Processing                                │
│                    ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Data Validator                                     │        │
│  │  - Schema validation (Zod)                         │        │
│  │  - Required field checks                           │        │
│  │  - Data type verification                          │        │
│  │  - Business rule validation                        │        │
│  └─────────────────┬───────────────────────────────────┘        │
│                    │                                              │
│                    ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Deduplicator                                       │        │
│  │  - Hash-based dedup (SHA-256)                      │        │
│  │  - Similarity detection (Levenshtein)              │        │
│  │  - Cross-source matching                           │        │
│  └─────────────────┬───────────────────────────────────┘        │
│                    │                                              │
│                    ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Data Enricher                                      │        │
│  │  - Investment grade calculation                    │        │
│  │  - Market data addition                            │        │
│  │  - Image optimization                              │        │
│  │  - Geo-coding (lat/lng)                           │        │
│  └─────────────────┬───────────────────────────────────┘        │
│                    │                                              │
│                    ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Processed JSON Storage                             │        │
│  │  /data/processed/YYYY-MM-DD/{type}.json            │        │
│  └─────────────────┬───────────────────────────────────┘        │
│                    │                                              │
│  STAGE 3: Database Import                                        │
│                    ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Batch Importer                                     │        │
│  │  - Chunked inserts (100 records/batch)            │        │
│  │  - Transaction management                          │        │
│  │  - Rollback on errors                              │        │
│  │  - Progress tracking                               │        │
│  └─────────────────┬───────────────────────────────────┘        │
│                    │                                              │
│                    ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  PostgreSQL Database                                │        │
│  │  - Vehicles table                                  │        │
│  │  - Events table                                    │        │
│  │  - Articles table                                  │        │
│  │  - Full-text search indexes                       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                   │
│  STAGE 4: Monitoring & Reporting                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Pipeline Monitor                                   │        │
│  │  - Success/failure rates                           │        │
│  │  - Processing times                                │        │
│  │  - Data quality metrics                            │        │
│  │  - Alert notifications                             │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Batch Processing Schedule

### Automated Cron Jobs

```typescript
// server/services/batch-scheduler.ts

import cron from 'node-cron';

// Daily vehicle scraping: 2 AM PST
cron.schedule('0 2 * * *', async () => {
  console.log('🚗 Starting daily vehicle scraping...');
  await batchScrapingService.scrapeVehicles();
});

// Daily event scraping: 3 AM PST
cron.schedule('0 3 * * *', async () => {
  console.log('📅 Starting daily event scraping...');
  await batchScrapingService.scrapeEvents();
});

// Weekly article scraping: Sunday 4 AM PST
cron.schedule('0 4 * * 0', async () => {
  console.log('📰 Starting weekly article scraping...');
  await batchScrapingService.scrapeArticles();
});

// Hourly data processing: Every hour at :15
cron.schedule('15 * * * *', async () => {
  console.log('⚙️ Processing collected data...');
  await batchProcessingService.processRawData();
});

// Database import: Every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('💾 Importing processed data to PostgreSQL...');
  await batchImportService.importToPostgres();
});

// Cleanup old files: Daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('🧹 Cleaning up old data files...');
  await cleanupService.removeOldFiles();
});
```

### Manual Batch Operations

```bash
# Run vehicle scraping manually
npm run batch:scrape:vehicles

# Run event scraping manually
npm run batch:scrape:events

# Process all raw data
npm run batch:process

# Import processed data to PostgreSQL
npm run batch:import

# Full pipeline (scrape + process + import)
npm run batch:full

# Backfill historical data (with date range)
npm run batch:backfill -- --from=2025-01-01 --to=2025-10-24
```

---

## Data Validation Rules

### Vehicle Validation Schema

```typescript
import { z } from 'zod';

export const vehicleSchema = z.object({
  // Required fields
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),

  // Optional but validated
  price: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
  description: z.string().max(5000).optional(),
  imageUrl: z.string().url().optional(),

  // Location
  locationCity: z.string().max(100).optional(),
  locationState: z.string().length(2).optional(), // US state codes
  locationRegion: z.enum([
    'West', 'South', 'Midwest', 'Northeast',
    'Europe', 'Asia', 'Oceania'
  ]).optional(),

  // Classification
  category: z.enum([
    'Muscle Cars', 'Sports Cars', 'Classic Cars',
    'Hot Rods', 'Restomods', 'Luxury Cars', 'Trucks'
  ]).optional(),

  condition: z.enum([
    'Excellent', 'Very Good', 'Good', 'Fair', 'Project'
  ]).optional(),

  // Source tracking
  sourceName: z.string().max(100),
  sourceUrl: z.string().url(),
  stockNumber: z.string().max(100).optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
```

### Validation Service

```typescript
class DataValidator {
  validateVehicle(data: any): ValidationResult {
    try {
      const validated = vehicleSchema.parse(data);

      // Additional business rules
      const errors: string[] = [];

      // Price should be reasonable
      if (validated.price) {
        const price = parseFloat(validated.price);
        if (price < 1000 || price > 10000000) {
          errors.push(`Price ${price} outside reasonable range`);
        }
      }

      // Year should match classic car criteria
      if (validated.year < 1920) {
        errors.push(`Year ${validated.year} too old for database`);
      }

      return {
        valid: errors.length === 0,
        data: validated,
        errors
      };

    } catch (error) {
      return {
        valid: false,
        errors: [error.message]
      };
    }
  }
}
```

---

## Deduplication Strategy

### Hash-Based Deduplication

```typescript
import crypto from 'crypto';

class Deduplicator {
  // Generate unique hash for vehicle
  generateVehicleHash(vehicle: VehicleInput): string {
    const uniqueFields = [
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.stockNumber || '',
      vehicle.sourceName
    ].join('|').toLowerCase();

    return crypto
      .createHash('sha256')
      .update(uniqueFields)
      .digest('hex');
  }

  // Check if vehicle already exists
  async isDuplicate(vehicle: VehicleInput): Promise<boolean> {
    const hash = this.generateVehicleHash(vehicle);

    // Check in-memory cache first
    if (this.hashCache.has(hash)) {
      return true;
    }

    // Check database
    const existing = await db.query.carsForSale.findFirst({
      where: eq(carsForSale.dataHash, hash)
    });

    if (existing) {
      this.hashCache.add(hash);
      return true;
    }

    return false;
  }

  // Similarity check (for near-duplicates)
  calculateSimilarity(v1: VehicleInput, v2: VehicleInput): number {
    // Levenshtein distance for model names
    const modelSim = this.levenshtein(v1.model, v2.model);

    // Same make/year?
    const makeSame = v1.make === v2.make ? 1 : 0;
    const yearSame = v1.year === v2.year ? 1 : 0;

    // Weighted similarity score
    return (modelSim * 0.5 + makeSame * 0.3 + yearSame * 0.2);
  }

  private levenshtein(s1: string, s2: string): number {
    // Levenshtein distance algorithm
    // Returns 0-1 similarity score
    // Implementation omitted for brevity
    return 0.85; // Example
  }
}
```

---

## Batch Import Service

### Chunked Insert Strategy

```typescript
class BatchImportService {
  private readonly BATCH_SIZE = 100;
  private readonly MAX_RETRIES = 3;

  async importVehicles(jsonFilePath: string): Promise<ImportResult> {
    const vehicles = await this.loadJSON(jsonFilePath);
    const stats = {
      total: vehicles.length,
      imported: 0,
      skipped: 0,
      failed: 0
    };

    // Process in chunks
    for (let i = 0; i < vehicles.length; i += this.BATCH_SIZE) {
      const chunk = vehicles.slice(i, i + this.BATCH_SIZE);

      try {
        await this.importChunk(chunk);
        stats.imported += chunk.length;

        console.log(`Imported ${i + chunk.length}/${vehicles.length} vehicles`);

      } catch (error) {
        console.error(`Failed to import chunk ${i}-${i + chunk.length}:`, error);
        stats.failed += chunk.length;
      }

      // Rate limiting between chunks
      await this.sleep(1000);
    }

    return stats;
  }

  private async importChunk(vehicles: VehicleInput[]): Promise<void> {
    // Use transaction for atomicity
    await db.transaction(async (tx) => {
      for (const vehicle of vehicles) {
        try {
          // Check for duplicates
          const isDupe = await this.deduplicator.isDuplicate(vehicle);
          if (isDupe) {
            continue; // Skip
          }

          // Insert vehicle
          await tx.insert(carsForSale).values({
            ...vehicle,
            dataHash: this.deduplicator.generateVehicleHash(vehicle),
            investmentGrade: this.calculateInvestmentGrade(vehicle),
            createdAt: new Date(),
            updatedAt: new Date()
          });

        } catch (error) {
          // Log but don't fail entire transaction
          console.error(`Failed to insert vehicle:`, error);
          throw error; // Rollback transaction
        }
      }
    });
  }

  private calculateInvestmentGrade(vehicle: VehicleInput): string {
    // Investment grade logic
    const muscleCars = ['Chevelle', 'GTO', 'Challenger', 'Camaro', 'Mustang'];
    const sportsCars = ['Corvette', 'Porsche', 'Ferrari', 'Jaguar'];

    const vehicleName = `${vehicle.make} ${vehicle.model}`;

    if (sportsCars.some(car => vehicleName.includes(car))) return 'A+';
    if (muscleCars.some(car => vehicleName.includes(car))) return 'A';
    if (vehicle.year >= 1950 && vehicle.year <= 1970) return 'A-';

    return 'B+';
  }
}
```

---

## Error Handling & Retry Logic

### Transactional Safety

```typescript
class TransactionalImporter {
  async importWithRetry(data: any[], maxRetries: number = 3): Promise<void> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await db.transaction(async (tx) => {
          // All inserts happen here
          for (const item of data) {
            await tx.insert(table).values(item);
          }
        });

        // Success - break out
        console.log(`✅ Successfully imported ${data.length} records`);
        return;

      } catch (error) {
        attempt++;
        console.error(`❌ Import failed (attempt ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        } else {
          // Final failure - save to failed queue
          await this.saveFailed(data, error);
          throw error;
        }
      }
    }
  }

  private async saveFailed(data: any[], error: Error): Promise<void> {
    const failedPath = `./data/failed/${new Date().toISOString()}.json`;

    await fs.writeFile(failedPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      error: error.message,
      data
    }, null, 2));

    console.log(`💾 Saved failed data to ${failedPath}`);
  }
}
```

---

## Monitoring & Metrics

### Pipeline Dashboard

```typescript
interface PipelineMetrics {
  // Collection metrics
  scraped: {
    total: number;
    byTool: Record<string, number>;
    successRate: number;
    avgResponseTime: number;
  };

  // Processing metrics
  validated: {
    total: number;
    passed: number;
    failed: number;
  };

  // Import metrics
  imported: {
    total: number;
    vehicles: number;
    events: number;
    articles: number;
  };

  // Error tracking
  errors: {
    total: number;
    byType: Record<string, number>;
    byStage: Record<string, number>;
  };
}

class PipelineMonitor {
  private metrics: PipelineMetrics;

  async generateReport(): Promise<string> {
    const report = `
    ═══════════════════════════════════════
    📊 BATCH PROCESSING PIPELINE REPORT
    ═══════════════════════════════════════

    Date: ${new Date().toISOString()}

    🔍 SCRAPING
    ─────────────────────────────────────
    Total Scraped: ${this.metrics.scraped.total}
    Success Rate: ${(this.metrics.scraped.successRate * 100).toFixed(2)}%
    Avg Response: ${this.metrics.scraped.avgResponseTime}ms

    By Tool:
    ${Object.entries(this.metrics.scraped.byTool)
      .map(([tool, count]) => `  - ${tool}: ${count}`)
      .join('\n')}

    ✅ VALIDATION
    ─────────────────────────────────────
    Total Processed: ${this.metrics.validated.total}
    Passed: ${this.metrics.validated.passed}
    Failed: ${this.metrics.validated.failed}
    Pass Rate: ${((this.metrics.validated.passed / this.metrics.validated.total) * 100).toFixed(2)}%

    💾 IMPORT
    ─────────────────────────────────────
    Total Imported: ${this.metrics.imported.total}
    Vehicles: ${this.metrics.imported.vehicles}
    Events: ${this.metrics.imported.events}
    Articles: ${this.metrics.imported.articles}

    ❌ ERRORS
    ─────────────────────────────────────
    Total Errors: ${this.metrics.errors.total}

    By Type:
    ${Object.entries(this.metrics.errors.byType)
      .map(([type, count]) => `  - ${type}: ${count}`)
      .join('\n')}

    ═══════════════════════════════════════
    `;

    return report;
  }
}
```

---

## File System Organization

### Complete Directory Structure

```
/data/
├── raw/                          # Raw scraped data (JSON)
│   ├── 2025-10-24/
│   │   ├── vehicles/
│   │   │   ├── apify_001.json    # 50 records
│   │   │   ├── apify_002.json    # 50 records
│   │   │   ├── brave_001.json    # 30 records
│   │   │   ├── tavily_001.json   # 20 records
│   │   │   └── meta.json         # Scraping metadata
│   │   ├── events/
│   │   │   ├── apify_001.json
│   │   │   └── meta.json
│   │   └── articles/
│   │       ├── perplexity_001.json
│   │       └── meta.json
│   └── 2025-10-25/
│       └── ...
│
├── processed/                    # Validated & enriched data
│   ├── 2025-10-24/
│   │   ├── vehicles.json         # All vehicles combined
│   │   ├── events.json           # All events combined
│   │   ├── articles.json         # All articles combined
│   │   └── processing_report.json
│   └── ...
│
├── failed/                       # Failed records for review
│   ├── 2025-10-24/
│   │   ├── validation_errors.json
│   │   ├── import_errors.json
│   │   └── retry_queue.json
│   └── ...
│
├── archive/                      # Archived old data (> 30 days)
│   ├── 2025-09-01.tar.gz
│   └── ...
│
└── logs/                         # Pipeline logs
    ├── scraping.log
    ├── processing.log
    ├── import.log
    └── errors.log
```

---

## Performance Optimization

### Parallel Processing

```typescript
import { Worker } from 'worker_threads';

class ParallelProcessor {
  private readonly MAX_WORKERS = 4;

  async processBatch(files: string[]): Promise<void> {
    const chunks = this.chunkArray(files, this.MAX_WORKERS);

    const workers = chunks.map((chunk, index) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', {
          workerData: { files: chunk, workerId: index }
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
    });

    await Promise.all(workers);
  }
}
```

---

## Next Steps

1. Implement base scraping service (see server/services/multi-tool-scraper.ts)
2. Create batch processing scheduler
3. Build data validators
4. Implement deduplication logic
5. Create PostgreSQL batch importers
6. Set up monitoring dashboard
7. Configure automated cron jobs

---

## Related Documentation

- [SCRAPING_ARCHITECTURE.md](./SCRAPING_ARCHITECTURE.md) - Multi-tool scraping details
- [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) - Database migration guide
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker configuration
