# Standalone Vehicle Data Scraping & Import Guide

## Overview

This guide provides two approaches for collecting and importing vehicle data into the Restomod Central database from a separate machine or environment with proper scraping tools.

---

## 🎯 Two Approaches

### **Approach 1: Container with MCP Servers** (Recommended)
Run the entire app in a Docker container with MCP server support for Playwright, Firecrawl, etc.

### **Approach 2: Standalone Scraper Utility** (Flexible)
Create a separate scraping utility that runs anywhere and connects to the database remotely or imports via API.

---

## 📦 Approach 1: Container with MCP Servers

### Why This Works
- Full browser automation (Playwright) available via MCP
- All scraping tools pre-configured
- No manual data transformation needed
- Direct database access

### Setup Instructions

#### 1. Create Docker Compose Configuration

Create `docker-compose.scraper.yml`:

\`\`\`yaml
version: '3.8'

services:
  # Main application with MCP support
  restomod-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    volumes:
      - ./db:/app/db
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/db/local.db
    depends_on:
      - playwright-mcp
      - firecrawl-mcp

  # Playwright MCP Server
  playwright-mcp:
    image: node:22-alpine
    working_dir: /app
    command: npx -y @playwright/mcp
    volumes:
      - playwright-cache:/root/.cache/ms-playwright
    environment:
      - PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

  # Firecrawl MCP Server (optional, for advanced scraping)
  firecrawl-mcp:
    image: node:22-alpine
    working_dir: /app
    command: npx -y crawl4ai-mcp-server
    environment:
      - FIRECRAWL_API_KEY=${FIRECRAWL_API_KEY:-}

volumes:
  playwright-cache:
\`\`\`

#### 2. Run the Container

\`\`\`bash
# Start all services
docker-compose -f docker-compose.scraper.yml up -d

# Check MCP servers are running
docker ps

# Access the container
docker exec -it restomod-app sh

# Run scraping scripts inside container
npx tsx scripts/scrape-with-mcp.ts 200
\`\`\`

#### 3. Configure MCP Servers

The `.mcp.json` file is already configured:

\`\`\`json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "description": "Browser automation for web scraping"
    },
    "crawl4ai": {
      "command": "npx",
      "args": ["-y", "crawl4ai-mcp-server"],
      "description": "Self-hosted web scraping (free Firecrawl alternative)"
    }
  }
}
\`\`\`

#### 4. Run Scraping from Inside Container

\`\`\`bash
# SSH into container
docker exec -it restomod-app sh

# Run the scraper with MCP Playwright
npx tsx scripts/scrape-classiccars-playwright.ts 200

# Or use the MCP integration script
npx tsx scripts/scrape-with-mcp.ts 200

# Verify imported data
npx tsx scripts/verify-database.ts
\`\`\`

---

## 🛠️ Approach 2: Standalone Scraper Utility

### Why This Works
- Run scraper on any machine with browsers
- No need to run full Restomod app
- Connect to database remotely OR use REST API
- Can run as cron job for continuous data collection

### Architecture

\`\`\`
┌─────────────────────────────────────┐
│  Separate Scraping Machine         │
│  (Your laptop, VM, cloud server)   │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Standalone Scraper Script   │  │
│  │  - Playwright/Puppeteer      │  │
│  │  - Cheerio/Axios            │  │
│  │  - Data transformation       │  │
│  └──────────────────────────────┘  │
│              │                      │
│              ▼                      │
│  ┌──────────────────────────────┐  │
│  │  Output: vehicles.json       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
              │
              │ HTTP POST /api/vehicles/import
              │ OR Direct DB Connection
              ▼
┌─────────────────────────────────────┐
│  Restomod Central Server            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  REST API (Express)          │  │
│  └──────────────────────────────┘  │
│              │                      │
│  ┌──────────────────────────────┐  │
│  │  SQLite Database             │  │
│  │  (db/local.db)               │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
\`\`\`

### Setup Instructions

See the detailed guide in **`STANDALONE-SCRAPER-SETUP.md`** for:
- Installing Playwright on your scraping machine
- Database connection methods (direct or API)
- Field requirements and validation
- Example scraper scripts

---

## 📊 Database Schema for Vehicle Import

### Table: `cars_for_sale`

#### Required Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| \`make\` | TEXT | Vehicle manufacturer | "Chevrolet" |
| \`model\` | TEXT | Vehicle model | "Corvette" |
| \`year\` | INTEGER | Year of manufacture | 1967 |
| \`sourceType\` | TEXT | Data source type | "import" |
| \`sourceName\` | TEXT | Source name & date | "ClassicCars.com scrape - 2025-10-24" |
| \`createdAt\` | TIMESTAMP | Record creation time | 1729785600 |
| \`updatedAt\` | TIMESTAMP | Record update time | 1729785600 |

#### Optional Fields (Recommended)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| \`price\` | TEXT | Listed price | "$119,995" |
| \`stockNumber\` | TEXT | Dealer stock number | "CC-1649045" |
| \`locationCity\` | TEXT | Vehicle location city | "Green Brook" |
| \`locationState\` | TEXT | Vehicle location state | "New Jersey" |
| \`locationRegion\` | TEXT | Geographic region | "northeast" |
| \`category\` | TEXT | Vehicle category | "Muscle Cars" |
| \`condition\` | TEXT | Condition rating | "Excellent" |
| \`mileage\` | INTEGER | Odometer reading | 73685 |
| \`exteriorColor\` | TEXT | Exterior color | "Kona Blue" |
| \`interiorColor\` | TEXT | Interior color | "Black" |
| \`engine\` | TEXT | Engine description | "383 Big Block" |
| \`transmission\` | TEXT | Transmission type | "Automatic" |
| \`imageUrl\` | TEXT | Primary image URL | "https://..." |
| \`description\` | TEXT | Full description | "Numbers matching..." |
| \`vin\` | TEXT | Vehicle VIN | "XXX..." |

#### Investment Analysis Fields (Optional)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| \`investmentGrade\` | TEXT | Investment rating | "A+" |
| \`appreciationRate\` | TEXT | Appreciation % | "12.5%/year" |
| \`marketTrend\` | TEXT | Market direction | "rising" |
| \`valuationConfidence\` | TEXT | Confidence score | "0.85" |

#### Special Fields
| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| \`features\` | JSON | Array of features | Store as JSON string |
| \`marketData\` | JSON | Market intelligence | Store as JSON string |

---

## 🔐 Database Connection Methods

### Method 1: Direct SQLite Connection (Local Network)

\`\`\`typescript
import Database from 'better-sqlite3';

// Connect to database
const db = new Database('/path/to/restomod_central/db/local.db');

// Insert vehicle
const stmt = db.prepare(\`
  INSERT INTO cars_for_sale (
    make, model, year, price, sourceType, sourceName,
    locationCity, locationState, stockNumber,
    createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
\`);

stmt.run(
  'Chevrolet',
  'Corvette',
  1967,
  '$119,995',
  'import',
  'ClassicCars.com scrape - 2025-10-24',
  'Green Brook',
  'New Jersey',
  'CC-1649045',
  Date.now(),
  Date.now()
);
\`\`\`

### Method 2: REST API (Remote/Production)

\`\`\`typescript
// POST to /api/vehicles/import
const response = await fetch('http://your-server:5000/api/vehicles/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    vehicles: [
      {
        make: 'Chevrolet',
        model: 'Corvette',
        year: 1967,
        price: '$119,995',
        sourceType: 'import',
        sourceName: 'ClassicCars.com scrape - 2025-10-24',
        locationCity: 'Green Brook',
        locationState: 'New Jersey',
        stockNumber: 'CC-1649045',
        // ... other fields
      }
    ]
  })
});
\`\`\`

### Method 3: JSON File Import (Simplest)

\`\`\`bash
# 1. Generate JSON on scraping machine
node scraper.js > vehicles-2025-10-24.json

# 2. Copy to server
scp vehicles-2025-10-24.json user@server:/app/data/

# 3. Import on server
cd /app
npx tsx scripts/import-real-listings.ts data/vehicles-2025-10-24.json
\`\`\`

---

## 📝 Example Scraper Scripts

See full working examples in:
- \`standalone-scraper/playwright-scraper.ts\` - Playwright-based scraper
- \`standalone-scraper/puppeteer-scraper.ts\` - Puppeteer alternative
- \`standalone-scraper/api-importer.ts\` - REST API import client
- \`standalone-scraper/db-importer.ts\` - Direct database import

---

## 🚀 Quick Start: Run Scraper on Separate Machine

### Step 1: Clone Standalone Scraper Package

\`\`\`bash
# On your scraping machine
git clone https://github.com/Planet9V/restomod-scraper
cd restomod-scraper
npm install
\`\`\`

### Step 2: Configure Connection

Edit \`config.json\`:

\`\`\`json
{
  "target": {
    "url": "https://classiccars.com",
    "filters": {
      "yearMin": 1930,
      "yearMax": 1980,
      "priceMin": 20000,
      "priceMax": 200000
    }
  },
  "database": {
    "method": "api",
    "apiUrl": "https://your-server.com/api/vehicles/import",
    "apiKey": "your-secret-key"
  },
  "scraping": {
    "concurrency": 3,
    "delay": 2000,
    "maxVehicles": 200
  }
}
\`\`\`

### Step 3: Run Scraper

\`\`\`bash
# Scrape 200 vehicles and import via API
npm run scrape

# Or generate JSON only
npm run scrape -- --output-only

# Or import from existing JSON
npm run import -- vehicles-2025-10-24.json
\`\`\`

---

## 🔄 Continuous Scraping (Cron Job)

### Option A: Daily Scraping on Separate Machine

\`\`\`bash
# Add to crontab
0 2 * * * cd /path/to/restomod-scraper && npm run scrape >> logs/scrape.log 2>&1
\`\`\`

### Option B: Cloud Function / Lambda

Deploy scraper as serverless function that runs on schedule:
- AWS Lambda + EventBridge
- Google Cloud Functions + Cloud Scheduler
- Azure Functions + Timer Trigger

See \`deployment/aws-lambda-scraper/\` for example

---

## 📦 Pre-built Scraper Docker Image

For maximum portability:

\`\`\`bash
# Pull pre-built scraper image
docker pull planet9v/restomod-scraper:latest

# Run scraper
docker run -e API_URL=https://your-server.com \\
           -e API_KEY=your-key \\
           planet9v/restomod-scraper:latest \\
           scrape 200
\`\`\`

---

## ⚠️ Important Notes

### Data Quality
- **sourceType MUST be 'import'** for real scraped data (not 'research')
- **sourceName** should include source website and date
- **stockNumber** should be unique per vehicle

### Rate Limiting
- Use respectful delays (2-4 seconds) between requests
- Implement exponential backoff on errors
- Consider using rotating proxies for large scrapes

### Validation
- Validate required fields before insertion
- Check for duplicate stock numbers
- Ensure prices are properly formatted

### Legal Compliance
- Respect robots.txt
- Follow website terms of service
- Don't overload servers

---

## 📚 Next Steps

1. **Choose your approach** (Container vs Standalone)
2. **Follow detailed setup guide** (see STANDALONE-SCRAPER-SETUP.md)
3. **Test with small batch** (10 vehicles first)
4. **Scale to full collection** (200+ vehicles)
5. **Set up automated scraping** (optional)

---

## 🆘 Troubleshooting

### "403 Forbidden" Errors
- Use browser automation (Playwright) instead of direct HTTP
- Rotate user agents
- Use residential proxies

### "Database Locked" Errors
- Close all connections before writing
- Use WAL mode: \`PRAGMA journal_mode=WAL;\`
- Ensure only one writer at a time

### Duplicate Stock Numbers
- Check existing vehicles before inserting
- Use \`INSERT OR IGNORE\` or \`INSERT OR REPLACE\`
- Maintain unique index on stock_number

---

## 📧 Support

For questions or issues:
- GitHub Issues: https://github.com/Planet9V/restomod_central/issues
- Documentation: https://docs.restomodcentral.com
