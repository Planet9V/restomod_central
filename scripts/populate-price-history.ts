/**
 * Phase 5 Data Population: Price History
 * Generates historical pricing data to power trend charts
 */

import { db } from '../db';
import { carsForSale, priceHistory } from '../shared/schema';

interface PricePoint {
  vehicleId: number;
  price: string;
  sourceType: string;
  sourceName: string;
  recordedDate: Date;
  createdAt: Date;
}

/**
 * Generate realistic price history based on vehicle attributes
 */
function generatePriceHistory(
  vehicleId: number,
  currentPrice: number,
  investmentGrade: string | null,
  marketTrend: string | null,
  months: number = 12
): PricePoint[] {
  const pricePoints: PricePoint[] = [];
  const now = new Date();

  // Determine base monthly change rate based on investment grade
  const gradeToRate: Record<string, number> = {
    'A+': 0.012, // 1.2% per month = ~15% annual
    'A': 0.010,  // 1.0% per month = ~12% annual
    'A-': 0.008, // 0.8% per month = ~10% annual
    'B+': 0.006, // 0.6% per month = ~7% annual
    'B': 0.004,  // 0.4% per month = ~5% annual
    'B-': 0.002, // 0.2% per month = ~2.5% annual
    'C+': 0.001, // 0.1% per month = ~1% annual
    'C': 0.000,  // 0% - flat
  };

  // Market trend modifiers
  const trendMultiplier: Record<string, number> = {
    'rising': 1.3,
    'stable': 1.0,
    'declining': 0.7,
  };

  const baseRate = gradeToRate[investmentGrade || 'B'] || 0.004;
  const trendMult = trendMultiplier[marketTrend || 'stable'] || 1.0;
  const monthlyRate = baseRate * trendMult;

  // Work backwards from current price
  let currentPriceValue = currentPrice;

  for (let i = 0; i < months; i++) {
    const monthsAgo = months - i;
    const date = new Date(now);
    date.setMonth(date.getMonth() - monthsAgo);

    // Add some randomness to make it realistic (±2%)
    const randomVariance = 1 + (Math.random() * 0.04 - 0.02);

    // Calculate historical price (price was lower in the past for appreciating assets)
    const historicalMultiplier = Math.pow(1 + monthlyRate, -monthsAgo);
    const historicalPrice = Math.round(currentPrice * historicalMultiplier * randomVariance / 100) * 100;

    pricePoints.push({
      vehicleId,
      price: historicalPrice.toString(),
      sourceType: i === 0 ? 'import' : 'market_analysis',
      sourceName: i === 0 ? 'Initial Listing' : 'Market Data Update',
      recordedDate: date,
      createdAt: new Date()
    });
  }

  // Add current price as most recent point
  pricePoints.push({
    vehicleId,
    price: currentPrice.toString(),
    sourceType: 'update',
    sourceName: 'Current Listing',
    recordedDate: now,
    createdAt: now
  });

  return pricePoints;
}

async function populatePriceHistory() {
  console.log('📈 Phase 5: Populating Price History Data\n');

  // Fetch all vehicles
  const vehicles = await db.query.carsForSale.findMany();

  if (vehicles.length === 0) {
    console.log('⚠️  No vehicles found. Please run populate-sample-vehicles.ts first!');
    return;
  }

  console.log(`🚗 Found ${vehicles.length} vehicles to process\n`);

  const allPricePoints: PricePoint[] = [];

  for (const vehicle of vehicles) {
    const currentPrice = parseInt(vehicle.price || '0');

    if (currentPrice === 0) {
      console.log(`⚠️  Skipping ${vehicle.year} ${vehicle.make} ${vehicle.model} (no price)`);
      continue;
    }

    // Generate 8-12 months of history (randomized per vehicle)
    const historyMonths = Math.floor(Math.random() * 5) + 8; // 8-12 months

    const pricePoints = generatePriceHistory(
      vehicle.id,
      currentPrice,
      vehicle.investmentGrade,
      vehicle.marketTrend,
      historyMonths
    );

    allPricePoints.push(...pricePoints);

    // Calculate price change
    const oldestPrice = parseInt(pricePoints[0].price);
    const priceChange = currentPrice - oldestPrice;
    const percentChange = ((priceChange / oldestPrice) * 100).toFixed(1);
    const direction = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️';

    console.log(`${direction} ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
    console.log(`   ${historyMonths} months: $${oldestPrice.toLocaleString()} → $${currentPrice.toLocaleString()} (${percentChange > 0 ? '+' : ''}${percentChange}%)`);
    console.log(`   Grade: ${vehicle.investmentGrade || 'N/A'} | Trend: ${vehicle.marketTrend || 'N/A'}`);
    console.log('');
  }

  console.log(`\n📦 Inserting ${allPricePoints.length} price history records...\n`);

  // Batch insert all price points
  const batchSize = 100;
  for (let i = 0; i < allPricePoints.length; i += batchSize) {
    const batch = allPricePoints.slice(i, i + batchSize);
    await db.insert(priceHistory).values(batch);
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allPricePoints.length / batchSize)}`);
  }

  console.log(`\n✨ Successfully created ${allPricePoints.length} price history records!`);

  // Summary statistics
  const avgPointsPerVehicle = (allPricePoints.length / vehicles.length).toFixed(1);
  console.log(`\n📊 Summary:`);
  console.log(`   Total vehicles with history: ${vehicles.length}`);
  console.log(`   Total price points: ${allPricePoints.length}`);
  console.log(`   Average points per vehicle: ${avgPointsPerVehicle}`);

  // Calculate overall market performance
  const appreciatingVehicles = vehicles.filter(v => v.marketTrend === 'rising').length;
  const stableVehicles = vehicles.filter(v => v.marketTrend === 'stable').length;
  const decliningVehicles = vehicles.filter(v => v.marketTrend === 'declining').length;

  console.log(`\n   Market Trends:`);
  console.log(`   📈 Rising: ${appreciatingVehicles} vehicles`);
  console.log(`   ➡️  Stable: ${stableVehicles} vehicles`);
  console.log(`   📉 Declining: ${decliningVehicles} vehicles`);
}

// Run the population script
populatePriceHistory()
  .catch(console.error)
  .finally(() => process.exit(0));
