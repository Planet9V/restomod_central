/**
 * Phase 5: Event-Vehicle Matching Service
 * Intelligently connects car show events with relevant vehicles for sale
 */

import { db } from "@db";
import { carShowEvents, carsForSale } from "@shared/schema";
import { and, gte, lte, like, or, desc, asc, sql, eq } from "drizzle-orm";

export interface VehicleMatch {
  vehicle: any;
  matchType: 'exact_make' | 'exact_model' | 'category' | 'geographic' | 'general';
  matchScore: number;
  distance?: number;
}

export interface EventMatch {
  event: any;
  matchType: 'exact_make' | 'exact_model' | 'category' | 'geographic' | 'temporal';
  matchScore: number;
  daysUntilEvent: number;
}

export class EventVehicleMatchingService {
  /**
   * Find vehicles that match a specific event
   * Priority: Exact make > Category > Geographic proximity
   */
  async getVehiclesForEvent(eventId: number, limit: number = 12): Promise<VehicleMatch[]> {
    const event = await db.query.carShowEvents.findFirst({
      where: eq(carShowEvents.id, eventId)
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const matches: VehicleMatch[] = [];

    // Parse event's vehicle focus
    const eventMakes = event.vehicleMakes ? JSON.parse(event.vehicleMakes) : [];
    const eventModels = event.vehicleModels ? JSON.parse(event.vehicleModels) : [];
    const eventCategory = event.eventCategory; // 'classic', 'muscle', 'hot_rod', etc.

    // Tier 1: Exact make match (highest priority)
    if (eventMakes.length > 0) {
      for (const make of eventMakes) {
        const vehicles = await db.query.carsForSale.findMany({
          where: like(carsForSale.make, `%${make}%`),
          limit: 4,
          orderBy: desc(carsForSale.investmentGrade)
        });

        vehicles.forEach(v => {
          matches.push({
            vehicle: v,
            matchType: 'exact_make',
            matchScore: 95
          });
        });
      }
    }

    // Tier 2: Category match
    if (eventCategory && matches.length < limit) {
      let categoryQuery = '%'; // default to all

      if (eventCategory.includes('muscle')) {
        categoryQuery = '%Muscle%';
      } else if (eventCategory.includes('classic')) {
        categoryQuery = '%Classic%';
      } else if (eventCategory.includes('hot_rod') || eventCategory.includes('hot rod')) {
        categoryQuery = '%Hot Rod%';
      }

      const categoryVehicles = await db.query.carsForSale.findMany({
        where: like(carsForSale.category, categoryQuery),
        limit: limit - matches.length,
        orderBy: desc(carsForSale.investmentGrade)
      });

      categoryVehicles.forEach(v => {
        if (!matches.find(m => m.vehicle.id === v.id)) {
          matches.push({
            vehicle: v,
            matchType: 'category',
            matchScore: 70
          });
        }
      });
    }

    // Tier 3: Geographic match (same state)
    if (event.state && matches.length < limit) {
      const localVehicles = await db.query.carsForSale.findMany({
        where: eq(carsForSale.locationState, event.state),
        limit: limit - matches.length,
        orderBy: desc(carsForSale.createdAt)
      });

      localVehicles.forEach(v => {
        if (!matches.find(m => m.vehicle.id === v.id)) {
          matches.push({
            vehicle: v,
            matchType: 'geographic',
            matchScore: 60,
            distance: 0 // Could calculate actual distance with coordinates
          });
        }
      });
    }

    // Tier 4: General match (investment grade vehicles)
    if (matches.length < limit) {
      const investmentVehicles = await db.query.carsForSale.findMany({
        where: or(
          eq(carsForSale.investmentGrade, 'A+'),
          eq(carsForSale.investmentGrade, 'A')
        ),
        limit: limit - matches.length,
        orderBy: desc(carsForSale.price)
      });

      investmentVehicles.forEach(v => {
        if (!matches.find(m => m.vehicle.id === v.id)) {
          matches.push({
            vehicle: v,
            matchType: 'general',
            matchScore: 50
          });
        }
      });
    }

    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Find upcoming events that match a specific vehicle
   * Shows where user can see similar vehicles in person
   */
  async getEventsForVehicle(vehicleId: number, limit: number = 6): Promise<EventMatch[]> {
    const vehicle = await db.query.carsForSale.findFirst({
      where: eq(carsForSale.id, vehicleId)
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const matches: EventMatch[] = [];
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    // Get all upcoming events in next 6 months
    const upcomingEvents = await db.query.carShowEvents.findMany({
      where: and(
        gte(carShowEvents.startDate, now),
        lte(carShowEvents.startDate, sixMonthsFromNow),
        eq(carShowEvents.status, 'active')
      ),
      orderBy: asc(carShowEvents.startDate)
    });

    for (const event of upcomingEvents) {
      let matchScore = 0;
      let matchType: EventMatch['matchType'] = 'general';

      // Calculate days until event
      const daysUntil = Math.floor((event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Tier 1: Exact make match
      if (event.vehicleMakes) {
        const eventMakes = JSON.parse(event.vehicleMakes);
        if (eventMakes.some((m: string) => vehicle.make.includes(m) || m.includes(vehicle.make))) {
          matchScore = 90;
          matchType = 'exact_make';
        }
      }

      // Tier 2: Category match
      if (matchScore === 0 && event.eventCategory && vehicle.category) {
        if (event.eventCategory.toLowerCase().includes(vehicle.category.toLowerCase()) ||
            vehicle.category.toLowerCase().includes(event.eventCategory.toLowerCase())) {
          matchScore = 70;
          matchType = 'category';
        }
      }

      // Tier 3: Geographic proximity (same state or region)
      if (matchScore === 0 && event.state === vehicle.locationState) {
        matchScore = 60;
        matchType = 'geographic';
      }

      // Tier 4: Large events (everyone should know about major shows)
      if (matchScore === 0 && event.expectedAttendance && event.expectedAttendance > 500) {
        matchScore = 50;
        matchType = 'temporal';
      }

      // Add bonus for sooner events
      if (matchScore > 0) {
        if (daysUntil < 14) matchScore += 10; // Event in next 2 weeks
        else if (daysUntil < 30) matchScore += 5; // Event in next month

        matches.push({
          event,
          matchType,
          matchScore,
          daysUntilEvent: daysUntil
        });
      }
    }

    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Get vehicle statistics for a specific make
   * Used for make/model hub pages
   */
  async getMakeStatistics(make: string) {
    const totalListings = await db
      .select({ count: sql<number>`count(*)` })
      .from(carsForSale)
      .where(like(carsForSale.make, `%${make}%`));

    const avgPrice = await db
      .select({ avg: sql<number>`avg(cast(${carsForSale.price} as real))` })
      .from(carsForSale)
      .where(like(carsForSale.make, `%${make}%`));

    const investmentGrades = await db
      .select({
        grade: carsForSale.investmentGrade,
        count: sql<number>`count(*)`
      })
      .from(carsForSale)
      .where(like(carsForSale.make, `%${make}%`))
      .groupBy(carsForSale.investmentGrade);

    return {
      totalListings: totalListings[0]?.count || 0,
      averagePrice: avgPrice[0]?.avg || 0,
      investmentGradeDistribution: investmentGrades
    };
  }

  /**
   * Get upcoming events for a specific make
   * Used for make/model hub pages
   */
  async getEventsForMake(make: string, limit: number = 6) {
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const events = await db.query.carShowEvents.findMany({
      where: and(
        gte(carShowEvents.startDate, now),
        lte(carShowEvents.startDate, sixMonthsFromNow),
        eq(carShowEvents.status, 'active'),
        or(
          like(carShowEvents.vehicleMakes, `%${make}%`),
          like(carShowEvents.eventName, `%${make}%`)
        )
      ),
      limit,
      orderBy: asc(carShowEvents.startDate)
    });

    return events;
  }
}

// Export singleton instance
export const eventVehicleMatchingService = new EventVehicleMatchingService();
