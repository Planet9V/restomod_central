# MCP Services Evaluation & Strategy for Classic Car Data Collection

**Date:** October 24, 2025
**Objective:** Collect 1000+ classic cars (1930-1980, $10k+) from ClassicCars.com, Hemmings, etc.
**Evaluation:** Perplexity MCP vs Firecrawl MCP vs Playwright MCP

---

## 🔍 Executive Summary

**Winner for Our Use Case: Firecrawl MCP** 🏆

**Ranking:**
1. **Firecrawl MCP** - Best for structured data extraction at scale
2. **Playwright MCP** - Best for complex interactions, JavaScript-heavy sites
3. **Perplexity MCP** - Best for research/summaries, not structured extraction

---

## 📊 Detailed Comparison Matrix

| Feature | Firecrawl MCP | Playwright MCP | Perplexity MCP |
|---------|---------------|----------------|----------------|
| **Structured Data Extraction** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐ Limited |
| **Batch Processing** | ⭐⭐⭐⭐⭐ Built-in | ⭐⭐⭐ Manual | ⭐⭐ Limited |
| **Rate Limiting** | ⭐⭐⭐⭐⭐ Automatic | ⭐⭐⭐ Manual | ⭐⭐⭐⭐ API managed |
| **Parallel Processing** | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐ Manual | ⭐⭐ Limited |
| **Cost Efficiency** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Free/Low | ⭐⭐⭐ API costs |
| **Speed (1000 cars)** | ⭐⭐⭐⭐⭐ 2-4 hours | ⭐⭐⭐ 6-10 hours | ⭐⭐ 10-20 hours |
| **Setup Complexity** | ⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Easiest |
| **Data Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Robustness** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐ Good |
| **Classic Car Sites** | ⭐⭐⭐⭐⭐ Perfect fit | ⭐⭐⭐⭐ Works well | ⭐⭐⭐ Not ideal |

---

## 1️⃣ Firecrawl MCP - Deep Dive

### Overview
Official Firecrawl MCP Server that integrates with Firecrawl API for advanced web scraping, specifically designed for LLM context.

### Core Capabilities

**Tools Available:**
- `FIRECRAWL_SCRAPE_EXTRACT_DATA_LLM` - Scrape and extract structured data
- `FIRECRAWL_CRAWL_URLS` - Crawl entire websites
- `FIRECRAWL_EXTRACT` - Extract structured data with schema
- `FIRECRAWL_CRAWL_JOB_STATUS` - Monitor crawl progress
- `FIRECRAWL_CANCEL_CRAWL_JOB` - Cancel jobs

**Key Features:**
- ✅ **LLM-Powered Extraction** - Uses AI to understand page structure
- ✅ **Parallel Processing** - Handles multiple URLs simultaneously
- ✅ **Auto Rate Limiting** - Built-in protection against rate limits
- ✅ **Retry Logic** - Automatic retries on failures
- ✅ **Batch Processing** - Process hundreds of URLs in one job
- ✅ **Image Extraction** - Supports extracting images
- ✅ **Summary Format** - Can get concise summaries
- ✅ **Map Endpoint** - Up to 100k results

### Strengths for Classic Car Collection

**Perfect For:**
1. **Structured Listing Pages** - ClassicCars.com, Hemmings listing grids
2. **Detail Page Extraction** - Extract specs, price, location, etc.
3. **Batch Operations** - Process 100+ vehicles in one go
4. **Consistent Data** - Returns clean, structured JSON

**Example Use Case:**
```javascript
// Step 1: Get listing URLs
FIRECRAWL_CRAWL_URLS({
  url: "https://classiccars.com/listings/find/1967/ford/mustang",
  extractSchema: {
    listings: [{
      url: "string",
      year: "number",
      make: "string",
      model: "string",
      price: "string"
    }]
  }
})

// Step 2: Extract details from each listing
FIRECRAWL_SCRAPE_EXTRACT_DATA_LLM({
  urls: [list of 100 URLs],
  schema: {
    stockNumber: "string",
    year: "number",
    make: "string",
    model: "string",
    price: "string",
    location: {
      city: "string",
      state: "string"
    },
    specs: {
      engine: "string",
      transmission: "string",
      mileage: "number"
    },
    images: ["string"],
    description: "string",
    seller: {
      name: "string",
      phone: "string",
      email: "string"
    }
  }
})
```

### Estimated Performance
- **Setup Time:** 30 minutes
- **100 Vehicles:** 20-30 minutes
- **1000 Vehicles:** 2-4 hours
- **Success Rate:** 95-98%

### Pricing (Firecrawl API)
- Free Tier: 500 credits (~500 pages)
- Hobby: $20/month - 5,000 credits
- Standard: $100/month - 50,000 credits
- **Cost for 1000 vehicles:** ~$20-40 (including detail pages)

---

## 2️⃣ Playwright MCP - Deep Dive

### Overview
Browser automation MCP server using Microsoft's Playwright. Provides full browser control with accessibility tree navigation.

### Core Capabilities

**Tools Available:**
- `playwright_navigate` - Navigate to URLs
- `playwright_screenshot` - Take screenshots
- `playwright_click` - Click elements
- `playwright_fill` - Fill form fields
- `playwright_select` - Select dropdowns
- `playwright_evaluate` - Execute JavaScript
- `playwright_get_accessibility_tree` - Get page structure

**Key Features:**
- ✅ **Real Browser** - Chrome, Firefox, WebKit, Edge
- ✅ **JavaScript Execution** - Handles dynamic content
- ✅ **Form Interaction** - Can search, filter, login
- ✅ **Screenshot Capture** - Visual verification
- ✅ **Accessibility Tree** - LLM-friendly structured data
- ✅ **No Vision Model Needed** - Uses structured snapshots

### Strengths for Classic Car Collection

**Perfect For:**
1. **JavaScript-Heavy Sites** - Sites with dynamic loading
2. **Form Interactions** - Search forms, filters
3. **Paginated Results** - Click "Next Page" buttons
4. **Complex Navigation** - Multi-step extraction processes
5. **Authentication** - Login to dealer portals

**Example Use Case:**
```javascript
// Step 1: Navigate and search
playwright_navigate("https://classiccars.com")
playwright_fill("#search", "1967 Ford Mustang")
playwright_click("button[type=submit]")

// Step 2: Get results
playwright_get_accessibility_tree()
// Parse accessibility tree for listing URLs

// Step 3: Loop through each listing
for (url in listings) {
  playwright_navigate(url)
  playwright_get_accessibility_tree()
  // Extract data from accessibility tree
}
```

### Estimated Performance
- **Setup Time:** 1-2 hours
- **100 Vehicles:** 1-2 hours
- **1000 Vehicles:** 6-10 hours
- **Success Rate:** 90-95%

### Pricing
- **Free** - Self-hosted
- **Only cost:** Compute resources

---

## 3️⃣ Perplexity MCP - Deep Dive

### Overview
MCP server that provides web search and research capabilities using Perplexity AI's API.

### Core Capabilities

**Tools Available:**
- `perplexity_search` - Search the web
- `perplexity_ask` - Ask questions with citations
- `perplexity_research` - Deep research on topics

**Key Features:**
- ✅ **AI-Powered Search** - Intelligent query understanding
- ✅ **Source Citations** - Links to original sources
- ✅ **Summary Generation** - Concise answers
- ✅ **Real-time Data** - Current information
- ✅ **No API Key Version** - Web interaction mode

### Strengths for Classic Car Collection

**Best For:**
1. **Market Research** - "What's the average 1967 Mustang price?"
2. **Trend Analysis** - "Which classic cars are appreciating?"
3. **General Discovery** - "Best classic car dealers in California"
4. **Content Aggregation** - Summaries from multiple sources

**NOT Good For:**
1. ❌ Structured data extraction
2. ❌ Batch processing
3. ❌ Individual listing details
4. ❌ Consistent schema

**Example Use Case:**
```javascript
// This is what Perplexity is GOOD for:
perplexity_search("Best websites for classic car listings 2025")
perplexity_ask("What's the average price of a 1967 Ford Mustang in excellent condition?")

// But NOT good for:
// "Extract all Ford Mustang listings from ClassicCars.com" ❌
```

### Estimated Performance
- **Setup Time:** 15 minutes
- **Market Research:** Excellent
- **Structured Data Collection:** Poor
- **1000 Individual Listings:** Not feasible

### Pricing (Perplexity API)
- Free: 5 searches/day
- Standard: $20/month - 300 searches
- Pro: $200/month - 5,000 searches

---

## 🏆 Ranking & Recommendation

### For Collecting 1000 Classic Cars

**1. Firecrawl MCP** 🥇
**Score: 9.5/10**

**Why #1:**
- ✅ **Purpose-built for this** - Designed for structured extraction
- ✅ **Fastest** - 2-4 hours for 1000 vehicles
- ✅ **Most reliable** - 95-98% success rate
- ✅ **Best data quality** - Consistent structured output
- ✅ **Easiest to maintain** - Built-in retries, rate limiting
- ✅ **Scalable** - Can handle 10,000+ vehicles easily

**Drawbacks:**
- ⚠️ Requires API key (costs $20-40 for 1000 vehicles)
- ⚠️ Dependent on Firecrawl service

**Best For:** Production use, ongoing collection, large scale

---

**2. Playwright MCP** 🥈
**Score: 8.0/10**

**Why #2:**
- ✅ **Free** - No API costs
- ✅ **Full control** - Complete browser automation
- ✅ **Handles anything** - Can deal with any site complexity
- ✅ **JavaScript execution** - Works with dynamic sites
- ✅ **Educational** - See exactly what's happening

**Drawbacks:**
- ⚠️ Slower - 6-10 hours for 1000 vehicles
- ⚠️ More manual coding required
- ⚠️ Need to handle rate limiting yourself
- ⚠️ Higher maintenance

**Best For:** Complex sites, one-time large collection, learning

---

**3. Perplexity MCP** 🥉
**Score: 4.0/10**

**Why #3:**
- ✅ **Great for research** - Market intelligence
- ✅ **Easy to use** - Simple queries
- ✅ **Good summaries** - Understand markets quickly

**Drawbacks:**
- ❌ **Not designed for this** - Not for structured extraction
- ❌ **Can't batch process** - One query at a time
- ❌ **Inconsistent output** - Summaries not structured data
- ❌ **Expensive at scale** - High API costs for 1000 queries

**Best For:** Market research, trend analysis, NOT data collection

---

## 🎯 Recommended Strategy: Hybrid Approach

### Phase 1: Initial Collection (Firecrawl) - Days 1-2

**Objective:** Collect 1000 vehicles quickly

**Tool:** Firecrawl MCP
**Timeline:** 2-4 hours active work
**Cost:** $20-40

**Process:**
```typescript
1. Target Selection
   - Ford Mustang 1965-1970: 150 vehicles
   - Chevrolet Corvette 1963-1977: 150 vehicles
   - Chevrolet Camaro 1967-1970: 100 vehicles
   - Dodge Charger/Challenger 1968-1970: 100 vehicles
   - Pontiac GTO 1964-1969: 100 vehicles
   - Plymouth Barracuda/Road Runner: 75 vehicles
   - Additional classics: 325 vehicles

2. Collection Script (Firecrawl)
   // Step A: Get listing URLs (10 minutes)
   FIRECRAWL_CRAWL_URLS for each make/model/year

   // Step B: Extract details in batches of 100 (2-3 hours)
   FIRECRAWL_SCRAPE_EXTRACT_DATA_LLM({
     urls: batch_of_100_urls,
     schema: VEHICLE_SCHEMA,
     parallel: true
   })

3. Data Validation (1 hour)
   - Check completeness
   - Verify price > $10k
   - Confirm year 1930-1980
   - Validate required fields

4. Database Import (30 minutes)
   - Transform to carsForSale schema
   - Import to database
   - Generate price history
```

**Expected Results:**
- 1000 vehicles collected
- 95% complete data
- All required fields populated
- Ready for production

---

### Phase 2: Ongoing Maintenance (Playwright) - Weekly

**Objective:** Keep data fresh, add new listings

**Tool:** Playwright MCP
**Timeline:** 1 hour per week
**Cost:** Free

**Process:**
```typescript
Weekly Update Script:
1. Check for new listings (15 min)
   - Navigate to each target site
   - Check for new vehicles posted this week
   - Collect 20-50 new listings

2. Update existing listings (15 min)
   - Check if vehicles still available
   - Update prices if changed
   - Mark sold vehicles

3. Quality additions (30 min)
   - Manually select 5-10 premium vehicles
   - Extract complete details
   - Verify seller information
```

**Expected Results:**
- Database stays current
- 20-50 new vehicles per week
- Sold listings removed
- Price changes tracked

---

### Phase 3: Market Intelligence (Perplexity) - Monthly

**Objective:** Understand market trends

**Tool:** Perplexity MCP
**Timeline:** 2 hours per month
**Cost:** $20/month

**Process:**
```typescript
Monthly Market Analysis:
1. Price Trends
   "What are the price trends for [make/model] in 2025?"

2. Investment Intelligence
   "Which classic cars under $50k are appreciating fastest?"

3. Geographic Analysis
   "Where are the most classic cars listed? Regional trends?"

4. Seasonal Patterns
   "Classic car listing patterns by season"

5. Update Investment Grades
   - Adjust based on market intelligence
   - Update appreciation rates
   - Refine market trend classifications
```

**Expected Results:**
- Market intelligence reports
- Updated investment grades
- Trend documentation
- Better user insights

---

## 📋 Implementation Plan

### Step 1: Setup Firecrawl MCP (Day 1 Morning)

**Tasks:**
1. ✅ Sign up for Firecrawl API ($20-100/month plan)
2. ✅ Install Firecrawl MCP server
3. ✅ Configure in Claude Desktop/Code
4. ✅ Test with 10 sample vehicles
5. ✅ Verify data quality

**Time:** 2 hours
**Deliverable:** Working Firecrawl integration

---

### Step 2: Create Collection Scripts (Day 1 Afternoon)

**Tasks:**
1. ✅ `scripts/firecrawl-collect-vehicles.ts`
   - Target configuration (makes/models)
   - Batch processing logic
   - Error handling
   - Data validation

2. ✅ `scripts/firecrawl-extract-details.ts`
   - Detail page extraction
   - Schema definition
   - Image collection
   - Seller information

3. ✅ `scripts/import-firecrawl-data.ts`
   - Transform to carsForSale schema
   - Database import
   - Price history generation
   - Event cross-linking

**Time:** 4 hours
**Deliverable:** Complete collection pipeline

---

### Step 3: Execute Collection (Day 1 Evening)

**Tasks:**
1. ✅ Run collection for all target makes/models
2. ✅ Process in batches of 100
3. ✅ Monitor progress and errors
4. ✅ Validate data quality
5. ✅ Import to database

**Time:** 2-4 hours (mostly automated)
**Deliverable:** 1000 vehicles in database

---

### Step 4: Setup Playwright MCP (Day 2 Morning)

**Tasks:**
1. ✅ Install Playwright MCP server
2. ✅ Configure browsers
3. ✅ Create weekly update script
4. ✅ Test on 5 sample vehicles
5. ✅ Document process

**Time:** 2 hours
**Deliverable:** Weekly update automation

---

### Step 5: Setup Perplexity MCP (Day 2 Afternoon)

**Tasks:**
1. ✅ Install Perplexity MCP server
2. ✅ Create market research queries
3. ✅ Build monthly analysis workflow
4. ✅ Test intelligence gathering
5. ✅ Document insights

**Time:** 1 hour
**Deliverable:** Monthly market analysis process

---

### Step 6: Production Deployment (Day 2 Evening)

**Tasks:**
1. ✅ Verify all 1000 vehicles
2. ✅ Run price history generation
3. ✅ Update event cross-links
4. ✅ Test Phase 5 UI
5. ✅ Create PR
6. ✅ Deploy to production

**Time:** 2 hours
**Deliverable:** Phase 5 deployed with 1000 real vehicles

---

## 🔄 Repeatable Process Documentation

### **Process Name:** "Monthly Classic Car Data Refresh"

**Frequency:** Monthly
**Duration:** 4 hours
**Tools:** Firecrawl (primary), Playwright (backup)

**Steps:**

```typescript
// 1. NEW LISTINGS COLLECTION (2 hours)
async function collectNewListings() {
  const targets = [
    { make: 'Ford', model: 'Mustang', count: 50 },
    { make: 'Chevrolet', model: 'Corvette', count: 50 },
    // ... more targets
  ];

  for (const target of targets) {
    // Use Firecrawl to get latest listings
    const urls = await FIRECRAWL_CRAWL_URLS({
      url: buildSearchUrl(target),
      filters: {
        postedAfter: lastCollectionDate,
        priceMin: 10000
      }
    });

    // Extract details in batch
    const vehicles = await FIRECRAWL_SCRAPE_EXTRACT_DATA_LLM({
      urls: urls,
      schema: VEHICLE_SCHEMA
    });

    // Import to database
    await importVehicles(vehicles);
  }
}

// 2. UPDATE EXISTING LISTINGS (1 hour)
async function updateExistingListings() {
  const existingVehicles = await db.query.carsForSale.findMany({
    where: eq(carsForSale.sourceType, 'firecrawl_listing')
  });

  // Check each vehicle (use Playwright for spot checks)
  for (const vehicle of existingVehicles) {
    const status = await checkVehicleStatus(vehicle.sourceUrl);

    if (status === 'sold' || status === '404') {
      await markAsSold(vehicle.id);
    } else if (status.priceChanged) {
      await updatePrice(vehicle.id, status.newPrice);
      await addPriceHistory(vehicle.id, status.newPrice);
    }
  }
}

// 3. MARKET INTELLIGENCE (1 hour)
async function gatherMarketIntelligence() {
  // Use Perplexity for market analysis
  const trends = await PERPLEXITY_RESEARCH([
    "Classic car price trends October 2025",
    "Most appreciating muscle cars 2025",
    "Regional classic car market analysis"
  ]);

  // Update investment grades
  await updateInvestmentGrades(trends);

  // Generate report
  await generateMarketReport(trends);
}

// 4. EXECUTE MONTHLY REFRESH
async function monthlyRefresh() {
  console.log('🔄 Starting Monthly Data Refresh...\n');

  await collectNewListings();      // +200-300 new vehicles
  await updateExistingListings();  // Update 1000 existing
  await gatherMarketIntelligence(); // Market insights

  console.log('✅ Monthly Refresh Complete!');
  console.log(`   New vehicles: ${newCount}`);
  console.log(`   Updated: ${updateCount}`);
  console.log(`   Marked sold: ${soldCount}`);
}
```

---

## 💰 Total Cost Analysis

### Initial Collection (1000 Vehicles)

**Firecrawl API:**
- Cost: $20-40 one-time
- Time: 2-4 hours

**Playwright:**
- Cost: $0
- Time: 6-10 hours

**Perplexity (optional):**
- Cost: $20/month
- Time: 1 hour

**Recommended:** Firecrawl for speed and reliability

---

### Ongoing Maintenance (Monthly)

**Firecrawl API:**
- Cost: $20-40/month
- Time: 2 hours/month
- Benefit: 200-300 new vehicles + updates

**Playwright:**
- Cost: $0
- Time: 4 hours/month
- Benefit: Same as Firecrawl but more time

**Perplexity:**
- Cost: $20/month (optional)
- Time: 1 hour/month
- Benefit: Market intelligence

**Total Ongoing:** $40-60/month or $0 (Playwright only)

---

## ✅ Next Steps

### Immediate (Today):

1. **Decision Required:** Which MCP service to setup first?
   - **Recommended:** Firecrawl (fastest path to 1000 vehicles)
   - **Alternative:** Playwright (free, more time)

2. **If Firecrawl:**
   - Sign up for API ($20-100/month)
   - I'll create collection scripts
   - Collect 1000 vehicles in 2-4 hours
   - Deploy Phase 5 today

3. **If Playwright:**
   - Install and configure
   - Create collection scripts
   - Collect 1000 vehicles in 6-10 hours
   - Deploy Phase 5 tomorrow

**What would you like to proceed with?**
