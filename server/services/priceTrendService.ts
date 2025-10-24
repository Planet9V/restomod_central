/**
 * Phase 2 Task 2.5: Price Trend Service
 * Calculates appreciation rates and price trends over time
 * Uses price_history table for real data-driven analysis
 */

import { db } from '@db';
import { priceHistory, carsForSale } from '@shared/schema';
import { eq, gte, and, sql } from 'drizzle-orm';

export class PriceTrendService {
  /**
   * Calculate appreciation for a specific vehicle over time
   * @param vehicleId - ID of the vehicle
   * @param timeframeMonths - Number of months to analyze (default: 12)
   * @returns Appreciation data or null if insufficient data
   */
  async calculateAppreciation(vehicleId: number, timeframeMonths: number = 12) {
    try {
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - timeframeMonths);

      // Get price history for this vehicle within timeframe
      const history = await db
        .select()
        .from(priceHistory)
        .where(
          and(
            eq(priceHistory.vehicleId, vehicleId),
            gte(priceHistory.recordedDate, cutoffDate)
          )
        )
        .orderBy(priceHistory.recordedDate);

      if (history.length < 2) {
        return null; // Need at least 2 data points
      }

      // Parse prices (stored as text)
      const oldestPrice = parseFloat(history[0].price.replace(/[^0-9.]/g, ''));
      const newestPrice = parseFloat(history[history.length - 1].price.replace(/[^0-9.]/g, ''));

      if (isNaN(oldestPrice) || isNaN(newestPrice)) {
        return null;
      }

      // Calculate percentage change
      const percentageChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;

      // Annualize the rate
      const monthsElapsed = Math.max(1, timeframeMonths);
      const annualizedRate = (percentageChange / monthsElapsed) * 12;

      // Determine trend direction
      let trend: 'rising' | 'stable' | 'declining' = 'stable';
      if (percentageChange > 5) trend = 'rising';
      else if (percentageChange < -5) trend = 'declining';

      return {
        vehicleId,
        startPrice: oldestPrice,
        currentPrice: newestPrice,
        percentageChange: parseFloat(percentageChange.toFixed(2)),
        annualizedRate: `${annualizedRate.toFixed(1)}%/year`,
        dataPoints: history.length,
        trend,
        timeframe: `${timeframeMonths} months`,
        oldestDate: history[0].recordedDate,
        newestDate: history[history.length - 1].recordedDate
      };
    } catch (error) {
      console.error(`Error calculating appreciation for vehicle ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Calculate average price trends for a specific make/model
   * @param make - Vehicle make (e.g., "Chevrolet")
   * @param model - Vehicle model (e.g., "Camaro")
   * @returns Historical price data points
   */
  async calculateMakeModelTrends(make: string, model: string) {
    try {
      // Get all vehicles matching make/model
      const vehicles = await db
        .select({ id: carsForSale.id })
        .from(carsForSale)
        .where(
          and(
            eq(carsForSale.make, make),
            eq(carsForSale.model, model)
          )
        );

      if (vehicles.length === 0) {
        return [];
      }

      const vehicleIds = vehicles.map(v => v.id);

      // Get price history for all matching vehicles, grouped by date
      const history = await db
        .select({
          recordedDate: sql<string>`DATE(${priceHistory.recordedDate})`.as('recordedDate'),
          avgPrice: sql<number>`AVG(CAST(REPLACE(REPLACE(${priceHistory.price}, '$', ''), ',', '') AS REAL))`.as('avgPrice'),
          count: sql<number>`COUNT(*)`.as('count')
        })
        .from(priceHistory)
        .where(sql`${priceHistory.vehicleId} IN (${sql.join(vehicleIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(sql`DATE(${priceHistory.recordedDate})`)
        .orderBy(sql`DATE(${priceHistory.recordedDate})`);

      return history.map(h => ({
        date: h.recordedDate,
        avgPrice: parseFloat(h.avgPrice.toFixed(2)),
        dataPoints: h.count
      }));
    } catch (error) {
      console.error(`Error calculating trends for ${make} ${model}:`, error);
      return [];
    }
  }

  /**
   * Get recent price changes across all vehicles
   * @param limit - Number of recent changes to return
   * @returns Recent price updates
   */
  async getRecentPriceChanges(limit: number = 20) {
    try {
      const changes = await db
        .select({
          vehicleId: priceHistory.vehicleId,
          price: priceHistory.price,
          sourceType: priceHistory.sourceType,
          sourceName: priceHistory.sourceName,
          recordedDate: priceHistory.recordedDate,
          make: carsForSale.make,
          model: carsForSale.model,
          year: carsForSale.year
        })
        .from(priceHistory)
        .leftJoin(carsForSale, eq(priceHistory.vehicleId, carsForSale.id))
        .orderBy(sql`${priceHistory.recordedDate} DESC`)
        .limit(limit);

      return changes;
    } catch (error) {
      console.error('Error getting recent price changes:', error);
      return [];
    }
  }
}

// Export singleton instance
export const priceTrendService = new PriceTrendService();
