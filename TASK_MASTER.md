# TASK MASTER - Search & Analytics Enhancement Implementation

**Project:** Search Efficiency & Market Analytics Enhancement
**Start Date:** October 24, 2025
**Status:** IN PROGRESS
**Branch:** claude/document-codebase-011CURGADYqkkn7ysYbQu3z5

---

## Implementation Principles

1. ✅ **Keep codebase simple** - Reuse existing patterns, avoid complexity
2. ✅ **Use shared libraries** - Leverage Drizzle ORM, existing services
3. ✅ **Atomic tasks** - Each task is independently testable
4. ✅ **Test before marking complete** - No task complete without verification
5. ✅ **Parallel execution** - Use agents/tools concurrently when possible
6. ✅ **Document everything** - Clear commit messages, inline comments

---

## Phase 1: Vehicle Analytics API (Foundation)

**Goal:** Add 7 real-time vehicle aggregation endpoints
**Dependencies:** None - uses existing database
**Estimated Time:** 2-3 days
**Priority:** CRITICAL

### Task Breakdown

#### 1.1 Create Vehicle Analytics Router ⏳
- **File:** `/server/api/vehicle-analytics.ts`
- **Dependencies:** Existing Drizzle ORM, Express Router
- **Complexity:** Medium
- **Test:** Endpoint responds with 200 status
- **Status:** PENDING

**Subtasks:**
- [ ] 1.1.1 Create file structure
- [ ] 1.1.2 Import required dependencies (Express, Drizzle, sql helpers)
- [ ] 1.1.3 Initialize Express Router
- [ ] 1.1.4 Add basic error handling middleware
- [ ] 1.1.5 Export router for integration

#### 1.2 Implement "Vehicles by Make" Endpoint ⏳
- **Endpoint:** `GET /api/vehicle-analytics/by-make`
- **Query:** `SELECT make, COUNT(*), AVG(price) GROUP BY make`
- **Response:** `[{ make, count, avgPrice }]`
- **Test:** Returns valid JSON with aggregated data
- **Status:** PENDING

**Subtasks:**
- [ ] 1.2.1 Write SQL query with Drizzle
- [ ] 1.2.2 Add route handler
- [ ] 1.2.3 Handle CAST for price (stored as text)
- [ ] 1.2.4 Order by count descending
- [ ] 1.2.5 Add error handling
- [ ] 1.2.6 Test with curl/Postman

#### 1.3 Implement "Vehicles by Year" Endpoint ⏳
- **Endpoint:** `GET /api/vehicle-analytics/by-year`
- **Query:** `SELECT year, COUNT(*), AVG/MIN/MAX(price) GROUP BY year`
- **Response:** `[{ year, count, avgPrice, minPrice, maxPrice }]`
- **Status:** PENDING

**Subtasks:**
- [ ] 1.3.1 Write SQL query
- [ ] 1.3.2 Add route handler
- [ ] 1.3.3 Order by year ascending
- [ ] 1.3.4 Test response format

#### 1.4 Implement "Vehicles by Category" Endpoint ⏳
- **Endpoint:** `GET /api/vehicle-analytics/by-category`
- **Query:** `SELECT category, COUNT(*), AVG(price) GROUP BY category`
- **Response:** `[{ category, count, avgPrice, investmentGrades }]`
- **Status:** PENDING

**Subtasks:**
- [ ] 1.4.1 Write SQL query with GROUP_CONCAT for grades
- [ ] 1.4.2 Filter NULL categories
- [ ] 1.4.3 Add route handler
- [ ] 1.4.4 Test response

#### 1.5 Implement "Vehicles by Region" Endpoint ⏳
- **Endpoint:** `GET /api/vehicle-analytics/by-region`
- **Query:** `SELECT locationRegion, COUNT(*), AVG(price) GROUP BY region`
- **Response:** `[{ region, count, avgPrice }]`
- **Status:** PENDING

**Subtasks:**
- [ ] 1.5.1 Write SQL query
- [ ] 1.5.2 Filter NULL regions
- [ ] 1.5.3 Order by avgPrice descending
- [ ] 1.5.4 Test response

#### 1.6 Implement "Investment Grades" Endpoint ⏳
- **Endpoint:** `GET /api/vehicle-analytics/investment-grades`
- **Query:** `SELECT investmentGrade, COUNT(*), AVG(price), AVG(appreciation) GROUP BY grade`
- **Response:** `[{ grade, count, avgPrice, avgAppreciation }]`
- **Status:** PENDING

**Subtasks:**
- [ ] 1.6.1 Write SQL query
- [ ] 1.6.2 Parse appreciation rate (remove '%/year')
- [ ] 1.6.3 Handle NULL grades
- [ ] 1.6.4 Order by grade (A+, A, A-, B+, etc.)
- [ ] 1.6.5 Test response

#### 1.7 Implement "Make-Model Trends" Endpoint ⏳
- **Endpoint:** `GET /api/vehicle-analytics/make-model-trends`
- **Query:** `SELECT make, model, COUNT(*), AVG(price) GROUP BY make, model HAVING count >= 3`
- **Response:** `[{ make, model, count, avgPrice, investmentGrade, marketTrend }]`
- **Status:** PENDING

**Subtasks:**
- [ ] 1.7.1 Write SQL query with HAVING clause
- [ ] 1.7.2 Use MODE() for most common grade/trend
- [ ] 1.7.3 Limit to top 50 results
- [ ] 1.7.4 Order by count descending
- [ ] 1.7.5 Test response

#### 1.8 Implement "Price Ranges" Endpoint ⏳
- **Endpoint:** `GET /api/vehicle-analytics/price-ranges`
- **Query:** CASE statement to bucket prices
- **Response:** `[{ priceRange, count, avgAppreciation }]`
- **Status:** PENDING

**Subtasks:**
- [ ] 1.8.1 Write CASE statement for price buckets
- [ ] 1.8.2 Create buckets: <$25k, $25k-$50k, $50k-$75k, $75k-$100k, $100k-$150k, $150k-$200k, >$200k
- [ ] 1.8.3 Calculate average appreciation per bucket
- [ ] 1.8.4 Order by minimum price
- [ ] 1.8.5 Test response

#### 1.9 Register Router in Application ⏳
- **File:** `/server/routes.ts`
- **Action:** Import and mount `/api/vehicle-analytics` router
- **Test:** All 7 endpoints accessible
- **Status:** PENDING

**Subtasks:**
- [ ] 1.9.1 Import vehicle-analytics router
- [ ] 1.9.2 Add app.use('/api/vehicle-analytics', router)
- [ ] 1.9.3 Test all endpoints respond

#### 1.10 Integration Testing ⏳
- **Tool:** curl or Postman
- **Verify:** All 7 endpoints return valid JSON
- **Status:** PENDING

**Subtasks:**
- [ ] 1.10.1 Test GET /api/vehicle-analytics/by-make
- [ ] 1.10.2 Test GET /api/vehicle-analytics/by-year
- [ ] 1.10.3 Test GET /api/vehicle-analytics/by-category
- [ ] 1.10.4 Test GET /api/vehicle-analytics/by-region
- [ ] 1.10.5 Test GET /api/vehicle-analytics/investment-grades
- [ ] 1.10.6 Test GET /api/vehicle-analytics/make-model-trends
- [ ] 1.10.7 Test GET /api/vehicle-analytics/price-ranges
- [ ] 1.10.8 Verify response formats match schema
- [ ] 1.10.9 Test error handling (invalid requests)
- [ ] 1.10.10 Performance test (response time < 500ms)

---

## Phase 2: Price History Tracking

**Goal:** Track price changes over time for trend analysis
**Dependencies:** Phase 1 complete
**Estimated Time:** 2-3 days
**Priority:** HIGH

### Task Breakdown

#### 2.1 Create Price History Table Schema ⏳
- **File:** `/shared/schema.ts`
- **Action:** Add priceHistory table definition
- **Status:** PENDING

**Subtasks:**
- [ ] 2.1.1 Define priceHistory sqliteTable
- [ ] 2.1.2 Add fields: id, vehicleId, price, sourceType, sourceName, recordedDate, createdAt
- [ ] 2.1.3 Add foreign key to carsForSale
- [ ] 2.1.4 Create insert schema with Zod
- [ ] 2.1.5 Export types

#### 2.2 Create Database Migration ⏳
- **File:** `/db/migrations/XXXX_add_price_history.sql`
- **Action:** SQL to create price_history table
- **Status:** PENDING

**Subtasks:**
- [ ] 2.2.1 Write CREATE TABLE statement
- [ ] 2.2.2 Add indexes on vehicle_id and recorded_date
- [ ] 2.2.3 Add foreign key constraint
- [ ] 2.2.4 Test migration with drizzle-kit

#### 2.3 Run Migration ⏳
- **Command:** `npm run db:migrate`
- **Verify:** Table exists in database
- **Status:** PENDING

**Subtasks:**
- [ ] 2.3.1 Run migration
- [ ] 2.3.2 Verify table structure with sqlite3
- [ ] 2.3.3 Check indexes created

#### 2.4 Update Import Scripts to Record History ⏳
- **Files:**
  - `/scripts/perplexity-vehicle-discovery.ts`
  - `/scripts/import-complete-cars-dataset.ts`
- **Action:** Insert price_history record on vehicle import
- **Status:** PENDING

**Subtasks:**
- [ ] 2.4.1 Import priceHistory schema
- [ ] 2.4.2 Add INSERT after vehicle creation
- [ ] 2.4.3 Capture initial price
- [ ] 2.4.4 Set source_type = 'import'
- [ ] 2.4.5 Test import creates history entry

#### 2.5 Create Price Trend Service ⏳
- **File:** `/server/services/priceTrendService.ts`
- **Functions:** calculateAppreciation(), calculateMakeModelTrends()
- **Status:** PENDING

**Subtasks:**
- [ ] 2.5.1 Create PriceTrendService class
- [ ] 2.5.2 Implement calculateAppreciation(vehicleId, months)
- [ ] 2.5.3 Implement calculateMakeModelTrends(make, model)
- [ ] 2.5.4 Add error handling
- [ ] 2.5.5 Export service instance

#### 2.6 Create Price Trend API Endpoints ⏳
- **File:** `/server/api/price-trends.ts`
- **Endpoints:**
  - `GET /api/price-trends/:vehicleId`
  - `GET /api/price-trends/make-model/:make/:model`
- **Status:** PENDING

**Subtasks:**
- [ ] 2.6.1 Create Express router
- [ ] 2.6.2 Add vehicle-specific trend endpoint
- [ ] 2.6.3 Add make-model trend endpoint
- [ ] 2.6.4 Handle missing data gracefully
- [ ] 2.6.5 Register router in routes.ts

#### 2.7 Backfill Price History for Existing Vehicles ⏳
- **Script:** `/scripts/backfill-price-history.ts`
- **Action:** Create initial history entry for all existing vehicles
- **Status:** PENDING

**Subtasks:**
- [ ] 2.7.1 Create backfill script
- [ ] 2.7.2 Query all vehicles
- [ ] 2.7.3 Insert price_history for each
- [ ] 2.7.4 Set recorded_date = vehicle.createdAt
- [ ] 2.7.5 Run script and verify

#### 2.8 Integration Testing ⏳
- **Verify:** Price history tracked correctly
- **Status:** PENDING

**Subtasks:**
- [ ] 2.8.1 Import new vehicle, verify history created
- [ ] 2.8.2 Test GET /api/price-trends/:id
- [ ] 2.8.3 Test GET /api/price-trends/make-model/Chevrolet/Camaro
- [ ] 2.8.4 Verify appreciation calculations
- [ ] 2.8.5 Test with multiple price points

---

## Phase 3: FTS5 Full-Text Search

**Goal:** 100x faster search with fuzzy matching
**Dependencies:** None - independent feature
**Estimated Time:** 2-3 days
**Priority:** HIGH

### Task Breakdown

#### 3.1 Create FTS5 Virtual Table Migration ⏳
- **File:** `/db/migrations/XXXX_add_fts5_search.sql`
- **Action:** Create cars_for_sale_fts virtual table
- **Status:** PENDING

**Subtasks:**
- [ ] 3.1.1 Write CREATE VIRTUAL TABLE statement
- [ ] 3.1.2 Define indexed fields (make, model, description, features, engine, transmission)
- [ ] 3.1.3 Set content table to cars_for_sale
- [ ] 3.1.4 Test migration

#### 3.2 Create FTS Sync Triggers ⏳
- **File:** Same migration
- **Action:** Auto-sync FTS on INSERT/UPDATE/DELETE
- **Status:** PENDING

**Subtasks:**
- [ ] 3.2.1 Create INSERT trigger
- [ ] 3.2.2 Create UPDATE trigger
- [ ] 3.2.3 Create DELETE trigger
- [ ] 3.2.4 Test triggers fire correctly

#### 3.3 Populate FTS5 Table ⏳
- **Script:** `/scripts/populate-fts-search.ts`
- **Action:** Initial population from existing vehicles
- **Status:** PENDING

**Subtasks:**
- [ ] 3.3.1 Create population script
- [ ] 3.3.2 INSERT INTO fts SELECT FROM cars_for_sale
- [ ] 3.3.3 Run script
- [ ] 3.3.4 Verify row count matches

#### 3.4 Run Migration ⏳
- **Command:** `npm run db:migrate`
- **Verify:** FTS table and triggers exist
- **Status:** PENDING

**Subtasks:**
- [ ] 3.4.1 Run migration
- [ ] 3.4.2 Check virtual table created
- [ ] 3.4.3 Verify triggers exist
- [ ] 3.4.4 Test search functionality

#### 3.5 Update Vehicle Search Function ⏳
- **File:** `/server/storage.ts`
- **Function:** `searchCarsForSale()`
- **Action:** Use FTS5 instead of LIKE
- **Status:** PENDING

**Subtasks:**
- [ ] 3.5.1 Create new searchCarsForSale() function
- [ ] 3.5.2 Use JOIN with FTS table
- [ ] 3.5.3 Use MATCH operator
- [ ] 3.5.4 Order by rank
- [ ] 3.5.5 Keep backward compatibility

#### 3.6 Update Cars API to Use FTS Search ⏳
- **File:** `/server/api/cars.ts`
- **Action:** Call searchCarsForSale() for search queries
- **Status:** PENDING

**Subtasks:**
- [ ] 3.6.1 Update route handler
- [ ] 3.6.2 Pass search query to new function
- [ ] 3.6.3 Maintain existing filter logic
- [ ] 3.6.4 Test search endpoint

#### 3.7 Performance Testing ⏳
- **Tool:** Bash time command
- **Target:** <100ms search response
- **Status:** PENDING

**Subtasks:**
- [ ] 3.7.1 Test search for "Camaro" (measure time)
- [ ] 3.7.2 Test search for "muscle car" (phrase)
- [ ] 3.7.3 Test search for "Camaro OR Mustang" (boolean)
- [ ] 3.7.4 Compare old vs new performance
- [ ] 3.7.5 Document improvement metrics

#### 3.8 Integration Testing ⏳
- **Verify:** Search works correctly with FTS5
- **Status:** PENDING

**Subtasks:**
- [ ] 3.8.1 Test simple keyword search
- [ ] 3.8.2 Test phrase search
- [ ] 3.8.3 Test fuzzy matching (typos)
- [ ] 3.8.4 Test combined with filters
- [ ] 3.8.5 Verify relevance ranking

---

## Phase 4: Frontend Integration & Automation

**Goal:** Connect frontend to new APIs, add caching, automation
**Dependencies:** Phases 1-3 complete
**Estimated Time:** 3-4 days
**Priority:** MEDIUM

### Task Breakdown

#### 4.1 Create Aggregation Cache Service ⏳
- **File:** `/server/services/aggregationCacheService.ts`
- **Action:** In-memory cache with 15-minute TTL
- **Status:** PENDING

**Subtasks:**
- [ ] 4.1.1 Create AggregationCacheService class
- [ ] 4.1.2 Implement getOrCompute(key, fn)
- [ ] 4.1.3 Add invalidate(key) method
- [ ] 4.1.4 Add invalidateAll() method
- [ ] 4.1.5 Set 15-minute timeout
- [ ] 4.1.6 Export singleton instance

#### 4.2 Add Caching to Analytics Endpoints ⏳
- **File:** `/server/api/vehicle-analytics.ts`
- **Action:** Wrap queries in cache.getOrCompute()
- **Status:** PENDING

**Subtasks:**
- [ ] 4.2.1 Import aggregationCache
- [ ] 4.2.2 Wrap by-make endpoint
- [ ] 4.2.3 Wrap by-year endpoint
- [ ] 4.2.4 Wrap by-category endpoint
- [ ] 4.2.5 Wrap by-region endpoint
- [ ] 4.2.6 Wrap investment-grades endpoint
- [ ] 4.2.7 Wrap make-model-trends endpoint
- [ ] 4.2.8 Wrap price-ranges endpoint
- [ ] 4.2.9 Test cache hit/miss

#### 4.3 Create RealTimeInventoryTrends Component ⏳
- **File:** `/client/src/components/market/RealTimeInventoryTrends.tsx`
- **Action:** React component with charts
- **Status:** PENDING

**Subtasks:**
- [ ] 4.3.1 Create component file
- [ ] 4.3.2 Add TanStack Query hooks for 7 endpoints
- [ ] 4.3.3 Create "Vehicles by Make" bar chart
- [ ] 4.3.4 Create "Price by Year" line chart
- [ ] 4.3.5 Create "Category Distribution" bar chart
- [ ] 4.3.6 Create "Price Ranges" bar chart
- [ ] 4.3.7 Add loading states
- [ ] 4.3.8 Add error handling
- [ ] 4.3.9 Style with Tailwind/Shadcn

#### 4.4 Integrate Component into Market Analysis Page ⏳
- **File:** `/client/src/pages/MarketAnalysis.tsx`
- **Action:** Add RealTimeInventoryTrends to page
- **Status:** PENDING

**Subtasks:**
- [ ] 4.4.1 Import component
- [ ] 4.4.2 Add to page layout
- [ ] 4.4.3 Create tab or section for "Live Inventory Trends"
- [ ] 4.4.4 Test rendering
- [ ] 4.4.5 Verify data loads correctly

#### 4.5 Add Search Autocomplete Component ⏳
- **File:** `/client/src/components/ui/search-autocomplete.tsx`
- **Action:** Autocomplete with FTS5 backend
- **Status:** PENDING

**Subtasks:**
- [ ] 4.5.1 Create autocomplete component
- [ ] 4.5.2 Add debounced search input
- [ ] 4.5.3 Call search API on input change
- [ ] 4.5.4 Display results dropdown
- [ ] 4.5.5 Handle selection
- [ ] 4.5.6 Style component

#### 4.6 Update Vehicle Search Page ⏳
- **File:** `/client/src/pages/CarsForSale.tsx`
- **Action:** Use new autocomplete component
- **Status:** PENDING

**Subtasks:**
- [ ] 4.6.1 Import SearchAutocomplete
- [ ] 4.6.2 Replace existing search input
- [ ] 4.6.3 Test search functionality
- [ ] 4.6.4 Verify fast response times

#### 4.7 Create Scheduled Tasks Service ⏳
- **File:** `/server/services/scheduledTasks.ts`
- **Action:** Add cron jobs for automation
- **Status:** PENDING

**Subtasks:**
- [ ] 4.7.1 Install node-cron if needed
- [ ] 4.7.2 Create ScheduledTasksService
- [ ] 4.7.3 Add nightly price update job (3am)
- [ ] 4.7.4 Add cache warming job (startup)
- [ ] 4.7.5 Add trend recalculation job (weekly)
- [ ] 4.7.6 Export service

#### 4.8 Integrate Scheduled Tasks into Server ⏳
- **File:** `/server/index.ts`
- **Action:** Start scheduled tasks on server startup
- **Status:** PENDING

**Subtasks:**
- [ ] 4.8.1 Import scheduledTasks service
- [ ] 4.8.2 Call scheduledTasks.start() after server init
- [ ] 4.8.3 Add cleanup on shutdown
- [ ] 4.8.4 Test tasks run correctly

#### 4.9 Performance Monitoring Dashboard ⏳
- **File:** `/server/api/monitoring.ts`
- **Endpoints:**
  - `GET /api/monitoring/cache-stats`
  - `GET /api/monitoring/query-performance`
- **Status:** PENDING

**Subtasks:**
- [ ] 4.9.1 Create monitoring router
- [ ] 4.9.2 Add cache stats endpoint
- [ ] 4.9.3 Track query execution times
- [ ] 4.9.4 Add performance metrics endpoint
- [ ] 4.9.5 Register router

#### 4.10 Integration Testing ⏳
- **Verify:** All components work together
- **Status:** PENDING

**Subtasks:**
- [ ] 4.10.1 Test frontend loads with new charts
- [ ] 4.10.2 Test search autocomplete works
- [ ] 4.10.3 Verify caching improves performance
- [ ] 4.10.4 Test scheduled tasks execute
- [ ] 4.10.5 Check monitoring endpoints

---

## Final Integration & Testing

### Integration Test Suite ⏳
- **Status:** PENDING

**Tasks:**
- [ ] IT.1 Test complete search flow (FTS5 → API → Frontend)
- [ ] IT.2 Test analytics pipeline (DB → Cache → API → Frontend)
- [ ] IT.3 Test price history tracking (Import → History → Trends)
- [ ] IT.4 Verify all 7 analytics endpoints functional
- [ ] IT.5 Verify all price trend endpoints functional
- [ ] IT.6 Load test with 625+ vehicles
- [ ] IT.7 Performance benchmarks (<100ms search, <500ms analytics)
- [ ] IT.8 Error handling verification
- [ ] IT.9 Edge case testing (null values, empty results)
- [ ] IT.10 Cross-browser frontend testing

### Documentation ⏳
- **Status:** PENDING

**Tasks:**
- [ ] DOC.1 Update API documentation
- [ ] DOC.2 Document new endpoints
- [ ] DOC.3 Add code comments
- [ ] DOC.4 Update COMPREHENSIVE_PLATFORM_DOCUMENTATION.md
- [ ] DOC.5 Create migration guide

---

## Success Criteria

### Phase 1 Success ✅
- [ ] All 7 analytics endpoints return valid JSON
- [ ] Response times < 500ms
- [ ] No errors in production

### Phase 2 Success ✅
- [ ] Price history table populated
- [ ] History recorded on every import
- [ ] Trend calculation endpoints functional
- [ ] Backfill script completed

### Phase 3 Success ✅
- [ ] FTS5 search 100x faster than LIKE
- [ ] Search response < 100ms
- [ ] Fuzzy matching works
- [ ] No search functionality broken

### Phase 4 Success ✅
- [ ] Frontend charts display real data
- [ ] Cache improves performance (2nd load instant)
- [ ] Scheduled tasks execute correctly
- [ ] Monitoring endpoints functional

### Overall Success ✅
- [ ] All 4 phases complete
- [ ] All tests passing
- [ ] No regressions introduced
- [ ] Performance targets met
- [ ] Documentation complete

---

## Risk Mitigation

### Technical Risks
1. **SQLite FTS5 not available**
   - Mitigation: Verify SQLite version supports FTS5
   - Fallback: Keep LIKE queries as backup

2. **Performance degradation**
   - Mitigation: Benchmark before/after
   - Rollback: Keep old code paths

3. **Data migration issues**
   - Mitigation: Test migrations on copy of DB
   - Backup: Create DB backup before migrations

### Process Risks
1. **Task dependencies blocking**
   - Mitigation: Parallel execution where possible
   - Fallback: Adjust task order

2. **Testing bottlenecks**
   - Mitigation: Automated test scripts
   - Parallel: Run independent tests concurrently

---

## Progress Tracking

**Overall Progress:** 0/100 tasks (0%)

**Phase 1:** 0/10 tasks (0%)
**Phase 2:** 0/8 tasks (0%)
**Phase 3:** 0/8 tasks (0%)
**Phase 4:** 0/10 tasks (0%)
**Integration:** 0/15 tasks (0%)

---

## Commit Strategy

- Commit after each major task completion
- Descriptive commit messages with task reference
- Push to branch after each phase
- Final PR after all phases complete

---

**Last Updated:** October 24, 2025
**Next Update:** After Phase 1 Task 1.1
