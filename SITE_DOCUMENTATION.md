# Skinny's Rod and Custom - Complete Platform Documentation

## Database Architecture & Configuration

### PostgreSQL Database Setup
- **Database Provider**: Replit PostgreSQL (Native)
- **ORM**: Drizzle ORM with TypeScript
- **Schema Location**: `shared/schema.ts`
- **Configuration**: `drizzle.config.ts`

### Required Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=database_host
PGPORT=5432
PGDATABASE=database_name
PGUSER=database_user
PGPASSWORD=database_password
```

### Database Schema Structure

#### Core Business Tables
```sql
-- Projects showcase table
projects (id, title, description, category, year, make, model, imageUrl, featured, completionDate, estimatedValue)

-- Client testimonials
testimonials (id, clientName, rating, review, projectType, completionDate, vehicleDetails)

-- Team member profiles  
team_members (id, name, role, bio, imageUrl, specialties, yearsExperience)

-- Company information
companies (id, name, description, foundedYear, location, specialties)
```

#### Authentic Research Data Tables (From Your Documents)
```sql
-- Market valuations from Classic Restomod Valuations.txt
market_valuations (id, vehicleMake, vehicleModel, yearRange, engineVariant, bodyStyle, conditionRating, hagertyValue, auctionHigh, auctionLow, averagePrice, trendPercentage, marketSegment, investmentGrade, sourceData)

-- Premium builder profiles  
builder_profiles (id, companyName, location, specialtyFocus, reputationTier, averageBuildCostRange, buildTimeEstimate, notableProjects, contactInformation, websiteUrl, warrantyOffered, yearEstablished, rating, reviewCount)

-- Technical specifications from Ford Coyote guide
technical_specifications (id, componentCategory, partNumber, manufacturer, productName, priceRange, exactPrice, compatibility, performanceSpecs, installationDifficulty, requiredTools, estimatedLaborHours, vendorUrl, inStock, popularityRank)

-- Event venues from car show research
event_venues (id, venueName, locationCity, locationState, locationCountry, venueType, capacity, amenities, contactInfo, websiteUrl, parkingAvailable, foodVendors, swapMeet, judgingClasses, entryFees, trophiesAwarded)

-- Vendor partnerships from affiliate research
vendor_partnerships (id, companyName, category, commissionRate, revenueOpportunity, productTypes, affiliateUrl, trackingCode, paymentTerms, minimumPayout, contactInfo, isActive)

-- Build guides generated from technical data
build_guides (id, title, vehicleApplication, difficultyLevel, estimatedCost, estimatedTime, requiredSkills, toolsNeeded, partsRequired, stepByStepGuide, safetyWarnings, troubleshootingTips, videoUrl, authorName, rating)

-- Investment analytics from market data
investment_analytics (id, vehicleCategory, investmentHorizon, expectedReturn, riskLevel, liquidityRating, marketTrends, demographicFactors, recommendationScore, supportingData)
```

#### Car Configurator Tables
```sql
-- Available base vehicles
car_models (id, make, model, yearStart, yearEnd, category, basePrice, popularity, imageUrl)

-- Engine swap options  
engine_options (id, manufacturer, engineName, displacement, horsepower, torque, price, compatibility, fuelType, aspirationType)

-- Transmission choices
transmission_options (id, manufacturer, transmissionName, type, gears, torqueRating, price, compatibility)

-- Paint and finish options
color_options (id, colorName, colorCode, finish, price, category, manufacturer, popularity)

-- Wheel packages
wheel_options (id, brand, wheelName, diameter, width, offset, price, style, material, compatibility)

-- Interior packages
interior_options (id, packageName, description, materials, features, price, compatibility, manufacturer)

-- Customer configurations
user_configurations (id, userId, carModelId, engineId, transmissionId, colorId, wheelId, interiorId, additionalOptions, totalPrice, configurationName, createdAt, updatedAt)
```

### Database Operations

#### Initial Setup
```bash
# Push schema to database
npm run db:push

# Seed with initial data
npm run db:seed

# Process authentic research documents
npx tsx server/scripts/processDirectData.ts
```

#### Authentic Data Processing
```bash
# Process all research documents
cd /home/runner/workspace && npx tsx server/scripts/processDirectData.ts

# Check processing status
curl http://localhost:5000/api/processing-status

# Access authentic data via API
curl http://localhost:5000/api/authentic-data/marketValuations
curl http://localhost:5000/api/authentic-data/builderProfiles
curl http://localhost:5000/api/authentic-data/technicalSpecs
```

## Site Overview

Skinny's Rod and Custom is a premium digital platform for restomod automotive enthusiasts, providing an immersive and data-driven exploration of classic car transformations and market insights. The platform features advanced, interactive market analysis tools, cutting-edge visualization technologies, and comprehensive research on valuations powered by authentic industry data.

## Codebase Structure

### Frontend Architecture (`client/`)
```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── home/         # Homepage components
│   │   ├── market/       # Market analysis components
│   │   └── layout/       # Layout components
│   ├── pages/            # Route pages
│   │   ├── Home.tsx
│   │   ├── MarketAnalysis.tsx
│   │   ├── Projects.tsx
│   │   └── About.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   └── App.tsx           # Main application router
```

### Backend Architecture (`server/`)
```
server/
├── services/             # Business logic services
│   ├── authenticDataProcessor.ts    # Research data processing
│   ├── directDataProcessor.ts       # Document parsing
│   ├── authenticDataIntegration.ts  # Data integration layer
│   ├── marketDataService.ts         # Market research API
│   └── contentGenerationService.ts  # AI content generation
├── api/                  # API endpoint handlers
│   ├── articles.ts       # Research articles API
│   └── processResearchData.ts       # Data processing endpoints
├── scripts/              # Utility scripts
│   ├── processDirectData.ts         # Main data processing script
│   └── init-database.js             # Database initialization
├── auth.ts               # Authentication middleware
├── routes.ts             # Main API routes
├── storage.ts            # Database operations
└── index.ts              # Server entry point
```

### Schema & Database (`shared/` & `db/`)
```
shared/
└── schema.ts             # Complete database schema definitions

db/
├── index.ts              # Database connection
└── seed.ts               # Database seeding
```

## API Endpoints

### Core Business APIs
```
GET  /api/projects                    # All projects
GET  /api/projects/featured           # Featured project
GET  /api/projects/:slug              # Project by slug
GET  /api/testimonials                # Client testimonials
GET  /api/team-members                # Team profiles
GET  /api/about                       # Company information
```

### Authentic Research Data APIs
```
GET  /api/authentic-data/marketValuations      # Market pricing data
GET  /api/authentic-data/builderProfiles       # Premium shop profiles
GET  /api/authentic-data/technicalSpecs        # Technical specifications
GET  /api/authentic-data/eventVenues           # Car show venues
GET  /api/authentic-data/vendorPartnerships    # Affiliate partnerships
GET  /api/authentic-data/buildGuides           # Build instructions
GET  /api/authentic-data/investmentAnalytics   # Investment insights
```

### Market Research APIs
```
GET  /api/market-insights              # Live market data
GET  /api/research-articles            # All research articles
GET  /api/research-articles/:id        # Article by ID
GET  /api/research-articles/category/:category  # Articles by category
```

### Processing & Status APIs
```
GET  /api/processing-status            # Data processing status
POST /api/process-research-data        # Trigger data processing
GET  /api/health-check                 # System health status
```

### Car Configurator APIs
```
GET  /api/car-models                   # Available base vehicles
GET  /api/engine-options               # Engine swap options
GET  /api/transmission-options         # Transmission choices
GET  /api/color-options                # Paint options
GET  /api/wheel-options                # Wheel packages
GET  /api/interior-options             # Interior packages
POST /api/user-configurations          # Save customer configuration
```

## Navigation Structure

### Main Navigation
- **Our Projects**: Explore completed custom builds and restomods
- **Process**: How we transform classics into modern masterpieces
- **About Us**: Meet our team and discover our passion for automotive excellence
- **Resources**: Educational articles and guides for restomod enthusiasts
- **Archive**: Browse our historical collection of classic and custom builds
- **Build Your Restomod**: AI-powered tool to create your dream custom build

### Market Research Navigation
- **Market Insights**: Industry trends and investment data for the restomod market
- **Restomod Valuations**: Detailed pricing analytics for specific restomod models
- **Market Analysis**: Comprehensive data on restomod market growth and investment metrics
- **Mustang Guide**: Expert guide to Ford Mustang restomod builds and valuations

## Key Pages

### Model Values Page
The Model Values page provides accurate, detailed pricing information for specific restomod models based on real auction data from Hagerty, Barrett-Jackson, Mecum, and RM Sotheby's.

**Features**:
- Comprehensive pricing details for 13 classic car models
- Interactive filtering by vehicle category
- Detailed auction history and recent sales data
- Value appreciation metrics comparing classic and restomod values
- Visual data presentation with animated charts
- AI-powered research capability

### Market Analysis Page
The Market Analysis page provides comprehensive market data, trends, and investment metrics for the restomod market.

**Features**:
- Current market size and projections
- Interactive charts showing growth patterns
- Demographic analysis of buyers
- ROI analysis for different vehicle categories
- Regional market hotspots
- Performance comparisons

## UI Components

### Global Components
- **Navigation**: Hamburger menu with categorized navigation links and descriptions
- **Breadcrumbs**: Hierarchical navigation showing current page context
- **PageHeader**: Consistent header designs across all main pages
- **Footer**: Site information, quick links, and legal information

### Animation System
The site uses a consistent animation system powered by Framer Motion:
- Staggered reveal animations for content sections
- Scroll-triggered animations for dynamic page elements
- Interactive hover and micro-interactions
- Page transitions between routes

### Data Visualization
Data visualization is implemented using Recharts and D3.js:
- Bar charts for value comparisons
- Line charts for historical trends
- Area charts for market projections
- Radar charts for vehicle performance metrics

## AI Integration

The site features several AI-powered components:
- **Car Configurator**: AI-guided custom build creation
- **Realtime Research**: Market data powered by Perplexity API
- **Article Generation**: Automated content creation for car shows and events

## Technology Stack

- **Frontend**: React with Vite
- **State Management**: TanStack React Query
- **Routing**: wouter
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **Data Visualization**: Recharts, D3.js
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with passport.js
- **AI Integration**: Perplexity API, Google Gemini API

## Responsive Design

The site is fully responsive with optimizations for:
- Mobile devices (including iPhone)
- Tablets
- Desktop
- Large monitors

## Authentic Data Integration

### Research Document Processing
Your authentic automotive industry data is processed from these research documents:
- **Classic Restomod Valuations.txt** → Market pricing data (5 records)
- **1960s Ford Restomod How To.md** → Technical specifications (3 records)
- **Research - Car Show Sites and PRD.txt** → Event venues (2 records)
- **Research Affiliate with Cars.txt** → Vendor partnerships (2 records)
- **Restomod Research Market.txt** → Investment analytics (5 records)

### Data Processing Workflow
1. **Document Analysis**: AI extracts structured data from your research files
2. **Data Validation**: Ensures authentic automotive industry information
3. **API Integration**: Makes data available through REST endpoints
4. **Frontend Display**: Renders authentic data across all pages

### Deployment Instructions

#### Environment Setup
```bash
# Required environment variables
DATABASE_URL=postgresql://user:password@host:port/database
PERPLEXITY_API_KEY=your_perplexity_key
GEMINI_API_KEY=your_gemini_key
```

#### Database Initialization
```bash
# Initial setup
npm run db:push
npm run db:seed

# Process authentic research data
npx tsx server/scripts/processDirectData.ts
```

#### Health Check Commands
```bash
# Check system status
curl http://localhost:5000/api/processing-status

# Verify authentic data availability
curl http://localhost:5000/api/authentic-data/marketValuations
```