# Restomod Central

A comprehensive platform for classic car enthusiasts, builders, and collectors. Restomod Central connects users with restomod projects, car shows, market data, and custom vehicle configurators.

## 🚀 Features

- **Classic Car Marketplace**: Browse and search 172+ real classic cars from Gateway Classic Cars
- **Car Show Directory**: Discover car shows and automotive events across the US
- **Vehicle Configurator**: Design custom builds with detailed specifications
- **Market Analytics**: Real-time pricing trends and investment grade analysis
- **Interactive Search**: Advanced filtering with full-text search (FTS5)
- **User Itineraries**: Plan trips to multiple car shows and events
- **Admin Dashboard**: Content management for luxury showcases and projects

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI primitives)
- **React Query** - Server state management
- **Wouter** - Lightweight routing
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend
- **Express.js** - Node.js web framework
- **Drizzle ORM** - TypeScript ORM
- **SQLite/PostgreSQL** - Database (supports both)
- **Passport.js** - Authentication
- **bcryptjs** - Password hashing
- **JWT** - Session management

### Tools & Libraries
- **tsx** - TypeScript execution
- **esbuild** - Fast bundler
- **Vitest** - Testing framework
- **Playwright** - E2E testing

## 📦 Prerequisites

- **Node.js** >= 18.x
- **npm** >= 10.x
- **Git**

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Planet9V/restomod_central.git
cd restomod_central
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment setup

The project includes a pre-configured `.env` file with SQLite:

```bash
DATABASE_URL="./db/local.db"
```

For PostgreSQL (optional), copy `.env.postgres` to `.env` and update the credentials.

### 4. Database setup

The database comes pre-seeded with data. If you need to reset:

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 5. Start development server

```bash
npm run dev
```

The application will be available at **http://localhost:5000**

## 💻 Development

### Available Scripts

```bash
npm run dev          # Start development server (tsx + Vite HMR)
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run test         # Run tests
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run pending migrations
npm run db:seed      # Seed database with sample data
```

### Import Scripts

```bash
npm run import:events  # Import car show events
npm run import:cars    # Import Gateway Classic Cars vehicles
```

## 🗄️ Database

### Schema Overview

The database supports both **SQLite** (development) and **PostgreSQL** (production).

**Main Tables:**
- `users` - User accounts and authentication
- `projects` - Showcase projects and builds
- `gatewayVehicles` - Real classic car inventory (172 vehicles)
- `carShowEvents` - US car show and event listings
- `userConfigurations` - Custom vehicle builds
- `userItineraries` - Planned event trips
- `luxuryShowcases` - Premium project showcases
- `researchArticles` - Automotive research content

### Migrations

Migrations are located in `db/migrations/`:
- `0000_amazing_marvel_apes.sql` - Initial schema
- `0001_classy_sumo.sql` - User preferences
- `0002_eager_prodigy.sql` - Luxury showcases
- `0003_fts5_vehicle_search.sql` - Full-text search
- `0004_lame_betty_brant.sql` - Event comments

### Seeding

Multiple seed files provide rich sample data:
- `db/seed.ts` - Main seeder (users, projects, configurations)
- `db/seed-gateway-classics.ts` - 172 real classic cars
- `db/seed-car-show-events.ts` - Car show events
- `db/seed-research-articles.ts` - Research content

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login (returns session)
POST   /api/auth/logout          # Logout
GET    /api/auth/user            # Get current user
```

### Vehicle Endpoints

```
GET    /api/cars                 # List all vehicles (supports filters)
GET    /api/cars/:id             # Get vehicle by ID
GET    /api/cars/featured        # Get featured vehicles
GET    /api/search/vehicles      # Advanced search with FTS5
```

### Event Endpoints

```
GET    /api/events               # List car show events (supports filters)
GET    /api/events/:id           # Get event by ID
POST   /api/events/:id/comments  # Add comment (auth required)
```

### Configuration Endpoints

```
GET    /api/user/configurations       # List user builds (auth required)
POST   /api/user/configurations       # Create build (auth required)
PUT    /api/user/configurations/:id   # Update build (auth required)
DELETE /api/user/configurations/:id   # Delete build (auth required)
```

### Itinerary Endpoints

```
GET    /api/user/itineraries          # List itineraries (auth required)
POST   /api/user/itineraries          # Create itinerary (auth required)
DELETE /api/user/itineraries/:id      # Delete itinerary (auth required)
```

See `server/routes.ts` for complete API documentation.

## 📁 Project Structure

```
restomod_central/
├── client/                    # Frontend React application
│   └── src/
│       ├── components/        # React components
│       │   ├── admin/         # Admin dashboard components
│       │   ├── auth/          # Authentication components
│       │   ├── events/        # Event components
│       │   ├── market/        # Market analytics components
│       │   ├── search/        # Search components
│       │   └── ui/            # shadcn/ui components
│       ├── data/              # Static data and types
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utility functions
│       ├── pages/             # Page components
│       ├── services/          # API services
│       ├── types/             # TypeScript types
│       ├── App.tsx            # Main app component
│       └── main.tsx           # Entry point
├── server/                    # Backend Express application
│   ├── api/                   # API route handlers
│   ├── services/              # Business logic services
│   ├── auth.ts                # Authentication logic
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Database queries
│   └── vite.ts                # Vite dev server setup
├── db/                        # Database
│   ├── migrations/            # SQL migration files
│   ├── index.ts               # Database connection
│   ├── migrate.ts             # Migration runner
│   └── seed.ts                # Database seeder
├── shared/                    # Shared code (client + server)
│   ├── schema.ts              # Drizzle schema definitions
│   └── configurator-schema.ts # Configurator schemas
├── scripts/                   # Utility scripts
├── public/                    # Static assets
├── data/                      # Data files (JSON)
├── docs/                      # Documentation
├── .env                       # Environment variables
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── tailwind.config.ts         # Tailwind config
└── drizzle.config.ts          # Drizzle ORM config
```

## 🧪 Testing

### Run Tests

```bash
npm run test
```

### Test Files
- `server/api/*.test.ts` - API integration tests
- Uses **Vitest** and **Supertest**

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This generates:
- `dist/` - Built frontend assets
- `dist/index.js` - Bundled server

### Start Production Server

```bash
npm run start
```

### Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`

Optional:
- `ANTHROPIC_API_KEY` - For AI features
- `OPENAI_API_KEY` - For AI features
- `PERPLEXITY_API_KEY` - For research automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier (configured)
- Follow existing patterns

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Documentation](./docs/)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)

## 💡 Key Features Explained

### Full-Text Search
The application uses SQLite FTS5 for lightning-fast vehicle search across make, model, year, and descriptions.

### Real Data
All vehicle listings are real data scraped from Gateway Classic Cars St. Louis showroom (172 vehicles).

### Progressive Enhancement
The app works with JavaScript disabled for core content, enhanced with React for interactivity.

### Type Safety
End-to-end TypeScript from database schema to frontend components using Drizzle-Zod.

## 📊 Data Sources

- **Gateway Classic Cars** - Real classic car inventory
- **US Car Shows** - Curated event listings
- **Market Analytics** - Historical pricing data

## 🙏 Acknowledgments

- Gateway Classic Cars for inspiration
- shadcn for the excellent UI component library
- Drizzle ORM team for the fantastic ORM

---

**Built with ❤️ for classic car enthusiasts**
