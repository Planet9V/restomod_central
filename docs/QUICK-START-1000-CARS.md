# Quick Start: Import 1000 Real Classic Cars

**Goal**: Get from 172 cars to 1000+ cars in 2-4 weeks
**Method**: Multi-source web scraping with Playwright MCP (FREE) or Firecrawl (PAID)
**Difficulty**: Medium (some manual intervention required)

---

## 🚀 Quick Start (5 Minutes to First 10 Cars)

### Step 1: Install Playwright MCP (if not already installed)

```bash
# From terminal:
claude mcp add playwright npx -- @playwright/mcp@latest

# Verify installation:
claude
# Then type: /mcp
# You should see "playwright" in the list
```

### Step 2: Test the Import Script

```bash
# Run in test mode (uses mock data):
tsx scripts/import-1000-cars.ts --limit=5

# Expected output:
# ✅ Imported: 1967 Chevrolet Corvette - $50,000
# ✅ Imported: 1969 Ford Mustang - $60,000
# ...
# 📊 Imported: 5 vehicles
```

### Step 3: Verify Database

```bash
# Check the database:
sqlite3 db/local.db "SELECT COUNT(*) FROM cars_for_sale;"
# Should show: 5 (or however many you imported)

sqlite3 db/local.db "SELECT year, make, model, price FROM cars_for_sale LIMIT 5;"
# Should show your imported cars
```

### Step 4: View in UI

```bash
# Start dev server:
npm run dev

# Visit: http://localhost:5000/cars-for-sale
# You should see the imported cars displayed
```

---

## 📋 Method 1: Use Playwright MCP (FREE - Recommended)

### How It Works

Playwright MCP allows Claude Code to control a browser and extract data. You give Claude Code instructions, and it scrapes the websites for you.

### Usage Example

In Claude Code, send this message:

```
Use Playwright MCP to scrape ClassicCars.com:

URL: https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars&page=1

For each vehicle listing on the page, extract:
- stockNumber (from URL or listing ID)
- year (vehicle year)
- make (manufacturer)
- model (model name)
- price (asking price)
- location (city, state)
- dealer (dealer name)
- imageUrl (main image)
- listingUrl (link to full listing)

Return as JSON array of 20 vehicles.

Example format:
[
  {
    "stockNumber": "CC-1234567",
    "year": 1967,
    "make": "Chevrolet",
    "model": "Camaro SS",
    "price": "$89,500",
    "location": "Phoenix, Arizona",
    "dealer": "Arizona Classic Cars",
    "imageUrl": "https://...",
    "listingUrl": "https://classiccars.com/listings/view/1234567"
  }
]
```

### Save the Results

Claude Code will return JSON. Save it to a file:

```bash
# Save Claude's output to:
data/scraped-classiccars-batch1.json
```

### Import to Database

```typescript
// Create scripts/import-scraped-batch.ts:
import { readFileSync } from 'fs';
import { db } from '../db';
import { carsForSale } from '../shared/schema';

async function importBatch(filename: string) {
  const rawData = readFileSync(filename, 'utf-8');
  const vehicles = JSON.parse(rawData);

  console.log(`Importing ${vehicles.length} vehicles...`);

  for (const vehicle of vehicles) {
    // Transform to match schema
    const car = {
      stockNumber: vehicle.stockNumber || `CC-${Date.now()}`,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      price: vehicle.price,
      sourceType: 'import',
      sourceName: 'ClassicCars.com',
      locationCity: vehicle.location?.split(',')[0]?.trim(),
      locationState: vehicle.location?.split(',')[1]?.trim(),
      dealer: vehicle.dealer,
      imageUrl: vehicle.imageUrl,
      listingUrl: vehicle.listingUrl,
      scrapedAt: new Date()
    };

    try {
      await db.insert(carsForSale).values(car);
      console.log(`✅ ${car.year} ${car.make} ${car.model}`);
    } catch (e) {
      console.log(`⏭️  Skipped duplicate: ${car.stockNumber}`);
    }
  }

  console.log('Import complete!');
}

importBatch('data/scraped-classiccars-batch1.json');
```

```bash
# Run import:
tsx scripts/import-scraped-batch.ts
```

---

## 📋 Method 2: Use Firecrawl API (PAID - $20-40 for 1000 cars)

### Setup

```bash
# Install Firecrawl:
npm install @mendable/firecrawl-js

# Get API key:
# 1. Visit https://firecrawl.dev
# 2. Sign up
# 3. Get API key (fc-xxx...)
# 4. Add to .env:
echo "FIRECRAWL_API_KEY=fc-xxx..." >> .env
```

### Usage Script

```typescript
// scripts/scrape-with-firecrawl.ts
import Firecrawl from '@mendable/firecrawl-js';
import { db } from '../db';
import { carsForSale } from '../shared/schema';

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! });

async function scrapeClassicCars(limit: number = 100) {
  const baseUrl = 'https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars';

  console.log('Scraping ClassicCars.com with Firecrawl...');

  // Scrape with structured extraction
  const scrapeResult = await app.scrapeUrl(baseUrl, {
    formats: ['markdown'],
    onlyMainContent: true
  });

  // Extract vehicle data from markdown
  // (You'd need to parse the markdown or use Firecrawl's extract feature)

  console.log('Scraping complete!');
}

scrapeClassicCars(100);
```

### Run It

```bash
tsx scripts/scrape-with-firecrawl.ts
```

---

## 📋 Method 3: Batch Process with URLs

### Create URL List

```bash
# Create data/scraping-urls.txt:
cat > data/scraping-urls.txt << EOF
https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars&page=1
https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars&page=2
https://classiccars.com/listings/find?make=chevrolet&model=corvette&page=1
https://classiccars.com/listings/find?make=ford&model=mustang&page=1
https://www.hemmings.com/classifieds?make=Chevrolet&year_range=1960-1969
https://bringatrailer.com/auctions/results/?q=muscle+car
EOF
```

### Process Each URL

Send to Claude Code (one at a time or in batches):

```
Process these ClassicCars.com URLs and extract vehicle data:

1. https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars&page=1
2. https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars&page=2

For each URL:
1. Use Playwright MCP to navigate to the page
2. Extract all vehicle listings (20 per page = 40 total)
3. Return as JSON array

Required fields per vehicle:
- stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl
```

---

## 📊 Daily Workflow (Get 50-100 cars/day)

### Morning (30 mins)

```bash
# 1. Pick a category (e.g., "1960s Muscle Cars")
# 2. Ask Claude Code to scrape 2-3 pages (40-60 cars)
# 3. Save JSON to data/scraped-YYYYMMDD-batch1.json
```

### Afternoon (30 mins)

```bash
# 1. Pick another category (e.g., "Corvettes")
# 2. Ask Claude Code to scrape 2 pages (40 cars)
# 3. Save JSON to data/scraped-YYYYMMDD-batch2.json
```

### Evening (15 mins)

```bash
# 1. Import both batches:
tsx scripts/import-scraped-batch.ts data/scraped-YYYYMMDD-batch1.json
tsx scripts/import-scraped-batch.ts data/scraped-YYYYMMDD-batch2.json

# 2. Verify:
sqlite3 db/local.db "SELECT COUNT(*) FROM cars_for_sale;"

# 3. Check UI:
npm run dev
# Visit http://localhost:5000/cars-for-sale
```

### Weekly Target

- **Mon-Fri**: 50-100 cars/day = 250-500 cars/week
- **Week 1**: 300 cars (ClassicCars.com)
- **Week 2**: 300 cars (Hemmings + BringATrailer)
- **Week 3**: 300 cars (Gateway + eBay)
- **Week 4**: 100 cars (fill gaps) + quality check

**Total: 1000+ cars in 4 weeks**

---

## 🎯 Target Categories (Suggested Order)

### Week 1: ClassicCars.com (300 cars)

```
Day 1: 1960s Muscle Cars (Camaro, Mustang, Charger) - 60 cars
Day 2: Corvettes (1953-1980) - 50 cars
Day 3: 1950s Classics (Bel Air, Thunderbird) - 50 cars
Day 4: Mustangs (1964-1973) - 50 cars
Day 5: Pre-war Classics (1930-1949) - 40 cars
Day 6: Modern Classics (1980-2000) - 50 cars
```

### Week 2: Hemmings + BringATrailer (300 cars)

```
Day 1-2: Hemmings Chevrolet (100 cars)
Day 3-4: Hemmings Ford (100 cars)
Day 5-6: BringATrailer auctions (100 cars)
```

### Week 3: Gateway + eBay + Misc (300 cars)

```
Day 1-2: Gateway all locations (100 cars)
Day 3-4: eBay Motors classics (100 cars)
Day 5-6: Cars On Line + others (100 cars)
```

### Week 4: Quality & Completion (100 cars)

```
Day 1-2: Fill gaps in makes/models (50 cars)
Day 3-4: Geographic diversity (50 cars)
Day 5: Data validation and cleanup
Day 6-7: Final quality check
```

---

## 🛠️ Troubleshooting

### Issue: Playwright MCP not working

```bash
# Reinstall:
claude mcp remove playwright
claude mcp add playwright npx -- @playwright/mcp@latest

# Restart Claude Code
```

### Issue: Getting blocked by website

```bash
# Solutions:
1. Add delays between requests (ask Claude to wait 3-5 seconds)
2. Scrape during off-peak hours (late night)
3. Switch to Firecrawl (bypasses anti-bot)
4. Use different sources (if ClassicCars.com blocks, try Hemmings)
```

### Issue: Duplicate imports

```bash
# The script checks for duplicates by:
# 1. Stock number
# 2. VIN (if available)
# 3. Year + Make + Model + Location

# If getting duplicates, check:
sqlite3 db/local.db "SELECT stockNumber, COUNT(*) FROM cars_for_sale GROUP BY stockNumber HAVING COUNT(*) > 1;"

# Remove duplicates:
sqlite3 db/local.db "DELETE FROM cars_for_sale WHERE rowid NOT IN (SELECT MIN(rowid) FROM cars_for_sale GROUP BY stockNumber);"
```

### Issue: Missing required fields

```bash
# Check for incomplete data:
sqlite3 db/local.db "SELECT * FROM cars_for_sale WHERE price IS NULL OR locationCity IS NULL LIMIT 10;"

# The import script will:
# 1. Generate stock number if missing
# 2. Set default values for optional fields
# 3. Skip vehicles missing year/make/model
```

---

## 📈 Progress Tracking

### Check Current Count

```bash
# Total cars:
sqlite3 db/local.db "SELECT COUNT(*) FROM cars_for_sale;"

# By source:
sqlite3 db/local.db "SELECT sourceName, COUNT(*) FROM cars_for_sale GROUP BY sourceName;"

# By category:
sqlite3 db/local.db "SELECT category, COUNT(*) FROM cars_for_sale GROUP BY category;"

# By decade:
sqlite3 db/local.db "SELECT (year / 10) * 10 AS decade, COUNT(*) FROM cars_for_sale GROUP BY decade ORDER BY decade;"
```

### Daily Report Script

```bash
# Create scripts/daily-report.ts:
import { db } from '../db';
import { carsForSale } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function dailyReport() {
  const total = await db.select({ count: sql<number>`COUNT(*)` }).from(carsForSale);
  const bySource = await db.select({
    source: carsForSale.sourceName,
    count: sql<number>`COUNT(*)`
  }).from(carsForSale).groupBy(carsForSale.sourceName);

  console.log(`\n📊 Daily Report - ${new Date().toLocaleDateString()}`);
  console.log(`═══════════════════════════════════════`);
  console.log(`Total Cars: ${total[0].count} / 1000 (${(total[0].count / 10).toFixed(1)}%)`);
  console.log(`\nBy Source:`);
  bySource.forEach(s => console.log(`  ${s.source}: ${s.count}`));
  console.log(`\nTarget: ${1000 - total[0].count} more cars needed`);
  console.log(`ETA: ${Math.ceil((1000 - total[0].count) / 50)} days at 50 cars/day\n`);
}

dailyReport();
```

```bash
# Run daily:
tsx scripts/daily-report.ts
```

---

## 🎉 Success Checklist

### After importing 1000 cars:

- ✅ Total count: 1000+ in `cars_for_sale` table
- ✅ Duplicates removed: <5% duplicate rate
- ✅ Data completeness: 90%+ have all required fields
- ✅ Geographic distribution: ~25% per region
- ✅ Category balance: Top 10 makes represented
- ✅ Price range: Good spread from $20k to $500k+
- ✅ Images: 95%+ have at least 1 image
- ✅ UI tested: Cars display correctly on website
- ✅ Search works: Can filter by make, year, price
- ✅ Documentation updated: Record sources and dates

---

## 🚀 Next Steps After 1000 Cars

### Immediate

1. **Quality Assurance**: Manually review 100 random cars
2. **Data Enhancement**: Add missing fields (mileage, colors, VIN)
3. **Image Optimization**: Download and host images locally
4. **SEO**: Create individual pages for each car
5. **Analytics**: Track most viewed cars

### Future

1. **Automated Updates**: Schedule weekly scraping
2. **Price Tracking**: Monitor price changes over time
3. **Market Analysis**: Identify trends and opportunities
4. **User Features**: Saved searches, favorites, alerts
5. **Dealer Partnerships**: Direct API integrations

---

**Last Updated**: 2025-11-17
**Estimated Time**: 2-4 weeks to reach 1000 cars
**Cost**: $0 (Playwright MCP) or $20-60 (Firecrawl)
