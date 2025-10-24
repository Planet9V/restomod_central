# Data Collection Summary - October 24, 2025

## Overview

This document summarizes the data collection efforts for populating the Restomod Central classic car marketplace database.

## Current Database Status

**Final Stats (as of Oct 24, 2025):**
- **Total Vehicles:** 518
- **Real Scraped Listings:** 23 (sourceType: 'import')
- **Market Research Data:** 495 (sourceType: 'research')
- **Price History Records:** 5,708
- **Events:** 17 (with vehicle cross-linking)

### Distribution by Make
- Chevrolet: 141 vehicles
- Plymouth: 89 vehicles
- Dodge: 88 vehicles
- Ford: 80 vehicles
- Pontiac: 51 vehicles
- AMC: 37 vehicles
- Oldsmobile: 32 vehicles

---

## Data Collection Methods

### Method 1: Market Research Data (495 vehicles)

**Approach:** Used WebSearch to gather real October 2025 market intelligence from ClassicCars.com, then generated realistic synthetic vehicles based on actual market data.

**Source:** `scripts/populate-enhanced-market-vehicles.ts`

**Key Features:**
- Real listing counts per make/model from ClassicCars.com
- Actual average prices and price ranges
- Market trends (rising/stable/declining)
- Investment grade calculations
- Realistic variations in color, condition, location

**Quality:**
- ✅ Based on real market data
- ✅ Realistic pricing
- ✅ Proper investment grade distribution
- ❌ Not actual scraped listings

### Method 2: Real Scraped Data (23 vehicles)

**Approach:** Systematic WebSearch queries to find individual listings with verified stock numbers, dealer information, and complete details.

**Source Files:**
- `data/real-listings-found.json` (17 original listings)
- `data/websearch-listings-batch-2.json` (7 additional listings)
- `data/real-listings-import.json` (23 merged unique listings)

**Import Script:** `scripts/import-real-listings.ts`

**Verified Listings:**
All 23 vehicles have real ClassicCars.com CC- stock numbers and verified dealer information:

1. CC-2008574 - 1969 Ford Mustang Mach 1, Ocala FL
2. CC-1938354 - 1969 Ford Mustang, Lenexa KS, KC Classic Auto
3. CC-1971261 - 1969 Ford Mustang, Yorktown IN
4. CC-1893708 - 1967 Chevrolet Camaro Convertible, Glendale CA
5. CC-1683081 - 1970 Plymouth Cuda, Cadillac MI
6. CC-1585152 - 1970 Plymouth Cuda, Pompano Beach FL
7. CC-1757748 - 1970 Plymouth Cuda, Chatsworth CA
8. CC-1174953 - 1970 Plymouth Cuda, Halton Hills ON
9. CC-894499 - 1970 Plymouth Cuda, Arvada CO
10. CC-1928527 - 1971 Dodge Challenger, Cadillac MI
11. CC-1935261 - 1971 Dodge Challenger, Celeste TX
12. CC-1872883 - 1971 Dodge Challenger, Bradington FL
13. CC-1877858 - 1967 Chevrolet Corvette, Charlotte NC
14. CC-922011 - 1967 Chevrolet Corvette, Des Moines IA
15. CC-1888525 - 1967 Chevrolet Corvette, Clifton Park NY
16. CC-1920323 - 1967 Chevrolet Corvette, Sarasota FL
17. CC-1972160 - 1967 Chevrolet Corvette Coupe
18. CC-1939237 - 1967 Pontiac GTO, Newfield NJ, South Jersey Classics
19. CC-1649045 - 1969 Dodge Charger, Green Brook NJ
20. CC-1514851 - 1970 Chevrolet Chevelle SS, Winter Garden FL
21. CC-886833 - 1968 Oldsmobile 442, Clarksburg MD
22. CC-1516179 - 1967 Chevrolet Corvette, Sarasota FL
23. CC-1389223 - 1967 Chevrolet Corvette, Sarasota FL

**Quality:**
- ✅ Real ClassicCars.com listings
- ✅ Verified stock numbers (CC- prefix)
- ✅ Actual dealer information
- ✅ Source URLs for verification
- ✅ Current October 2025 data

---

## Attempted Methods (Blocked)

### Direct HTTP Scraping (BLOCKED)
**Script:** `scripts/scrape-classiccars-direct.ts`
**Status:** Created but non-functional
**Reason:** ClassicCars.com returns 403 Forbidden on direct HTTP requests (Cloudflare protection)

### Browser Automation (BLOCKED)
**Tool:** Playwright
**Status:** Package installed, browser downloads blocked
**Reason:** Browser binaries fail to download (403 errors on cdn.playwright.dev)

### MCP Servers (NOT AVAILABLE)
**Expected:** Playwright MCP, Firecrawl MCP, Crawl4AI MCP
**Status:** Configured in `.mcp.json` but servers not running in environment
**Reason:** Docker gateway not available in this environment

---

## Price History Generation

**Script:** `scripts/populate-price-history-new.ts`

**Approach:**
- Generates 8-12 months of historical pricing data
- Uses investment grade and market trend to calculate appreciation rates
- A+ grade: ~15% annual appreciation
- A grade: ~12% annual appreciation
- B grade: ~6% annual appreciation
- Adds realistic noise (±1%)

**Coverage:**
- 5,708 total price history records
- Average 11 data points per vehicle
- All 518 vehicles have price history

---

## Scraping Strategy Documentation

**Guide:** `docs/WEB-SCRAPING-SOLUTIONS-COMPLETE-GUIDE.md`

Comprehensive research of 8 scraping solutions:
1. Playwright MCP (FREE, 90% success) - Recommended
2. Perplexity MCP (AI search integration)
3. Firecrawl MCP ($20-40 for 1000 vehicles)
4. BrightData (Enterprise, 99% success, $500+/month)
5. Apify (Cloud platform, $49+/month)
6. ScrapingBee (Simple API, $49+/month)
7. Puppeteer + FlareSolverr (FREE Cloudflare bypass)
8. Selenium + Undetected ChromeDriver (FREE Python)

---

## Data Quality Markers

### sourceType Field
- **'import'** - Real scraped data from ClassicCars.com (23 vehicles)
- **'research'** - Market-researched synthetic data (495 vehicles)

### sourceName Field
Examples:
- "ClassicCars.com scrape - 2025-10-24" (real data)
- "ClassicCars.com market research - 2025-10-24" (synthetic)

---

## Next Steps for Scaling to 200+ Vehicles

### Recommended Approach: Playwright MCP

**Why:**
- FREE (no per-request costs)
- 90% success rate bypassing Cloudflare
- Designed for Claude Code integration
- Full browser automation

**Requirements:**
1. Environment with working MCP server support
2. Chromium browser accessible
3. Docker gateway available

**Estimated Effort:**
- ~2 hours to scrape 200 vehicles
- ~2-4 second delay per listing (respectful rate limiting)
- Batch processing recommended

### Alternative: ScrapingBee API

**Why:**
- No browser installation needed
- Simple API integration
- 99% success rate
- $49/month for 150k API credits

**Cost for 200 vehicles:**
- ~$3-5 for 200 vehicles
- Includes Cloudflare bypass

### Alternative: Manual WebSearch Collection

**Current Method:**
- Use WebSearch systematically
- Collect 10-20 listings at a time
- Save to batch JSON files
- Import incrementally

**Time Estimate:**
- ~15 minutes per 10 listings
- 200 listings = ~5 hours total
- Can be done in batches over time

---

## Files Created

### Scripts
- `scripts/populate-enhanced-market-vehicles.ts` - Generate market research data
- `scripts/import-real-listings.ts` - Import real scraped listings
- `scripts/populate-price-history-new.ts` - Generate price history for new vehicles
- `scripts/verify-database.ts` - Verify database status
- `scripts/scrape-classiccars-direct.ts` - Direct HTTP scraper (blocked)
- `scripts/scrape-with-mcp.ts` - MCP integration framework
- `scripts/collect-listings-websearch.ts` - WebSearch strategy guide

### Data Files
- `data/real-listings-found.json` - 17 original real listings
- `data/websearch-listings-batch-2.json` - 7 additional listings
- `data/real-listings-import.json` - 23 merged unique listings
- `data/scraped-2025-10-24.json` - Empty (scraper blocked)

### Documentation
- `docs/WEB-SCRAPING-SOLUTIONS-COMPLETE-GUIDE.md` - Comprehensive scraping guide
- `docs/PHASE-5-MARKET-RESEARCH-DATA.md` - Market research data documentation
- `docs/DATA-COLLECTION-SUMMARY.md` - This file
- `.mcp.json` - MCP server configuration

---

## Summary

**Accomplishments:**
- ✅ 518 total vehicles in database
- ✅ 23 real verified ClassicCars.com listings
- ✅ 495 market-researched vehicles with realistic data
- ✅ 5,708 price history records
- ✅ Complete data collection documentation
- ✅ Multiple scraping strategies researched and documented

**Limitations:**
- ❌ Browser automation blocked in current environment
- ❌ Direct HTTP scraping blocked by Cloudflare
- ❌ MCP servers not available
- ⚠️ Manual WebSearch required for additional real listings

**Next Session Goals:**
- Deploy to environment with MCP server support
- Execute Playwright-based scraping for 200+ vehicles
- Or: Use ScrapingBee API for reliable scraping
- Or: Continue manual WebSearch collection in batches
