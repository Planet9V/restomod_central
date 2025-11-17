# Restomod Central - Architecture Overview

This document provides a comprehensive overview of the Restomod Central platform architecture, design decisions, and system components.

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Layers](#application-layers)
4. [Data Architecture](#data-architecture)
5. [API Design](#api-design)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Performance Considerations](#performance-considerations)
9. [Security](#security)
10. [Deployment Architecture](#deployment-architecture)

## System Overview

Restomod Central is a monolithic full-stack TypeScript application with the following key characteristics:

- **Monorepo Structure**: Single repository containing frontend, backend, and shared code
- **Type-Safe**: End-to-end TypeScript from database to UI
- **SSR Capable**: Server-side rendering support via Vite
- **Real-Time Ready**: WebSocket support for future real-time features
- **Progressive**: Works without JavaScript, enhanced with React

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client Browser                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │         React SPA (Vite + TypeScript)              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │ │
│  │  │  Pages   │  │Components│  │  React Query     │ │ │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP/WebSocket
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Express.js Server                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │              API Routes (REST)                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │ │
│  │  │  Auth    │  │ Business │  │  WebSocket      │ │ │
│  │  │ Passport │  │  Logic   │  │  (ws)           │ │ │
│  │  └──────────┘  └──────────┘  └─────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────┬──────────────────────────────────┘
                        │ Drizzle ORM
                        ▼
┌─────────────────────────────────────────────────────────┐
│            Database (SQLite / PostgreSQL)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Users │ Vehicles │ Events │ Configs │ Showcases  │ │
│  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │         FTS5 Full-Text Search Index           │ │ │
│  │  └───────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Framework
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.6+
- **Module System**: ESM (ES Modules)

### Frontend
| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| React 18 | UI Library | Industry standard, great ecosystem |
| Vite | Build Tool | Fast HMR, modern tooling |
| Wouter | Routing | Lightweight (1.3KB vs React Router 11KB) |
| TailwindCSS | Styling | Utility-first, rapid development |
| shadcn/ui | Components | High-quality, accessible, customizable |
| React Query | State Management | Server state caching, prefetching |
| Framer Motion | Animations | Declarative, performant animations |
| Recharts | Visualization | React-native charts |

### Backend
| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| Express.js | Web Framework | Mature, flexible, well-documented |
| Drizzle ORM | Database ORM | Type-safe, zero-cost abstractions |
| Passport.js | Authentication | Battle-tested, strategy-based |
| bcryptjs | Password Hashing | Secure, synchronous hashing |
| JWT | Session Tokens | Stateless authentication |
| Zod | Validation | Type-safe runtime validation |

### Database
| Technology | Purpose | Why Chosen |
|-----------|---------|------------|
| SQLite | Dev Database | Zero-config, file-based |
| PostgreSQL | Prod Database | ACID, scalable, reliable |
| FTS5 | Full-Text Search | Built-in, performant |

## Application Layers

### 1. Presentation Layer (Client)

**Location**: `client/src/`

**Responsibilities**:
- Render UI components
- Handle user interactions
- Manage client-side routing
- Cache server data
- Form validation

**Key Components**:
- **Pages**: Top-level route components
- **Components**: Reusable UI building blocks
- **Hooks**: Custom React hooks for shared logic
- **Services**: API client functions

### 2. API Layer (Server)

**Location**: `server/api/`

**Responsibilities**:
- Route handling
- Request validation
- Response formatting
- Error handling
- Authentication checks

**Pattern**: Resource-based routing

```typescript
server/api/
├── auth.ts          # Authentication endpoints
├── cars.ts          # Vehicle CRUD operations
├── events.ts        # Car show events
├── comments.ts      # Event comments
├── user.ts          # User profile & preferences
└── itinerary.ts     # User trip planning
```

### 3. Business Logic Layer (Services)

**Location**: `server/services/`

**Responsibilities**:
- Complex business logic
- Data transformations
- Third-party integrations
- Background jobs

**Examples**:
- `comprehensiveDataProcessor.ts` - Data aggregation
- `eventVehicleMatchingService.ts` - Smart vehicle-event matching
- `priceTrendService.ts` - Market analytics
- `databaseHealthCheck.ts` - Monitoring

### 4. Data Access Layer (Storage)

**Location**: `server/storage.ts`

**Responsibilities**:
- Database queries
- Transaction management
- Data fetching
- Query optimization

**Pattern**: Repository pattern with Drizzle ORM

```typescript
// Example: Centralized query functions
export const getGatewayVehicles = async (filters?: VehicleFilters) => {
  let query = db.select().from(schema.gatewayVehicles);

  if (filters?.make) {
    query = query.where(eq(schema.gatewayVehicles.make, filters.make));
  }

  return await query.orderBy(desc(schema.gatewayVehicles.year));
};
```

### 5. Data Layer (Database)

**Location**: `db/` and `shared/schema.ts`

**Responsibilities**:
- Schema definitions
- Migrations
- Seeding
- Database configuration

## Data Architecture

### Schema Design Philosophy

1. **Type Safety**: Drizzle schema generates TypeScript types
2. **Denormalization**: Strategic denormalization for read performance
3. **JSON Columns**: Use for flexible, non-queryable data
4. **Relations**: Define in code, not database (except foreign keys)

### Key Entities

#### Users
```typescript
users
├── id (PK)
├── username (unique)
├── email (unique)
├── password (hashed)
├── isAdmin (boolean)
└── createdAt
```

#### Gateway Vehicles (Classic Cars)
```typescript
gatewayVehicles
├── id (PK)
├── listingId (external ID)
├── make
├── model
├── year
├── price
├── description
├── location
├── imageUrl
├── detailsUrl
├── category
├── investmentGrade
└── featured (boolean)
```

#### Car Show Events
```typescript
carShowEvents
├── id (PK)
├── name
├── eventType
├── description
├── startDate
├── endDate
├── location
├── city
├── state
├── website
├── registrationUrl
├── venueType
└── expectedAttendance
```

#### User Configurations (Custom Builds)
```typescript
userConfigurations
├── id (PK)
├── userId (FK)
├── vehicleType
├── baseVehicle
├── modifications (JSON)
├── estimatedCost
└── completionDate
```

### Full-Text Search (FTS5)

**Implementation**: SQLite FTS5 virtual table

```sql
CREATE VIRTUAL TABLE vehicles_fts USING fts5(
  make,
  model,
  year,
  description,
  category,
  content=gatewayVehicles
);
```

**Benefits**:
- Lightning-fast text search
- Relevance ranking
- Prefix matching
- Built-in stemming

**Usage**:
```typescript
const results = await db.all(
  `SELECT * FROM vehicles_fts WHERE vehicles_fts MATCH ? ORDER BY rank`,
  [searchTerm]
);
```

## API Design

### REST Conventions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/resource` | List all |
| GET | `/api/resource/:id` | Get one |
| POST | `/api/resource` | Create |
| PUT | `/api/resource/:id` | Update |
| DELETE | `/api/resource/:id` | Delete |

### Response Format

**Success** (200-299):
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20
  }
}
```

**Error** (400-599):
```json
{
  "error": "Resource not found",
  "code": "RESOURCE_NOT_FOUND",
  "details": {...}
}
```

### Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │  POST /api/auth/login                         │
     │  { username, password }                       │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                        Verify credentials     │
     │                        Generate session       │
     │                                                │
     │  200 OK                                       │
     │  Set-Cookie: session=...                      │
     │<──────────────────────────────────────────────┤
     │                                                │
     │  GET /api/user/configurations                 │
     │  Cookie: session=...                          │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                        Validate session       │
     │                        Fetch user data        │
     │                                                │
     │  200 OK                                       │
     │  { data: [...] }                              │
     │<──────────────────────────────────────────────┤
```

## Frontend Architecture

### Component Hierarchy

```
App (Router)
├── Layout
│   ├── Header
│   │   └── Navigation
│   └── Footer
├── Pages
│   ├── Home
│   │   ├── Hero
│   │   ├── FeaturedVehicles
│   │   └── UpcomingEvents
│   ├── VehiclesPage
│   │   ├── SearchFilters
│   │   ├── VehicleGrid
│   │   │   └── VehicleCard (×N)
│   │   └── Pagination
│   ├── VehicleDetailPage
│   │   ├── VehicleGallery
│   │   ├── VehicleSpecs
│   │   └── SimilarVehicles
│   ├── EventsPage
│   │   ├── EventFilters
│   │   ├── EventList
│   │   │   └── EventCard (×N)
│   │   └── EventMap
│   └── ConfiguratorPage
│       ├── VehicleSelector
│       ├── ModificationList
│       └── CostEstimator
└── Modals / Dialogs (Portal)
```

### State Management Strategy

**Server State** (React Query):
- Vehicle listings
- Event data
- User configurations
- Market analytics

**Client State** (React useState/useReducer):
- UI state (modals, dropdowns)
- Form inputs
- Filters (transient)

**URL State** (Wouter):
- Current route
- Search parameters
- Filter selections

**Global State** (React Context):
- User authentication
- Theme preference
- Toast notifications

### Data Flow

```
┌───────────────────────────────────────────────────┐
│                 React Component                    │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │    useQuery({ queryKey, queryFn })           │ │
│  └────────────┬────────────────────┬────────────┘ │
│               │                    │               │
│               ▼                    │               │
│  ┌──────────────────────┐         │               │
│  │   React Query Cache  │         │               │
│  │  (in-memory)         │         │               │
│  └──────────┬───────────┘         │               │
│             │ miss                │ hit           │
│             ▼                     ▼               │
│  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   API Fetch          │  │  Return Cached   │  │
│  └──────────┬───────────┘  └──────────────────┘  │
│             │                                     │
└─────────────┼─────────────────────────────────────┘
              ▼
    ┌───────────────────┐
    │  Express Server   │
    │  (API Endpoint)   │
    └─────────┬─────────┘
              ▼
    ┌───────────────────┐
    │  Drizzle ORM      │
    └─────────┬─────────┘
              ▼
    ┌───────────────────┐
    │  Database         │
    └───────────────────┘
```

## Authentication & Authorization

### Session Management

- **Session Store**: Express-session with memory store (dev) / Redis (prod)
- **Cookie**: HttpOnly, Secure (production), SameSite=Lax
- **Duration**: 7 days
- **Serialization**: User ID only (minimize session data)

### Middleware Stack

```typescript
app.use(express.json());                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(session({...}));                    // Session management
app.use(passport.initialize());             // Passport init
app.use(passport.session());                // Passport session
```

### Authorization Patterns

```typescript
// Public route - no auth
app.get("/api/vehicles", vehicleController);

// Optional auth - different data for authenticated users
app.get("/api/events", maybeIsAuthenticated, eventsController);

// Required auth - 401 if not authenticated
app.get("/api/user/configs", isAuthenticated, configsController);

// Admin only - 403 if not admin
app.post("/api/admin/projects", isAdmin, createProjectController);
```

## Performance Considerations

### Database Optimization

1. **Indexes**: Strategic indexes on frequently queried columns
   ```sql
   CREATE INDEX idx_vehicles_make ON gatewayVehicles(make);
   CREATE INDEX idx_vehicles_year ON gatewayVehicles(year);
   CREATE INDEX idx_events_date ON carShowEvents(startDate);
   ```

2. **Query Optimization**:
   - Use `select()` to limit columns
   - Avoid N+1 queries with relations
   - Use `limit()` for pagination

3. **Caching**:
   - React Query cache (frontend)
   - Future: Redis cache (backend)

### Frontend Optimization

1. **Code Splitting**: Route-based lazy loading
   ```typescript
   const ConfiguratorPage = lazy(() => import("./pages/ConfiguratorPage"));
   ```

2. **Asset Optimization**:
   - Image lazy loading
   - WebP format support
   - Responsive images

3. **Bundle Size**:
   - Tree shaking (Vite automatic)
   - Dynamic imports
   - Minimal dependencies

## Security

### Input Validation

**Frontend**: Client-side validation (UX)
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

**Backend**: Server-side validation (security)
```typescript
app.post("/api/auth/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  // Process validated data
});
```

### SQL Injection Prevention

Drizzle ORM uses parameterized queries automatically:
```typescript
// Safe - parameterized
db.select().from(vehicles).where(eq(vehicles.id, userId));

// Never do this - vulnerable
db.execute(`SELECT * FROM vehicles WHERE id = ${userId}`);
```

### XSS Prevention

- React escapes output by default
- Use `dangerouslySetInnerHTML` sparingly
- Sanitize user-generated HTML with DOMPurify

### CSRF Protection

- SameSite cookies
- CSRF tokens for state-changing operations (future)

## Deployment Architecture

### Development
```
┌────────────────────────┐
│  Vite Dev Server       │  Port 5173 (HMR)
│  (Frontend)            │
└───────────┬────────────┘
            │ Proxy
            ▼
┌────────────────────────┐
│  Express Server (tsx)  │  Port 5000
│  (Backend + Frontend)  │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  SQLite Database       │  ./db/local.db
└────────────────────────┘
```

### Production
```
┌────────────────────────┐
│  Nginx / CDN           │  Port 443 (HTTPS)
│  (Static Assets)       │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Node.js Server        │  Port 5000
│  (SSR + API)           │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  PostgreSQL Database   │  Port 5432
│  (Production Data)     │
└────────────────────────┘
```

### Build Process

```bash
# 1. Build frontend (Vite)
vite build
# Output: dist/client/

# 2. Build backend (esbuild)
esbuild server/index.ts --bundle --platform=node
# Output: dist/server/

# 3. Copy static assets
cp -r public/* dist/client/

# 4. Run production
node dist/server/index.js
```

## Future Enhancements

### Planned Improvements

1. **Caching Layer**: Redis for API response caching
2. **Real-Time Features**: WebSocket for live updates
3. **Background Jobs**: Bull queue for async tasks
4. **File Storage**: S3 for user-uploaded images
5. **Search**: Elasticsearch for advanced search
6. **Monitoring**: Sentry for error tracking
7. **Analytics**: Mixpanel for user analytics
8. **Email**: SendGrid for transactional emails

### Scalability Considerations

- **Horizontal Scaling**: Stateless design allows multiple instances
- **Database**: PostgreSQL replication for read scaling
- **Caching**: Redis cluster for distributed cache
- **CDN**: CloudFront for global asset delivery
- **Load Balancing**: AWS ELB or Nginx

---

This architecture is designed for:
- ✅ **Developer Experience**: Fast iteration, type safety
- ✅ **Performance**: Optimized queries, caching, code splitting
- ✅ **Security**: Secure by default, defense in depth
- ✅ **Maintainability**: Clear separation of concerns, testable
- ✅ **Scalability**: Can grow from SQLite to distributed system

**Last Updated**: 2025-11-17
