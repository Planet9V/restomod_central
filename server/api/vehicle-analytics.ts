/**
 * Vehicle Analytics API
 * Real-time aggregation and trend analysis of vehicle inventory
 *
 * Phase 1 Task 1.1-1.8: Vehicle Analytics Endpoints
 * Uses existing Drizzle ORM patterns for simplicity
 */

import { Router, Request, Response } from 'express';
import { db } from '@db';
import { carsForSale } from '@shared/schema';
import { sql, count, avg, desc, asc } from 'drizzle-orm';

const router = Router();

/**
 * Task 1.2: GET /api/vehicle-analytics/by-make
 * Returns vehicle count and average price grouped by manufacturer
 */
router.get('/by-make', async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        make: carsForSale.make,
        count: count(carsForSale.id),
        avgPrice: sql<number>`AVG(CAST(${carsForSale.price} AS REAL))`.as('avgPrice'),
      })
      .from(carsForSale)
      .where(sql`${carsForSale.price} IS NOT NULL`)
      .groupBy(carsForSale.make)
      .orderBy(desc(count(carsForSale.id)));

    res.json(data);
  } catch (error) {
    console.error('Error in /by-make:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle analytics by make' });
  }
});

/**
 * Task 1.3: GET /api/vehicle-analytics/by-year
 * Returns vehicle count and price statistics grouped by year
 */
router.get('/by-year', async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        year: carsForSale.year,
        count: count(carsForSale.id),
        avgPrice: sql<number>`AVG(CAST(${carsForSale.price} AS REAL))`.as('avgPrice'),
        minPrice: sql<number>`MIN(CAST(${carsForSale.price} AS REAL))`.as('minPrice'),
        maxPrice: sql<number>`MAX(CAST(${carsForSale.price} AS REAL))`.as('maxPrice'),
      })
      .from(carsForSale)
      .where(sql`${carsForSale.price} IS NOT NULL`)
      .groupBy(carsForSale.year)
      .orderBy(asc(carsForSale.year));

    res.json(data);
  } catch (error) {
    console.error('Error in /by-year:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle analytics by year' });
  }
});

/**
 * Task 1.4: GET /api/vehicle-analytics/by-category
 * Returns vehicle count and average price grouped by category
 */
router.get('/by-category', async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        category: carsForSale.category,
        count: count(carsForSale.id),
        avgPrice: sql<number>`AVG(CAST(${carsForSale.price} AS REAL))`.as('avgPrice'),
        investmentGrades: sql<string>`GROUP_CONCAT(DISTINCT ${carsForSale.investmentGrade})`.as('investmentGrades'),
      })
      .from(carsForSale)
      .where(sql`${carsForSale.category} IS NOT NULL AND ${carsForSale.price} IS NOT NULL`)
      .groupBy(carsForSale.category)
      .orderBy(desc(count(carsForSale.id)));

    res.json(data);
  } catch (error) {
    console.error('Error in /by-category:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle analytics by category' });
  }
});

/**
 * Task 1.5: GET /api/vehicle-analytics/by-region
 * Returns vehicle count and average price grouped by region
 */
router.get('/by-region', async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        region: carsForSale.locationRegion,
        count: count(carsForSale.id),
        avgPrice: sql<number>`AVG(CAST(${carsForSale.price} AS REAL))`.as('avgPrice'),
      })
      .from(carsForSale)
      .where(sql`${carsForSale.locationRegion} IS NOT NULL AND ${carsForSale.price} IS NOT NULL`)
      .groupBy(carsForSale.locationRegion)
      .orderBy(desc(sql<number>`AVG(CAST(${carsForSale.price} AS REAL))`));

    res.json(data);
  } catch (error) {
    console.error('Error in /by-region:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle analytics by region' });
  }
});

/**
 * Task 1.6: GET /api/vehicle-analytics/investment-grades
 * Returns vehicle count, average price, and appreciation by investment grade
 */
router.get('/investment-grades', async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        grade: carsForSale.investmentGrade,
        count: count(carsForSale.id),
        avgPrice: sql<number>`AVG(CAST(${carsForSale.price} AS REAL))`.as('avgPrice'),
        avgAppreciation: sql<number>`AVG(CAST(REPLACE(${carsForSale.appreciationRate}, '%/year', '') AS REAL))`.as('avgAppreciation'),
      })
      .from(carsForSale)
      .where(sql`${carsForSale.investmentGrade} IS NOT NULL AND ${carsForSale.price} IS NOT NULL`)
      .groupBy(carsForSale.investmentGrade)
      .orderBy(carsForSale.investmentGrade);

    res.json(data);
  } catch (error) {
    console.error('Error in /investment-grades:', error);
    res.status(500).json({ error: 'Failed to fetch investment grade analytics' });
  }
});

/**
 * Task 1.7: GET /api/vehicle-analytics/make-model-trends
 * Returns top make/model combinations with pricing and trend data
 * Only includes models with 3+ listings for statistical significance
 */
router.get('/make-model-trends', async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        make: carsForSale.make,
        model: carsForSale.model,
        count: count(carsForSale.id),
        avgPrice: sql<number>`AVG(CAST(${carsForSale.price} AS REAL))`.as('avgPrice'),
        // Most common investment grade for this make/model
        commonGrade: sql<string>`
          (SELECT ${carsForSale.investmentGrade}
           FROM ${carsForSale} AS c2
           WHERE c2.make = ${carsForSale.make}
             AND c2.model = ${carsForSale.model}
             AND c2.investmentGrade IS NOT NULL
           GROUP BY c2.investmentGrade
           ORDER BY COUNT(*) DESC
           LIMIT 1)
        `.as('commonGrade'),
        // Most common market trend for this make/model
        commonTrend: sql<string>`
          (SELECT ${carsForSale.marketTrend}
           FROM ${carsForSale} AS c3
           WHERE c3.make = ${carsForSale.make}
             AND c3.model = ${carsForSale.model}
             AND c3.marketTrend IS NOT NULL
           GROUP BY c3.marketTrend
           ORDER BY COUNT(*) DESC
           LIMIT 1)
        `.as('commonTrend'),
      })
      .from(carsForSale)
      .where(sql`${carsForSale.price} IS NOT NULL`)
      .groupBy(carsForSale.make, carsForSale.model)
      .having(sql`COUNT(*) >= 3`)
      .orderBy(desc(count(carsForSale.id)))
      .limit(50);

    res.json(data);
  } catch (error) {
    console.error('Error in /make-model-trends:', error);
    res.status(500).json({ error: 'Failed to fetch make-model trends' });
  }
});

/**
 * Task 1.8: GET /api/vehicle-analytics/price-ranges
 * Returns vehicle distribution across price brackets with appreciation data
 */
router.get('/price-ranges', async (req: Request, res: Response) => {
  try {
    const data = await db
      .select({
        priceRange: sql<string>`
          CASE
            WHEN CAST(${carsForSale.price} AS REAL) < 25000 THEN 'Under $25k'
            WHEN CAST(${carsForSale.price} AS REAL) < 50000 THEN '$25k-$50k'
            WHEN CAST(${carsForSale.price} AS REAL) < 75000 THEN '$50k-$75k'
            WHEN CAST(${carsForSale.price} AS REAL) < 100000 THEN '$75k-$100k'
            WHEN CAST(${carsForSale.price} AS REAL) < 150000 THEN '$100k-$150k'
            WHEN CAST(${carsForSale.price} AS REAL) < 200000 THEN '$150k-$200k'
            ELSE 'Over $200k'
          END
        `.as('priceRange'),
        count: count(carsForSale.id),
        avgAppreciation: sql<number>`AVG(CAST(REPLACE(${carsForSale.appreciationRate}, '%/year', '') AS REAL))`.as('avgAppreciation'),
      })
      .from(carsForSale)
      .where(sql`${carsForSale.price} IS NOT NULL`)
      .groupBy(sql`
        CASE
          WHEN CAST(${carsForSale.price} AS REAL) < 25000 THEN 'Under $25k'
          WHEN CAST(${carsForSale.price} AS REAL) < 50000 THEN '$25k-$50k'
          WHEN CAST(${carsForSale.price} AS REAL) < 75000 THEN '$50k-$75k'
          WHEN CAST(${carsForSale.price} AS REAL) < 100000 THEN '$75k-$100k'
          WHEN CAST(${carsForSale.price} AS REAL) < 150000 THEN '$100k-$150k'
          WHEN CAST(${carsForSale.price} AS REAL) < 200000 THEN '$150k-$200k'
          ELSE 'Over $200k'
        END
      `)
      .orderBy(sql`MIN(CAST(${carsForSale.price} AS REAL))`);

    res.json(data);
  } catch (error) {
    console.error('Error in /price-ranges:', error);
    res.status(500).json({ error: 'Failed to fetch price range distribution' });
  }
});

/**
 * Task 1.1.4: Error handling middleware
 * Catches any unhandled errors in analytics routes
 */
router.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Vehicle Analytics Error:', err);
  res.status(500).json({
    error: 'Internal server error in vehicle analytics',
    message: err.message
  });
});

export default router;
