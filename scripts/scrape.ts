#!/usr/bin/env tsx
// Scraping CLI Tool
// Run with: npm run scrape <command>

import {
  quickScrape,
  balancedScrape,
  comprehensiveScrape,
  scrapeCarsOnly,
  scrapeEventsOnly,
  testScrapers,
  getScrapingStats,
} from '../server/services/scraping/orchestrator';

// Parse command line arguments
const command = process.argv[2] || 'help';
const arg = process.argv[3];

async function main() {
  console.log('\n🤖 Restomod Central Scraping System\n');

  switch (command) {
    case 'test':
      console.log('Running scraper tests...\n');
      await testScrapers();
      break;

    case 'quick':
      console.log('Running QUICK scrape (500 cars, 100 events)...\n');
      await quickScrape();
      break;

    case 'balanced':
      console.log('Running BALANCED scrape (2,000 cars, 500 events)...\n');
      await balancedScrape();
      break;

    case 'comprehensive':
      console.log('Running COMPREHENSIVE scrape (5,000 cars, 2,000 events)...\n');
      await comprehensiveScrape();
      break;

    case 'cars':
      const carTarget = arg ? parseInt(arg, 10) : 1000;
      console.log(`Running CARS ONLY scrape (${carTarget} cars)...\n`);
      await scrapeCarsOnly(carTarget);
      break;

    case 'events':
      const eventTarget = arg ? parseInt(arg, 10) : 500;
      console.log(`Running EVENTS ONLY scrape (${eventTarget} events)...\n`);
      await scrapeEventsOnly(eventTarget);
      break;

    case 'stats':
      console.log('Fetching scraping statistics...\n');
      const stats = await getScrapingStats();
      console.log('Stats:', stats);
      break;

    case 'help':
    default:
      showHelp();
      break;
  }

  process.exit(0);
}

function showHelp() {
  console.log(`
📖 Usage: npm run scrape <command> [options]

Commands:
  test              Test all scrapers with small samples (5 each)
  quick             Quick scrape: 500 cars + 100 events (~10-15 min)
  balanced          Balanced scrape: 2,000 cars + 500 events (~30-45 min)
  comprehensive     Full scrape: 5,000 cars + 2,000 events (~2-3 hours)
  cars [number]     Scrape only cars (default: 1,000)
  events [number]   Scrape only events (default: 500)
  stats             Show scraping statistics
  help              Show this help message

Examples:
  npm run scrape test           # Test all scrapers
  npm run scrape quick          # Quick scrape for testing
  npm run scrape cars 500       # Scrape 500 cars only
  npm run scrape events 200     # Scrape 200 events only
  npm run scrape balanced       # Production scrape (recommended)

Sources:
  🚗 ClassicCars.com    - Playwright scraping
  🚗 Hemmings.com       - Playwright scraping
  🚗 eBay Motors        - Official API
  📅 Eventbrite         - Official API

Notes:
  - Test scrapers before running large batches
  - API keys required for eBay Motors and Eventbrite
  - Scraping respects robots.txt and rate limits
  - All data is deduplicated before saving
`);
}

// Run main function
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
