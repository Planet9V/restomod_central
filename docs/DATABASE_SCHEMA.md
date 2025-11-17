# Database Schema Documentation

Complete database schema reference for Restomod Central.

## Database Technologies

- **Development**: SQLite 3.x
- **Production**: PostgreSQL 15+
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit

## Schema Overview

### Core Tables
1. [users](#users) - User accounts and authentication
2. [projects](#projects) - Showcase projects
3. [gatewayVehicles](#gatewayvehicles) - Classic car inventory
4. [carShowEvents](#carshowevents) - Car show listings
5. [userConfigurations](#userconfigurations) - Custom vehicle builds
6. [userItineraries](#useritineraries) - Trip planning
7. [userPreferences](#userpreferences) - User settings
8. [luxuryShowcases](#luxuryshowcases) - Premium showcases
9. [researchArticles](#researcharticles) - Content articles
10. [eventComments](#eventcomments) - Event discussions

### Relationship Diagram

```
users (1) ──────── (N) userConfigurations
  │
  ├───────────────── (1) userPreferences
  │
  ├───────────────── (N) userItineraries
  │
  └───────────────── (N) eventComments
                         │
                         └────── (1) carShowEvents

luxuryShowcases (N) ─── (1) projects [optional]
```

---

## Table Definitions

### users

User accounts and authentication.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user ID |
| username | TEXT | NOT NULL, UNIQUE | Username (3-20 chars) |
| email | TEXT | NOT NULL, UNIQUE | Email address |
| password | TEXT | NOT NULL | Hashed password (bcrypt) |
| isAdmin | BOOLEAN | NOT NULL, DEFAULT false | Admin flag |
| createdAt | TIMESTAMP | NOT NULL | Account creation date |

**Indexes**:
- `UNIQUE idx_users_username` on `username`
- `UNIQUE idx_users_email` on `email`

**Relations**:
- One-to-many with `userConfigurations`
- One-to-many with `userItineraries`
- One-to-one with `userPreferences`
- One-to-many with `eventComments`

**TypeScript Types**:
```typescript
type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
};

type InsertUser = {
  username: string;
  email: string;
  password: string;
  isAdmin?: boolean;
};
```

---

### projects

Showcase projects and builds.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Project ID |
| title | TEXT | NOT NULL | Project title |
| subtitle | TEXT | NOT NULL | Short subtitle |
| slug | TEXT | NOT NULL, UNIQUE | URL-friendly slug |
| description | TEXT | NOT NULL | Full description |
| category | TEXT | NOT NULL | Category (e.g., "Muscle Car") |
| imageUrl | TEXT | NOT NULL | Main image URL |
| galleryImages | JSON | NOT NULL | Array of image URLs |
| specs | JSON | NOT NULL | Key-value specs object |
| features | JSON | NOT NULL | Array of features |
| clientQuote | TEXT | NULL | Client testimonial |
| clientName | TEXT | NULL | Client name |
| clientLocation | TEXT | NULL | Client location |
| createdAt | TIMESTAMP | NOT NULL | Creation date |

**Indexes**:
- `UNIQUE idx_projects_slug` on `slug`

**TypeScript Types**:
```typescript
type Project = {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  galleryImages: string[];
  specs: Record<string, string>;
  features: string[];
  clientQuote: string | null;
  clientName: string | null;
  clientLocation: string | null;
  createdAt: Date;
};
```

---

### gatewayVehicles

Classic car inventory from Gateway Classic Cars.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Vehicle ID |
| listingId | TEXT | UNIQUE | External listing ID |
| make | TEXT | NOT NULL | Manufacturer (e.g., "Ford") |
| model | TEXT | NOT NULL | Model (e.g., "Mustang") |
| year | INTEGER | NOT NULL | Model year |
| price | INTEGER | NULL | Price in USD |
| description | TEXT | NULL | Full description |
| location | TEXT | NULL | Physical location |
| imageUrl | TEXT | NULL | Primary image URL |
| detailsUrl | TEXT | NULL | External details URL |
| category | TEXT | NULL | Vehicle category |
| investmentGrade | TEXT | NULL | Investment grade rating |
| featured | BOOLEAN | DEFAULT false | Featured flag |

**Indexes**:
- `idx_vehicles_make` on `make`
- `idx_vehicles_year` on `year`
- `idx_vehicles_category` on `category`
- `UNIQUE idx_vehicles_listing` on `listingId`

**Full-Text Search**:
- FTS5 virtual table on `make`, `model`, `year`, `description`, `category`

**TypeScript Types**:
```typescript
type GatewayVehicle = {
  id: number;
  listingId: string | null;
  make: string;
  model: string;
  year: number;
  price: number | null;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  detailsUrl: string | null;
  category: string | null;
  investmentGrade: string | null;
  featured: boolean;
};
```

---

### carShowEvents

Car show and automotive event listings.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Event ID |
| name | TEXT | NOT NULL | Event name |
| eventType | TEXT | NOT NULL | Type (car_show, auction, etc.) |
| description | TEXT | NULL | Event description |
| startDate | TIMESTAMP | NOT NULL | Start date/time |
| endDate | TIMESTAMP | NULL | End date/time |
| location | TEXT | NOT NULL | Venue name |
| city | TEXT | NOT NULL | City |
| state | TEXT | NOT NULL | State |
| website | TEXT | NULL | Event website |
| registrationUrl | TEXT | NULL | Registration URL |
| venueType | TEXT | NULL | Venue type |
| expectedAttendance | INTEGER | NULL | Expected attendance |

**Indexes**:
- `idx_events_start_date` on `startDate`
- `idx_events_state` on `state`
- `idx_events_type` on `eventType`

**TypeScript Types**:
```typescript
type CarShowEvent = {
  id: number;
  name: string;
  eventType: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string;
  city: string;
  state: string;
  website: string | null;
  registrationUrl: string | null;
  venueType: string | null;
  expectedAttendance: number | null;
};
```

---

### userConfigurations

User-created custom vehicle builds.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Configuration ID |
| userId | INTEGER | NOT NULL, FK → users.id | Owner user ID |
| vehicleType | TEXT | NOT NULL | Type of vehicle |
| baseVehicle | JSON | NOT NULL | Base vehicle info |
| modifications | JSON | NOT NULL | Modifications object |
| estimatedCost | INTEGER | NULL | Total cost estimate |
| createdAt | TIMESTAMP | NOT NULL | Creation date |
| completionDate | TIMESTAMP | NULL | Planned completion |

**Indexes**:
- `idx_configs_user` on `userId`

**Foreign Keys**:
- `userId` → `users.id` (CASCADE DELETE)

**TypeScript Types**:
```typescript
type UserConfiguration = {
  id: number;
  userId: number;
  vehicleType: string;
  baseVehicle: {
    make: string;
    model: string;
    year: number;
  };
  modifications: Record<string, any>;
  estimatedCost: number | null;
  createdAt: Date;
  completionDate: Date | null;
};
```

---

### userItineraries

User trip itineraries for visiting events.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Itinerary ID |
| userId | INTEGER | NOT NULL, FK → users.id | Owner user ID |
| name | TEXT | NOT NULL | Itinerary name |
| description | TEXT | NULL | Description |
| events | JSON | NOT NULL | Array of event IDs |
| createdAt | TIMESTAMP | NOT NULL | Creation date |

**Indexes**:
- `idx_itineraries_user` on `userId`

**Foreign Keys**:
- `userId` → `users.id` (CASCADE DELETE)

**TypeScript Types**:
```typescript
type UserItinerary = {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  events: number[]; // Array of event IDs
  createdAt: Date;
};
```

---

### userPreferences

User settings and preferences.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Preference ID |
| userId | INTEGER | NOT NULL, UNIQUE, FK → users.id | User ID |
| homeLocation | JSON | NULL | Home location object |
| preferredCategories | JSON | NULL | Preferred vehicle categories |
| createdAt | TIMESTAMP | NOT NULL | Creation date |
| updatedAt | TIMESTAMP | NOT NULL | Last update date |

**Indexes**:
- `UNIQUE idx_prefs_user` on `userId`

**Foreign Keys**:
- `userId` → `users.id` (CASCADE DELETE)

**TypeScript Types**:
```typescript
type UserPreference = {
  id: number;
  userId: number;
  homeLocation: {
    city?: string;
    state?: string;
    zip?: string;
  } | null;
  preferredCategories: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### luxuryShowcases

Premium project showcases with rich media.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Showcase ID |
| projectId | INTEGER | NULL, FK → projects.id | Related project |
| title | TEXT | NOT NULL | Showcase title |
| slug | TEXT | NOT NULL, UNIQUE | URL slug |
| featured | BOOLEAN | DEFAULT false | Featured flag |
| description | TEXT | NOT NULL | Full description |
| subtitle | TEXT | NOT NULL | Subtitle |
| shortDescription | TEXT | NOT NULL | Short summary |
| heroImage | TEXT | NOT NULL | Hero image URL |
| galleryImages | JSON | NOT NULL | Gallery image URLs |
| detailSections | JSON | NOT NULL | Detailed sections |
| specifications | JSON | NOT NULL | Technical specs |
| videoUrl | TEXT | NULL | Video URL |
| publishedAt | TIMESTAMP | NULL | Publish date |
| createdAt | TIMESTAMP | NOT NULL | Creation date |
| updatedAt | TIMESTAMP | NOT NULL | Update date |

**Indexes**:
- `UNIQUE idx_showcases_slug` on `slug`
- `idx_showcases_featured` on `featured`

**Foreign Keys**:
- `projectId` → `projects.id` (SET NULL on delete)

**TypeScript Types**:
```typescript
type LuxuryShowcase = {
  id: number;
  projectId: number | null;
  title: string;
  slug: string;
  featured: boolean;
  description: string;
  subtitle: string;
  shortDescription: string;
  heroImage: string;
  galleryImages: string[];
  detailSections: Array<{
    title: string;
    content: string;
    order: number;
    image?: string;
  }>;
  specifications: Array<{
    category: string;
    items: Array<{
      label: string;
      value: string;
    }>;
  }>;
  videoUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### researchArticles

Automotive research and educational content.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Article ID |
| title | TEXT | NOT NULL | Article title |
| slug | TEXT | NOT NULL, UNIQUE | URL slug |
| content | TEXT | NOT NULL | Article content (Markdown) |
| summary | TEXT | NOT NULL | Summary/excerpt |
| category | TEXT | NOT NULL | Article category |
| tags | JSON | NOT NULL | Array of tags |
| imageUrl | TEXT | NULL | Header image URL |
| authorId | INTEGER | NULL, FK → users.id | Author user ID |
| publishedAt | TIMESTAMP | NULL | Publish date |
| createdAt | TIMESTAMP | NOT NULL | Creation date |
| updatedAt | TIMESTAMP | NOT NULL | Update date |

**Indexes**:
- `UNIQUE idx_articles_slug` on `slug`
- `idx_articles_category` on `category`
- `idx_articles_published` on `publishedAt`

**Foreign Keys**:
- `authorId` → `users.id` (SET NULL on delete)

**TypeScript Types**:
```typescript
type ResearchArticle = {
  id: number;
  title: string;
  slug: string;
  content: string; // Markdown
  summary: string;
  category: string;
  tags: string[];
  imageUrl: string | null;
  authorId: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### eventComments

User comments on car show events.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Comment ID |
| eventId | INTEGER | NOT NULL, FK → carShowEvents.id | Event ID |
| userId | INTEGER | NOT NULL, FK → users.id | Commenter user ID |
| content | TEXT | NOT NULL | Comment content |
| createdAt | TIMESTAMP | NOT NULL | Creation date |

**Indexes**:
- `idx_comments_event` on `eventId`
- `idx_comments_user` on `userId`

**Foreign Keys**:
- `eventId` → `carShowEvents.id` (CASCADE DELETE)
- `userId` → `users.id` (CASCADE DELETE)

**TypeScript Types**:
```typescript
type EventComment = {
  id: number;
  eventId: number;
  userId: number;
  content: string;
  createdAt: Date;
};
```

---

## Migrations

Migrations are stored in `db/migrations/` and managed by Drizzle Kit.

### Migration Files

1. **0000_amazing_marvel_apes.sql** (Initial schema)
   - Created all core tables
   - Set up indexes
   - Added initial constraints

2. **0001_classy_sumo.sql** (User preferences)
   - Added `userPreferences` table
   - Added foreign key to users

3. **0002_eager_prodigy.sql** (Luxury showcases)
   - Added `luxuryShowcases` table
   - Added `researchArticles` table

4. **0003_fts5_vehicle_search.sql** (Full-text search)
   - Created FTS5 virtual table for vehicles
   - Set up search triggers

5. **0004_lame_betty_brant.sql** (Event comments)
   - Added `eventComments` table
   - Added comment indexes

### Running Migrations

```bash
# Generate new migration
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema (skip migrations, for dev only)
npm run db:push
```

---

## Seeding

### Seed Data

Located in `db/seed*.ts` files:

- **seed.ts**: Users, projects, configurations
- **seed-gateway-classics.ts**: 172 real classic cars
- **seed-car-show-events.ts**: Car show events
- **seed-research-articles.ts**: Sample articles

### Running Seeders

```bash
# Run all seeders
npm run db:seed

# Import external data
npm run import:cars      # Import Gateway vehicles
npm run import:events    # Import car show events
```

---

## Database Queries

### Common Query Patterns

#### Get user with preferences
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    preferences: true,
  },
});
```

#### Search vehicles
```typescript
const vehicles = await db
  .select()
  .from(gatewayVehicles)
  .where(
    and(
      eq(gatewayVehicles.make, "Ford"),
      gte(gatewayVehicles.year, 1965)
    )
  )
  .orderBy(desc(gatewayVehicles.year));
```

#### Get event with comments
```typescript
const event = await db.query.carShowEvents.findFirst({
  where: eq(carShowEvents.id, eventId),
  with: {
    comments: {
      with: {
        user: {
          columns: { username: true },
        },
      },
    },
  },
});
```

#### Full-text search
```typescript
const results = await db.all(
  `SELECT * FROM vehicles_fts
   WHERE vehicles_fts MATCH ?
   ORDER BY rank
   LIMIT ?`,
  [searchQuery, limit]
);
```

---

## Performance Optimization

### Indexes

Strategic indexes for common queries:
- User lookups: `username`, `email`
- Vehicle filters: `make`, `year`, `category`
- Event filtering: `startDate`, `state`, `eventType`
- Relations: All foreign keys indexed

### Query Optimization

1. **Select specific columns**: Use `.select()` instead of `SELECT *`
2. **Use limits**: Always paginate large result sets
3. **Eager load relations**: Use `.with()` to avoid N+1 queries
4. **Use indexes**: Filter on indexed columns when possible

### Database Size

Current production data:
- **Users**: ~1,000 rows (~100 KB)
- **Vehicles**: 172 rows (~500 KB)
- **Events**: ~500 rows (~200 KB)
- **Total**: ~5 MB (SQLite), ~10 MB (PostgreSQL)

---

## Backup Strategy

### Development (SQLite)
```bash
# Backup
cp db/local.db db/backups/local-$(date +%Y%m%d).db

# Restore
cp db/backups/local-20250115.db db/local.db
```

### Production (PostgreSQL)
```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20250115.sql
```

---

## Schema Validation

Drizzle generates Zod schemas for runtime validation:

```typescript
import { createInsertSchema } from "drizzle-zod";
import { users } from "@shared/schema";

const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

// Validate at runtime
const result = insertUserSchema.safeParse(userData);
```

---

Last Updated: 2025-11-17
