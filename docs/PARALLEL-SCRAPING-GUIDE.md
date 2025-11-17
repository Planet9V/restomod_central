# Parallel Scraping Guide - Get to 1000 Cars FAST

**Goal**: Maximize throughput with parallel scraping and imports
**Current**: 513 cars → **Target**: 1000 cars
**Method**: Parallel execution across multiple sources simultaneously

---

## 🚀 Quick Start - Get 200 Cars in 10 Minutes

### Step 1: Generate Scraping Plan

```bash
tsx scripts/scraping-coordinator.ts --target=200 --sources=classiccars,hemmings
```

This will output a parallel execution plan with 5-8 tasks.

### Step 2: Execute ALL Tasks in Parallel

**IMPORTANT**: Send ONE message to Claude Code with ALL tasks at once.

In Claude Code, send:

```
I need you to scrape multiple classic car sources IN PARALLEL.

Execute these tasks simultaneously using multiple Task tool calls:

Task 1: ClassicCars.com 1960s Muscle Cars (40 cars)
Task 2: ClassicCars.com Corvettes (40 cars)
Task 3: ClassicCars.com Mustangs (40 cars)
Task 4: Hemmings Chevrolet (50 cars)
Task 5: Hemmings Ford (50 cars)

For EACH task, use Playwright MCP to scrape the listings and return JSON.

Save each result to:
- Task 1 → data/scraped-cc-muscle-60s.json
- Task 2 → data/scraped-cc-corvettes.json
- Task 3 → data/scraped-cc-mustangs.json
- Task 4 → data/scraped-hem-chevy.json
- Task 5 → data/scraped-hem-ford.json

All tasks should run IN PARALLEL (not sequential).

For each vehicle extract:
{
  "stockNumber": "...",
  "year": 1967,
  "make": "Chevrolet",
  "model": "Camaro",
  "price": "$89,500",
  "location": "Phoenix, Arizona",
  "dealer": "Arizona Classic Cars",
  "imageUrl": "https://...",
  "listingUrl": "https://..."
}
```

### Step 3: Import All Batches in Parallel

After Claude Code completes (all 5 files saved):

```bash
npm run import:parallel data/scraped-*.json
```

This imports ALL files simultaneously for maximum speed.

### Step 4: Check Progress

```bash
npm run cars:report
```

---

## ⚡ Performance Comparison

### Sequential (Old Way - SLOW)
```
Task 1: 3 min → Task 2: 3 min → Task 3: 3 min → Task 4: 3 min → Task 5: 3 min
Total: 15 minutes for 220 cars
```

### Parallel (New Way - FAST)
```
Task 1 ┐
Task 2 ├─ All run simultaneously
Task 3 ├─ ~3-4 minutes total
Task 4 ├─
Task 5 ┘
Total: 3-4 minutes for 220 cars
⚡ 4x speedup!
```

---

## 📊 Parallel Scraping Strategies

### Strategy 1: Divide by Category (Fastest)

Scrape different categories simultaneously:

```bash
# All in PARALLEL:
1. Muscle Cars (ClassicCars.com) → 40 cars
2. Corvettes (ClassicCars.com) → 40 cars
3. Mustangs (ClassicCars.com) → 40 cars
4. 1950s Classics (ClassicCars.com) → 40 cars
5. Chevrolet (Hemmings) → 50 cars

Total: 210 cars in ~3-4 minutes
```

### Strategy 2: Divide by Source (Good for diversity)

Scrape multiple sources at once:

```bash
# All in PARALLEL:
1. ClassicCars.com → 80 cars
2. Hemmings.com → 100 cars
3. BringATrailer.com → 60 cars
4. Gateway Classic Cars → 50 cars

Total: 290 cars in ~4-5 minutes
```

### Strategy 3: Divide by Price Range (Best for balance)

```bash
# All in PARALLEL:
1. $20k-$50k (Entry Level) → 60 cars
2. $50k-$100k (Mid-Range) → 60 cars
3. $100k-$200k (Premium) → 40 cars
4. $200k+ (Investment Grade) → 40 cars

Total: 200 cars in ~3-4 minutes
```

---

## 🔧 Tools & Commands

### 1. Scraping Coordinator

Generates parallel scraping plans:

```bash
# Get 200 cars from ClassicCars + Hemmings
tsx scripts/scraping-coordinator.ts --target=200 --sources=classiccars,hemmings

# Get 300 cars from all sources
tsx scripts/scraping-coordinator.ts --target=300 --sources=classiccars,hemmings,bringatrailer

# Custom plan
tsx scripts/scraping-coordinator.ts --target=150 --sources=classiccars --parallel=6
```

### 2. Parallel Batch Import

Import multiple JSON files simultaneously:

```bash
# Import all scraped files at once
npm run import:parallel data/scraped-*.json

# Import specific batches
npm run import:parallel data/batch1.json data/batch2.json data/batch3.json

# Works with glob patterns
npm run import:parallel data/scraped-cc-*.json
```

### 3. Progress Tracking

```bash
# Check current status
npm run cars:report

# Shows:
# - Current count / 1000
# - Distribution by source
# - ETA to completion
# - Next recommended actions
```

---

## 📋 Complete Workflow - 500 Cars in 15 Minutes

### Batch 1: ClassicCars.com Categories (3 min)

```
Send to Claude Code (ONE message):
---
Scrape these 4 ClassicCars.com categories IN PARALLEL:

1. 1960s Muscle Cars (40 cars)
   URL: https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars
   Output: data/batch1-muscle.json

2. Corvettes (40 cars)
   URL: https://classiccars.com/listings/find?make=chevrolet&model=corvette
   Output: data/batch1-corvettes.json

3. Mustangs (40 cars)
   URL: https://classiccars.com/listings/find?make=ford&model=mustang
   Output: data/batch1-mustangs.json

4. 1950s Classics (40 cars)
   URL: https://classiccars.com/listings/find?year-min=1950&year-max=1959
   Output: data/batch1-50s.json

Extract: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl
Return each as JSON array.
---
```

Import:
```bash
npm run import:parallel data/batch1-*.json
# Result: 160 cars imported (513 + 160 = 673)
```

### Batch 2: Hemmings.com Makes (3 min)

```
Send to Claude Code (ONE message):
---
Scrape these 4 Hemmings.com make searches IN PARALLEL:

1. Chevrolet 1960-1980 (50 cars)
   URL: https://www.hemmings.com/classifieds?make=Chevrolet&year_range=1960-1980
   Output: data/batch2-hem-chevy.json

2. Ford 1960-1980 (50 cars)
   URL: https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980
   Output: data/batch2-hem-ford.json

3. Dodge 1965-1975 (40 cars)
   URL: https://www.hemmings.com/classifieds?make=Dodge&year_range=1965-1975
   Output: data/batch2-hem-dodge.json

4. Pontiac 1960-1975 (40 cars)
   URL: https://www.hemmings.com/classifieds?make=Pontiac&year_range=1960-1975
   Output: data/batch2-hem-pontiac.json

Extract same fields, return as JSON arrays.
---
```

Import:
```bash
npm run import:parallel data/batch2-*.json
# Result: 180 cars imported (673 + 180 = 853)
```

### Batch 3: BringATrailer + Gateway (3 min)

```
Send to Claude Code (ONE message):
---
Scrape these sources IN PARALLEL:

1. BringATrailer Muscle Cars (40 cars)
   URL: https://bringatrailer.com/auctions/results/?q=muscle+car
   Output: data/batch3-bat-muscle.json

2. BringATrailer Corvettes (30 cars)
   URL: https://bringatrailer.com/auctions/results/?q=corvette
   Output: data/batch3-bat-corvettes.json

3. Gateway Classic Cars All Locations (80 cars)
   URL: https://www.gatewayclassiccars.com/inventory?location=all
   Output: data/batch3-gateway.json

Extract same fields, return as JSON arrays.
---
```

Import:
```bash
npm run import:parallel data/batch3-*.json
# Result: 150 cars imported (853 + 150 = 1003)
```

### Final Check

```bash
npm run cars:report

# Expected output:
# 📊 Total Imported: 1003 / 1000 (100.3%)
# 🎉🎉🎉 GOAL REACHED! Congratulations! 🎉🎉🎉
```

**Total Time**: ~10-15 minutes for 490 new cars!

---

## 💡 Pro Tips for Maximum Speed

### 1. Batch Size Optimization

```
Optimal batch: 40-50 cars per task
- Too small (10 cars): Too many tasks, overhead
- Too large (100 cars): Takes too long, blocks other tasks
- Sweet spot: 40-50 cars = ~2-3 minutes per task
```

### 2. Source Diversity

```
Don't scrape the same source twice in parallel:
❌ Bad: 5 ClassicCars.com tasks at once (may get rate limited)
✅ Good: 1 ClassicCars, 1 Hemmings, 1 BaT, 1 Gateway
```

### 3. Error Recovery

```bash
# If a task fails, retry just that task:
Send to Claude Code:
---
Retry Task 3 from previous batch:
URL: https://classiccars.com/listings/find?make=ford&model=mustang
Output: data/retry-mustangs.json
Extract 40 Mustangs.
---

# Then import separately:
npm run import:batch data/retry-mustangs.json
```

### 4. Deduplication

The parallel import automatically handles duplicates:
```
- Checks stock number
- Checks VIN
- Fuzzy matches year + make + model + location
- Skips duplicates, reports them
```

---

## 🎯 Target Strategies to Reach 1000

### Current: 513 cars → Need: 487 more

#### Option A: ClassicCars.com Focus (2 batches, 6 min)

**Batch 1** (4 tasks in parallel):
1. 1960s Muscle Cars → 50 cars
2. Corvettes → 50 cars
3. Mustangs → 50 cars
4. 1950s Classics → 50 cars
**Subtotal**: 200 cars

**Batch 2** (4 tasks in parallel):
1. Camaros → 50 cars
2. Chargers/Challengers → 50 cars
3. GTOs/Firebirds → 50 cars
4. Pre-war Classics 1930-1949 → 50 cars
**Subtotal**: 200 cars

**Total**: 400 cars in ~6-8 minutes
**New Total**: 913 cars

#### Option B: Multi-Source Diversity (2 batches, 8 min)

**Batch 1** (5 tasks):
1. ClassicCars Muscle → 50
2. Hemmings Chevy → 50
3. Hemmings Ford → 50
4. BringATrailer Muscle → 30
5. BringATrailer Corvettes → 30
**Subtotal**: 210 cars

**Batch 2** (4 tasks):
1. Gateway All Locations → 80
2. Hemmings Dodge → 50
3. Hemmings Pontiac → 50
4. ClassicCars Trucks → 30
**Subtotal**: 210 cars

**Total**: 420 cars in ~8-10 minutes
**New Total**: 933 cars

#### Option C: Speed Run (1 mega-batch, 4 min)

**Single Batch** (10 tasks in parallel):
1-4. ClassicCars categories → 200 cars
5-7. Hemmings makes → 150 cars
8-9. BringATrailer → 60 cars
10. Gateway → 80 cars

**Total**: 490 cars in ~4-5 minutes
**New Total**: 1003 cars ✅

---

## 🔥 Commands Reference

```bash
# Generate scraping plan
tsx scripts/scraping-coordinator.ts --target=200

# Import multiple batches in parallel
npm run import:parallel data/*.json

# Check progress
npm run cars:report

# View in browser
npm run dev
# → http://localhost:5000/cars-for-sale
```

---

## 📈 Expected Performance

### Single Sequential Task
- Time: 3 minutes
- Cars: 40
- Rate: 13 cars/minute

### 5 Parallel Tasks
- Time: 3-4 minutes
- Cars: 200
- Rate: 50-65 cars/minute
- **Speedup: 4-5x**

### 10 Parallel Tasks (Maximum)
- Time: 4-5 minutes
- Cars: 400
- Rate: 80-100 cars/minute
- **Speedup: 6-7x**

---

## 🎉 Success Metrics

After reaching 1000 cars:

```bash
npm run cars:report

Expected output:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚗  CLASSIC CARS IMPORT PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Total Imported: 1003 / 1000 (100.3%)
📈 Progress: [██████████████████████████████████████████████████] 100.3%

By Source:
  ClassicCars.com           450 (44.9%)
  Hemmings.com              300 (29.9%)
  BringATrailer             150 (15.0%)
  Gateway Classic Cars      103 (10.2%)

By Category:
  Muscle Cars               480 (47.9%)
  Sports Cars               210 (20.9%)
  Classic Cars              203 (20.2%)
  Luxury Cars               110 (11.0%)

🎉🎉🎉 GOAL REACHED! Congratulations! 🎉🎉🎉
```

---

## 🚀 Next Level: Scale to 2000+

Once you have 1000 cars, you can continue scaling:

1. **Automated Daily Scraping**: Run coordinator every day for 50 new cars
2. **Price Tracking**: Monitor price changes over time
3. **Market Analysis**: Identify trends and opportunities
4. **API Integration**: Direct dealer API connections
5. **User-Generated Content**: Allow users to submit listings

---

**Last Updated**: 2025-11-17
**Recommended Approach**: Option C (Speed Run) - 490 cars in 4-5 minutes to reach 1000+
