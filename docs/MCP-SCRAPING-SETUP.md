# MCP Web Scraping Setup for Real Classic Car Data

**Created:** October 24, 2025
**Status:** ✅ Configuration Added
**Goal:** Scrape 1000+ REAL classic car listings from ClassicCars.com, Hemmings, etc.

---

## MCP Servers Configured

### ✅ Playwright MCP
- **Package:** `@playwright/mcp`
- **Cost:** FREE
- **Capabilities:** Browser automation, page navigation, DOM interaction, screenshots
- **Best For:** Navigating paginated listings, handling JavaScript-heavy sites
- **API Key:** Not required

### ✅ Crawl4AI MCP
- **Package:** `crawl4ai-mcp-server`
- **Cost:** FREE (self-hosted)
- **Capabilities:** Web scraping, crawling, structured extraction
- **Best For:** Alternative to Firecrawl, similar API but free
- **API Key:** Not required

### ⚠️ Firecrawl MCP (Optional - Paid)
- **Package:** `firecrawl-mcp`
- **Cost:** $20-40 for 1000 vehicles
- **Capabilities:** LLM-powered extraction, batch processing, structured data
- **Best For:** Highest quality structured extraction
- **API Key:** Required from https://firecrawl.dev

---

## Configuration Files

### Project-Level MCP Config
**File:** `/home/user/restomod_central/.mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "description": "Browser automation for web scraping classic car listings"
    },
    "crawl4ai": {
      "command": "npx",
      "args": ["-y", "crawl4ai-mcp-server"],
      "description": "Self-hosted web scraping (free Firecrawl alternative)"
    }
  }
}
```

### Optional: Add Firecrawl (Requires API Key)
```json
{
  "mcpServers": {
    "playwright": { ... },
    "crawl4ai": { ... },
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "YOUR_API_KEY_HERE"
      },
      "description": "Premium web scraping with LLM extraction"
    }
  }
}
```

---

## How to Use MCP Servers

### Verification
Once Claude Code recognizes the `.mcp.json` file:

```bash
# Check available MCP tools
/mcp

# You should see:
# - playwright: navigate, screenshot, click, type, extract
# - crawl4ai: scrape, crawl, extract_structured
```

### Enable/Disable Servers
```bash
# Enable specific server
@playwright

# Disable server
@playwright (toggle off)
```

---

## Scraping Strategy

### Option 1: Playwright MCP (Recommended - Free)

**Approach:** Navigate ClassicCars.com search pages, extract listings

```typescript
// Example prompt to Claude with Playwright MCP:
"Use Playwright MCP to:
1. Navigate to https://classiccars.com/listings/find/1967-1969/chevrolet/camaro
2. Extract all vehicle listings on the page (make, model, year, price, location, stock#, dealer)
3. Click 'Next Page' and repeat for 10 pages
4. Return structured JSON for all vehicles"
```

**Expected Output:**
```json
[
  {
    "stockNumber": "CC-1234567",
    "year": 1967,
    "make": "Chevrolet",
    "model": "Camaro",
    "price": "$45,000",
    "location": "Phoenix, Arizona",
    "dealer": "Gateway Classic Cars",
    "url": "https://classiccars.com/...",
    "images": ["url1", "url2"],
    "description": "Beautiful restored..."
  }
]
```

### Option 2: Crawl4AI MCP (Good Alternative)

**Approach:** Crawl website with structured extraction

```typescript
// Example prompt:
"Use Crawl4AI to scrape ClassicCars.com listings:
- URL: https://classiccars.com/listings/find/1965-1970/ford/mustang
- Extract: year, make, model, price, dealer, location, stock number
- Paginate through all results
- Return as JSON array"
```

### Option 3: Firecrawl MCP (Best Quality - Paid)

**Approach:** LLM-powered batch extraction

```typescript
// Example prompt:
"Use Firecrawl to batch scrape 100 ClassicCars.com URLs:
- Schema: { stockNumber, year, make, model, price, location, dealer, images[], description }
- LLM extraction for high accuracy
- Handle pagination automatically"
```

---

## Real Data Collection Workflow

### Phase 1: Setup & Test (1 hour)
1. Verify MCP servers are loaded: `/mcp`
2. Test single listing extraction with Playwright
3. Validate data structure matches `carsForSale` schema
4. Test pagination (10 listings)

### Phase 2: Bulk Collection (2-4 hours)
1. Target makes/models:
   - Ford Mustang (1965-1970): ~119 listings
   - Chevrolet Corvette (1967-1970): ~196 listings
   - Chevrolet Camaro (1967-1969): ~627 listings
   - Dodge Charger (1968-1970): ~79 listings
   - Plymouth Cuda (1970-1974): ~51 listings
   - Pontiac GTO (1965-1972): ~128 listings
   - *Total: ~1200 listings*

2. Scrape in batches of 50-100 vehicles
3. Save raw JSON to `/data/raw-scraped/`
4. Log progress and errors

### Phase 3: Data Import (30 min)
1. Validate scraped data structure
2. Transform to `InsertCarForSale` schema
3. Update `sourceType` to `'import'` (not `'research'`)
4. Import to database via `db.insert(carsForSale).values(vehicles)`
5. Generate price history for new vehicles

### Phase 4: Verification (30 min)
1. Run `scripts/verify-database.ts`
2. Verify `sourceType: 'import'` vehicles present
3. Test Phase 5 UI with real data
4. Validate images load, prices are correct
5. Check event-vehicle cross-linking

---

## Scraping Scripts

### Base Scraper Framework
**File:** `scripts/scrape-with-mcp.ts`

```typescript
import { db } from '../db';
import { carsForSale } from '../shared/schema';

/**
 * Real vehicle scraping via MCP servers
 *
 * Prerequisites:
 * - MCP servers configured in .mcp.json
 * - Playwright or Crawl4AI MCP available
 *
 * Usage:
 * 1. Run Claude Code in this project
 * 2. Verify MCP servers: /mcp
 * 3. Ask Claude: "Use Playwright MCP to scrape ClassicCars.com..."
 *
 * This file serves as reference schema and import logic.
 */

interface ScrapedVehicle {
  // Raw scraped data
  stockNumber?: string;
  year: number;
  make: string;
  model: string;
  price: string;
  location?: string;
  dealer?: string;
  dealerPhone?: string;
  dealerEmail?: string;
  description?: string;
  images?: string[];
  url: string;
  scrapedDate: string;

  // Additional fields from detail pages
  engine?: string;
  transmission?: string;
  mileage?: number;
  exteriorColor?: string;
  interiorColor?: string;
  vin?: string;
  bodyStyle?: string;
  condition?: string;
}

/**
 * Transform scraped data to database schema
 */
function transformToSchema(scraped: ScrapedVehicle): typeof carsForSale.$inferInsert {
  // Parse location
  const locationParts = (scraped.location || '').split(',').map(s => s.trim());
  const city = locationParts[0] || 'Unknown';
  const state = locationParts[1] || 'Unknown';

  // Parse price
  const priceNumber = parseInt(scraped.price.replace(/[^0-9]/g, ''));

  // Determine region
  const getRegion = (state: string): string => {
    const regions: Record<string, string> = {
      'Arizona': 'west', 'California': 'west', 'Nevada': 'west',
      'Florida': 'south', 'Texas': 'south', 'Georgia': 'south',
      'Illinois': 'midwest', 'Ohio': 'midwest', 'Michigan': 'midwest',
      'New York': 'northeast', 'Pennsylvania': 'northeast',
    };
    return regions[state] || 'south';
  };

  // Calculate investment grade (placeholder - enhance later)
  const calculateGrade = (year: number, make: string, price: number): string => {
    if (price > 100000 || year < 1968) return 'A+';
    if (price > 60000) return 'A';
    if (price > 40000) return 'A-';
    return 'B+';
  };

  // Determine category
  const getCategory = (make: string, model: string): string => {
    if (['Corvette', 'Mustang', 'Camaro', 'Charger', 'Cuda', 'Challenger', 'GTO', '442'].includes(model)) {
      return 'Muscle Cars';
    }
    if (['Corvette', 'Thunderbird'].includes(model)) {
      return 'Sports Cars';
    }
    return 'Classic Cars';
  };

  return {
    // Core data
    make: scraped.make,
    model: scraped.model,
    year: scraped.year,
    price: scraped.price,

    // Source information (CRITICAL - marks as REAL data)
    sourceType: 'import' as const,  // ← NOT 'research'!
    sourceName: `ClassicCars.com scrape - ${scraped.scrapedDate}`,

    // Location
    city,
    state,
    locationCity: city,
    locationState: state,
    locationRegion: getRegion(state),
    country: 'United States',

    // Vehicle details
    stockNumber: scraped.stockNumber,
    vin: scraped.vin,
    mileage: scraped.mileage,
    engine: scraped.engine,
    transmission: scraped.transmission,
    exteriorColor: scraped.exteriorColor,
    interiorColor: scraped.interiorColor,
    bodyStyle: scraped.bodyStyle,
    condition: scraped.condition || 'Good',
    description: scraped.description,

    // Classification
    category: getCategory(scraped.make, scraped.model),
    investmentGrade: calculateGrade(scraped.year, scraped.make, priceNumber),
    marketTrend: 'stable',

    // Dealer
    dealerName: scraped.dealer || 'Unknown Dealer',
    dealerPhone: scraped.dealerPhone,
    dealerEmail: scraped.dealerEmail,

    // Media
    images: scraped.images ? JSON.stringify(scraped.images) : null,
    imageUrl: scraped.images?.[0],

    // Source tracking
    source: 'ClassicCars.com',
    sourceUrl: scraped.url,
    datePosted: new Date(),

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Import scraped vehicles to database
 */
async function importScrapedVehicles(scrapedData: ScrapedVehicle[]) {
  console.log(`\n🔥 Importing ${scrapedData.length} REAL scraped vehicles...\n`);

  const vehicles = scrapedData.map(transformToSchema);

  // Import in batches
  const batchSize = 50;
  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize);
    await db.insert(carsForSale).values(batch);
    console.log(`   Imported ${Math.min(i + batchSize, vehicles.length)} / ${vehicles.length}`);
  }

  console.log(`\n✅ Successfully imported ${vehicles.length} REAL vehicles!`);
  console.log(`   Source Type: 'import' (REAL scraped data)`);
  console.log(`   NOT 'research' (synthetic data)`);

  return vehicles.length;
}

export { ScrapedVehicle, transformToSchema, importScrapedVehicles };
```

---

## Example Prompts for Claude

### Prompt 1: Test Single Listing
```
Use Playwright MCP to:
1. Navigate to https://classiccars.com/listings/view/1234567
2. Extract all vehicle details
3. Return as JSON matching ScrapedVehicle interface
```

### Prompt 2: Scrape Search Page
```
Use Playwright MCP to scrape this page:
https://classiccars.com/listings/find/1967-1969/chevrolet/camaro

Extract all listings (year, make, model, price, location, dealer, stock#, URL)
Return as JSON array
```

### Prompt 3: Bulk Scrape with Pagination
```
Use Playwright MCP to scrape ClassicCars.com:
- Make: Chevrolet Corvette
- Years: 1967-1970
- Scrape all pages (up to 100 listings)
- Extract full details for each
- Save to /data/raw-scraped/corvettes-1967-1970.json
```

### Prompt 4: Import to Database
```
Read /data/raw-scraped/corvettes-1967-1970.json
Transform using transformToSchema function
Import to database using importScrapedVehicles
Verify sourceType is 'import' not 'research'
```

---

## Data Quality Checklist

Before importing scraped data, verify:

- [ ] `sourceType === 'import'` (NOT 'research')
- [ ] Stock numbers are unique
- [ ] Prices are valid numbers
- [ ] Images are valid URLs
- [ ] Locations parsed correctly (city, state)
- [ ] Make/model normalized (Chevrolet not Chevy, etc.)
- [ ] Dates are valid timestamps
- [ ] Dealer information captured
- [ ] Source URL preserved for verification

---

## Next Steps

1. **Verify MCP Configuration**
   ```bash
   # In Claude Code
   /mcp
   # Should show: playwright, crawl4ai
   ```

2. **Test Playwright MCP**
   ```
   Ask Claude: "Use Playwright MCP to navigate to ClassicCars.com and extract one 1967 Mustang listing"
   ```

3. **Scrape First Batch (50 vehicles)**
   ```
   Ask Claude: "Scrape 50 Chevrolet Corvettes from ClassicCars.com using Playwright MCP"
   ```

4. **Import and Validate**
   ```bash
   npx tsx scripts/verify-database.ts
   # Check for sourceType: 'import'
   ```

5. **Scale to 1000+ Vehicles**
   ```
   Continue scraping in batches across all target makes/models
   ```

---

## Troubleshooting

### MCP Servers Not Loading
```bash
# Check .mcp.json syntax
cat .mcp.json | jq .

# Restart Claude Code in project directory
cd /home/user/restomod_central
claude
```

### Playwright Navigation Errors
```
# Websites may block automation
# Solution: Add delays, rotate user agents, use Crawl4AI instead
```

### Rate Limiting
```
# Add delays between requests
# Scrape 50-100 at a time with 1-2 second delays
```

---

## Summary

✅ **Configuration Added:** `.mcp.json` with Playwright and Crawl4AI
✅ **Scripts Ready:** `scrape-with-mcp.ts` transformation framework
✅ **Strategy Documented:** Phased approach for 1000+ real vehicles
⏳ **Next Action:** Verify MCP servers load via `/mcp` command

**Critical:** All imported data MUST have `sourceType: 'import'` to distinguish from synthetic research data.
