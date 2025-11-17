# Automotive Data Scraping - Quick Reference Guide

**Last Updated:** November 17, 2025

---

## Data Source Priority Matrix

| Source | Access Method | Difficulty | Quality | Cost/Month | Priority | Est. Volume |
|--------|---------------|------------|---------|------------|----------|-------------|
| **NHTSA VIN API** | FREE API | 1/10 | 10/10 | $0 | ⭐⭐⭐⭐⭐ CRITICAL | Unlimited |
| **ClassicCars.com** | Scraping | 7/10 | 8/10 | $40 | ⭐⭐⭐⭐⭐ CRITICAL | 1,500 vehicles |
| **Hemmings** | Scraping | 7/10 | 9/10 | $0 | ⭐⭐⭐⭐⭐ HIGH | 1,000 vehicles |
| **Bring a Trailer** | Apify/Scraping | 9/10 | 10/10 | $20 | ⭐⭐⭐⭐⭐ HIGH | 800 auctions |
| **Eventbrite API** | FREE API | 1/10 | 7/10 | $0 | ⭐⭐⭐⭐⭐ HIGH | 400 events |
| **eBay Motors API** | FREE API | 1/10 | 6/10 | $0 | ⭐⭐⭐⭐ MEDIUM | 600 vehicles |
| **Hagerty Valuation** | Scraping | 8/10 | 10/10 | $100 | ⭐⭐⭐⭐ HIGH | 40K pricing data |
| **Gateway Classic** | Scraping | 5/10 | 9/10 | $0 | ⭐⭐⭐ MEDIUM | 100 vehicles |
| **Goodguys Events** | Scraping | 4/10 | 10/10 | $0 | ⭐⭐⭐⭐⭐ HIGH | 15+ events |
| **NSRA Events** | Scraping + PDF | 5/10 | 9/10 | $0 | ⭐⭐⭐⭐ HIGH | 200 events |

---

## Recommended Tool Stack

### Primary Tools (Must-Have)

**1. Playwright + Stealth Plugin** (FREE)
- Use for: ClassicCars.com, Hemmings, Goodguys
- Success rate: 85-92%
- Installation: `npm install playwright playwright-extra puppeteer-extra-plugin-stealth`

**2. NHTSA VIN API** (FREE)
- Use for: VIN decoding and validation
- Rate limit: 1000-2000/min
- URL: https://vpic.nhtsa.dot.gov/api/

**3. Firecrawl API** ($83/month - Standard)
- Use for: LLM-ready extraction, batch processing
- Credits: 10,000/month
- Best for: ClassicCars.com structured data

### Secondary Tools

**4. Apify** (FREE tier)
- Use for: Bring a Trailer, Cars & Bids
- Pre-built actors available
- 5,000 runs/month free

**5. Bright Data Proxies** ($100/month)
- Use for: High-difficulty sites (BaT, Hagerty)
- 72M residential IPs
- $10.5/GB

**6. 2Captcha** ($20/month)
- Use for: CAPTCHA-protected sites
- $2.99/1000 reCAPTCHAs
- API integration

---

## Anti-Bot Strategy Quick Reference

| Site | Protection Level | Strategy | Cost |
|------|------------------|----------|------|
| ClassicCars.com | MEDIUM | Playwright Stealth + Delays | $0 |
| Hemmings | MEDIUM | Playwright + User Agent Rotation | $0 |
| Bring a Trailer | HIGH | Apify Actor OR Proxies + Stealth | $20 |
| Hagerty | VERY HIGH | Residential Proxies + CAPTCHA Solver | $120 |
| Gateway Classic | LOW | Standard Playwright | $0 |
| eBay Motors | NONE | Official API | $0 |

---

## Budget Scenarios

### Scenario 1: Minimal (Mostly Free)
**Monthly Cost:** $0

**Tools:**
- Playwright (FREE)
- NHTSA API (FREE)
- eBay API (FREE)
- Eventbrite API (FREE)

**Capabilities:**
- 500-800 vehicles/month
- 400+ events/month
- VIN validation unlimited
- Manual effort: HIGH

---

### Scenario 2: Recommended (Production)
**Monthly Cost:** $203-253

**Tools:**
- Playwright + Firecrawl Standard ($83)
- Bright Data Residential ($100)
- 2Captcha ($20)
- Apify Free Tier ($0)

**Capabilities:**
- 2,000+ vehicles/month
- 1,200+ events/month
- Market intelligence data
- Manual effort: LOW

---

### Scenario 3: Enterprise (High Volume)
**Monthly Cost:** $1,782

**Tools:**
- Firecrawl Scale ($333)
- Bright Data Advanced ($500)
- Apify Scale ($499)
- 2Captcha ($50)
- NADA API ($200)
- Dedicated Proxies ($200)

**Capabilities:**
- 10,000+ vehicles/month
- 5,000+ events/month
- Real-time updates
- Full automation
- Manual effort: MINIMAL

---

## Implementation Timeline

### Week 1: Setup & Testing
- [ ] Install Playwright + Stealth
- [ ] Create Firecrawl account
- [ ] Set up Bright Data proxies
- [ ] Test NHTSA VIN API
- [ ] Test scraping 10 sample listings
- **Time:** 16 hours

### Week 2-3: Vehicle Collection
- [ ] Scrape ClassicCars.com (600 vehicles)
- [ ] Scrape Hemmings (500 vehicles)
- [ ] Scrape Bring a Trailer (400 vehicles)
- [ ] Import to database
- **Time:** 25-31 hours
- **Cost:** $30-70

### Week 4: Event Collection
- [ ] Eventbrite API (400 events)
- [ ] Goodguys (15+ events)
- [ ] NSRA (200 events)
- [ ] AACA (300 events)
- **Time:** 14 hours
- **Cost:** $0

### Week 5: Data Quality
- [ ] VIN validation
- [ ] Duplicate detection
- [ ] Data normalization
- [ ] Image deduplication
- **Time:** 20 hours

### Week 6: Automation
- [ ] Scheduled jobs
- [ ] Error monitoring
- [ ] Admin dashboard
- **Time:** 16 hours

**Total Time:** 91-97 hours (2.5 months part-time)
**Total Cost:** $76-193 setup + $203/month ongoing

---

## Legal Compliance Checklist

### Before Scraping ANY Site:

- [ ] Check robots.txt
- [ ] Review Terms of Service
- [ ] Implement rate limiting (max 20 req/min)
- [ ] Add 3-5 second delays
- [ ] Use respectful user agent
- [ ] Store source URLs
- [ ] Add attribution links
- [ ] Don't claim photo ownership

### Safe to Scrape (Public Data):
✅ NHTSA API (official)
✅ eBay API (official)
✅ Eventbrite API (official)
✅ Goodguys event calendar (public)
✅ Auction results (public sales)

### Review ToS Carefully:
⚠️ ClassicCars.com
⚠️ Hemmings
⚠️ Bring a Trailer
⚠️ Hagerty

---

## Rate Limiting Rules

```javascript
// Respectful scraping limits
const limits = {
  ClassicCars:    { reqPerMin: 20, delay: 3000 },
  Hemmings:       { reqPerMin: 15, delay: 4000 },
  BringATrailer:  { reqPerMin: 10, delay: 6000 },
  Hagerty:        { reqPerMin: 5,  delay: 12000 },
  GatewayClassic: { reqPerMin: 30, delay: 2000 }
};
```

---

## Success Metrics

### Data Collection Targets

**Vehicles:**
- Total: 2,000 vehicles
- Complete data: 90%+
- Duplicate rate: <5%
- Update frequency: Weekly

**Events:**
- Total: 1,200 events
- Coverage: 50 US states
- Lead time: 6 months advance
- Update frequency: Monthly

**Data Quality:**
- Validation pass rate: 85%+
- VIN decode success: 95%+
- Image availability: 90%+

---

## Troubleshooting Quick Fixes

### Problem: Getting Blocked

**Solution:**
1. Add 5-10 second delays
2. Enable residential proxies
3. Rotate user agents
4. Use CAPTCHA solver
5. Switch to Firecrawl API

### Problem: CAPTCHAs

**Solution:**
1. Enable 2Captcha integration
2. Use Bright Data Web Unlocker
3. Reduce request frequency
4. Use Apify pre-built actors

### Problem: Data Quality Issues

**Solution:**
1. Validate with NHTSA VIN API
2. Implement fuzzy duplicate detection
3. Add manual review step
4. Use LLM extraction (Firecrawl)

### Problem: Rate Limits

**Solution:**
1. Implement token bucket rate limiter
2. Add exponential backoff
3. Use multiple proxy IPs
4. Schedule jobs off-peak hours

---

## API Keys Needed

| Service | Required? | Cost | Purpose |
|---------|-----------|------|---------|
| NHTSA VIN API | No | FREE | VIN decoding |
| eBay Developer | Yes | FREE | eBay Motors access |
| Eventbrite OAuth | Yes | FREE | Event discovery |
| Firecrawl API | Recommended | $83/mo | LLM extraction |
| Bright Data | Recommended | $100/mo | Residential proxies |
| 2Captcha | Optional | $20/mo | CAPTCHA solving |
| Apify | Optional | FREE | Pre-built scrapers |

---

## Data Source Contact Info

**For API Access Inquiries:**

- **Hagerty:** Contact business development team (no public API)
- **NADA:** MicroBilt (https://developer.microbilt.com)
- **ClassicCars.com:** Possible dealer API (inquire)
- **Hemmings:** No public API (inquire for partnerships)
- **Auction Houses:** Contact for data licensing

---

## Quick Start Commands

```bash
# Install Playwright + Stealth
npm install playwright playwright-extra puppeteer-extra-plugin-stealth

# Install Crawlee (alternative)
npm install crawlee @crawlee/playwright

# Install Firecrawl MCP (for Claude Code)
claude mcp add firecrawl npx -- -y firecrawl-mcp

# Install Apify CLI
npm install -g apify-cli

# Test NHTSA VIN API
curl "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/1HGBH41JXMN109186?format=json"
```

---

## Code Snippets

### Playwright Stealth Setup
```javascript
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...'
});
```

### NHTSA VIN Validation
```javascript
async function decodeVIN(vin) {
  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
  );
  const data = await response.json();
  return data.Results;
}
```

### Rate Limiter
```javascript
class RateLimiter {
  constructor(maxPerMin) {
    this.maxPerMin = maxPerMin;
    this.queue = [];
  }

  async acquire() {
    const now = Date.now();
    this.queue = this.queue.filter(t => now - t < 60000);

    if (this.queue.length >= this.maxPerMin) {
      const waitTime = 60000 - (now - this.queue[0]);
      await new Promise(r => setTimeout(r, waitTime));
    }

    this.queue.push(Date.now());
  }
}
```

---

## Resources

**Documentation:**
- Playwright: https://playwright.dev/
- Firecrawl: https://docs.firecrawl.dev/
- NHTSA API: https://vpic.nhtsa.dot.gov/api/
- Bright Data: https://brightdata.com/
- Apify: https://apify.com/store

**Community:**
- Playwright Discord
- Web Scraping Subreddit: r/webscraping
- Apify Community Forum

**Legal:**
- robots.txt Checker: https://www.google.com/robots.txt
- GDPR Compliance: https://gdpr.eu/

---

**For full details, see:** `/docs/AUTOMOTIVE-DATA-SCRAPING-ROADMAP-2025.md`

**Status:** READY FOR IMPLEMENTATION
**Next Review:** December 1, 2025
