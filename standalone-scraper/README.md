# Restomod Central - Standalone Vehicle Scraper

This is a standalone scraping utility that can run on any machine to collect vehicle data and import it into the Restomod Central database.

## Features

- 🚀 Run anywhere (laptop, VM, cloud server)
- 🔍 Multiple scraping methods (Playwright, Puppeteer, Cheerio)
- 📡 Multiple import methods (API, Direct DB, JSON export)
- 🔄 Automatic retry and error handling
- 📊 Progress tracking and logging
- ⚙️ Fully configurable

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure

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
    "apiUrl": "http://localhost:5000/api/cars/import",
    "apiKey": "your-api-key"
  }
}
\`\`\`

### 3. Run Scraper

\`\`\`bash
# Scrape and import via API
npm run scrape

# Scrape to JSON only
npm run scrape:json

# Import existing JSON
npm run import vehicles-2025-10-24.json
\`\`\`

## Configuration

### Target Configuration

\`\`\`json
{
  "target": {
    "url": "https://classiccars.com",
    "filters": {
      "yearMin": 1930,
      "yearMax": 1980,
      "priceMin": 20000,
      "priceMax": 200000,
      "makes": ["Chevrolet", "Ford", "Dodge"],
      "models": ["Corvette", "Mustang", "Charger"]
    }
  }
}
\`\`\`

### Database Configuration

#### Option 1: API Import (Recommended)
\`\`\`json
{
  "database": {
    "method": "api",
    "apiUrl": "https://your-server.com/api/cars/import",
    "apiKey": "your-secret-api-key"
  }
}
\`\`\`

#### Option 2: Direct Database Connection
\`\`\`json
{
  "database": {
    "method": "direct",
    "path": "/path/to/restomod_central/db/local.db"
  }
}
\`\`\`

#### Option 3: JSON Export
\`\`\`json
{
  "database": {
    "method": "json",
    "outputPath": "./output/vehicles.json"
  }
}
\`\`\`

### Scraping Configuration

\`\`\`json
{
  "scraping": {
    "method": "playwright",
    "concurrency": 3,
    "delay": 2000,
    "maxRetries": 3,
    "maxVehicles": 200,
    "headless": true,
    "userAgent": "Mozilla/5.0..."
  }
}
\`\`\`

## Scraping Methods

### Playwright (Recommended)
Best for sites with JavaScript rendering or bot protection.

\`\`\`bash
npm run scrape:playwright
\`\`\`

### Puppeteer
Alternative to Playwright, similar capabilities.

\`\`\`bash
npm run scrape:puppeteer
\`\`\`

### Cheerio + Axios
Fastest method for simple HTML sites without JavaScript.

\`\`\`bash
npm run scrape:cheerio
\`\`\`

## Import Methods

### 1. API Import

Most flexible method, works over HTTP.

\`\`\`bash
npm run import:api vehicles.json
\`\`\`

Example:
\`\`\`typescript
import { importViaAPI } from './lib/api-importer';

await importViaAPI({
  apiUrl: 'https://your-server.com/api/cars/import',
  apiKey: 'your-api-key',
  vehicles: vehiclesArray
});
\`\`\`

### 2. Direct Database Import

Fastest method, requires file system access to database.

\`\`\`bash
npm run import:db vehicles.json
\`\`\`

Example:
\`\`\`typescript
import { importToDB } from './lib/db-importer';

await importToDB({
  dbPath: '/path/to/db/local.db',
  vehicles: vehiclesArray
});
\`\`\`

### 3. JSON Export

For manual review or batch processing.

\`\`\`bash
npm run scrape:json
# Outputs to: output/vehicles-YYYY-MM-DD.json
\`\`\`

## Environment Variables

\`\`\`bash
# API Configuration
SCRAPER_API_URL=https://your-server.com/api/cars/import
SCRAPER_API_KEY=your-secret-key

# Database Configuration
SCRAPER_DB_PATH=/path/to/db/local.db

# Scraping Configuration
SCRAPER_MAX_VEHICLES=200
SCRAPER_CONCURRENCY=3
SCRAPER_DELAY=2000
SCRAPER_HEADLESS=true

# Proxy Configuration (optional)
PROXY_URL=http://your-proxy:8080
PROXY_USERNAME=user
PROXY_PASSWORD=pass
\`\`\`

## Docker Usage

### Build Image

\`\`\`bash
docker build -t restomod-scraper .
\`\`\`

### Run Scraper

\`\`\`bash
docker run -e SCRAPER_API_URL=https://your-server.com \\
           -e SCRAPER_API_KEY=your-key \\
           restomod-scraper scrape 200
\`\`\`

### Run as Cron Job

\`\`\`bash
# Add to crontab
0 2 * * * docker run restomod-scraper scrape 50 >> /var/log/scraper.log 2>&1
\`\`\`

## Monitoring & Logging

### View Logs

\`\`\`bash
# Real-time logs
tail -f logs/scraper.log

# Error logs only
tail -f logs/errors.log

# Stats
cat logs/stats.json
\`\`\`

### Stats Output

\`\`\`json
{
  "timestamp": "2025-10-24T10:30:00Z",
  "duration": 3600,
  "total": 200,
  "success": 195,
  "failed": 5,
  "skipped": 0,
  "vehicles": [...]
}
\`\`\`

## Troubleshooting

### 403 Forbidden Errors

Use Playwright instead of Cheerio:
\`\`\`bash
npm run scrape:playwright
\`\`\`

### Rate Limiting

Increase delay in config:
\`\`\`json
{
  "scraping": {
    "delay": 5000,
    "concurrency": 1
  }
}
\`\`\`

### Database Locked

Ensure only one process writes at a time:
\`\`\`bash
# Check for existing processes
ps aux | grep scraper

# Use API method instead of direct DB
npm run import:api vehicles.json
\`\`\`

## Examples

See the \`examples/\` directory for complete working examples:
- \`examples/basic-scraper.ts\` - Simple scraping example
- \`examples/batch-scraper.ts\` - Batch processing with progress tracking
- \`examples/cron-scraper.ts\` - Automated daily scraping
- \`examples/lambda-scraper.ts\` - AWS Lambda deployment

## License

MIT
