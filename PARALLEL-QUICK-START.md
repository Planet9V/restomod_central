# ⚡ PARALLEL QUICK START - 487 Cars in 12 Minutes

**Current**: 513 / 1000 cars (51.3%)
**Target**: 1000 cars
**Needed**: 487 more cars
**Time with Parallel**: ~12 minutes
**Time Sequential**: ~40 minutes
**Speedup**: **3-4x faster** ⚡

---

## 🚀 Step-by-Step (Copy & Paste)

### Step 1: Generate Scraping Plan (30 seconds)

```bash
npm run scraping:plan -- --target=200 --sources=classiccars,hemmings
```

This outputs 5 parallel tasks (220 cars total).

### Step 2: Execute in Claude Code (3-4 minutes)

**Copy this ENTIRE message and send to Claude Code:**

```
I need you to scrape 5 classic car sources IN PARALLEL using the Task tool.

IMPORTANT: Execute ALL 5 tasks simultaneously in a SINGLE message using multiple Task tool calls.

Task 1: ClassicCars.com - 1960s Muscle Cars (40 cars)
Use Playwright MCP to scrape:
URL: https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars
Extract: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl
Save to: data/scraped-cc-muscle-60s.json

Task 2: ClassicCars.com - Corvettes (40 cars)
Use Playwright MCP to scrape:
URL: https://classiccars.com/listings/find?make=chevrolet&model=corvette
Extract: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl
Save to: data/scraped-cc-corvettes.json

Task 3: ClassicCars.com - Mustangs (40 cars)
Use Playwright MCP to scrape:
URL: https://classiccars.com/listings/find?make=ford&model=mustang
Extract: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl
Save to: data/scraped-cc-mustangs.json

Task 4: Hemmings.com - Chevrolet 1960-1980 (50 cars)
Use Playwright MCP to scrape:
URL: https://www.hemmings.com/classifieds?make=Chevrolet&year_range=1960-1980
Extract: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl
Save to: data/scraped-hem-chevy.json

Task 5: Hemmings.com - Ford 1960-1980 (50 cars)
Use Playwright MCP to scrape:
URL: https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980
Extract: stockNumber, year, make, model, price, location, dealer, imageUrl, listingUrl
Save to: data/scraped-hem-ford.json

For each vehicle, return JSON array format:
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
    "listingUrl": "https://..."
  }
]

Execute all 5 tasks IN PARALLEL (not sequential).
```

### Step 3: Import All Batches in Parallel (10 seconds)

After Claude Code completes:

```bash
npm run import:parallel data/scraped-*.json
```

Expected output:
```
⚡ PARALLEL BATCH IMPORT
📊 Files to import: 5
✅  Total Imported: 220
⏱️  Total Duration: 3.2s
⚡ Parallel speedup: 4.7x faster
```

### Step 4: Check Progress (5 seconds)

```bash
npm run cars:report
```

Expected:
```
📊 Total Imported: 733 / 1000 (73.3%)
📈 Progress: [████████████████████████████████████░░░░░░░░░░░░░░] 73.3%
💪 Halfway there! Great progress!
```

### Step 5: Repeat for Batch 2 (3-4 minutes)

**Send to Claude Code:**

```
Scrape 5 more sources IN PARALLEL:

Task 1: ClassicCars 1950s Classics (40 cars)
URL: https://classiccars.com/listings/find?year-min=1950&year-max=1959
Save to: data/batch2-cc-50s.json

Task 2: Hemmings Dodge (40 cars)
URL: https://www.hemmings.com/classifieds?make=Dodge&year_range=1965-1975
Save to: data/batch2-hem-dodge.json

Task 3: Hemmings Pontiac (40 cars)
URL: https://www.hemmings.com/classifieds?make=Pontiac&year_range=1960-1975
Save to: data/batch2-hem-pontiac.json

Task 4: BringATrailer Muscle Cars (40 cars)
URL: https://bringatrailer.com/auctions/results/?q=muscle+car
Save to: data/batch2-bat-muscle.json

Task 5: Gateway Classic Cars (50 cars)
URL: https://www.gatewayclassiccars.com/inventory?location=all
Save to: data/batch2-gateway.json

Same format, execute in PARALLEL.
```

Import:
```bash
npm run import:parallel data/batch2-*.json
```

New total: ~943 / 1000 (94.3%)

### Step 6: Final Batch (2-3 minutes)

**Send to Claude Code:**

```
Final batch - 3 tasks IN PARALLEL:

Task 1: ClassicCars Camaros (40 cars)
URL: https://classiccars.com/listings/find?make=chevrolet&model=camaro
Save to: data/batch3-cc-camaros.json

Task 2: ClassicCars Chargers (40 cars)
URL: https://classiccars.com/listings/find?make=dodge&model=charger
Save to: data/batch3-cc-chargers.json

Task 3: eBay Motors Classics (30 cars)
URL: https://www.ebay.com/b/Classic-Cars/6001
Save to: data/batch3-ebay-classics.json

Execute in PARALLEL.
```

Import:
```bash
npm run import:parallel data/batch3-*.json
```

### Step 7: Celebrate! 🎉

```bash
npm run cars:report
```

Expected:
```
📊 Total Imported: 1053 / 1000 (105.3%)
🎉🎉🎉 GOAL REACHED! Congratulations! 🎉🎉🎉
```

---

## 📊 Time Breakdown

| Step | Time | Action |
|------|------|--------|
| **Batch 1** | 4 min | Scrape 220 cars (5 tasks parallel) |
| Import | 10 sec | Import all batches |
| **Batch 2** | 4 min | Scrape 210 cars (5 tasks parallel) |
| Import | 10 sec | Import all batches |
| **Batch 3** | 3 min | Scrape 110 cars (3 tasks parallel) |
| Import | 10 sec | Import all batches |
| **Total** | **~12 min** | **540 cars** → **1053 total** ✅ |

---

## 🎯 Commands Cheat Sheet

```bash
# 1. Generate plan
npm run scraping:plan -- --target=200

# 2. Import batches in parallel
npm run import:parallel data/*.json

# 3. Check progress
npm run cars:report

# 4. View in browser
npm run dev
# → http://localhost:5000/cars-for-sale

# 5. Database query
sqlite3 db/local.db "SELECT COUNT(*) FROM cars_for_sale;"
```

---

## ⚡ Why Parallel is Faster

### Sequential (Old Way):
```
Task 1: 3 min ──→ Task 2: 3 min ──→ Task 3: 3 min
Total: 9 minutes for 120 cars
```

### Parallel (New Way):
```
Task 1 ┐
Task 2 ├── All run simultaneously in 3-4 minutes
Task 3 ┘
Total: 3-4 minutes for 120 cars
Speedup: 3x faster!
```

---

## 💡 Pro Tips

1. **Always use "IN PARALLEL"** in your Claude Code message
2. **Send ALL tasks in ONE message** (not separate messages)
3. **Save each result to different file** (data/task1.json, data/task2.json, etc.)
4. **Import all at once** with: `npm run import:parallel data/*.json`
5. **Check progress** after each batch: `npm run cars:report`

---

## 🔥 Alternative: Speed Run (Single Mega-Batch)

If you want to reach 1000 in ONE batch (~5 minutes):

**Send to Claude Code (10 tasks in parallel):**

```
Scrape 10 sources IN PARALLEL for 490 cars total:

1. ClassicCars Muscle 60s → data/speed-cc-muscle.json (50 cars)
2. ClassicCars Corvettes → data/speed-cc-corvettes.json (50 cars)
3. ClassicCars Mustangs → data/speed-cc-mustangs.json (50 cars)
4. ClassicCars 50s → data/speed-cc-50s.json (50 cars)
5. Hemmings Chevy → data/speed-hem-chevy.json (50 cars)
6. Hemmings Ford → data/speed-hem-ford.json (50 cars)
7. Hemmings Dodge → data/speed-hem-dodge.json (50 cars)
8. BringATrailer Muscle → data/speed-bat-muscle.json (40 cars)
9. BringATrailer Corvettes → data/speed-bat-vettes.json (40 cars)
10. Gateway All → data/speed-gateway.json (60 cars)

Execute ALL 10 tasks simultaneously.
```

Import:
```bash
npm run import:parallel data/speed-*.json
```

Result: **513 + 490 = 1003 cars in ~5 minutes** ⚡

---

**Created**: 2025-11-17
**Estimated Time to 1000**: 12 minutes (3 batches)
**Speedup vs Sequential**: 3-4x faster
