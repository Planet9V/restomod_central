// Scraping Orchestrator
// Coordinates all scrapers and manages execution

import { scrapeClassicCars, scrapeAllPopularMakes } from './scrapers/classicCars';
import { scrapeHemmings, scrapeHemmingsByCategory } from './scrapers/hemmings';
import { scrapeEBayMotors, scrapeAllEBayMakes } from './integrations/ebayMotors';
import { scrapeEventbrite, scrapeAllMajorCities, scrapeAllEventKeywords } from './integrations/eventbrite';
import type { ScrapeResult } from '../../types/scraping';

/**
 * Scraping strategies
 */
export type ScrapingStrategy = 'quick' | 'balanced' | 'comprehensive';

export interface ScrapingPlan {
  strategy: ScrapingStrategy;
  targetCars: number;
  targetEvents: number;
  enabledScrapers: {
    classicCars: boolean;
    hemmings: boolean;
    ebayMotors: boolean;
    eventbrite: boolean;
  };
}

/**
 * Execute full scraping plan
 */
export async function executeScraping Plan(plan: ScrapingPlan): Promise<void> {
  console.log('======================================');
  console.log('  RESTOMOD CENTRAL SCRAPING SYSTEM');
  console.log('======================================');
  console.log(`Strategy: ${plan.strategy.toUpperCase()}`);
  console.log(`Target: ${plan.targetCars} cars, ${plan.targetEvents} events`);
  console.log('======================================\n');

  const startTime = Date.now();
  let totalCarsScraped = 0;
  let totalEventsScraped = 0;

  // === CAR LISTINGS ===
  console.log('📦 Starting car listings collection...\n');

  if (plan.enabledScrapers.classicCars) {
    console.log('🚗 [1/4] ClassicCars.com...');
    try {
      const result = await scrapeClassicCars(Math.floor(plan.targetCars * 0.4)); // 40% of target
      totalCarsScraped += result.data?.length || 0;
      console.log(`✅ ClassicCars complete: ${result.data?.length || 0} cars\n`);
    } catch (error) {
      console.error('❌ ClassicCars failed:', error, '\n');
    }

    await delay(5000); // 5 second delay between sources
  }

  if (plan.enabledScrapers.hemmings) {
    console.log('🚗 [2/4] Hemmings.com...');
    try {
      const result = await scrapeHemmings(Math.floor(plan.targetCars * 0.3)); // 30% of target
      totalCarsScraped += result.data?.length || 0;
      console.log(`✅ Hemmings complete: ${result.data?.length || 0} cars\n`);
    } catch (error) {
      console.error('❌ Hemmings failed:', error, '\n');
    }

    await delay(5000);
  }

  if (plan.enabledScrapers.ebayMotors) {
    console.log('🚗 [3/4] eBay Motors...');
    try {
      const result = await scrapeEBayMotors(Math.floor(plan.targetCars * 0.2)); // 20% of target
      totalCarsScraped += result.data?.length || 0;
      console.log(`✅ eBay Motors complete: ${result.data?.length || 0} cars\n`);
    } catch (error) {
      console.error('❌ eBay Motors failed:', error, '\n');
    }

    await delay(5000);
  }

  // === EVENTS ===
  console.log('\n📅 Starting events collection...\n');

  if (plan.enabledScrapers.eventbrite) {
    console.log('🎪 [4/4] Eventbrite...');
    try {
      const result = await scrapeEventbrite(plan.targetEvents);
      totalEventsScraped += result.data?.length || 0;
      console.log(`✅ Eventbrite complete: ${result.data?.length || 0} events\n`);
    } catch (error) {
      console.error('❌ Eventbrite failed:', error, '\n');
    }
  }

  // === SUMMARY ===
  const duration = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log('\n======================================');
  console.log('  SCRAPING COMPLETE');
  console.log('======================================');
  console.log(`🚗 Total Cars: ${totalCarsScraped}`);
  console.log(`📅 Total Events: ${totalEventsScraped}`);
  console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
  console.log('======================================\n');
}

/**
 * Quick scraping (testing/development)
 * Target: ~500 cars, ~100 events
 */
export async function quickScrape(): Promise<void> {
  const plan: ScrapingPlan = {
    strategy: 'quick',
    targetCars: 500,
    targetEvents: 100,
    enabledScrapers: {
      classicCars: true,
      hemmings: true,
      ebayMotors: true,
      eventbrite: true,
    },
  };

  await executeScrapingPlan(plan);
}

/**
 * Balanced scraping (production)
 * Target: ~2,000 cars, ~500 events
 */
export async function balancedScrape(): Promise<void> {
  const plan: ScrapingPlan = {
    strategy: 'balanced',
    targetCars: 2000,
    targetEvents: 500,
    enabledScrapers: {
      classicCars: true,
      hemmings: true,
      ebayMotors: true,
      eventbrite: true,
    },
  };

  await executeScrapingPlan(plan);
}

/**
 * Comprehensive scraping (full scale)
 * Target: ~5,000 cars, ~2,000 events
 */
export async function comprehensiveScrape(): Promise<void> {
  const plan: ScrapingPlan = {
    strategy: 'comprehensive',
    targetCars: 5000,
    targetEvents: 2000,
    enabledScrapers: {
      classicCars: true,
      hemmings: true,
      ebayMotors: true,
      eventbrite: true,
    },
  };

  await executeScrapingPlan(plan);
}

/**
 * Scrape only cars
 */
export async function scrapeCarsOnly(target: number = 1000): Promise<void> {
  console.log(`🚗 Scraping ${target} car listings only...\n`);

  const plan: ScrapingPlan = {
    strategy: 'balanced',
    targetCars: target,
    targetEvents: 0,
    enabledScrapers: {
      classicCars: true,
      hemmings: true,
      ebayMotors: true,
      eventbrite: false,
    },
  };

  await executeScrapingPlan(plan);
}

/**
 * Scrape only events
 */
export async function scrapeEventsOnly(target: number = 500): Promise<void> {
  console.log(`📅 Scraping ${target} events only...\n`);

  const plan: ScrapingPlan = {
    strategy: 'balanced',
    targetCars: 0,
    targetEvents: target,
    enabledScrapers: {
      classicCars: false,
      hemmings: false,
      ebayMotors: false,
      eventbrite: true,
    },
  };

  await executeScrapingPlan(plan);
}

/**
 * Test individual scrapers
 */
export async function testScrapers(): Promise<void> {
  console.log('🧪 Testing individual scrapers...\n');

  // Test ClassicCars (5 listings)
  console.log('Testing ClassicCars.com...');
  try {
    const result1 = await scrapeClassicCars(5);
    console.log(`✅ ClassicCars: ${result1.success ? 'PASS' : 'FAIL'} (${result1.data?.length || 0} listings)\n`);
  } catch (error) {
    console.error('❌ ClassicCars: FAIL', error, '\n');
  }

  await delay(3000);

  // Test Hemmings (5 listings)
  console.log('Testing Hemmings.com...');
  try {
    const result2 = await scrapeHemmings(5);
    console.log(`✅ Hemmings: ${result2.success ? 'PASS' : 'FAIL'} (${result2.data?.length || 0} listings)\n`);
  } catch (error) {
    console.error('❌ Hemmings: FAIL', error, '\n');
  }

  await delay(3000);

  // Test eBay Motors (5 listings)
  console.log('Testing eBay Motors...');
  try {
    const result3 = await scrapeEBayMotors(5);
    console.log(`✅ eBay Motors: ${result3.success ? 'PASS' : 'FAIL'} (${result3.data?.length || 0} listings)\n`);
  } catch (error) {
    console.error('❌ eBay Motors: FAIL', error, '\n');
  }

  await delay(3000);

  // Test Eventbrite (5 events)
  console.log('Testing Eventbrite...');
  try {
    const result4 = await scrapeEventbrite(5);
    console.log(`✅ Eventbrite: ${result4.success ? 'PASS' : 'FAIL'} (${result4.data?.length || 0} events)\n`);
  } catch (error) {
    console.error('❌ Eventbrite: FAIL', error, '\n');
  }

  console.log('🧪 Testing complete!\n');
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get scraping statistics
 */
export async function getScrapingStats(): Promise<any> {
  // TODO: Query database for stats
  return {
    totalCars: 0,
    totalEvents: 0,
    sources: {
      classicCars: 0,
      hemmings: 0,
      ebayMotors: 0,
      eventbrite: 0,
    },
  };
}
