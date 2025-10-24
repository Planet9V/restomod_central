# Phase 5 Implementation Plan: Event-Vehicle Ecosystem
## PostgreSQL Migration + Cross-Linking Features

**Branch:** `claude/phase-5-event-ecosystem-011CURGADYqkkn7ysYbQu3z5`
**Estimated Time:** 16-20 hours total
**Complexity:** Medium-High
**Business Impact:** 🔥 VERY HIGH

---

## 🎯 Objectives

### Primary Goals:
1. **Migrate to PostgreSQL** - Scale from SQLite to production-ready database
2. **Event-Vehicle Cross-Linking** - Connect events to relevant cars for sale
3. **Make/Model Hubs** - SEO-optimized landing pages for popular makes
4. **Market Insights Dashboard** - Establish authority with data-driven insights
5. **Enhanced UX** - Seamless navigation, intuitive user journeys

### Success Metrics:
- 20%+ event visitors click through to vehicles
- 10%+ vehicle viewers check relevant events
- 3+ make/model hubs with complete data
- <2s page load times (PostgreSQL optimization)
- Zero breaking changes to existing features

---

## 📊 Database Migration Strategy

### Why PostgreSQL?
- **Scale:** Better performance for 1,000+ events, 1,000+ vehicles
- **Features:** JSON support, full-text search (can replace FTS5), better indexing
- **Production-Ready:** Docker deployment, connection pooling, replication
- **Cost:** Already available (shared Postgres instance)

### Migration Approach: **Dual-Database Transition**

**Rationale:** Keep SQLite working while testing PostgreSQL to minimize risk

**Phase 5A: Setup (Week 1, Days 1-2)**
```typescript
// Support BOTH databases during migration
// db/index.ts becomes:

import { env } from "process";

// SQLite (existing)
const sqlite = new Database(process.env.DATABASE_URL);
export const sqliteDb = drizzle(sqlite, { schema });

// PostgreSQL (new)
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const pgConnection = postgres({
  host: 'postgres-shared',
  port: 5432,
  database: 'neocoder',
  username: 'neocoder',
  password: 'neocoder123',
});

export const db = drizzlePg(pgConnection, { schema });

// Export both for gradual migration
export const legacyDb = sqliteDb;
```

**Phase 5B: Schema Migration (Week 1, Days 2-3)**
```bash
# 1. Update drizzle.config.ts for PostgreSQL
# 2. Generate PostgreSQL migrations from schema
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Migrate data (script)
tsx scripts/migrate-sqlite-to-postgres.ts
```

**Phase 5C: Testing (Week 1, Day 4)**
- Verify all queries work
- Test existing features
- Performance benchmarks
- Rollback plan ready

---

## 🔗 Feature 1: Event-Vehicle Cross-Linking

### Database Schema Enhancement

**Add to `carShowEvents` table:**
```typescript
// shared/schema.ts additions

export const carShowEvents = sqliteTable("car_show_events", {
  // ... existing fields ...

  // NEW: Cross-linking intelligence
  primaryVehicleFocus: text("primary_vehicle_focus"),
    // 'make' | 'model' | 'category' | 'era' | 'general'

  vehicleMakes: text("vehicle_makes"), // JSON array
    // ['Ford', 'Chevrolet', 'Dodge']

  vehicleCategories: text("vehicle_categories"), // JSON array
    // ['Muscle Cars', 'Hot Rods', 'Classics']

  vehicleEraFilter: text("vehicle_era_filter"),
    // 'pre-war' | '1950s' | 'muscle_era' | 'modern_classic'

  expectedAttendanceMin: integer("expected_attendance_min"),
  expectedAttendanceMax: integer("expected_attendance_max"),
});
```

**Create new `eventVehicleMatches` table (cache layer):**
```typescript
export const eventVehicleMatches = pgTable("event_vehicle_matches", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => carShowEvents.id),
  vehicleId: integer("vehicle_id").notNull().references(() => carsForSale.id),
  matchType: text("match_type").notNull(),
    // 'exact_make' | 'exact_model' | 'category' | 'geographic' | 'investment'
  matchScore: integer("match_score").notNull(), // 0-100
  distance: real("distance"), // miles (for geographic matches)
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Service Layer

**Create:** `server/services/eventVehicleMatchingService.ts`
```typescript
export class EventVehicleMatchingService {
  // Find vehicles that match an event
  async getVehiclesForEvent(eventId: number, limit = 12) {
    const event = await db.query.carShowEvents.findFirst({
      where: eq(carShowEvents.id, eventId)
    });

    // Tier 1: Exact make match
    // Tier 2: Category match
    // Tier 3: Geographic match (within 100 miles)
    // Tier 4: Investment grade (for premium events)

    return ranked results with matchScore;
  }

  // Find events that match a vehicle
  async getEventsForVehicle(vehicleId: number, limit = 6) {
    const vehicle = await db.query.carsForSale.findFirst({
      where: eq(carsForSale.id, vehicleId)
    });

    // Find events in next 6 months featuring:
    // - Same make
    // - Same category
    // - Same region (within 200 miles)

    return upcoming events sorted by relevance;
  }
}
```

### API Endpoints

**Create:** `server/api/event-vehicle-links.ts`
```typescript
const router = Router();

// Get vehicles for an event
router.get('/events/:eventId/vehicles', async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const limit = parseInt(req.query.limit as string) || 12;

  const service = new EventVehicleMatchingService();
  const vehicles = await service.getVehiclesForEvent(eventId, limit);

  res.json({ vehicles, total: vehicles.length });
});

// Get events for a vehicle
router.get('/vehicles/:vehicleId/events', async (req, res) => {
  const vehicleId = parseInt(req.params.vehicleId);
  const limit = parseInt(req.query.limit as string) || 6;

  const service = new EventVehicleMatchingService();
  const events = await service.getEventsForVehicle(vehicleId, limit);

  res.json({ events, total: events.length });
});

export default router;
```

### UI Component

**Create:** `client/src/components/events/EventVehicleLinks.tsx`
```typescript
interface EventVehicleLinksProps {
  eventId: number;
  eventName: string;
  eventCategory?: string;
}

export function EventVehicleLinks({ eventId, eventName, eventCategory }: EventVehicleLinksProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['event-vehicles', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event-vehicle-links/events/${eventId}/vehicles`);
      return res.json();
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!data?.vehicles?.length) return null;

  return (
    <Card className="bg-[#222222] border-[#3A3A3A]">
      <CardHeader>
        <CardTitle className="font-playfair text-[#C9A770]">
          🚗 Vehicles You Might See at {eventName}
        </CardTitle>
        <CardDescription className="text-[#888888]">
          Browse {data.total} vehicles for sale that match this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} compact />
          ))}
        </div>
        <Button
          asChild
          className="w-full mt-4 bg-[#7D2027] hover:bg-[#5D1820]"
        >
          <Link href={`/cars-for-sale?category=${eventCategory}`}>
            View All Matching Vehicles →
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Create:** `client/src/components/vehicles/VehicleEventLinks.tsx`
```typescript
interface VehicleEventLinksProps {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
}

export function VehicleEventLinks({ vehicleId, make, model, year }: VehicleEventLinksProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['vehicle-events', vehicleId],
    queryFn: async () => {
      const res = await fetch(`/api/event-vehicle-links/vehicles/${vehicleId}/events`);
      return res.json();
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!data?.events?.length) return null;

  return (
    <Card className="bg-[#222222] border-[#3A3A3A]">
      <CardHeader>
        <CardTitle className="font-playfair text-[#C9A770]">
          🏁 See Similar {year} {make} {model}s at Upcoming Shows
        </CardTitle>
        <CardDescription className="text-[#888888]">
          Reduce purchase anxiety by seeing similar vehicles in person
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.events.map(event => (
          <Link
            key={event.id}
            href={`/events/${event.eventSlug}`}
            className="block p-4 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-[#C9A770]" />
                  <span className="text-sm text-[#888888]">
                    {formatDate(event.startDate)}
                  </span>
                </div>
                <h4 className="font-medium text-[#F8F8F8] mb-1">
                  {event.eventName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-[#888888]">
                  <MapPin className="h-3 w-3" />
                  {event.city}, {event.state}
                </div>
              </div>
              <Badge className="bg-[#7D2027]/20 text-[#C9A770] border-[#C9A770]/30">
                {event.expectedAttendanceMin}+ vehicles
              </Badge>
            </div>
          </Link>
        ))}

        <Button
          asChild
          className="w-full bg-[#7D2027] hover:bg-[#5D1820]"
        >
          <Link href={`/events?make=${make}`}>
            Find More {make} Events →
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🏛️ Feature 2: Make/Model Hub Pages

### Database Schema

**Create:** `vehicleMakeHubs` table
```typescript
export const vehicleMakeHubs = pgTable("vehicle_make_hubs", {
  id: serial("id").primaryKey(),
  make: text("make").unique().notNull(), // "Ford", "Chevrolet"
  slug: text("slug").unique().notNull(), // "ford", "chevrolet"

  // Content
  heroTitle: text("hero_title"),
  heroDescription: text("hero_description"),
  historyOverview: text("history_overview"), // Rich text
  iconUrl: text("icon_url"),
  heroImageUrl: text("hero_image_url"),

  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords"), // JSON array

  // Analytics (cached, updated daily)
  totalListings: integer("total_listings").default(0),
  averagePrice: integer("average_price"),
  priceAppreciation5yr: real("price_appreciation_5yr"), // percentage
  investmentGradeDistribution: jsonb("investment_grade_distribution"),
  popularModels: jsonb("popular_models"), // array of models
  upcomingEventsCount: integer("upcoming_events_count").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Route Structure

**New routes:**
```
/mustang    → MakeHubPage (make="Ford Mustang")
/corvette   → MakeHubPage (make="Chevrolet Corvette")
/camaro     → MakeHubPage (make="Chevrolet Camaro")
/ford       → MakeHubPage (make="Ford")
/chevrolet  → MakeHubPage (make="Chevrolet")
```

### API Endpoints

**Create:** `server/api/make-hubs.ts`
```typescript
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;

  // Get hub data
  const hub = await db.query.vehicleMakeHubs.findFirst({
    where: eq(vehicleMakeHubs.slug, slug)
  });

  // Get live data
  const listings = await db.query.carsForSale.findMany({
    where: like(carsForSale.make, `%${hub.make}%`),
    limit: 12,
    orderBy: desc(carsForSale.createdAt)
  });

  const upcomingEvents = await db.query.carShowEvents.findMany({
    where: and(
      gte(carShowEvents.startDate, new Date()),
      or(
        like(carShowEvents.vehicleMakes, `%${hub.make}%`),
        eq(carShowEvents.primaryVehicleFocus, 'make')
      )
    ),
    limit: 6,
    orderBy: asc(carShowEvents.startDate)
  });

  // Market analysis
  const priceHistory = await calculatePriceHistory(hub.make);

  res.json({
    hub,
    listings,
    upcomingEvents,
    marketAnalysis: priceHistory
  });
});
```

### Page Component

**Create:** `client/src/pages/MakeHubPage.tsx`
```typescript
export default function MakeHubPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data, isLoading } = useQuery({
    queryKey: ['make-hub', slug],
    queryFn: async () => {
      const res = await fetch(`/api/make-hubs/${slug}`);
      return res.json();
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!data) return <NotFound />;

  const { hub, listings, upcomingEvents, marketAnalysis } = data;

  return (
    <div className="min-h-screen bg-[#222222]">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A]">
        <img
          src={hub.heroImageUrl}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-6xl font-playfair font-bold mb-4 bg-gradient-to-r from-[#C9A770] to-[#7D2027] bg-clip-text text-transparent">
              {hub.heroTitle}
            </h1>
            <p className="text-xl text-[#888888]">
              {hub.heroDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-4 gap-4 mb-12">
          <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-[#C9A770]">
                {hub.totalListings}
              </div>
              <div className="text-sm text-[#888888]">For Sale</div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-[#C9A770]">
                {formatCurrency(hub.averagePrice)}
              </div>
              <div className="text-sm text-[#888888]">Avg Price</div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-400">
                +{hub.priceAppreciation5yr}%
              </div>
              <div className="text-sm text-[#888888]">5yr Growth</div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A2A] border-[#3A3A3A]">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-[#C9A770]">
                {hub.upcomingEventsCount}
              </div>
              <div className="text-sm text-[#888888]">Upcoming Shows</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Listings */}
        <section className="mb-12">
          <h2 className="text-3xl font-playfair font-bold text-[#F8F8F8] mb-6">
            {hub.make} For Sale Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          <Button asChild className="w-full mt-6 bg-[#7D2027]">
            <Link href={`/cars-for-sale?make=${hub.make}`}>
              View All {hub.totalListings} {hub.make} Vehicles →
            </Link>
          </Button>
        </section>

        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-3xl font-playfair font-bold text-[#F8F8F8] mb-6">
            Upcoming {hub.make} Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Button asChild className="w-full mt-6 bg-[#7D2027]">
            <Link href={`/events?make=${hub.make}`}>
              Find All {hub.make} Shows →
            </Link>
          </Button>
        </section>

        {/* Market Analysis */}
        <section className="mb-12">
          <h2 className="text-3xl font-playfair font-bold text-[#F8F8F8] mb-6">
            {hub.make} Market Insights
          </h2>
          <PriceTrendChart data={marketAnalysis} />
        </section>
      </div>
    </div>
  );
}
```

---

## 📊 Feature 3: Market Insights Dashboard

### Page Structure

**Create:** `client/src/pages/MarketInsights.tsx`

**Sections:**
1. **Regional Price Heatmap** - US map showing price variations
2. **Trending Makes/Models** - Top gainers, most searched
3. **Event Impact Analysis** - How shows affect prices
4. **Seasonal Trends** - Best time to buy/sell
5. **Investment Opportunities** - High-potential vehicles

### API Endpoint

**Create:** `server/api/market-insights.ts`
```typescript
router.get('/regional-prices', async (req, res) => {
  // Aggregate prices by state/region
  const regionalData = await db
    .select({
      state: carsForSale.locationState,
      avgPrice: avg(carsForSale.price),
      count: count(),
    })
    .from(carsForSale)
    .groupBy(carsForSale.locationState);

  res.json(regionalData);
});

router.get('/trending', async (req, res) => {
  // Calculate trending makes based on:
  // - Recent price appreciation
  // - Search volume (from FTS5 stats)
  // - New listings

  res.json({ trending: trendingMakes });
});

router.get('/seasonal-trends', async (req, res) => {
  // Analyze price patterns by month

  res.json({ seasonalData });
});
```

---

## 🎨 Navigation & UX Integration

### Update Main Navigation

**File:** `client/src/components/Navigation.tsx`

**New structure:**
```typescript
<nav>
  <NavLink href="/">Home</NavLink>

  {/* Vehicles Dropdown */}
  <NavDropdown label="Vehicles">
    <NavLink href="/cars-for-sale">Search All</NavLink>
    <Separator />
    <NavLink href="/mustang">Mustang Hub</NavLink>
    <NavLink href="/corvette">Corvette Hub</NavLink>
    <NavLink href="/camaro">Camaro Hub</NavLink>
    <Separator />
    <NavLink href="/market-insights">Market Insights</NavLink>
  </NavDropdown>

  {/* Events Dropdown */}
  <NavDropdown label="Events">
    <NavLink href="/events">All Events</NavLink>
    <NavLink href="/my-itinerary">My Itinerary</NavLink>
    <Separator />
    <NavLink href="/event-planner">Plan My Weekend</NavLink>
  </NavDropdown>

  <NavLink href="/research">Research</NavLink>
  <NavLink href="/about">About</NavLink>
</nav>
```

---

## 📅 Implementation Timeline

### Week 1: Database & Foundation
**Days 1-2:** PostgreSQL Setup
- Install pg package
- Update drizzle config
- Create migration scripts
- Test connection

**Days 3-4:** Schema Migration
- Generate PG migrations
- Run migrations
- Migrate data from SQLite
- Verify data integrity

**Day 5:** Event-Vehicle Matching Service
- Create matching algorithm
- Build API endpoints
- Write tests

### Week 2: Event-Vehicle Cross-Linking
**Days 6-7:** Event Detail Enhancement
- Create EventVehicleLinks component
- Integrate into EventDetailsPage
- Test UX flow

**Days 8-9:** Vehicle Detail Enhancement
- Create VehicleEventLinks component
- Integrate into vehicle detail page
- Test recommendations

**Day 10:** Testing & Refinement
- End-to-end testing
- Performance optimization
- Bug fixes

### Week 3: Make/Model Hubs
**Days 11-12:** Hub Infrastructure
- Create vehicleMakeHubs table
- Build API endpoints
- Seed initial data (top 10 makes)

**Days 13-14:** Hub Pages
- Create MakeHubPage component
- Build all hub sections
- SEO optimization

**Day 15:** Content & Testing
- Write hub content
- Add hero images
- Test SEO

### Week 4: Market Insights & Polish
**Days 16-17:** Market Insights Dashboard
- Build API endpoints
- Create visualizations
- Regional heatmap

**Days 18-19:** Navigation & UX
- Update main navigation
- Mobile optimization
- User testing

**Day 20:** Final Testing & PR
- Comprehensive testing
- Documentation
- Create PR

---

## 🧪 Testing Strategy

### Unit Tests
- Event-vehicle matching algorithm
- Price calculation services
- Data migration scripts

### Integration Tests
- API endpoints
- Database queries
- Cross-linking logic

### E2E Tests
- Event page → vehicle page flow
- Vehicle page → event page flow
- Make hub complete journey
- Market insights data accuracy

### Performance Tests
- PostgreSQL query performance (<100ms)
- Page load times (<2s)
- API response times (<200ms)

---

## 🚀 Rollout Plan

### Phase 1: Soft Launch (Week 4, Day 18)
- Deploy to staging
- Internal testing
- Beta user feedback

### Phase 2: Gradual Rollout (Week 4, Day 19)
- Enable for 10% of traffic
- Monitor performance
- Fix any issues

### Phase 3: Full Launch (Week 4, Day 20)
- Enable for 100% traffic
- Announce new features
- Monitor metrics

---

## 📈 Success Criteria

### Technical:
- ✅ Zero downtime during migration
- ✅ All existing features working
- ✅ <2s page load times
- ✅ <100ms database queries
- ✅ 100% test coverage for new features

### Business:
- ✅ 20% event→vehicle click-through
- ✅ 10% vehicle→event engagement
- ✅ 3 make hubs live with content
- ✅ Market insights dashboard functional
- ✅ Positive user feedback

---

## 🎯 Next Steps: Let's Start!

**Immediate actions:**
1. Install PostgreSQL dependencies
2. Update database configuration
3. Create migration scripts
4. Begin implementation

**Ready to begin coding?** I'll start with the PostgreSQL migration and work through each feature systematically.
