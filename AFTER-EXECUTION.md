# 📋 After Execution Checklist

## ✅ Step-by-Step After Scraping

### 1. Verify Files Were Created
```bash
ls -lh data/scraped-*.json
```

Expected: 9 files (scraped-cc-muscle-60s.json, scraped-cc-corvettes.json, etc.)

### 2. Check File Sizes
```bash
du -h data/scraped-*.json
```

Each file should be 10-50KB. If any file is <1KB, it may have failed.

### 3. Preview One File
```bash
head -20 data/scraped-cc-muscle-60s.json
```

Should see valid JSON with vehicle data.

### 4. Import All Batches in Parallel
```bash
npm run import:parallel data/scraped-*.json
```

Expected output:
```
⚡ PARALLEL BATCH IMPORT
📊 Files to import: 9
✅ Total Imported: ~360
⏱️ Total Duration: ~10-15s
⚡ Parallel speedup: 4-5x faster
```

### 5. Check Progress
```bash
npm run cars:report
```

Expected:
```
📊 Total Imported: 873 / 1000 (87.3%)
📈 Progress: [████████████████████████████████████████████░░░░░] 87.3%
```

### 6. Verify in Browser
```bash
npm run dev
```

Visit: http://localhost:5000/cars-for-sale

Should see 873 cars.

### 7. Test Search
In the browser:
- Search for "Camaro" → should find results
- Filter by year 1960-1969 → should show muscle cars
- Check different sources in the listings

---

## 🎯 Next Steps Based on Results

### If you have 850-900 cars:
**One more small batch to reach 1000:**

```bash
npm run scraping:plan -- --target=150
```

Execute the 3-4 tasks in parallel, import, done! 🎉

### If you have 700-850 cars:
**Two more batches:**

Batch 1: 150 cars (3-4 tasks)
Batch 2: 100 cars (2-3 tasks)

### If some tasks failed:
**Retry failed tasks individually:**

Example retry message for Claude Code:
```
Retry scraping ClassicCars.com Mustangs:
URL: https://classiccars.com/listings/find?make=ford&model=mustang
Extract 40 Mustangs.
Output: data/retry-mustangs.json
```

Then import:
```bash
npm run import:batch data/retry-mustangs.json
```

---

## 📊 Quality Checks

### Check Distribution
```bash
sqlite3 db/local.db "SELECT sourceName, COUNT(*) FROM cars_for_sale GROUP BY sourceName ORDER BY COUNT(*) DESC;"
```

Should see good mix:
- ClassicCars.com: 200-300
- Hemmings: 150-250
- BringATrailer: 50-100

### Check by Category
```bash
sqlite3 db/local.db "SELECT category, COUNT(*) FROM cars_for_sale GROUP BY category ORDER BY COUNT(*) DESC;"
```

Expected:
- Muscle Cars: 300-400
- Sports Cars: 150-200
- Classic Cars: 150-200

### Check for Duplicates
```bash
sqlite3 db/local.db "SELECT stockNumber, COUNT(*) FROM cars_for_sale GROUP BY stockNumber HAVING COUNT(*) > 1;"
```

Should return nothing (system auto-deduplicates).

### Check Price Range
```bash
sqlite3 db/local.db "SELECT 
  COUNT(CASE WHEN CAST(REPLACE(REPLACE(price, '$', ''), ',', '') AS INTEGER) < 50000 THEN 1 END) as under_50k,
  COUNT(CASE WHEN CAST(REPLACE(REPLACE(price, '$', ''), ',', '') AS INTEGER) BETWEEN 50000 AND 100000 THEN 1 END) as mid_range,
  COUNT(CASE WHEN CAST(REPLACE(REPLACE(price, '$', ''), ',', '') AS INTEGER) > 100000 THEN 1 END) as over_100k
FROM cars_for_sale WHERE price LIKE '$%';"
```

Should see good distribution across price ranges.

---

## 🎉 Celebrate When You Hit 1000!

```bash
npm run cars:report
```

When you see:
```
📊 Total Imported: 1003 / 1000 (100.3%)
🎉🎉🎉 GOAL REACHED! Congratulations! 🎉🎉🎉
```

**You did it!** 🚀

Share your success:
- Take a screenshot of the progress report
- Show the cars in your browser
- Post about your achievement

---

## 🚀 Beyond 1000

Now that you have 1000+ cars:

### Immediate
1. **Data Quality Pass**: Manually review 20 random cars
2. **Fix Any Issues**: Missing images, incorrect data, etc.
3. **Update Documentation**: Record your sources and dates

### This Week
1. **Continue to 2000**: Use the same parallel system
2. **Add Price Tracking**: Save prices over time
3. **Market Analysis**: Identify trending models

### Long Term
1. **Automated Updates**: Schedule weekly scraping
2. **Dealer Partnerships**: Direct API integrations
3. **User Features**: Saved searches, price alerts
4. **Advanced Analytics**: Investment opportunities

---

## 🔧 Common Issues & Solutions

### Issue: "File not found" during import
**Solution**: Check file names match exactly
```bash
ls data/scraped-*.json
```

### Issue: "UNIQUE constraint failed"
**Solution**: Normal! System is skipping duplicates. Check the report for actual imported count.

### Issue: Import seems slow
**Solution**: You might be running sequential import. Use:
```bash
npm run import:parallel data/*.json
```
NOT:
```bash
npm run import:batch data/*.json
```

### Issue: Some cars missing location
**Solution**: Normal - not all listings have complete data. System handles this gracefully.

---

## 📈 Performance Metrics to Track

After each batch, note:
- Total import time
- Cars imported vs duplicates
- Error rate
- Average cars/second

This helps optimize future scraping sessions.

---

**Created**: 2025-11-17
**For use after**: Executing the 9-task parallel scraping plan
**Next doc**: GET-TO-1000-CARS.md (if you need more cars)
