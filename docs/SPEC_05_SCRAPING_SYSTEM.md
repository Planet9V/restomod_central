# Scraping System Specification v1.0
## Automated Data Collection with Anti-Bot Bypass

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** DRAFT - Awaiting Approval
**Goal:** Scale from 625 cars → 5,000 cars | 223 events → 2,000 events

---

## 1. System Overview

### Purpose
Build a robust, automated scraping system that:
- Collects 5,000+ classic car listings from verified sources
- Aggregates 2,000+ automotive events worldwide
- Bypasses anti-bot detection mechanisms
- Maintains data quality and accuracy
- Runs on automated schedules
- Provides admin monitoring and control

### Key Challenges
1. **Anti-bot detection** - Cloudflare, reCAPTCHA, fingerprinting
2. **Rate limiting** - Avoiding IP bans and throttling
3. **Dynamic content** - JavaScript-rendered pages
4. **Data consistency** - Handling various formats
5. **Legal compliance** - Respecting robots.txt and ToS

---

## 2. Architecture

### System Components
```
┌──────────────────────────────────────────────────────────────┐
│                    Scheduler (pg_cron)                       │
│   Triggers scraping jobs based on cron schedules             │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│                  Job Queue (Bull/Redis)                      │
│   Manages scraping tasks, retries, and concurrency          │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│                Scraping Orchestrator                         │
│  - Route to appropriate scraper (Playwright/API/Perplexity)  │
│  - Apply anti-bot strategies                                 │
│  - Handle errors and retries                                 │
└─────┬────────────┬────────────┬──────────────────────────────┘
      ↓            ↓            ↓
  ┌─────────┐ ┌─────────┐ ┌──────────────┐
  │Playwright│ │Brave API│ │Perplexity AI │
  │ Scraper  │ │ Scraper │ │   Scraper    │
  └─────────┘ └─────────┘ └──────────────┘
      ↓            ↓            ↓
┌──────────────────────────────────────────────────────────────┐
│                  Data Processor                              │
│  - Normalize data formats                                    │
│  - Validate required fields                                  │
│  - Generate embeddings                                       │
│  - Deduplicate entries                                       │
└────────────────────┬─────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  - cars_for_sale                                             │
│  - car_show_events                                           │
│  - scraping_logs                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Scraping Methods

### 3.1 Method 1: Playwright Stealth Mode

**Best For:** JavaScript-heavy sites with anti-bot protection

**Setup:**
```bash
npm install playwright playwright-extra puppeteer-extra-plugin-stealth
```

**Implementation:**
```typescript
// server/services/scraping/playwrightScraper.ts

import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

interface PlaywrightConfig {
  url: string;
  selectors: {
    listing: string;
    title: string;
    price: string;
    image: string;
    // ... more selectors
  };
  useProxy?: boolean;
  proxyUrl?: string;
  delayRange?: [number, number];
  scrollBehavior?: 'smooth' | 'instant';
}

export async function scrapeWithPlaywright(config: PlaywrightConfig) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      config.useProxy && config.proxyUrl ? `--proxy-server=${config.proxyUrl}` : '',
    ].filter(Boolean),
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: getRandomUserAgent(),
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: [],
  });

  // Remove webdriver flag
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

  const page = await context.newPage();

  // Random delays to mimic human behavior
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const randomDelay = () => delay(
    Math.random() * (config.delayRange?.[1] || 3000) + (config.delayRange?.[0] || 1000)
  );

  try {
    // Navigate with random delay
    await page.goto(config.url, { waitUntil: 'networkidle' });
    await randomDelay();

    // Random mouse movements
    await page.mouse.move(
      Math.random() * 1920,
      Math.random() * 1080
    );

    // Scroll randomly to load lazy images
    await autoScroll(page, config.scrollBehavior);
    await randomDelay();

    // Extract listings
    const listings = await page.$$eval(config.selectors.listing, (elements, selectors) => {
      return elements.map(el => ({
        title: el.querySelector(selectors.title)?.textContent?.trim(),
        price: el.querySelector(selectors.price)?.textContent?.trim(),
        image: el.querySelector(selectors.image)?.getAttribute('src'),
        link: el.querySelector('a')?.getAttribute('href'),
        // ... extract more fields
      }));
    }, config.selectors);

    return { success: true, data: listings };

  } catch (error) {
    console.error('Playwright scraping failed:', error);
    return { success: false, error: error.message };

  } finally {
    await browser.close();
  }
}

async function autoScroll(page: any, behavior: 'smooth' | 'instant' = 'smooth') {
  await page.evaluate(async (scrollBehavior: string) => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy({ top: distance, behavior: scrollBehavior as ScrollBehavior });
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  }, behavior);
}

function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}
```

---

### 3.2 Method 2: Brave Search API

**Best For:** Discovering new listings without direct scraping

**Setup:**
```bash
# Get API key from https://brave.com/search/api/
# Free tier: 2,000 queries/month
```

**Implementation:**
```typescript
// server/services/scraping/braveApiScraper.ts

import fetch from 'node-fetch';

interface BraveSearchConfig {
  query: string;
  count?: number;
  offset?: number;
}

export async function scrapeWithBraveAPI(config: BraveSearchConfig) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  const url = new URL('https://api.search.brave.com/res/v1/web/search');

  url.searchParams.append('q', config.query);
  url.searchParams.append('count', String(config.count || 20));
  url.searchParams.append('offset', String(config.offset || 0));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract relevant results
    const listings = data.web?.results
      ?.filter((result: any) => {
        // Filter for car listing sites
        return result.url.includes('classiccars.com') ||
               result.url.includes('bringatrailer.com') ||
               result.url.includes('hemmings.com');
      })
      .map((result: any) => ({
        title: result.title,
        url: result.url,
        description: result.description,
        source: new URL(result.url).hostname,
      }));

    return { success: true, data: listings };

  } catch (error) {
    console.error('Brave API scraping failed:', error);
    return { success: false, error: error.message };
  }
}

// Example queries for car discovery
const carSearchQueries = [
  '1967 Ford Mustang for sale',
  'classic Chevrolet Corvette for sale',
  'vintage Porsche 911 for sale',
  'classic muscle cars for sale site:classiccars.com',
  'investment grade classic cars site:bringatrailer.com',
];
```

---

### 3.3 Method 3: Perplexity AI Scraping

**Best For:** Discovering hard-to-find listings and events

**Implementation:**
```typescript
// server/services/scraping/perplexityScraper.ts

import fetch from 'node-fetch';

interface PerplexityConfig {
  query: string;
  type: 'cars' | 'events';
}

export async function scrapeWithPerplexity(config: PerplexityConfig) {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  const prompts = {
    cars: `Find 20 classic car listings for sale from reputable dealers. For each car, provide:
- Year, Make, Model
- Price
- Location (City, State)
- Dealer/Source name
- Direct URL to listing
- Brief description

Return as JSON array.`,

    events: `Find 20 upcoming classic car shows and automotive events in the United States. For each event, provide:
- Event name
- Date (start and end)
- Location (City, State, Venue)
- Event type (car show, auction, concours, etc.)
- Website URL
- Brief description

Return as JSON array.`,
  };

  const fullPrompt = `${prompts[config.type]}\n\n${config.query}`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a data extraction assistant. Always return valid JSON arrays.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Perplexity response');
    }

    const listings = JSON.parse(jsonMatch[0]);

    return { success: true, data: listings };

  } catch (error) {
    console.error('Perplexity scraping failed:', error);
    return { success: false, error: error.message };
  }
}
```

---

## 4. Anti-Bot Bypass Strategies

### 4.1 Rotating Proxies

**Option 1: Bright Data (Residential Proxies)**
```typescript
// server/services/scraping/proxyService.ts

import fetch from 'node-fetch';

interface ProxyConfig {
  provider: 'brightdata' | 'oxylabs' | 'smartproxy';
  zone: string;
  username: string;
  password: string;
}

function getProxyUrl(config: ProxyConfig): string {
  switch (config.provider) {
    case 'brightdata':
      return `http://${config.username}:${config.password}@brd.superproxy.io:22225`;

    case 'oxylabs':
      return `http://${config.username}:${config.password}@pr.oxylabs.io:7777`;

    case 'smartproxy':
      return `http://${config.username}:${config.password}@gate.smartproxy.com:7000`;

    default:
      throw new Error('Unsupported proxy provider');
  }
}

export async function fetchWithProxy(url: string, config: ProxyConfig) {
  const proxyUrl = getProxyUrl(config);

  const response = await fetch(url, {
    agent: new (require('https-proxy-agent'))(proxyUrl),
  });

  return response;
}
```

**Option 2: Free Proxy Rotation**
```typescript
// For development/testing only (not reliable for production)

async function getFreeProxies(): Promise<string[]> {
  const response = await fetch('https://www.proxy-list.download/api/v1/get?type=https');
  const proxies = await response.text();
  return proxies.split('\n').filter(Boolean);
}

let currentProxyIndex = 0;
const proxies = await getFreeProxies();

function getNextProxy(): string {
  const proxy = proxies[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  return proxy;
}
```

### 4.2 Header Randomization

```typescript
function getRandomHeaders() {
  const userAgents = [/* ... user agent list */];
  const acceptLanguages = ['en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9'];
  const acceptEncodings = ['gzip, deflate, br', 'gzip, deflate'];

  return {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
    'Accept-Encoding': acceptEncodings[Math.floor(Math.random() * acceptEncodings.length)],
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
  };
}
```

### 4.3 Request Fingerprinting Evasion

```typescript
// Remove automation signatures
await page.evaluateOnNewDocument(() => {
  // Overwrite the `languages` property
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
  });

  // Overwrite the `plugins` property
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
  });

  // Remove webdriver flag
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
  });

  // Chrome runtime
  window.chrome = { runtime: {} };
});
```

---

## 5. Target Sources

### 5.1 Car Listing Sources (4,375 new cars needed)

| Source | Method | Est. Listings | Difficulty | Priority |
|--------|--------|---------------|------------|----------|
| **ClassicCars.com** | Playwright | 1,500 | Medium | High |
| **Bring a Trailer** | Playwright + API | 800 | High | High |
| **Hemmings** | Playwright | 1,000 | Medium | High |
| **eBay Motors Classic** | API | 600 | Low | Medium |
| **Cars & Bids** | Playwright | 500 | Medium | Medium |
| **Mecum Auctions** | Perplexity | 400 | High | Low |
| **Barrett-Jackson** | Manual + API | 200 | High | Low |
| **Gateway Classic** | API | 150 | Low | Medium |
| **Vanguard Motor Sales** | Playwright | 100 | Low | Low |
| **Classic Car Studio** | Playwright | 75 | Low | Low |
| **RK Motors** | Playwright | 50 | Low | Low |

**Total Target:** 5,375 cars (buffer for duplicates/errors)

### 5.2 Event Sources (1,777 new events needed)

| Source | Method | Est. Events | Difficulty | Priority |
|--------|--------|-------------|------------|----------|
| **Goodguys Rod & Custom** | Playwright | 250 | Medium | High |
| **NSRA Events** | Playwright | 200 | Medium | High |
| **AACA Calendar** | API/RSS | 300 | Low | High |
| **Eventbrite Automotive** | API | 400 | Low | High |
| **Facebook Events** | Graph API | 350 | High | Medium |
| **Local Car Clubs** | Perplexity | 200 | Medium | Medium |
| **CarShowsPlus.com** | Playwright | 150 | Low | Medium |
| **CarShowFinder.org** | Playwright | 100 | Low | Low |
| **Regional Calendars** | Mixed | 250 | Varies | Low |

**Total Target:** 2,200 events (buffer for duplicates/errors)

---

## 6. Configuration Format

### 6.1 Scraping Schedule Schema
```typescript
interface ScrapingSchedule {
  id: number;
  sourceName: string;
  sourceType: 'playwright' | 'brave_api' | 'perplexity' | 'api';
  sourceUrl: string;
  scheduleCron: string;
  enabled: boolean;
  config: ScraperConfig;
  lastRun?: Date;
  nextRun?: Date;
}

interface ScraperConfig {
  // Playwright-specific
  selectors?: {
    listing: string;
    title: string;
    price: string;
    make?: string;
    model?: string;
    year?: string;
    image?: string;
    description?: string;
    location?: string;
    [key: string]: string | undefined;
  };
  pagination?: {
    type: 'click' | 'url';
    selector?: string;
    maxPages?: number;
    urlPattern?: string;
  };

  // Anti-bot strategies
  useStealth: boolean;
  useProxy: boolean;
  proxyType?: 'residential' | 'datacenter' | 'rotating';
  userAgent?: string;
  delayBetweenRequests?: number; // milliseconds
  maxRequestsPerMinute?: number;

  // Data processing
  transformations?: {
    priceRegex?: string;
    dateFormat?: string;
    locationParser?: string;
  };

  // Error handling
  maxRetries?: number;
  retryDelay?: number;
  timeoutMs?: number;
}
```

### 6.2 Example Configuration: ClassicCars.com
```json
{
  "sourceName": "ClassicCars.com",
  "sourceType": "playwright",
  "sourceUrl": "https://classiccars.com/listings/find/all-years",
  "scheduleCron": "0 3 * * *",
  "enabled": true,
  "config": {
    "selectors": {
      "listing": ".listing-item",
      "title": ".listing-title",
      "price": ".listing-price",
      "make": "[data-make]",
      "model": "[data-model]",
      "year": "[data-year]",
      "image": ".listing-image img",
      "location": ".listing-location",
      "description": ".listing-description"
    },
    "pagination": {
      "type": "click",
      "selector": ".next-page",
      "maxPages": 50
    },
    "useStealth": true,
    "useProxy": true,
    "proxyType": "residential",
    "delayBetweenRequests": 3000,
    "maxRequestsPerMinute": 20,
    "transformations": {
      "priceRegex": "\\$([0-9,]+)",
      "locationParser": "split-comma"
    },
    "maxRetries": 3,
    "retryDelay": 5000,
    "timeoutMs": 30000
  }
}
```

---

## 7. Data Processing Pipeline

### 7.1 Normalization
```typescript
// server/services/scraping/dataProcessor.ts

interface RawListing {
  title?: string;
  price?: string;
  make?: string;
  model?: string;
  year?: string | number;
  location?: string;
  image?: string;
  description?: string;
  url?: string;
}

export function normalizeListing(raw: RawListing, source: string): Partial<CarForSale> {
  return {
    // Parse title if make/model/year not explicit
    ...parseTitleForDetails(raw.title),

    // Normalize price
    price: parsePrice(raw.price),

    // Normalize year
    year: typeof raw.year === 'string' ? parseInt(raw.year, 10) : raw.year,

    // Parse location
    ...parseLocation(raw.location),

    // Clean image URL
    imageUrl: normalizeImageUrl(raw.image),

    // Clean description
    description: cleanDescription(raw.description),

    // Source tracking
    sourceType: 'scraped',
    sourceName: source,
    sourceUrl: raw.url,

    // Timestamps
    scrapedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function parsePrice(priceStr?: string): number | null {
  if (!priceStr) return null;

  // Remove $, commas, and extra text
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const price = parseFloat(cleaned);

  return isNaN(price) ? null : price;
}

function parseLocation(locationStr?: string): Partial<CarForSale> {
  if (!locationStr) return {};

  // "Los Angeles, CA" or "Los Angeles, California"
  const parts = locationStr.split(',').map(s => s.trim());

  if (parts.length === 2) {
    return {
      locationCity: parts[0],
      locationState: normalizeState(parts[1]),
    };
  }

  return {};
}

function parseTitleForDetails(title?: string): Partial<CarForSale> {
  if (!title) return {};

  // "1967 Ford Mustang Fastback"
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : undefined;

  // Common make patterns
  const makes = ['Ford', 'Chevrolet', 'Dodge', 'Plymouth', 'Pontiac', 'Porsche', 'Ferrari'];
  const make = makes.find(m => title.includes(m));

  return { year, make, title };
}
```

### 7.2 Validation
```typescript
function validateListing(listing: Partial<CarForSale>): boolean {
  // Required fields
  if (!listing.make || !listing.model || !listing.year) {
    console.warn('Missing required fields:', listing);
    return false;
  }

  // Year range check
  if (listing.year < 1900 || listing.year > new Date().getFullYear() + 1) {
    console.warn('Invalid year:', listing.year);
    return false;
  }

  // Price sanity check
  if (listing.price && (listing.price < 100 || listing.price > 10000000)) {
    console.warn('Suspicious price:', listing.price);
    return false;
  }

  return true;
}
```

### 7.3 Deduplication
```typescript
async function deduplicateListing(listing: Partial<CarForSale>): Promise<boolean> {
  // Check for exact duplicates by VIN
  if (listing.vin) {
    const existing = await db.select()
      .from(carsForSale)
      .where(eq(carsForSale.vin, listing.vin))
      .limit(1);

    if (existing.length > 0) {
      console.log('Duplicate VIN found:', listing.vin);
      return false; // Skip
    }
  }

  // Check for fuzzy duplicates (same make/model/year, similar price, same location)
  const fuzzyMatches = await db.select()
    .from(carsForSale)
    .where(
      and(
        eq(carsForSale.make, listing.make!),
        eq(carsForSale.model, listing.model!),
        eq(carsForSale.year, listing.year!),
        eq(carsForSale.locationCity, listing.locationCity || ''),
      )
    );

  for (const match of fuzzyMatches) {
    const priceDiff = Math.abs((match.price || 0) - (listing.price || 0));
    const priceThreshold = 1000; // $1000 difference allowed

    if (priceDiff < priceThreshold) {
      console.log('Fuzzy duplicate found:', listing);
      return false; // Skip
    }
  }

  return true; // Not a duplicate
}
```

---

## 8. Job Execution

### 8.1 Job Queue Setup
```typescript
// server/services/scraping/jobQueue.ts

import Bull from 'bull';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);

export const scrapingQueue = new Bull('scraping', {
  redis: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000, // 1 minute
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
});

// Process scraping jobs
scrapingQueue.process('scrape-cars', async (job) => {
  const { scheduleId } = job.data;
  return await executeScraping(scheduleId);
});

scrapingQueue.process('scrape-events', async (job) => {
  const { scheduleId } = job.data;
  return await executeScraping(scheduleId);
});
```

### 8.2 Scraping Executor
```typescript
// server/services/scraping/scrapingExecutor.ts

async function executeScraping(scheduleId: number) {
  const schedule = await db.select()
    .from(scrapingSchedules)
    .where(eq(scrapingSchedules.id, scheduleId))
    .limit(1);

  if (!schedule[0] || !schedule[0].enabled) {
    throw new Error('Schedule not found or disabled');
  }

  const { sourceName, sourceType, sourceUrl, config } = schedule[0];

  // Create log entry
  const logId = await createScrapingLog(scheduleId);
  const startTime = Date.now();

  try {
    let result;

    // Route to appropriate scraper
    switch (sourceType) {
      case 'playwright':
        result = await scrapeWithPlaywright({ url: sourceUrl, ...config });
        break;

      case 'brave_api':
        result = await scrapeWithBraveAPI({ query: sourceUrl, ...config });
        break;

      case 'perplexity':
        result = await scrapeWithPerplexity({ query: sourceUrl, type: 'cars', ...config });
        break;

      default:
        throw new Error(`Unsupported scraper type: ${sourceType}`);
    }

    if (!result.success) {
      throw new Error(result.error);
    }

    // Process and save data
    const stats = await processAndSaveListings(result.data, sourceName);

    // Update log
    await updateScrapingLog(logId, {
      status: 'success',
      itemsScraped: result.data.length,
      itemsInserted: stats.inserted,
      itemsUpdated: stats.updated,
      itemsFailed: stats.failed,
      durationSeconds: Math.floor((Date.now() - startTime) / 1000),
      completedAt: new Date(),
    });

    // Update schedule
    await updateScheduleLastRun(scheduleId);

    return stats;

  } catch (error) {
    console.error(`Scraping failed for ${sourceName}:`, error);

    // Update log with error
    await updateScrapingLog(logId, {
      status: 'failed',
      errors: [error.message],
      errorSummary: error.message,
      durationSeconds: Math.floor((Date.now() - startTime) / 1000),
      completedAt: new Date(),
    });

    // Increment consecutive failures
    await incrementConsecutiveFailures(scheduleId);

    throw error;
  }
}

async function processAndSaveListings(rawListings: any[], source: string) {
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const raw of rawListings) {
    try {
      // Normalize
      const normalized = normalizeListing(raw, source);

      // Validate
      if (!validateListing(normalized)) {
        failed++;
        continue;
      }

      // Deduplicate
      const isUnique = await deduplicateListing(normalized);
      if (!isUnique) {
        updated++;
        continue;
      }

      // Generate embedding
      const embeddingText = generateCarEmbedding(normalized as any);
      const embedding = await generateEmbedding(embeddingText);

      // Insert
      await db.insert(carsForSale).values({
        ...normalized,
        embedding: JSON.stringify(embedding),
        status: 'active',
      });

      inserted++;

    } catch (error) {
      console.error('Failed to process listing:', error);
      failed++;
    }
  }

  return { inserted, updated, failed };
}
```

---

## 9. Scheduling

### 9.1 Cron Schedules
```typescript
// Common cron patterns
const schedules = {
  daily_3am: '0 3 * * *',          // Daily at 3 AM
  daily_4am: '0 4 * * *',          // Daily at 4 AM (offset to avoid spikes)
  weekly_sunday: '0 2 * * 0',      // Every Sunday at 2 AM
  twice_weekly: '0 3 * * 0,3',     // Sunday and Wednesday at 3 AM
  monthly: '0 2 1 * *',            // 1st of month at 2 AM
};

// Recommended schedule assignments
const sourceSchedules = [
  { source: 'ClassicCars.com', cron: schedules.daily_3am },
  { source: 'Bring a Trailer', cron: schedules.daily_4am },
  { source: 'Hemmings', cron: schedules.twice_weekly },
  { source: 'eBay Motors', cron: schedules.weekly_sunday },
  { source: 'Mecum Auctions', cron: schedules.monthly },
];
```

### 9.2 Automatic Schedule Updates
```typescript
// Update next_run timestamp after each execution
async function updateScheduleLastRun(scheduleId: number) {
  const schedule = await db.select()
    .from(scrapingSchedules)
    .where(eq(scrapingSchedules.id, scheduleId))
    .limit(1);

  if (!schedule[0]) return;

  const nextRun = calculateNextRun(schedule[0].scheduleCron);

  await db.update(scrapingSchedules)
    .set({
      lastRun: new Date(),
      nextRun,
      consecutiveFailures: 0, // Reset on success
    })
    .where(eq(scrapingSchedules.id, scheduleId));
}

function calculateNextRun(cronExpression: string): Date {
  // Use cron-parser library
  const parser = require('cron-parser');
  const interval = parser.parseExpression(cronExpression);
  return interval.next().toDate();
}
```

---

## 10. Error Handling & Recovery

### 10.1 Retry Logic
```typescript
async function scrapeWithRetry(config: any, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scrapeWithPlaywright(config);

      if (result.success) {
        return result;
      }

      // Partial success - return what we have
      if (result.data && result.data.length > 0) {
        console.warn(`Partial success on attempt ${attempt}`);
        return result;
      }

      // Total failure - retry
      throw new Error(result.error);

    } catch (error) {
      console.error(`Scraping attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error; // Give up
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 10.2 Automatic Disabling
```typescript
async function incrementConsecutiveFailures(scheduleId: number) {
  const schedule = await db.select()
    .from(scrapingSchedules)
    .where(eq(scrapingSchedules.id, scheduleId))
    .limit(1);

  if (!schedule[0]) return;

  const failures = (schedule[0].consecutiveFailures || 0) + 1;

  // Auto-disable after 5 consecutive failures
  if (failures >= 5) {
    await db.update(scrapingSchedules)
      .set({
        enabled: false,
        consecutiveFailures: failures,
      })
      .where(eq(scrapingSchedules.id, scheduleId));

    // Notify admin
    await notifyAdmin({
      type: 'scraper_disabled',
      scheduleId,
      sourceName: schedule[0].sourceName,
      failures,
    });
  } else {
    await db.update(scrapingSchedules)
      .set({ consecutiveFailures: failures })
      .where(eq(scrapingSchedules.id, scheduleId));
  }
}
```

---

## 11. Monitoring & Alerts

### 11.1 Admin Dashboard Metrics
```typescript
// GET /api/admin/scraping/stats
async function getScrapingStats() {
  // Active schedules
  const activeSchedules = await db.select()
    .from(scrapingSchedules)
    .where(eq(scrapingSchedules.enabled, true));

  // Recent logs (last 24 hours)
  const recentLogs = await db.select()
    .from(scrapingLogs)
    .where(gte(scrapingLogs.startedAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))
    .orderBy(desc(scrapingLogs.startedAt));

  // Success rate
  const successCount = recentLogs.filter(l => l.status === 'success').length;
  const successRate = (successCount / recentLogs.length) * 100;

  // Items scraped (last 7 days)
  const weekLogs = await db.select()
    .from(scrapingLogs)
    .where(gte(scrapingLogs.startedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

  const totalItemsScraped = weekLogs.reduce((sum, log) => sum + (log.itemsScraped || 0), 0);
  const totalItemsInserted = weekLogs.reduce((sum, log) => sum + (log.itemsInserted || 0), 0);

  return {
    activeSchedules: activeSchedules.length,
    successRate,
    totalItemsScraped,
    totalItemsInserted,
    recentLogs: recentLogs.slice(0, 10),
  };
}
```

### 11.2 Alerts
```typescript
async function notifyAdmin(alert: {
  type: string;
  scheduleId?: number;
  sourceName?: string;
  failures?: number;
  message?: string;
}) {
  // Send email notification
  // Log to admin dashboard
  // Create alert in database

  console.log('ADMIN ALERT:', alert);

  // TODO: Implement email/Slack notification
}
```

---

## 12. Legal & Ethical Considerations

### 12.1 robots.txt Compliance
```typescript
import { fetchRobotsTxt, isAllowed } from 'robots-parser';

async function checkRobotsPermission(url: string, userAgent: string): Promise<boolean> {
  try {
    const robotsTxt = await fetchRobotsTxt(url);
    return isAllowed(robotsTxt, url, userAgent);
  } catch (error) {
    console.warn('Failed to fetch robots.txt, proceeding cautiously');
    return true; // Proceed if robots.txt unavailable
  }
}
```

### 12.2 Rate Limiting (Respectful Scraping)
```typescript
// Never exceed these limits per source
const rateLimits = {
  requestsPerMinute: 20,      // Max 20 requests/min
  requestsPerHour: 500,       // Max 500 requests/hour
  concurrentRequests: 3,      // Max 3 parallel requests
  delayBetweenRequests: 3000, // Min 3 seconds between requests
};

// Implement token bucket algorithm
class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(private maxTokens: number, private refillRate: number) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) * (1000 / this.refillRate);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refill();
    }

    this.tokens -= 1;
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
```

---

## 13. Approval Checklist

- [ ] Review scraping methods (Playwright, Brave, Perplexity)
- [ ] Approve anti-bot bypass strategies
- [ ] Verify target sources and priorities
- [ ] Confirm data processing pipeline
- [ ] Review deduplication logic
- [ ] Approve error handling and retry mechanisms
- [ ] Validate legal compliance (robots.txt, rate limiting)
- [ ] Review scheduling approach
- [ ] Confirm monitoring and alerting strategy

---

**Status:** READY FOR REVIEW
**Next Step:** Await approval before implementation
**Implementation Time:** 3-4 weeks
**Dependencies:** PostgreSQL, Redis (job queue), Playwright, API keys

**Budget Estimate:**
- Residential proxies: $100-300/month
- Brave Search API: Free (2K queries/month)
- Perplexity API: $20-200/month
- Redis hosting: $0-20/month (free tier available)

**Total:** $120-520/month
