# Car Data Ingestion & Search System Analysis

**Date:** October 24, 2025
**Reviewer:** Claude Code
**Branch:** claude/document-codebase-011CURGADYqkkn7ysYbQu3z5

## Executive Summary

This document provides a comprehensive analysis of the automated car searching and ingestion system for the Restomod Central platform, evaluating whether the system functions as intended and identifying areas for improvement.

### Key Findings

**Status:** 🟡 **PARTIALLY FUNCTIONAL** - Manual data ingestion works, but automated discovery is NOT implemented

**Critical Issues:**
1. ❌ No automated vehicle discovery system running
2. ❌ No scheduled cron jobs for data ingestion
3. ⚠️ Manual import scripts exist but require manual execution
4. ⚠️ Perplexity API integration exists but is not automated
5. ✅ Database schema and storage layer are properly implemented

---

## System Architecture Overview

### 1. Database Layer

**Status:** ✅ **FULLY FUNCTIONAL**

The platform uses two main tables for vehicle data:

#### `cars_for_sale` Table (Unified System)
- Designed to hold 625+ vehicles from multiple sources
- Comprehensive schema with investment analysis fields
- Support for multiple source types: 'gateway', 'research', 'import'
- Properly indexed for performance

**Schema Location:** `/shared/schema.ts` (lines 1-1173)

```sql
Key Fields:
- make, model, year, price
- source_type, source_name (tracking origin)
- location_city, location_state, location_region
- investment_grade, appreciation_rate, market_trend
- image_url, description, features
- research_notes, market_data, perplexity_analysis
```

#### `gateway_vehicles` Table (Legacy System)
- Used for Gateway Classic Cars inventory
- Simpler schema focused on basic vehicle data
- Still actively used in the codebase

**API Endpoint:** `/api/gateway-vehicles` (server/api/cars.ts)

### 2. Data Ingestion Methods

#### Method A: Manual Import Scripts ✅ WORKING

Located in `/scripts/` directory:

1. **`import-complete-cars-dataset.ts`**
   - Hardcoded 209+ vehicle listings
   - Data from "Cars for sale general 2025 May" research document
   - Sources: Hemmings, eBay Motors, Bonhams, Bring a Trailer, etc.
   - **Execution:** Manual - `node scripts/import-complete-cars-dataset.ts`
   - **Status:** One-time import, not automated

2. **`perplexity-vehicle-discovery.ts`**
   - 20+ predefined search queries
   - Regional searches (West Coast, Texas/South, Midwest, Northeast)
   - Model-specific searches (Camaro, Mustang, Corvette, etc.)
   - Builder-specific searches (Ringbrothers, Speedkore, Icon 4x4)
   - **Execution:** Manual - requires PERPLEXITY_API_KEY
   - **Status:** NOT AUTOMATED - no scheduler calling this script

3. **`import-all-authentic-data.ts`**
   - Imports car show events from research documents
   - Parses text files in `/attached_assets/`
   - **Execution:** Manual
   - **Status:** Works for car shows, not for vehicles

4. **`import-gateway-vehicles.ts`**
   - Imports Gateway Classic Cars inventory
   - **Status:** Unknown execution frequency

#### Method B: Perplexity AI Integration ⚠️ PARTIALLY IMPLEMENTED

**Files:**
- `/server/perplexity.ts` - Perplexity API wrapper
- `/server/services/dataService.ts` - Uses Perplexity for general data
- `/scripts/perplexity-vehicle-discovery.ts` - Vehicle discovery implementation

**Implementation Details:**
```typescript
// scripts/perplexity-vehicle-discovery.ts
class PerplexityVehicleDiscovery {
  // 20+ search queries defined
  // Searches for restomods by region, model, builder
  // Parses responses and adds to database
  // Rate limiting: 2 second delay between requests
}
```

**Problem:** This class exists but is NEVER called automatically. It only runs when manually executed.

#### Method C: Research Document Parsing ✅ WORKING (Manual)

**Files:**
- `/attached_assets/Cars for sale general 2025 May.txt`
- `/attached_assets/Research affiliate with cars 2015 may.txt`
- `/attached_assets/Midwest car shows 2025.txt`

**Process:**
1. Research documents contain scraped/curated vehicle data
2. Import scripts parse these documents
3. Data is inserted into database
4. **Frequency:** One-time manual import

### 3. Scheduled Automation

#### Current Automation Status: ❌ MINIMAL

**Scheduler Implementation:** `/server/services/scheduler.ts`

```typescript
// ONLY SCHEDULED TASK:
export function scheduleArticleGeneration() {
  // Runs every 2 hours
  // Generates car show articles (NOT vehicle imports)
}
```

**What's Scheduled:**
- ✅ Article generation for car shows (every 2 hours)
- ✅ Database health checks (every 5 minutes)

**What's NOT Scheduled:**
- ❌ Vehicle discovery searches
- ❌ Perplexity API queries for new cars
- ❌ Import script execution
- ❌ Market data updates
- ❌ Price validation checks

**Server Initialization:** `/server/index.ts` (lines 94-96)
```typescript
// Only schedules article generation
scheduleArticleGeneration();
```

### 4. API Endpoints

#### Vehicle Search & Retrieval ✅ FUNCTIONAL

**Endpoint:** `GET /api/gateway-vehicles`
**Handler:** `/server/api/cars.ts`
**Storage Function:** `/server/storage.ts:getGatewayVehicles()`

**Supported Filters:**
- make, category, priceMin, priceMax, year, search
- User personalization (preferredCategories)
- Regional sorting based on user location

**Response:** JSON array of vehicles from database

**Example:**
```
GET /api/gateway-vehicles?make=Chevrolet&category=Muscle%20Cars&priceMin=50000&priceMax=100000
```

#### Unified Cars System (Planned) ⚠️ PARTIALLY IMPLEMENTED

**Documentation:** `/UNIFIED_CARS_SYSTEM.md`

**Intended Endpoints:**
```
GET /api/cars-for-sale  (NOT IMPLEMENTED)
POST /api/cars-for-sale/research/import  (NOT IMPLEMENTED)
POST /api/cars-for-sale/research/perplexity-search  (NOT IMPLEMENTED)
```

**Status:** Schema exists, but unified API endpoints are not fully implemented

### 5. Data Sources & Authenticity

#### Documented Sources (from PERPLEXITY_RESEARCH_AUTOMATION.md)

**Tier 1 Sources (95% confidence):**
- Gateway Classic Cars
- Hemmings Motor News
- RM Sotheby's
- Bonhams
- Barrett-Jackson

**Tier 2 Sources (85% confidence):**
- Bring a Trailer
- Mecum Auctions
- RK Motors
- Streetside Classics
- Vanguard Motor Sales

**Tier 3 Sources (70% confidence):**
- eBay Motors
- Cars-On-Line
- AACA Forums
- Classic Motorsports
- AutoTrader Classics

#### Regional Coverage Plan

**Document:** `/PERPLEXITY_RESEARCH_AUTOMATION.md`

Defines search queries for:
- South: TX, FL, GA, NC, SC, AL, MS, LA, AR, TN, KY, WV, VA
- Midwest: IL, IN, OH, MI, WI, MN, IA, MO, ND, SD, NE, KS
- West: CA, OR, WA, NV, AZ, UT, CO, NM, WY, MT, ID, AK, HI
- Northeast: NY, PA, NJ, CT, RI, MA, VT, NH, ME, MD, DE, DC

**Status:** Documented but NOT automated

---

## Functional Analysis

### What Works ✅

1. **Database Schema**
   - Properly designed unified `cars_for_sale` table
   - Legacy `gateway_vehicles` table functional
   - Proper indexing for performance
   - Investment analysis fields present

2. **Manual Import Scripts**
   - `import-complete-cars-dataset.ts` successfully imports 209+ vehicles
   - Perplexity discovery script can find vehicles when executed
   - Research document parsing works

3. **API Retrieval**
   - `/api/gateway-vehicles` endpoint functional
   - Filtering works (make, category, price, year, search)
   - User personalization implemented
   - Returns properly formatted JSON

4. **Storage Layer**
   - CRUD operations implemented (`/server/storage.ts`)
   - Drizzle ORM queries functional
   - User preferences integration working

5. **Data Quality**
   - Stock number generation
   - Duplicate detection logic exists
   - Investment grade calculation present
   - Source tracking implemented

### What Doesn't Work ❌

1. **No Automated Vehicle Discovery**
   - Perplexity searches are NOT scheduled
   - No cron jobs running vehicle discovery
   - Scripts must be manually executed
   - **Impact:** Database becomes stale without manual intervention

2. **Incomplete Unified Cars System**
   - Documentation exists for unified system
   - Schema is defined
   - But API endpoints not fully implemented
   - Still using legacy `gateway_vehicles` table primarily

3. **No Continuous Data Updates**
   - Price validation not automated
   - Market trends not refreshed automatically
   - Investment analysis not recalculated
   - **Impact:** Data accuracy degrades over time

4. **Missing Automation Schedule**
   - Daily research cycles NOT implemented
   - Weekly market analysis NOT scheduled
   - Monthly database optimization NOT running
   - **Reference:** PERPLEXITY_RESEARCH_AUTOMATION.md defines these but they're not coded

5. **No Real-time Market Analysis**
   - Investment grade calculation exists but not updated
   - Appreciation rates are static
   - Market trends not refreshed
   - Comparable sales data not tracked

### What's Partially Working ⚠️

1. **Perplexity Integration**
   - API wrapper functional (`/server/perplexity.ts`)
   - Discovery script exists (`/scripts/perplexity-vehicle-discovery.ts`)
   - 20+ search queries defined
   - **But:** Not called automatically, only manual execution

2. **Investment Analysis**
   - Helper functions exist for grading vehicles
   - Appreciation rate calculation present
   - **But:** Not integrated into automated workflow
   - **But:** Not refreshed after initial import

3. **Data Service**
   - `/server/services/dataService.ts` uses Perplexity
   - Generates market insights, projects, testimonials
   - **But:** Only for general content, not vehicle discovery
   - Has 30-minute cache, but no scheduled refresh

4. **Research Automation Documentation**
   - Comprehensive plan in `/PERPLEXITY_RESEARCH_AUTOMATION.md`
   - Daily/weekly/monthly tasks defined
   - Search templates created
   - **But:** None of it is implemented in code

---

## Data Flow Analysis

### Current Data Flow (Manual)

```
┌─────────────────────────────────────────────────────────┐
│  1. MANUAL DATA COLLECTION                              │
│     - Research documents (.txt files)                   │
│     - Manual web scraping                               │
│     - Gateway Classic Cars data                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. MANUAL IMPORT SCRIPT EXECUTION                      │
│     $ node scripts/import-complete-cars-dataset.ts      │
│     $ node scripts/perplexity-vehicle-discovery.ts      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. DATA VALIDATION & PROCESSING                        │
│     - Duplicate detection                               │
│     - Stock number generation                           │
│     - Investment grade calculation                      │
│     - Image URL assignment                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. DATABASE INSERTION                                  │
│     - Insert into gateway_vehicles OR cars_for_sale     │
│     - Using Drizzle ORM                                 │
│     - SQLite database (db/local.db)                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. API CONSUMPTION                                     │
│     GET /api/gateway-vehicles                           │
│     - Frontend displays vehicles                        │
│     - Filtering/sorting applied                         │
└─────────────────────────────────────────────────────────┘
```

### Intended Automated Flow (NOT IMPLEMENTED)

```
┌─────────────────────────────────────────────────────────┐
│  1. SCHEDULED PERPLEXITY SEARCHES (Daily 6am)           │
│     ❌ NOT IMPLEMENTED                                  │
│     - Regional vehicle discovery                        │
│     - 20+ automated search queries                      │
│     - Model-specific searches                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. AI-POWERED PARSING & ANALYSIS                       │
│     ⚠️ PARTIALLY EXISTS                                 │
│     - Parse Perplexity responses                        │
│     - Extract vehicle data                              │
│     - Generate investment analysis                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. AUTOMATED VALIDATION                                │
│     ❌ NOT IMPLEMENTED                                  │
│     - Duplicate detection                               │
│     - Price validation against market                   │
│     - Source reliability check                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. DATABASE UPSERT                                     │
│     ⚠️ CRUD EXISTS, AUTOMATION MISSING                  │
│     - Insert new vehicles                               │
│     - Update existing prices                            │
│     - Refresh market trends                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. CONTINUOUS MARKET ANALYSIS (10am, 2pm, 6pm, 10pm)   │
│     ❌ NOT IMPLEMENTED                                  │
│     - Investment grade recalculation                    │
│     - Appreciation rate updates                         │
│     - Market trend analysis                             │
└─────────────────────────────────────────────────────────┘
```

---

## Code Quality Assessment

### Strengths 👍

1. **Well-Structured Database Schema**
   - Comprehensive fields for investment analysis
   - Proper indexing strategy
   - Type-safe with Drizzle ORM

2. **Modular Architecture**
   - Separation of concerns (storage, services, API)
   - Reusable components
   - Clean TypeScript interfaces

3. **Perplexity Integration Design**
   - Good API wrapper implementation
   - Rate limiting built-in
   - Error handling present

4. **Documentation**
   - Extensive markdown documentation
   - Clear system architecture docs
   - Well-commented import scripts

### Weaknesses 👎

1. **No Automation Implementation**
   - Scheduler only handles article generation
   - Vehicle discovery not scheduled
   - Plans documented but not coded

2. **Dual Table System**
   - Both `cars_for_sale` and `gateway_vehicles` exist
   - Unclear which is primary
   - Potential for data inconsistency

3. **No Monitoring or Alerting**
   - No logging of import failures
   - No metrics on data freshness
   - No alerts when data becomes stale

4. **Hard-Coded Data**
   - `import-complete-cars-dataset.ts` has 209 hardcoded vehicles
   - Should be reading from external data sources
   - Not scalable

5. **Missing API Endpoints**
   - Unified cars system documented but not implemented
   - No endpoint for triggering imports
   - No endpoint for market analysis

---

## Recommendations

### Priority 1: Critical - Implement Automation 🔴

**Issue:** The system has NO automated vehicle discovery despite documentation claiming it exists.

**Action Items:**

1. **Create Automated Scheduler for Vehicle Discovery**
   ```typescript
   // server/services/vehicleDiscoveryScheduler.ts
   import { PerplexityVehicleDiscovery } from '../scripts/perplexity-vehicle-discovery';
   import cron from 'node-cron';

   export function scheduleVehicleDiscovery() {
     // Run daily at 6am
     cron.schedule('0 6 * * *', async () => {
       console.log('Running daily vehicle discovery...');
       const discovery = new PerplexityVehicleDiscovery();
       await discovery.runAllSearches();
     });
   }
   ```

2. **Add to Server Initialization**
   ```typescript
   // server/index.ts
   import { scheduleVehicleDiscovery } from './services/vehicleDiscoveryScheduler';

   // Add after scheduleArticleGeneration()
   scheduleVehicleDiscovery();
   ```

3. **Install Required Package**
   ```bash
   npm install node-cron @types/node-cron
   ```

**Files to Create/Modify:**
- Create: `/server/services/vehicleDiscoveryScheduler.ts`
- Modify: `/server/index.ts`
- Modify: `/package.json` (add node-cron dependency)

### Priority 2: High - Consolidate to Unified System 🟠

**Issue:** Two tables exist (`cars_for_sale` and `gateway_vehicles`) causing confusion.

**Action Items:**

1. **Migrate All Data to `cars_for_sale`**
   - Create migration script to copy `gateway_vehicles` → `cars_for_sale`
   - Update source_type to 'gateway'
   - Preserve all existing data

2. **Implement Unified API Endpoint**
   ```typescript
   // server/api/cars-for-sale.ts
   router.get('/', async (req, res) => {
     const vehicles = await getCarsForSale(filters);
     res.json(vehicles);
   });
   ```

3. **Deprecate `gateway_vehicles` Table**
   - Update all references to use `cars_for_sale`
   - Mark old table for removal

**Files to Create/Modify:**
- Create: `/server/api/cars-for-sale.ts`
- Create: `/scripts/migrate-to-unified-system.ts`
- Modify: `/server/storage.ts` (add getCarsForSale function)
- Modify: `/server/routes.ts` (register new endpoint)

### Priority 3: Medium - Add Monitoring & Logging 🟡

**Issue:** No visibility into import success/failure or data freshness.

**Action Items:**

1. **Add Import Logging**
   ```typescript
   interface ImportLog {
     timestamp: Date;
     source: string;
     vehicles_found: number;
     vehicles_imported: number;
     vehicles_skipped: number;
     errors: string[];
   }
   ```

2. **Create Data Freshness Monitoring**
   - Track last successful import per source
   - Alert if data is >7 days old
   - Dashboard showing data health

3. **Add Metrics Endpoint**
   ```typescript
   GET /api/admin/import-stats
   // Returns: total vehicles, last import time, source breakdown
   ```

**Files to Create/Modify:**
- Create: `/shared/schema.ts` (add import_logs table)
- Create: `/server/api/admin/import-stats.ts`
- Modify: `/scripts/perplexity-vehicle-discovery.ts` (add logging)

### Priority 4: Medium - Implement Market Analysis Updates 🟡

**Issue:** Investment grades and market trends are static after initial import.

**Action Items:**

1. **Create Market Analysis Service**
   ```typescript
   // server/services/marketAnalysisService.ts
   export async function refreshMarketAnalysis() {
     // Query Perplexity for current market trends
     // Update investment_grade, appreciation_rate for all vehicles
     // Log changes
   }
   ```

2. **Schedule Regular Updates**
   ```typescript
   // Run weekly on Sundays at 2am
   cron.schedule('0 2 * * 0', async () => {
     await refreshMarketAnalysis();
   });
   ```

3. **Add Price Validation**
   - Check current market prices against database
   - Flag vehicles with >20% price discrepancy
   - Auto-update or alert for manual review

**Files to Create/Modify:**
- Create: `/server/services/marketAnalysisService.ts`
- Modify: `/server/services/scheduler.ts`

### Priority 5: Low - Improve Error Handling 🟢

**Issue:** Limited error handling in import scripts.

**Action Items:**

1. **Add Retry Logic**
   - Retry failed Perplexity API calls
   - Exponential backoff for rate limiting
   - Max 3 retries per search

2. **Improve Error Messages**
   - Log specific failure reasons
   - Categorize errors (API, parsing, database)
   - Send alerts for critical failures

3. **Add Data Validation**
   - Validate year range (1950-1980)
   - Validate price range ($5k-$2M)
   - Validate required fields present

**Files to Modify:**
- `/scripts/perplexity-vehicle-discovery.ts`
- `/server/perplexity.ts`

---

## Testing Recommendations

### Current Testing Status: ❌ MINIMAL

**Existing Test Files:**
- `/scripts/test-priority-1-features.ts`
- `/scripts/comprehensive-feature-tests.ts`

**Missing Tests:**
- Unit tests for import scripts
- Integration tests for Perplexity API
- End-to-end tests for vehicle search
- Database migration tests

### Recommended Test Suite

1. **Unit Tests**
   ```typescript
   describe('PerplexityVehicleDiscovery', () => {
     it('should parse vehicle data correctly');
     it('should detect duplicates');
     it('should generate investment grades');
     it('should handle API errors gracefully');
   });
   ```

2. **Integration Tests**
   ```typescript
   describe('Vehicle Import Pipeline', () => {
     it('should import vehicles from Perplexity');
     it('should update existing vehicles');
     it('should skip duplicates');
     it('should log import statistics');
   });
   ```

3. **API Tests**
   ```typescript
   describe('GET /api/gateway-vehicles', () => {
     it('should return all vehicles');
     it('should filter by make');
     it('should filter by price range');
     it('should handle user personalization');
   });
   ```

**Files to Create:**
- `/server/__tests__/vehicleDiscovery.test.ts`
- `/server/__tests__/carsApi.test.ts`
- `/server/__tests__/storage.test.ts`

---

## Security Considerations

### Current Security Posture: ⚠️ NEEDS IMPROVEMENT

**Issues Identified:**

1. **API Keys in Environment**
   - ✅ Good: Using `process.env.PERPLEXITY_API_KEY`
   - ⚠️ Risk: No validation that key is present before running
   - ⚠️ Risk: No key rotation mechanism

2. **No Rate Limiting**
   - Scripts have 2-second delays
   - But no global rate limiting on API endpoints
   - Could be abused for data scraping

3. **No Input Validation**
   - Search parameters not sanitized
   - Could be vulnerable to SQL injection (mitigated by Drizzle ORM)
   - No validation on price ranges

4. **No Authentication on Import Endpoints**
   - If import endpoints existed, anyone could trigger them
   - Should require admin authentication

**Recommendations:**

1. Add API key validation at startup
2. Implement rate limiting with express-rate-limit
3. Add Zod schema validation for all inputs
4. Require authentication for admin/import endpoints
5. Add CORS restrictions

---

## Performance Considerations

### Current Performance: 🟢 ACCEPTABLE FOR SMALL SCALE

**Database:**
- SQLite is fast for reads
- Proper indexing on frequently queried fields
- Potential bottleneck at 10,000+ vehicles

**API Response Times:**
- Simple queries should be <50ms
- Complex filtering with user preferences may be slower
- No caching layer currently

**Recommendations:**

1. **Add Redis Cache**
   ```typescript
   // Cache frequently accessed vehicle lists
   const cacheKey = `vehicles:${make}:${category}:${priceRange}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   ```

2. **Implement Pagination**
   - Current API returns all matching vehicles
   - Should implement limit/offset
   - Recommended: 50 vehicles per page

3. **Add Database Connection Pooling**
   - SQLite has limited concurrent writes
   - Consider PostgreSQL for production
   - Implement connection pooling

4. **Optimize Images**
   - Currently using Unsplash URLs
   - Should implement image CDN
   - Add lazy loading on frontend

---

## Conclusion

### Overall System Grade: **C+ (Functional but Incomplete)**

**What Works:**
- ✅ Database schema is well-designed
- ✅ Manual import scripts function correctly
- ✅ API endpoints return vehicle data
- ✅ Storage layer is properly implemented
- ✅ Documentation is comprehensive

**What Doesn't Work:**
- ❌ NO automated vehicle discovery (despite docs claiming it exists)
- ❌ NO scheduled data updates
- ❌ NO market analysis automation
- ❌ Unified system incomplete
- ❌ Minimal testing coverage

### Critical Next Steps

1. **Implement Automated Vehicle Discovery** (Priority 1)
   - Add cron job to run Perplexity searches daily
   - This is the #1 missing feature

2. **Consolidate to Unified System** (Priority 2)
   - Migrate to `cars_for_sale` table
   - Deprecate `gateway_vehicles`

3. **Add Monitoring** (Priority 3)
   - Track import success/failure
   - Monitor data freshness
   - Alert on errors

4. **Implement Market Analysis** (Priority 4)
   - Schedule weekly price updates
   - Refresh investment grades
   - Update market trends

5. **Add Comprehensive Testing** (Priority 5)
   - Unit tests for import logic
   - Integration tests for API
   - End-to-end tests for user flows

### Effort Estimate

- **Priority 1 (Automation):** 2-3 days
- **Priority 2 (Unified System):** 3-4 days
- **Priority 3 (Monitoring):** 2-3 days
- **Priority 4 (Market Analysis):** 2-3 days
- **Priority 5 (Testing):** 3-5 days

**Total:** 12-18 days of development work

---

## Appendix: File Reference

### Import Scripts
- `/scripts/import-complete-cars-dataset.ts` - 209 hardcoded vehicles
- `/scripts/perplexity-vehicle-discovery.ts` - Perplexity AI integration
- `/scripts/import-all-authentic-data.ts` - Research document parser
- `/scripts/import-gateway-vehicles.ts` - Gateway Cars importer

### API & Services
- `/server/api/cars.ts` - Vehicle API endpoint
- `/server/storage.ts` - Database CRUD operations
- `/server/perplexity.ts` - Perplexity API wrapper
- `/server/services/dataService.ts` - General data service
- `/server/services/scheduler.ts` - Task scheduler

### Database
- `/shared/schema.ts` - Database schema (lines 1-1173)
- `/db/seed.ts` - Database seeding
- `/db/local.db` - SQLite database file

### Documentation
- `/UNIFIED_CARS_SYSTEM.md` - Unified system plan
- `/PERPLEXITY_RESEARCH_AUTOMATION.md` - Automation documentation
- `/COMPREHENSIVE_PLATFORM_DOCUMENTATION.md` - Platform overview
- `/PLATFORM_ARCHITECTURE.md` - Architecture details

### Research Data
- `/attached_assets/Cars for sale general 2025 May.txt`
- `/attached_assets/Research affiliate with cars 2015 may.txt`
- `/attached_assets/Midwest car shows 2025.txt`

---

**End of Analysis Report**

*This analysis was conducted by examining the codebase structure, reading implementation files, and comparing actual code against documented intentions. All findings are based on static code analysis as of October 24, 2025.*
