# 🚀 EXECUTE NOW - Ready-to-Copy Parallel Scraping Prompt

**Current**: 513 / 1000 cars (51.3%)
**This will add**: 360 cars
**New total**: 873 / 1000 (87.3%)
**Time**: ~5 minutes (parallel) vs ~27 minutes (sequential)
**Speedup**: 6x faster

---

## 📋 STEP 1: Copy This ENTIRE Message

Send this complete message to Claude Code (copy everything below the line):

---

I need you to scrape 9 classic car sources IN PARALLEL using the Task tool.

**CRITICAL**: Execute ALL 9 tasks SIMULTANEOUSLY in a SINGLE response using multiple Task tool calls. Do NOT execute them sequentially.

For each task, use Playwright MCP to scrape the website and save results to the specified JSON file.

### Task 1: ClassicCars.com - 1960s Muscle Cars (40 cars)
**URL**: https://classiccars.com/listings/find?year-min=1960&year-max=1969&category=muscle-cars

Scrape 40 muscle cars (navigate through 2 pages, 20 per page).

Extract for each vehicle:
- stockNumber (from URL or listing ID)
- year
- make
- model
- price (or "Call for Price")
- location (format: "City, State")
- dealer
- imageUrl
- listingUrl

**Output**: data/scraped-cc-muscle-60s.json

---

### Task 2: ClassicCars.com - Corvettes (40 cars)
**URL**: https://classiccars.com/listings/find?make=chevrolet&model=corvette

Scrape 40 Corvettes across all years (2 pages).

Same fields as Task 1.

**Output**: data/scraped-cc-corvettes.json

---

### Task 3: ClassicCars.com - Mustangs (40 cars)
**URL**: https://classiccars.com/listings/find?make=ford&model=mustang

Scrape 40 Mustangs across all years (2 pages).

Same fields as Task 1.

**Output**: data/scraped-cc-mustangs.json

---

### Task 4: Hemmings.com - Chevrolet 1960-1980 (50 cars)
**URL**: https://www.hemmings.com/classifieds?make=Chevrolet&year_range=1960-1980

Scrape 50 Chevrolet vehicles from 1960-1980.

Same fields as Task 1.

**Output**: data/scraped-hem-chevy.json

---

### Task 5: Hemmings.com - Ford 1960-1980 (50 cars)
**URL**: https://www.hemmings.com/classifieds?make=Ford&year_range=1960-1980

Scrape 50 Ford vehicles from 1960-1980.

Same fields as Task 1.

**Output**: data/scraped-hem-ford.json

---

### Task 6: BringATrailer.com - Muscle Cars (30 cars)
**URL**: https://bringatrailer.com/auctions/results/?q=muscle+car

Scrape 30 muscle car auction results (both completed and active auctions).

Extract:
- stockNumber (use auction ID)
- year
- make
- model
- price (sold price for completed, current bid for active)
- location
- imageUrl
- listingUrl

**Output**: data/scraped-bat-muscle.json

---

### Task 7: ClassicCars.com - 1950s Classics (40 cars)
**URL**: https://classiccars.com/listings/find?year-min=1950&year-max=1959

Scrape 40 classic cars from the 1950s (2 pages).

Same fields as Task 1.

**Output**: data/scraped-cc-classics-50s.json

---

### Task 8: Hemmings.com - Dodge 1965-1975 (40 cars)
**URL**: https://www.hemmings.com/classifieds?make=Dodge&year_range=1965-1975

Scrape 40 Dodge vehicles from the muscle car era.

Same fields as Task 1.

**Output**: data/scraped-hem-dodge.json

---

### Task 9: BringATrailer.com - Corvettes (30 cars)
**URL**: https://bringatrailer.com/auctions/results/?q=corvette

Scrape 30 Corvette auction results.

Same fields as Task 6.

**Output**: data/scraped-bat-corvettes.json

---

## JSON Format Example:

```json
[
  {
    "stockNumber": "CC-1234567",
    "year": 1967,
    "make": "Chevrolet",
    "model": "Camaro SS",
    "price": "$89,500",
    "location": "Phoenix, Arizona",
    "dealer": "Arizona Classic Cars",
    "imageUrl": "https://images.example.com/camaro.jpg",
    "listingUrl": "https://classiccars.com/listings/view/1234567"
  }
]
```

## Critical Requirements:

1. **Execute ALL 9 tasks IN PARALLEL** using multiple Task tool calls in this single response
2. **Use Playwright MCP** for each scraping task
3. **Save each result** to its designated JSON file (data/scraped-*.json)
4. **Return valid JSON arrays** for each task
5. **Extract all specified fields** for every vehicle

Begin parallel execution now.

---

## 📋 STEP 2: After Claude Code Completes

Once all 9 files are created, run this command in your terminal:

```bash
npm run import:parallel data/scraped-cc-muscle-60s.json data/scraped-cc-corvettes.json data/scraped-cc-mustangs.json data/scraped-hem-chevy.json data/scraped-hem-ford.json data/scraped-bat-muscle.json data/scraped-cc-classics-50s.json data/scraped-hem-dodge.json data/scraped-bat-corvettes.json
```

Or simply:

```bash
npm run import:parallel data/scraped-*.json
```

---

## 📋 STEP 3: Verify Success

```bash
npm run cars:report
```

Expected output:
```
📊 Total Imported: 873 / 1000 (87.3%)
📈 Progress: [████████████████████████████████████████████░░░░░] 87.3%
```

---

## 🎯 If You Need More Cars After This

Run one more batch to reach 1000+:

```bash
npm run scraping:plan -- --target=150 --sources=classiccars,hemmings
```

Then execute the generated plan (should be 3-4 more tasks in parallel).

---

## ⚡ Performance Estimate

- **Scraping Time**: 5-6 minutes (all 9 tasks in parallel)
- **Import Time**: 10-15 seconds (all files in parallel)
- **Total Time**: ~6 minutes
- **Sequential Time**: ~28 minutes
- **Time Saved**: 22 minutes (4.7x faster)

---

## 🔧 Troubleshooting

### If Claude Code executes tasks sequentially instead of parallel:
Emphasize in your message: "Use multiple Task tool calls in a SINGLE message"

### If a task fails:
Retry just that task:
```
Retry Task X from the previous batch.
URL: [url]
Output: data/retry-taskX.json
```

### If getting rate limited:
Add this to the message: "Wait 2-3 seconds between page navigations within each task"

---

**Ready to execute!** Copy the prompt above and send it to Claude Code now! 🚀
