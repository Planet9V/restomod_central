/**
 * Generate price history for vehicles that don't have any yet
 * Specifically for the 17 newly imported real listings
 */

import { db } from '../db';
import { carsForSale, priceHistory } from '../shared/schema';
import { sql, notInArray, eq } from 'drizzle-orm';

interface PricePoint {
  vehicleId: number;
  price: string;
  sourceType: string;
  recordedDate: Date;
}

function generatePriceHistory(
  vehicleId: number,
  currentPrice: number,
  investmentGrade: string | null,
  marketTrend: string | null,
  months: number = 12
): PricePoint[] {
  const gradeToRate: Record<string, number> = {
    'A+': 0.012,  // 1.2% per month = ~15% annual
    'A': 0.010,   // 1.0% per month = ~12% annual
    'A-': 0.008,  // 0.8% per month = ~10% annual
    'B+': 0.006,  // 0.6% per month = ~7% annual
    'B': 0.005,   // 0.5% per month = ~6% annual
    'B-': 0.004,  // 0.4% per month = ~5% annual
    'C+': 0.003,  // 0.3% per month = ~4% annual
  };

  const trendMultiplier: Record<string, number> = {
    'rising': 1.3,
    'stable': 1.0,
    'declining': 0.7
  };

  const baseRate = gradeToRate[investmentGrade || 'B'] || 0.005;
  const trendMult = trendMultiplier[marketTrend || 'stable'] || 1.0;
  const monthlyRate = baseRate * trendMult;

  const points: PricePoint[] = [];
  const randomMonths = Math.floor(Math.random() * 5) + 8; // 8-12 months

  for (let i = 0; i < randomMonths; i++) {
    const monthsAgo = randomMonths - i - 1;
    const historicalPrice = currentPrice * Math.pow(1 + monthlyRate, -monthsAgo);
    const noise = (Math.random() - 0.5) * 0.02; // ±1% noise
    const finalPrice = Math.floor(historicalPrice * (1 + noise));

    const recordDate = new Date();
    recordDate.setMonth(recordDate.getMonth() - monthsAgo);

    points.push({
      vehicleId,
      price: `$${finalPrice.toLocaleString()}`,
      sourceType: 'research', // Price history is modeled
      recordedDate: recordDate
    });
  }

  return points;
}

async function populatePriceHistoryForNew() {
  console.log('📈 Generating Price History for New Vehicles\n');
  console.log('='.repeat(60));

  // Find vehicles that don't have price history yet
  const vehiclesWithHistory = await db
    .select({ vehicleId: priceHistory.vehicleId })
    .from(priceHistory);

  const vehicleIdsWithHistory = new Set(vehiclesWithHistory.map(v => v.vehicleId));

  // Get all vehicles
  const allVehicles = await db.select().from(carsForSale);

  // Filter to those without history
  const vehiclesNeedingHistory = allVehicles.filter(v => !vehicleIdsWithHistory.has(v.id));

  console.log(`\n🚗 Found ${allVehicles.length} total vehicles`);
  console.log(`   ${vehicleIdsWithHistory.size} already have price history`);
  console.log(`   ${vehiclesNeedingHistory.length} need price history\n`);

  if (vehiclesNeedingHistory.length === 0) {
    console.log('✅ All vehicles already have price history!');
    return 0;
  }

  console.log(`📊 Generating price history for ${vehiclesNeedingHistory.length} vehicles...\n`);

  let totalPoints = 0;

  for (const vehicle of vehiclesNeedingHistory) {
    const priceNumber = parseInt(vehicle.price?.replace(/[^0-9]/g, '') || '0');

    if (priceNumber === 0) {
      console.log(`   ⏭️  Skipping ${vehicle.year} ${vehicle.make} ${vehicle.model} (no valid price)`);
      continue;
    }

    const points = generatePriceHistory(
      vehicle.id,
      priceNumber,
      vehicle.investmentGrade,
      vehicle.marketTrend
    );

    await db.insert(priceHistory).values(
      points.map(p => ({
        vehicleId: p.vehicleId,
        price: p.price,
        sourceType: p.sourceType,
        recordedDate: p.recordedDate,
        createdAt: new Date()
      }))
    );

    const appreciation = ((priceNumber - parseInt(points[0].price.replace(/[^0-9]/g, ''))) / parseInt(points[0].price.replace(/[^0-9]/g, '')) * 100).toFixed(1);

    console.log(`   ✅ ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
    console.log(`      ${points.length} months: ${points[0].price} → $${priceNumber.toLocaleString()} (+${appreciation}%)`);

    totalPoints += points.length;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n✅ Generated ${totalPoints} price history records`);
  console.log(`   for ${vehiclesNeedingHistory.length} vehicles\n`);

  return totalPoints;
}

populatePriceHistoryForNew()
  .then((count) => {
    console.log(`✅ Complete! Added ${count} price history records.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
