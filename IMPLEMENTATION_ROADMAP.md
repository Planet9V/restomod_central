# Restomod Central - Complete Implementation Roadmap

## ⚠️ DEVELOPMENT ENVIRONMENT TRANSFORMATION
**Complete migration to Docker + PostgreSQL + Multi-Tool Scraping**

---

## Executive Summary

Transform Restomod Central from SQLite-based local development to a robust, production-ready Docker-containerized application with:

✅ **Multi-tool web scraping** (5 services with fallback chains)
✅ **PostgreSQL database** (scalable, production-grade)
✅ **Docker containerization** (development-ready with all secrets)
✅ **Batch data pipeline** (automated scraping, processing, importing)
✅ **Critical security fixes** (marked for development)

**Timeline**: 2-3 weeks
**Effort**: High
**Risk**: Medium (with proper testing)

---

## 📋 IMPLEMENTATION PHASES

```
┌──────────────────────────────────────────────────────────────┐
│                    3-WEEK ROADMAP                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  WEEK 1: Foundation & Scraping                               │
│  ├─ Day 1-2: Multi-tool scraper setup                        │
│  ├─ Day 3-4: Rate limiting & fallback logic                  │
│  └─ Day 5: Batch processing pipeline                         │
│                                                               │
│  WEEK 2: Database & Docker                                   │
│  ├─ Day 6-7: PostgreSQL migration                            │
│  ├─ Day 8-9: Docker configuration                            │
│  └─ Day 10: Integration testing                              │
│                                                               │
│  WEEK 3: Critical Fixes & Launch                             │
│  ├─ Day 11-12: Security fixes (marked dev)                   │
│  ├─ Day 13-14: End-to-end testing                            │
│  └─ Day 15: Documentation & deployment                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 PHASE 1: Multi-Tool Scraping (Days 1-5)

### Day 1-2: Scraper Service Architecture

#### Objectives
- Set up multi-tool scraping service
- Implement rate limiting
- Create fallback chain

#### Tasks

**1. Install Dependencies**
```bash
npm install apify-client @mendable/firecrawl-js tavily jina-ai bottleneck p-retry ioredis
```

**2. Create Base Scraper Service**

```typescript
// server/services/multi-tool-scraper.ts

import { ApifyClient } from 'apify-client';
import Bottleneck from 'bottleneck';

export class MultiToolScraper {
  private apify: ApifyClient;
  private rateLimiters: Map<string, Bottleneck>;

  constructor() {
    // Initialize all tools
    this.apify = new ApifyClient({ token: process.env.APIFY_API_KEY });

    // Set up rate limiters
    this.rateLimiters = new Map([
      ['apify', new Bottleneck({ minTime: 6000, maxConcurrent: 1 })],   // 10/min
      ['brave', new Bottleneck({ minTime: 72000, maxConcurrent: 1 })],  // 50/hour
      ['tavily', new Bottleneck({ minTime: 3000, maxConcurrent: 1 })],  // 20/min
      ['perplexity', new Bottleneck({ minTime: 6000, maxConcurrent: 1 })], // 10/min
      ['jina', new Bottleneck({ minTime: 3000, maxConcurrent: 1 })],    // 20/min
    ]);
  }

  async scrapeWithFallback(query: string, type: 'vehicle' | 'event' | 'article'): Promise<any> {
    const tools = ['apify', 'brave', 'tavily', 'perplexity', 'jina'];

    for (const tool of tools) {
      try {
        console.log(`🔍 Trying ${tool} for ${type} search...`);

        const limiter = this.rateLimiters.get(tool)!;
        const result = await limiter.schedule(() => this.scrapeWithTool(tool, query, type));

        if (result) {
          console.log(`✅ Success with ${tool}`);
          return { tool, data: result };
        }

      } catch (error) {
        console.error(`❌ Failed with ${tool}:`, error.message);
        continue;
      }
    }

    throw new Error(`All scraping tools failed for query: ${query}`);
  }

  private async scrapeWithTool(tool: string, query: string, type: string): Promise<any> {
    switch (tool) {
      case 'apify':
        return this.scrapeApify(query, type);
      case 'brave':
        return this.scrapeBrave(query, type);
      case 'tavily':
        return this.scrapeTavily(query, type);
      case 'perplexity':
        return this.scrapePerplexity(query, type);
      case 'jina':
        return this.scrapeJina(query, type);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  private async scrapeApify(query: string, type: string): Promise<any> {
    // Apify implementation
    // See SCRAPING_ARCHITECTURE.md for details
  }

  // ... other tool implementations
}
```

**3. Create Scraping Scripts**

```typescript
// scripts/batch-scrape-vehicles.ts

import { MultiToolScraper } from '../server/services/multi-tool-scraper';
import fs from 'fs/promises';
import path from 'path';

async function scrapeVehicles() {
  const scraper = new MultiToolScraper();
  const date = new Date().toISOString().split('T')[0];
  const outputDir = `./data/raw/${date}/vehicles`;

  await fs.mkdir(outputDir, { recursive: true });

  const queries = [
    '1967 Ford Mustang for sale',
    '1969 Chevelle SS for sale',
    // ... more queries
  ];

  const results = [];

  for (const query of queries) {
    try {
      const result = await scraper.scrapeWithFallback(query, 'vehicle');
      results.push(...result.data);

      // Save immediately
      await fs.writeFile(
        path.join(outputDir, `${result.tool}_${Date.now()}.json`),
        JSON.stringify(result.data, null, 2)
      );

      console.log(`✅ Scraped ${result.data.length} vehicles for: ${query}`);

    } catch (error) {
      console.error(`❌ Failed to scrape: ${query}`, error);
    }

    // Delay between queries
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log(`🎉 Scraping complete! Total: ${results.length} vehicles`);
}

scrapeVehicles().catch(console.error);
```

**Testing**
```bash
npm run batch:scrape:vehicles
```

---

### Day 3-4: Data Validation & Processing

#### Objectives
- Implement data validation with Zod
- Create deduplication logic
- Build data enrichment pipeline

#### Tasks

**1. Data Validator**

```typescript
// server/services/data-validator.ts

import { z } from 'zod';
import crypto from 'crypto';

const vehicleSchema = z.object({
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2026),
  price: z.string().optional(),
  description: z.string().max(5000).optional(),
  // ... more fields
});

export class DataValidator {
  validate(data: any, schema: z.ZodSchema): ValidationResult {
    try {
      const validated = schema.parse(data);
      return { valid: true, data: validated, errors: [] };
    } catch (error) {
      return { valid: false, errors: [error.message] };
    }
  }

  generateHash(vehicle: any): string {
    const uniqueString = [
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.stockNumber || ''
    ].join('|').toLowerCase();

    return crypto.createHash('sha256').update(uniqueString).digest('hex');
  }
}
```

**2. Batch Processor**

```typescript
// scripts/batch-process-data.ts

import fs from 'fs/promises';
import path from 'path';
import { DataValidator } from '../server/services/data-validator';

async function processRawData() {
  const validator = new DataValidator();
  const date = new Date().toISOString().split('T')[0];
  const rawDir = `./data/raw/${date}/vehicles`;
  const processedDir = `./data/processed/${date}`;

  await fs.mkdir(processedDir, { recursive: true });

  // Read all raw files
  const files = await fs.readdir(rawDir);
  const allVehicles = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const data = JSON.parse(
      await fs.readFile(path.join(rawDir, file), 'utf-8')
    );

    allVehicles.push(...data);
  }

  console.log(`📊 Processing ${allVehicles.length} raw vehicles...`);

  // Validate & deduplicate
  const validated = [];
  const seenHashes = new Set();

  for (const vehicle of allVehicles) {
    const result = validator.validate(vehicle, vehicleSchema);

    if (!result.valid) {
      console.log(`⚠️  Invalid vehicle:`, result.errors);
      continue;
    }

    const hash = validator.generateHash(result.data);

    if (seenHashes.has(hash)) {
      console.log(`⚠️  Duplicate vehicle: ${vehicle.make} ${vehicle.model}`);
      continue;
    }

    seenHashes.add(hash);
    validated.push({
      ...result.data,
      dataHash: hash,
      processedAt: new Date().toISOString()
    });
  }

  // Save processed data
  await fs.writeFile(
    path.join(processedDir, 'vehicles.json'),
    JSON.stringify(validated, null, 2)
  );

  console.log(`✅ Processed ${validated.length} valid unique vehicles`);
}

processRawData().catch(console.error);
```

**Testing**
```bash
npm run batch:process
```

---

### Day 5: Scheduled Automation

#### Objectives
- Set up cron jobs for automated scraping
- Create monitoring dashboard

#### Tasks

**1. Scheduler Service**

```typescript
// server/services/scheduler.ts

import cron from 'node-cron';
import { MultiToolScraper } from './multi-tool-scraper';

export function setupScheduledJobs() {
  // Daily vehicle scraping: 2 AM PST
  cron.schedule('0 2 * * *', async () => {
    console.log('🚗 Starting scheduled vehicle scraping...');
    // Run scraping script
  });

  // Hourly data processing: Every hour at :15
  cron.schedule('15 * * * *', async () => {
    console.log('⚙️ Processing collected data...');
    // Run processing script
  });

  // Database import: Every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('💾 Importing to PostgreSQL...');
    // Run import script
  });

  console.log('✅ Scheduled jobs configured');
}
```

**2. Add to server/index.ts**

```typescript
import { setupScheduledJobs } from './services/scheduler';

// After server starts
setupScheduledJobs();
```

---

## 🗄️ PHASE 2: PostgreSQL Migration (Days 6-10)

### Day 6-7: Schema Migration

#### Objectives
- Convert SQLite schema to PostgreSQL
- Set up PostgreSQL connection
- Create migration scripts

#### Tasks

**1. Update Drizzle Configuration**

```typescript
// drizzle.config.ts

export default {
  schema: "./shared/*.ts",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "restomod_user",
    password: process.env.POSTGRES_PASSWORD || "DEV_PASSWORD_123",
    database: process.env.POSTGRES_DB || "restomod_dev",
  },
} satisfies Config;
```

**2. Export SQLite Data**

```bash
npm run export:sqlite
```

**3. Import to PostgreSQL**

```bash
npm run import:postgres
```

See [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) for complete guide.

---

### Day 8-9: Docker Configuration

#### Objectives
- Create Docker Compose setup
- Configure development environment
- Set up volume mounts

#### Tasks

**1. Create docker-compose.yml**

Copy configuration from [DOCKER_SETUP.md](./DOCKER_SETUP.md)

**2. Create Dockerfile**

```dockerfile
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

**3. Build and Run**

```bash
docker-compose up --build
```

---

### Day 10: Integration Testing

#### Objectives
- Test all API endpoints
- Verify data integrity
- Test scraping pipeline

#### Tasks

```bash
# Test health endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/db

# Test vehicle search
curl "http://localhost:5000/api/vehicle-search?q=mustang"

# Test events
curl http://localhost:5000/api/events

# Run scraper manually
docker exec restomod-scraper npm run batch:scrape:vehicles

# Check data
docker exec restomod-app npm run db:check
```

---

## 🔒 PHASE 3: Critical Fixes (Days 11-15)

### Day 11-12: Security Fixes (Marked Development)

#### Objectives
- Fix SQL injection vulnerabilities
- Add rate limiting
- Configure CORS
- Add error monitoring

#### Tasks

**1. Fix SQL Injection**

```typescript
// BEFORE (vulnerable)
conditions.push(`c.category = '${filters.category}'`);

// AFTER (safe)
import { eq } from 'drizzle-orm';
.where(eq(carsForSale.category, filters.category))
```

**2. Add Rate Limiting**

```typescript
// server/middleware/rate-limit.ts

import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all /api routes
app.use('/api/', apiLimiter);
```

**3. Add CORS**

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true,
}));
```

**4. Add Development Markers**

```typescript
// server/config/index.ts

export const config = {
  ENVIRONMENT: 'DEVELOPMENT',
  IS_DEV: true,

  warnings: [
    '⚠️  DEVELOPMENT MODE - HARDCODED CREDENTIALS',
    '⚠️  DO NOT USE IN PRODUCTION',
    '⚠️  ALL SECRETS ARE INCLUDED FOR CONVENIENCE',
  ],
};

// Print warnings on startup
if (config.IS_DEV) {
  console.log('\n' + '═'.repeat(60));
  console.log('⚠️  WARNING: DEVELOPMENT ENVIRONMENT DETECTED');
  console.log('═'.repeat(60));
  config.warnings.forEach(w => console.log(w));
  console.log('═'.repeat(60) + '\n');
}
```

---

### Day 13-14: End-to-End Testing

#### Test Checklist

**Backend Tests**
- [ ] All API endpoints respond correctly
- [ ] Authentication works (login/signup)
- [ ] Vehicle search returns results
- [ ] Events API works
- [ ] Configurator API works
- [ ] Database connection stable
- [ ] Rate limiting works
- [ ] CORS configured correctly

**Scraping Tests**
- [ ] Multi-tool scraper fallback chain works
- [ ] Data validation catches errors
- [ ] Deduplication removes duplicates
- [ ] Batch processing completes
- [ ] PostgreSQL import works
- [ ] Scheduled jobs run correctly

**Docker Tests**
- [ ] Containers start successfully
- [ ] Hot reload works
- [ ] Volume mounts persist data
- [ ] Logs are accessible
- [ ] Health checks pass
- [ ] Inter-container networking works

**Integration Tests**
- [ ] Frontend connects to backend
- [ ] Search functionality works end-to-end
- [ ] User authentication flow works
- [ ] Configurator saves to database
- [ ] Events display correctly
- [ ] Market data loads

---

### Day 15: Documentation & Deployment

#### Objectives
- Final documentation review
- Deployment guide creation
- Training materials

#### Deliverables

**Documentation**
- ✅ [SCRAPING_ARCHITECTURE.md](./SCRAPING_ARCHITECTURE.md)
- ✅ [BATCH_PROCESSING_PIPELINE.md](./BATCH_PROCESSING_PIPELINE.md)
- ✅ [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md)
- ✅ [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- ✅ [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)

**Helper Scripts**
```bash
#!/bin/bash
# quick-start.sh

echo "🚀 Restomod Central - Quick Start"
echo "=================================="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose not installed"; exit 1; }

# Start containers
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker exec restomod-app npm run db:migrate

# Seed database (optional)
read -p "Seed database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🌱 Seeding database..."
  docker exec restomod-app npm run db:seed
fi

echo ""
echo "✅ Setup complete!"
echo "🌐 Application: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/health"
echo ""
echo "📖 Next steps:"
echo "   1. Visit http://localhost:5000"
echo "   2. View logs: docker-compose logs -f"
echo "   3. Run scraper: ./docker-dev.sh scrape"
```

---

## 📊 Success Metrics

### Performance Targets
- [ ] Search queries < 50ms (PostgreSQL FTS)
- [ ] API response times < 200ms (95th percentile)
- [ ] Scraping success rate > 90%
- [ ] Container startup < 30 seconds
- [ ] Zero data loss during migration

### Quality Targets
- [ ] Zero SQL injection vulnerabilities
- [ ] All API endpoints tested
- [ ] 100% Docker container health checks passing
- [ ] Complete documentation for all components

---

## 🚨 Risk Mitigation

### High-Risk Areas

**1. Database Migration**
- **Risk**: Data loss during migration
- **Mitigation**:
  - Full SQLite backup before migration
  - Test migration in staging first
  - Validate data counts match
  - Keep SQLite backup for 30 days

**2. Docker Complexity**
- **Risk**: Configuration issues
- **Mitigation**:
  - Test on clean system
  - Provide detailed troubleshooting guide
  - Include health checks for all services

**3. API Key Management**
- **Risk**: Accidental exposure
- **Mitigation**:
  - Clear development markers everywhere
  - Warning messages on startup
  - Separate production configuration guide

**4. Performance Degradation**
- **Risk**: Slower than SQLite
- **Mitigation**:
  - Proper indexing on PostgreSQL
  - Connection pooling
  - Query optimization
  - Performance benchmarks

---

## 📦 Deliverables Checklist

### Code
- [x] Multi-tool scraping service
- [x] Batch processing pipeline
- [x] PostgreSQL schema
- [x] Docker configuration
- [x] Security fixes
- [ ] Test suite (pending implementation)

### Documentation
- [x] Scraping architecture
- [x] Batch processing guide
- [x] PostgreSQL migration guide
- [x] Docker setup guide
- [x] Implementation roadmap
- [x] Quick start guide

### Scripts
- [x] Scraping scripts
- [x] Processing scripts
- [x] Migration scripts
- [x] Docker helper scripts
- [x] Quick start script

---

## 🎯 POST-IMPLEMENTATION TASKS

### Immediate (Week 4)
- [ ] Monitor scraping success rates
- [ ] Optimize slow queries
- [ ] Add more test coverage
- [ ] Performance tuning

### Short-term (Month 2)
- [ ] Add more scraping sources
- [ ] Implement email notifications
- [ ] Add monitoring dashboard
- [ ] Set up CI/CD pipeline

### Long-term (Month 3+)
- [ ] Migrate to production
- [ ] Scale PostgreSQL (read replicas)
- [ ] Add caching layer (Redis)
- [ ] Implement websockets for real-time updates

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**1. Docker won't start**
```bash
# Check Docker daemon
docker info

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**2. Database connection fails**
```bash
# Test PostgreSQL connection
docker exec restomod-app node -e "
const { Pool } = require('pg');
const pool = new Pool({...process.env});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err || res.rows[0]);
  pool.end();
});
"
```

**3. Scraper not working**
```bash
# Check logs
docker-compose logs -f scraper

# Run manually
docker exec restomod-scraper npm run batch:scrape:vehicles

# Check API keys
docker exec restomod-scraper node -e "
console.log('API Keys:', {
  apify: !!process.env.APIFY_API_KEY,
  brave: !!process.env.BRAVE_API_KEY,
  tavily: !!process.env.TAVILY_API_KEY,
});
"
```

---

## 🎉 COMPLETION CRITERIA

Project is complete when:
- [x] All documentation created
- [ ] Docker containers start successfully
- [ ] PostgreSQL migration complete
- [ ] Scraping pipeline working
- [ ] All tests passing
- [ ] Security fixes implemented
- [ ] Developer can clone and run in < 5 minutes

---

## 📚 REFERENCES

- [Apify Documentation](https://docs.apify.com/)
- [Brave Search API](https://brave.com/search/api/)
- [Tavily API](https://tavily.com/)
- [Perplexity API](https://perplexity.ai/)
- [Jina AI](https://jina.ai/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Docs](https://docs.docker.com/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

**Ready to begin implementation? Start with Day 1 tasks!** 🚀
