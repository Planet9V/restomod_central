# Standalone Scraper Setup Guide

Step-by-step instructions for setting up the standalone vehicle scraper on a separate machine.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Network access to Restomod Central server (if using API import)
- File system access to database (if using direct import)
- Sufficient disk space for browser binaries (~300MB)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Node.js

\`\`\`bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (using Homebrew)
brew install node@22

# Windows (using Chocolatey)
choco install nodejs-lts

# Verify installation
node --version  # Should be 18+
npm --version
\`\`\`

### Step 2: Clone or Copy Scraper Package

#### Option A: Git Clone
\`\`\`bash
git clone https://github.com/Planet9V/restomod_central
cd restomod_central/standalone-scraper
\`\`\`

#### Option B: Copy Files
\`\`\`bash
# From Restomod Central server, copy the standalone-scraper directory
scp -r user@server:/path/to/restomod_central/standalone-scraper ./
cd standalone-scraper
\`\`\`

### Step 3: Install Dependencies

\`\`\`bash
npm install

# Install Playwright browsers
npx playwright install chromium
\`\`\`

### Step 4: Configure Environment

Create \`.env\` file:

\`\`\`bash
# API Configuration (for API import method)
SCRAPER_API_URL=http://your-server:5000/api/cars/import
SCRAPER_API_KEY=your-secret-api-key

# Or Database Configuration (for direct import method)
SCRAPER_DB_PATH=/path/to/restomod_central/db/local.db

# Scraping Configuration
SCRAPER_MAX_VEHICLES=200
SCRAPER_CONCURRENCY=3
SCRAPER_DELAY=2000
SCRAPER_HEADLESS=true
\`\`\`

### Step 5: Test Scraper

\`\`\`bash
# Test with small batch (10 vehicles)
npm run scrape:playwright -- 1930 1980 20000 200000 10

# If successful, you'll see:
# ✅ Complete! Scraped 10 vehicles
\`\`\`

### Step 6: Import to Database

#### Method A: API Import (Recommended)
\`\`\`bash
# Scrape and import automatically
npm run scrape

# Or import existing JSON
npm run import:api vehicles-2025-10-24.json
\`\`\`

#### Method B: Direct Database Import
\`\`\`bash
# Ensure database path is set in .env
npm run import:db vehicles-2025-10-24.json
\`\`\`

---

## 🔧 Detailed Configuration

### config.json

Create a \`config.json\` file for more control:

\`\`\`json
{
  "target": {
    "url": "https://classiccars.com",
    "filters": {
      "yearMin": 1930,
      "yearMax": 1980,
      "priceMin": 20000,
      "priceMax": 200000,
      "makes": ["Chevrolet", "Ford", "Dodge", "Plymouth"],
      "models": ["Corvette", "Mustang", "Charger", "Cuda"]
    }
  },
  "database": {
    "method": "api",
    "apiUrl": "http://your-server:5000/api/cars/import",
    "apiKey": "your-secret-api-key"
  },
  "scraping": {
    "method": "playwright",
    "concurrency": 3,
    "delay": 2000,
    "maxRetries": 3,
    "maxVehicles": 200,
    "headless": true,
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  },
  "logging": {
    "level": "info",
    "file": "logs/scraper.log"
  }
}
\`\`\`

---

## 🎯 Usage Examples

### Example 1: Scrape 200 Muscle Cars (1965-1974)

\`\`\`bash
npm run scrape:playwright -- 1965 1974 20000 200000 200
\`\`\`

### Example 2: Scrape Specific Makes

Edit \`config.json\`:
\`\`\`json
{
  "target": {
    "filters": {
      "makes": ["Chevrolet", "Pontiac"],
      "models": ["Corvette", "Camaro", "GTO", "Firebird"]
    }
  }
}
\`\`\`

Then run:
\`\`\`bash
npm run scrape
\`\`\`

### Example 3: Export to JSON Only (No Import)

\`\`\`bash
npm run scrape:json
# Outputs to: output/vehicles-2025-10-24.json
\`\`\`

### Example 4: Batch Import from Multiple JSON Files

\`\`\`bash
for file in data/*.json; do
  npm run import:api "$file"
done
\`\`\`

---

## 🐳 Docker Setup

### Build Docker Image

\`\`\`bash
cd standalone-scraper
docker build -t restomod-scraper .
\`\`\`

### Run in Docker

\`\`\`bash
docker run --rm \\
  -e SCRAPER_API_URL=http://your-server:5000/api/cars/import \\
  -e SCRAPER_API_KEY=your-secret-key \\
  -v $(pwd)/output:/app/output \\
  restomod-scraper npm run scrape
\`\`\`

### Docker Compose

Create \`docker-compose.yml\`:

\`\`\`yaml
version: '3.8'

services:
  scraper:
    build: .
    environment:
      - SCRAPER_API_URL=http://restomod-server:5000/api/cars/import
      - SCRAPER_API_KEY=${SCRAPER_API_KEY}
      - SCRAPER_MAX_VEHICLES=200
    volumes:
      - ./output:/app/output
      - ./logs:/app/logs
    command: npm run scrape
\`\`\`

Run with:
\`\`\`bash
docker-compose up
\`\`\`

---

## 🔄 Automated Scraping (Cron Jobs)

### Linux/macOS Cron

\`\`\`bash
# Edit crontab
crontab -e

# Add daily scraping at 2 AM
0 2 * * * cd /path/to/standalone-scraper && npm run scrape >> logs/cron.log 2>&1

# Add weekly scraping on Sunday at midnight
0 0 * * 0 cd /path/to/standalone-scraper && npm run scrape >> logs/cron.log 2>&1
\`\`\`

### Windows Task Scheduler

\`\`\`powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "npm" -Argument "run scrape" -WorkingDirectory "C:\\path\\to\\standalone-scraper"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "RestomodScraper" -Description "Daily vehicle scraping"
\`\`\`

### Docker Cron

Use `ofelia` scheduler:

\`\`\`yaml
version: '3.8'

services:
  scraper:
    build: .
    labels:
      ofelia.enabled: "true"
      ofelia.job-exec.scrape.schedule: "0 2 * * *"
      ofelia.job-exec.scrape.command: "npm run scrape"

  scheduler:
    image: mcuadros/ofelia:latest
    depends_on:
      - scraper
    command: daemon --docker
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
\`\`\`

---

## 🌐 Cloud Deployment

### AWS Lambda

1. Package scraper as Lambda function
2. Use EventBridge for scheduling
3. Store output in S3
4. Trigger import via API Gateway

See \`deployment/aws-lambda/\` for complete example.

### Google Cloud Functions

1. Deploy as Cloud Function
2. Use Cloud Scheduler for cron
3. Store output in Cloud Storage
4. Trigger import via HTTP

See \`deployment/gcp-functions/\` for complete example.

### Azure Functions

1. Deploy as Azure Function
2. Use Timer Trigger
3. Store output in Blob Storage
4. Trigger import via HTTP

See \`deployment/azure-functions/\` for complete example.

---

## 🔐 Security Best Practices

### API Key Management

\`\`\`bash
# Never commit API keys to git
echo ".env" >> .gitignore

# Use environment variables
export SCRAPER_API_KEY="your-secret-key"

# Or use a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
\`\`\`

### Network Security

\`\`\`bash
# Use HTTPS for API connections
SCRAPER_API_URL=https://your-server.com/api/cars/import

# Use VPN or SSH tunnel for direct database access
ssh -L 5000:localhost:5000 user@server

# Or use firewall rules to restrict access
sudo ufw allow from your-scraper-ip to any port 5000
\`\`\`

### Rate Limiting

\`\`\`json
{
  "scraping": {
    "delay": 3000,
    "concurrency": 2,
    "maxRetries": 3,
    "backoff": {
      "initialDelay": 1000,
      "maxDelay": 30000,
      "factor": 2
    }
  }
}
\`\`\`

---

## 📊 Monitoring & Debugging

### View Real-time Logs

\`\`\`bash
# Follow log file
tail -f logs/scraper.log

# Filter for errors
tail -f logs/scraper.log | grep ERROR

# Monitor progress
watch -n 1 'tail -n 20 logs/scraper.log'
\`\`\`

### Debug Mode

\`\`\`bash
# Run in non-headless mode to see browser
SCRAPER_HEADLESS=false npm run scrape:playwright

# Enable verbose logging
LOG_LEVEL=debug npm run scrape
\`\`\`

### Performance Monitoring

\`\`\`bash
# Check stats
cat logs/stats.json | jq '.'

# Monitor system resources
htop  # CPU/Memory
iotop # Disk I/O
\`\`\`

---

## ❗ Troubleshooting

### Issue: "Browser executable not found"

**Solution:**
\`\`\`bash
# Reinstall Playwright browsers
npx playwright install --force chromium

# Or use system Chrome
CHROME_PATH=/usr/bin/google-chrome npm run scrape:playwright
\`\`\`

### Issue: "403 Forbidden" or "Access Denied"

**Solutions:**
1. **Use Playwright** (handles JavaScript/bot protection)
2. **Rotate user agents** (edit config.json)
3. **Add delays** (increase `delay` in config)
4. **Use residential proxies** (see Proxy Configuration)

### Issue: "Database locked"

**Solutions:**
1. **Use API import method** (recommended)
2. **Ensure no other process is writing** (`ps aux | grep scraper`)
3. **Enable WAL mode** (in database: `PRAGMA journal_mode=WAL;`)

### Issue: "API authentication failed"

**Solutions:**
1. **Check API key** (`echo $SCRAPER_API_KEY`)
2. **Verify server is running** (`curl http://your-server:5000/health`)
3. **Check firewall rules** (`telnet your-server 5000`)

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Puppeteer Documentation](https://pptr.dev/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Restomod Central API Docs](https://docs.restomodcentral.com/api)

---

## 🆘 Support

Need help?
- GitHub Issues: https://github.com/Planet9V/restomod_central/issues
- Email: support@restomodcentral.com
- Discord: https://discord.gg/restomod
