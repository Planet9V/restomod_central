#!/usr/bin/env tsx
/**
 * Test script for Playwright car scraper
 * Tests bot evasion and data extraction
 */

import { getCarScraper } from '../server/services/carScraperOrchestrator.js';

async function testScraper() {
  console.log('🧪 Testing Playwright Car Scraper\n');

  const scraper = getCarScraper();

  // Test queries
  const testQueries = [
    { query: '1967 Mustang', sites: ['classiccars'], maxListings: 5 },
    { query: 'Chevelle SS', sites: ['classiccars'], maxListings: 5 },
  ];

  for (const test of testQueries) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Testing: "${test.query}" from ${test.sites.join(', ')}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      const result = await scraper.quickScrape(
        test.query,
        test.sites,
        test.maxListings
      );

      console.log(`\n✅ Results:`);
      console.log(`   Found: ${result.found} listings`);
      console.log(`   Saved: ${result.saved} to database`);

      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.length}`);
        result.errors.forEach(err => console.log(`     - ${err}`));
      }
    } catch (error: any) {
      console.error(`❌ Test failed:`, error.message);
    }

    // Wait between tests
    console.log('\n⏳ Waiting 10 seconds before next test...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  console.log('\n✨ All tests completed!\n');
  process.exit(0);
}

testScraper().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
