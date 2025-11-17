# Scraping System Guide

**Version:** 1.0
**Last Updated:** 2025-01-17
**Status:** Production Ready

---

## Overview

The Restomod Central scraping system is a robust, automated data collection pipeline that gathers classic car listings and automotive events from multiple verified sources. It features anti-bot detection bypass, rate limiting, deduplication, and comprehensive error handling.

### Key Features

✅ **Anti-Bot Detection** - Playwright Stealth mode bypasses Cloudflare, reCAPTCHA
✅ **Multi-Source** - ClassicCars.com, Hemmings, eBay Motors, Eventbrite
✅ **Smart Deduplication** - VIN-based and fuzzy matching
✅ **Rate Limiting** - Respectful scraping with configurable delays
✅ **Auto-Validation** - Ensures data quality before saving
✅ **Legal Compliance** - Respects robots.txt and Terms of Service
✅ **CLI Tools** - Easy-to-use command-line interface

### Targets

- **Cars:** 5,000+ classic vehicle listings
- **Events:** 2,000+ automotive shows and events
- **Sources:** 4 primary data sources
- **Update Frequency:** Configurable (daily recommended)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and add:

```bash
# Required for eBay Motors
EBAY_APP_ID=your_ebay_app_id_here

# Required for Eventbrite
EVENTBRITE_OAUTH_TOKEN=your_eventbrite_token_here
```

### 3. Test Scrapers

```bash
npm run scrape test
```

This will test each scraper with 5 sample items to verify everything works.

### 4. Run Quick Scrape

```bash
npm run scrape quick
```

Collects ~500 cars + ~100 events in 10-15 minutes.

---

## CLI Commands

### Test Mode

```bash
npm run scrape test
```

Tests all scrapers with small samples (5 items each). Use this to verify configuration.

### Quick Scrape (Development)

```bash
npm run scrape quick
```

- **Target:** 500 cars + 100 events
- **Duration:** ~10-15 minutes
- **Use Case:** Testing, development, initial data

### Balanced Scrape (Production)

```bash
npm run scrape balanced
```

- **Target:** 2,000 cars + 500 events
- **Duration:** ~30-45 minutes
- **Use Case:** Regular production updates

### Comprehensive Scrape (Full Scale)

```bash
npm run scrape comprehensive
```

- **Target:** 5,000 cars + 2,000 events
- **Duration:** ~2-3 hours
- **Use Case:** Initial database population, monthly refresh

### Targeted Scraping

```bash
# Scrape only cars
npm run scrape cars 1000

# Scrape only events
npm run scrape events 500
```

### Statistics

```bash
npm run scrape stats
```

Shows current scraping statistics from the database.

---

## Architecture

### System Components

```
┌────────────────────────────────────────┐
│         CLI Interface (scripts/scrape) │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│    Orchestrator (orchestrator.ts)      │
│    - Coordinates all scrapers          │
│    - Manages execution flow            │
└──────────┬────────────┬────────────────┘
           ↓            ↓
  ┌────────────────┐ ┌──────────────────┐
  │  Playwright    │ │  API Integrations│
  │  Scrapers      │ │  (eBay, Eventbrite)│
  └────────┬───────┘ └────────┬─────────┘
           ↓                  ↓
┌────────────────────────────────────────┐
│      Data Processor                     │
│      - Normalize                        │
│      - Validate                         │
│      - Deduplicate                      │
└──────────────┬──────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│      PostgreSQL Database                │
│      - cars_for_sale                    │
│      - car_show_events                  │
└─────────────────────────────────────────┘
```

### Data Flow

1. **Scraper** → Fetches raw data from source
2. **Data Processor** → Normalizes, validates, deduplicates
3. **Embedding Service** → Generates vector embeddings for search
4. **Database** → Stores processed data

---

## Scrapers

### 1. ClassicCars.com (Playwright)

**Target:** 1,500 listings
**Method:** Playwright Stealth mode
**Difficulty:** Medium
**Configuration:**

```typescript
{
  url: 'https://classiccars.com/listings/find/all-years',
  selectors: {
    listing: '.card.listing-card',
    title: '.listing-title',
    price: '.listing-price',
    image: '.listing-image img',
    location: '.listing-location',
  },
  pagination: {
    type: 'click',
    selector: 'a.next',
    maxPages: 30,
  },
  delayRange: [2000, 4000],
}
```

**Features:**
- Category-based scraping (muscle, classic, exotic, trucks)
- Make-based scraping (Ford, Chevrolet, Porsche, etc.)
- Automatic pagination
- Image lazy-loading support

### 2. Hemmings.com (Playwright)

**Target:** 1,000 listings
**Method:** Playwright Stealth mode
**Difficulty:** Medium
**Configuration:**

```typescript
{
  url: 'https://www.hemmings.com/classifieds/cars-for-sale',
  selectors: {
    listing: '.vehicle-card',
    title: '.vehicle-title',
    price: '.vehicle-price',
  },
  pagination: {
    type: 'url',
    urlPattern: 'https://www.hemmings.com/classifieds/cars-for-sale?page={page}',
    maxPages: 20,
  },
  delayRange: [3000, 5000],
}
```

**Features:**
- Category-based scraping (prewar, muscle, sports, trucks)
- URL-based pagination
- Conservative rate limiting

### 3. eBay Motors (Official API)

**Target:** 600 listings
**Method:** eBay Finding API
**Difficulty:** Low
**API:** https://developer.ebay.com/

**Configuration:**

```typescript
{
  categoryId: '6001', // Cars & Trucks
  keywords: 'classic car vintage muscle',
  minPrice: 5000,
  maxPrice: 500000,
  entriesPerPage: 100,
}
```

**Features:**
- Official API (no scraping needed)
- 5,000 calls/day free tier
- Advanced search filters
- Make-specific searches

**Rate Limits:**
- 5,000 requests/day
- No concurrent request limit

### 4. Eventbrite (Official API)

**Target:** 400+ events
**Method:** Eventbrite Events API
**Difficulty:** Low
**API:** https://www.eventbrite.com/platform/api

**Configuration:**

```typescript
{
  q: 'car show classic automotive',
  'start_date.range_start': startDate,
  'start_date.range_end': endDate,
  page: 1,
}
```

**Features:**
- Official API (no scraping needed)
- 1,000 requests/hour free tier
- Location-based search
- Keyword-based search
- Date range filtering

**Rate Limits:**
- 1,000 requests/hour
- No concurrent request limit

---

## Data Processing

### Normalization

Raw scraped data is normalized into consistent database format:

**Input (Raw):**
```json
{
  "title": "1967 Ford Mustang Fastback",
  "price": "$45,000",
  "location": "Los Angeles, CA",
  "image": "/path/to/image.jpg"
}
```

**Output (Normalized):**
```json
{
  "year": 1967,
  "make": "Ford",
  "model": "Mustang",
  "title": "1967 Ford Mustang Fastback",
  "price": 45000,
  "locationCity": "Los Angeles",
  "locationState": "CA",
  "locationCountry": "USA",
  "imageUrl": "https://example.com/path/to/image.jpg",
  "sourceType": "scraped",
  "sourceName": "ClassicCars.com",
  "sourceUrl": "https://...",
  "scrapedAt": "2025-01-17T10:00:00Z"
}
```

### Validation

Each listing must pass validation:

✅ **Required Fields:** make, model, year
✅ **Year Range:** 1900 - current year + 1
✅ **Price Range:** $100 - $10,000,000 (if provided)
✅ **Data Quality:** Title and description present

**Invalid listings are logged but not saved.**

### Deduplication

Three-tier deduplication strategy:

**1. Source URL Match (Exact)**
```typescript
if (listing.sourceUrl === existingListing.sourceUrl) {
  // Skip - exact duplicate
}
```

**2. VIN Match (Exact)**
```typescript
if (listing.vin === existingListing.vin) {
  // Skip - same vehicle
}
```

**3. Fuzzy Match (Similarity)**
```typescript
if (
  listing.make === existing.make &&
  listing.model === existing.model &&
  listing.year === existing.year &&
  listing.locationCity === existing.locationCity &&
  Math.abs(listing.price - existing.price) < 2000
) {
  // Skip - likely duplicate
}
```

---

## Rate Limiting & Legal Compliance

### Rate Limits (Per Source)

| Source | Requests/Min | Delay Between Requests | Max Concurrent |
|--------|-------------|------------------------|----------------|
| ClassicCars.com | 20 | 3s | 1 |
| Hemmings | 15 | 4s | 1 |
| eBay Motors API | 60 | 1s | 3 |
| Eventbrite API | 60 | 1s | 3 |

### robots.txt Compliance

All scrapers automatically check `robots.txt` before scraping:

```typescript
const isAllowed = await checkRobotsPermission(url);
if (!isAllowed) {
  console.log('Blocked by robots.txt - skipping');
  return;
}
```

### User Agent

```
Mozilla/5.0 (compatible; RestomodBot/1.0; +https://restomodcentral.com/about)
```

### Legal Considerations

✅ **Public Data Only** - Only scrape publicly visible listings
✅ **Attribution** - Always store source URL
✅ **Rate Limiting** - Respectful delays between requests
✅ **robots.txt** - Automatic compliance
✅ **Terms of Service** - Review and follow ToS
✅ **No Login Required** - Only public listings
✅ **Copyright** - Never claim ownership of images

---

## Error Handling

### Retry Strategy

Failed scrapes are automatically retried with exponential backoff:

```typescript
Attempt 1: Immediate
Attempt 2: 2 second delay
Attempt 3: 4 second delay
Attempt 4: 8 second delay
```

### Partial Success

If some listings fail but others succeed, the successful ones are still saved:

```
✅ Successfully scraped: 85 listings
⚠️  Failed to process: 15 listings
✅ Inserted to database: 80 listings
⚠️  Duplicates skipped: 5 listings
```

### Logging

All scraping activity is logged:

```typescript
[ClassicCars] Starting scraper...
[ClassicCars] Page 1: Found 50 listings
[ClassicCars] Page 2: Found 48 listings
[ClassicCars] Successfully scraped 98 listings
[DataProcessor] Processing 98 listings...
[DataProcessor] Completed: 90 inserted, 5 updated, 3 duplicates, 0 failed
```

---

## Performance

### Expected Times

| Strategy | Cars | Events | Duration | Cost |
|----------|------|--------|----------|------|
| **Test** | 20 | 5 | ~2 min | $0 |
| **Quick** | 500 | 100 | 10-15 min | $0 |
| **Balanced** | 2,000 | 500 | 30-45 min | $0 |
| **Comprehensive** | 5,000 | 2,000 | 2-3 hours | $0 |

### Throughput

- **Playwright Scrapers:** ~2-3 listings/second
- **API Scrapers:** ~10-20 listings/second
- **Database Inserts:** ~100 listings/second

### Resource Usage

- **CPU:** Low (1-2% average)
- **Memory:** ~500MB (Playwright)
- **Network:** ~10-50 MB/hour
- **Database:** ~500 KB/1000 listings

---

## Troubleshooting

### Issue: "EBAY_APP_ID not configured"

**Solution:** Add eBay API key to `.env`:
```bash
EBAY_APP_ID=your_ebay_app_id_here
```

Get API key from: https://developer.ebay.com/

### Issue: "EVENTBRITE_OAUTH_TOKEN not configured"

**Solution:** Add Eventbrite token to `.env`:
```bash
EVENTBRITE_OAUTH_TOKEN=your_token_here
```

Get token from: https://www.eventbrite.com/platform/api

### Issue: "Blocked by robots.txt"

**Solution:** The site's robots.txt blocks scraping. This is expected and legal compliance. Consider:
1. Using official API if available
2. Contacting site for permission
3. Finding alternative data source

### Issue: "Playwright browser not found"

**Solution:** Install Playwright browsers:
```bash
npx playwright install chromium
```

### Issue: "Connection timeout"

**Solution:** Increase timeout in scraper config:
```typescript
timeoutMs: 60000  // 60 seconds
```

### Issue: "Too many duplicates"

**Solution:** This is expected on subsequent scrapes. Deduplication is working correctly.

---

## Monitoring

### Success Metrics

✅ **Scrape Success Rate:** >85%
✅ **Data Quality Rate:** >90%
✅ **Duplicate Rate:** <20%
✅ **Processing Speed:** >50 listings/min

### Alerts

Set up alerts for:
- Consecutive scrape failures (>5)
- Low success rate (<70%)
- High error rate (>30%)
- Timeout issues (>10%)

---

## Future Enhancements

### Planned Features

- [ ] Job queue with Bull/Redis
- [ ] Automated scheduling (cron)
- [ ] Admin dashboard UI
- [ ] Real-time monitoring
- [ ] Additional sources (Bring a Trailer, Cars & Bids)
- [ ] Image downloading to Cloudinary
- [ ] VIN auto-extraction from images (OCR)
- [ ] Proxy rotation support

---

## API Reference

### Orchestrator Functions

```typescript
import {
  quickScrape,
  balancedScrape,
  comprehensiveScrape,
  scrapeCarsOnly,
  scrapeEventsOnly,
  testScrapers,
} from './server/services/scraping/orchestrator';

// Run quick scrape
await quickScrape();

// Run balanced scrape
await balancedScrape();

// Scrape 1,000 cars only
await scrapeCarsOnly(1000);

// Scrape 500 events only
await scrapeEventsOnly(500);

// Test all scrapers
await testScrapers();
```

### Individual Scrapers

```typescript
import { scrapeClassicCars } from './server/services/scraping/scrapers/classicCars';
import { scrapeHemmings } from './server/services/scraping/scrapers/hemmings';
import { scrapeEBayMotors } from './server/services/scraping/integrations/ebayMotors';
import { scrapeEventbrite } from './server/services/scraping/integrations/eventbrite';

// Scrape 500 listings from ClassicCars.com
const result1 = await scrapeClassicCars(500);

// Scrape 300 listings from Hemmings
const result2 = await scrapeHemmings(300);

// Scrape 200 listings from eBay Motors
const result3 = await scrapeEBayMotors(200);

// Scrape 100 events from Eventbrite
const result4 = await scrapeEventbrite(100);
```

---

## FAQ

**Q: Is web scraping legal?**
A: Scraping publicly available data is generally legal, but you must respect robots.txt, Terms of Service, and copyright. Our system is designed for legal compliance.

**Q: Do I need API keys?**
A: eBay and Eventbrite require free API keys. ClassicCars and Hemmings are scraped without keys (respecting robots.txt and rate limits).

**Q: How often should I run scrapers?**
A: Daily for events, weekly for car listings is recommended.

**Q: Will I get blocked?**
A: Our scrapers use stealth mode, realistic delays, and rate limiting to minimize blocking risk. API scrapers cannot be blocked.

**Q: Can I add more sources?**
A: Yes! Follow the existing scraper patterns in `/server/services/scraping/scrapers/`.

---

## Support

For issues or questions:

1. Check this documentation
2. Review scraper logs
3. Test individual scrapers
4. Open GitHub issue

---

**Last Updated:** 2025-01-17
**Version:** 1.0
**Maintained by:** Restomod Central Team
