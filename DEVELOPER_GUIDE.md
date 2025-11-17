# Developer Guide

Welcome to the Restomod Central development team! This guide will help you get up and running quickly and understand our development practices.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Organization](#code-organization)
4. [Database Development](#database-development)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Getting Started

### Initial Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/Planet9V/restomod_central.git
   cd restomod_central
   npm install
   ```

2. **Environment configuration**:
   - Copy `.env.postgres` to `.env` if using PostgreSQL
   - Or use the default SQLite setup (already configured)

3. **Start development**:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### Development Tools

Install recommended VS Code extensions:
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript Vue Plugin (Volar)** - Enhanced TypeScript support

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### Commit Convention

We follow conventional commits:

```
feat: Add vehicle comparison feature
fix: Resolve search pagination bug
docs: Update API documentation
style: Format code with prettier
refactor: Simplify auth middleware
test: Add tests for user itinerary
chore: Update dependencies
```

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests: `npm run test`
4. Check types: `npm run check`
5. Push and create PR to `develop`
6. Request review from maintainers
7. Address feedback
8. Merge when approved

## Code Organization

### Frontend Structure

```
client/src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── admin/           # Admin-specific components
│   ├── auth/            # Authentication components
│   ├── events/          # Event-related components
│   ├── market/          # Market analytics components
│   └── search/          # Search components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── lib/                 # Utilities and helpers
├── data/                # Static data and constants
└── types/               # TypeScript type definitions
```

### Backend Structure

```
server/
├── api/                 # Route handlers (organized by resource)
├── services/            # Business logic (pure functions)
├── auth.ts              # Authentication & authorization
├── routes.ts            # Main route registration
├── storage.ts           # Database query functions
├── vite.ts              # Vite dev server integration
└── index.ts             # Server entry point
```

### Shared Code

```
shared/
├── schema.ts            # Drizzle database schema
└── configurator-schema.ts  # Vehicle configurator schemas
```

## Database Development

### Working with Drizzle ORM

#### Defining Tables

Tables are defined in `shared/schema.ts`:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price"),
});
```

#### Creating Relations

```typescript
import { relations } from "drizzle-orm";

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  owner: one(users, {
    fields: [vehicles.userId],
    references: [users.id],
  }),
  images: many(vehicleImages),
}));
```

#### Type Inference

```typescript
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
```

### Schema Changes

1. **Modify schema** in `shared/schema.ts`
2. **Generate migration**:
   ```bash
   npm run db:generate
   ```
3. **Review migration** in `db/migrations/`
4. **Apply migration**:
   ```bash
   npm run db:migrate
   ```

Or use push for rapid development (skips migrations):
```bash
npm run db:push
```

### Writing Queries

Use the storage abstraction in `server/storage.ts`:

```typescript
import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, like } from "drizzle-orm";

export const getVehiclesByMake = async (make: string) => {
  return await db
    .select()
    .from(schema.gatewayVehicles)
    .where(eq(schema.gatewayVehicles.make, make))
    .orderBy(desc(schema.gatewayVehicles.year));
};
```

### Seeding Data

Add seed data to `db/seed.ts`:

```typescript
import { db } from "./index";
import * as schema from "@shared/schema";

export async function seed() {
  await db.insert(schema.vehicles).values([
    { make: "Ford", model: "Mustang", year: 1967, price: 85000 },
    { make: "Chevrolet", model: "Camaro", year: 1969, price: 92000 },
  ]);
}
```

Run with:
```bash
npm run db:seed
```

## API Development

### Creating New Endpoints

1. **Define route handler** in `server/api/`:

```typescript
// server/api/vehicles.ts
import { Express } from "express";
import { getVehiclesByMake } from "@server/storage";
import { isAuthenticated } from "@server/auth";

export function registerVehicleRoutes(app: Express) {
  // Public endpoint
  app.get("/api/vehicles/:make", async (req, res) => {
    const { make } = req.params;
    const vehicles = await getVehiclesByMake(make);
    res.json(vehicles);
  });

  // Protected endpoint
  app.post("/api/vehicles", isAuthenticated, async (req, res) => {
    // Handle POST request
  });
}
```

2. **Register routes** in `server/routes.ts`:

```typescript
import { registerVehicleRoutes } from "./api/vehicles";

export function registerRoutes(app: Express) {
  registerVehicleRoutes(app);
  // ... other routes
}
```

### Request Validation

Use Zod for request validation:

```typescript
import { z } from "zod";

const createVehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear()),
  price: z.number().positive().optional(),
});

app.post("/api/vehicles", isAuthenticated, async (req, res) => {
  try {
    const data = createVehicleSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    res.status(400).json({ error: "Invalid request data" });
  }
});
```

### Error Handling

```typescript
app.get("/api/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await getVehicleById(Number(req.params.id));

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

## Frontend Development

### Creating Components

Use TypeScript and functional components:

```typescript
// client/src/components/VehicleCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VehicleCardProps {
  make: string;
  model: string;
  year: number;
  price?: number;
}

export function VehicleCard({ make, model, year, price }: VehicleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{year} {make} {model}</CardTitle>
      </CardHeader>
      <CardContent>
        {price && <p>${price.toLocaleString()}</p>}
      </CardContent>
    </Card>
  );
}
```

### Using React Query

For server state management:

```typescript
import { useQuery } from "@tanstack/react-query";

export function VehicleList() {
  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ["/api/vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {vehicles.map(vehicle => (
        <VehicleCard key={vehicle.id} {...vehicle} />
      ))}
    </div>
  );
}
```

### Styling with Tailwind

Use utility classes:

```tsx
<div className="container mx-auto px-4 py-8">
  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
    Classic Cars
  </h1>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Content */}
  </div>
</div>
```

### Using shadcn/ui Components

Import from `@/components/ui`:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-4">
  <div>
    <Label htmlFor="make">Make</Label>
    <Input id="make" placeholder="Ford" />
  </div>
  <Button>Search</Button>
</div>
```

## Testing

### Unit Tests

```typescript
// server/api/vehicles.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("GET /api/vehicles", () => {
  it("returns list of vehicles", async () => {
    const response = await request(app)
      .get("/api/vehicles")
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### Integration Tests

```typescript
it("creates and retrieves a vehicle", async () => {
  const newVehicle = {
    make: "Ford",
    model: "Mustang",
    year: 1967,
  };

  const createResponse = await request(app)
    .post("/api/vehicles")
    .send(newVehicle)
    .expect(201);

  const vehicleId = createResponse.body.id;

  const getResponse = await request(app)
    .get(`/api/vehicles/${vehicleId}`)
    .expect(200);

  expect(getResponse.body).toMatchObject(newVehicle);
});
```

## Common Tasks

### Adding a New shadcn/ui Component

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add calendar
```

### Creating a New Database Table

1. Add table to `shared/schema.ts`:
```typescript
export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});
```

2. Generate migration:
```bash
npm run db:generate
```

3. Apply migration:
```bash
npm run db:migrate
```

### Importing External Data

1. Create import script in `scripts/`:
```typescript
// scripts/import-data.ts
import { db } from "../db";
import * as schema from "../shared/schema";

async function importData() {
  const data = await fetchExternalData();
  await db.insert(schema.vehicles).values(data);
}

importData();
```

2. Add npm script to `package.json`:
```json
{
  "scripts": {
    "import:data": "tsx scripts/import-data.ts"
  }
}
```

3. Run:
```bash
npm run import:data
```

## Troubleshooting

### TypeScript Errors

```bash
# Check types
npm run check

# Common fixes:
# 1. Clear build cache
rm -rf node_modules/.cache

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### Database Issues

```bash
# Reset database
rm db/local.db
npm run db:push
npm run db:seed

# Check database content (SQLite)
sqlite3 db/local.db
.tables
SELECT * FROM users;
.quit
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or change port in server/index.ts
const PORT = process.env.PORT || 3000;
```

### Module Resolution Errors

Ensure `tsconfig.json` paths are correct:

```json
{
  "compilerOptions": {
    "paths": {
      "@db": ["./db/index.ts"],
      "@db/*": ["./db/*"],
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@server/*": ["./server/*"]
    }
  }
}
```

## Best Practices

### TypeScript

- ✅ Use strict mode (already enabled)
- ✅ Define interfaces for all component props
- ✅ Use type inference from Drizzle schemas
- ❌ Avoid `any` type (use `unknown` if needed)
- ✅ Use union types for constants

### Database

- ✅ Use transactions for related operations
- ✅ Add indexes for frequently queried columns
- ✅ Use migrations for schema changes in production
- ❌ Don't use raw SQL unless absolutely necessary
- ✅ Use database relations for joins

### API Design

- ✅ Use RESTful conventions
- ✅ Version your API (`/api/v1/...`)
- ✅ Return appropriate HTTP status codes
- ✅ Include error messages in responses
- ✅ Use pagination for large datasets
- ✅ Validate all inputs with Zod

### React

- ✅ Keep components small and focused
- ✅ Extract custom hooks for reusable logic
- ✅ Use React Query for server state
- ✅ Use React Context sparingly
- ✅ Memoize expensive computations
- ❌ Don't use index as key in lists

### Performance

- ✅ Lazy load routes and heavy components
- ✅ Optimize images (use WebP)
- ✅ Debounce search inputs
- ✅ Use React Query caching
- ✅ Add database indexes
- ✅ Minimize bundle size

### Security

- ✅ Validate all user inputs
- ✅ Use parameterized queries (Drizzle handles this)
- ✅ Hash passwords with bcrypt
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Sanitize HTML output
- ❌ Never log sensitive data

## Getting Help

- **Documentation**: Check `/docs` folder
- **Architecture**: See `ARCHITECTURE.md`
- **Issues**: [GitHub Issues](https://github.com/Planet9V/restomod_central/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Planet9V/restomod_central/discussions)

## Code Review Checklist

Before submitting a PR:

- [ ] Code compiles without errors (`npm run check`)
- [ ] All tests pass (`npm run test`)
- [ ] New features have tests
- [ ] No console.logs in production code
- [ ] Types are properly defined
- [ ] API changes are documented
- [ ] Database migrations are included
- [ ] UI is responsive (mobile, tablet, desktop)
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Error handling is comprehensive

---

Welcome aboard! Happy coding! 🚗💨
