# Skinny's Rod and Custom - Complete Platform Documentation
*Updated: May 28, 2025 - Matches Current Codebase*

## 🏗️ Database Architecture & Current Data Status

### Active PostgreSQL Database (Neon)
- **Database Provider**: Neon PostgreSQL
- **ORM**: Drizzle ORM with TypeScript
- **Schema Location**: `shared/schema.ts` + `shared/configurator-schema.ts`
- **Configuration**: `drizzle.config.ts`
- **Health Status**: ✅ Connected (90 Gateway vehicles, 203 car show events, 9 projects, 32 research articles)

### Live Database Tables & Current Data
```sql
-- Current authentic data from Gateway Classic Cars
gateway_vehicles (90 records) - Real inventory with pricing from Gateway Classic Cars St. Louis
car_show_events (203 records) - Authentic car show events across Midwest, Southern, and Eastern US
projects (9 records) - Completed restomod projects showcased on site
research_articles (32 records) - AI-generated articles with real market data
testimonials (3 records) - Client testimonials
luxury_showcases (1 record) - Premium vehicle showcases
team_members - Team profiles
companies - Company information
hero_content - Homepage hero content
engineering_features - Technical capabilities
process_steps - Build process information
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

### Current Frontend Architecture (`client/`)
```
client/src/
├── pages/                 # All available routes (19 pages)
│   ├── Home.tsx          # Homepage with featured content
│   ├── CarConfigurator.tsx # Step-by-step car configurator (✅ Restored)
│   ├── CarShowEvents.tsx # 203 authentic car show events
│   ├── GatewayVehicles.tsx # 90 real Gateway Classic Cars inventory
│   ├── MarketAnalysis.tsx # Market data and insights
│   ├── ModelValues.tsx   # Valuation analytics
│   ├── ResearchArticles.tsx # 32 AI-generated research articles
│   ├── ProjectsPage.tsx  # 9 completed restomod projects
│   ├── VehicleArchive.tsx # Classic car archive
│   ├── LuxuryShowcasePage.tsx # Premium vehicle showcases
│   ├── MustangRestomods.tsx # Ford Mustang specialist page
│   ├── Resources.tsx     # Educational resources
│   ├── AdminDashboard.tsx # Admin management interface
│   ├── AuthPage.tsx      # Authentication system
│   ├── ProjectDetail.tsx # Individual project details
│   ├── ArticleDetail.tsx # Research article details
│   ├── CarShowGuide.tsx  # Car show guide
│   ├── LuxuryShowcasesPage.tsx # Luxury showcases listing
│   └── not-found.tsx     # 404 error page
├── components/
│   ├── ui/               # 39 Shadcn/ui components + custom components
│   ├── home/             # Homepage sections (12 components)
│   ├── market/           # Market analysis components (5 components)
│   ├── layout/           # Navigation, header, footer (4 components)
│   ├── configurator/     # Car configurator components (8 components)
│   ├── admin/            # Admin dashboard components (7 components)
│   ├── auth/             # Authentication components
│   ├── animations/       # Framer Motion animations (4 components)
│   └── showcase/         # Luxury showcase components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
├── data/                 # Static data and configurations
├── services/             # API service layers
└── App.tsx               # Main router with all 19 routes
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

## 🔗 Current API Endpoints (All Active)

### Core Business APIs
```
GET  /api/projects                    # All 9 restomod projects
GET  /api/projects/featured           # Featured project showcase
GET  /api/projects/:slug              # Individual project details
GET  /api/testimonials                # 3 client testimonials
GET  /api/about                       # Company information
GET  /api/hero                        # Homepage hero content
GET  /api/engineering                 # Engineering features
GET  /api/process                     # Build process steps
```

### Authentic Car Data APIs (✅ Live Data)
```
GET  /api/gateway-vehicles            # 90 real Gateway Classic Cars with pricing
GET  /api/car-show-events             # 203 authentic car show events
GET  /api/car-show-events?featured=true&limit=6  # Featured events
GET  /api/luxury-showcases            # Premium vehicle showcases
GET  /api/luxury-showcases/featured   # Featured luxury showcases
```

### Car Configurator APIs (✅ Restored & Working)
```
GET  /api/configurator/car-models     # 20 authentic Gateway vehicles for configuration
GET  /api/configurator/engines        # 3 engine options for customization
GET  /api/configurator/transmissions  # 2 transmission options
GET  /api/configurator/colors         # Color customization options
GET  /api/configurator/wheels         # Wheel package options
GET  /api/configurator/interiors      # Interior customization options
```

### Research & Articles APIs
```
GET  /api/research-articles           # 32 AI-generated research articles
GET  /api/research-articles/:id       # Individual article details
GET  /api/research-articles/category/:category # Articles by category
```

### Market Analysis APIs
```
GET  /api/market-insights             # Live market data and trends
GET  /api/market-trends               # Real-time market analysis
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

## 🧭 Current Site Navigation & Cursor Map

### Active Routes & Pages (19 Total)
```
/ (Home)                    # Homepage with featured content and gateway vehicles
/projects                   # 9 completed restomod projects showcase
/car-configurator          # ✅ Step-by-step car configuration (restored)
/car-show-events           # 203 authentic car show events with search
/gateway-vehicles          # 90 real Gateway Classic Cars inventory
/market-analysis           # Market insights and trend analysis
/model-values              # Vehicle valuation analytics
/research-articles         # 32 AI-generated research articles
/vehicle-archive           # Classic car archive and history
/luxury-showcases          # Premium vehicle showcases
/mustang-restomods         # Ford Mustang specialist builds
/resources                 # Educational guides and resources
/admin                     # Admin dashboard (protected route)
/auth                      # Authentication system
/projects/:slug            # Individual project detail pages
/articles/:id              # Research article detail pages
/car-show-guide           # Car show planning guide
/luxury-showcase/:id      # Individual luxury showcase pages
/404                      # Error page for invalid routes
```

### Navigation Menu Structure
**Main Categories:**
- **Our Work**: Projects, Luxury Showcases, Vehicle Archive
- **Build Tools**: Car Configurator, Resources, Mustang Guide
- **Market Data**: Gateway Vehicles, Market Analysis, Model Values
- **Events & Research**: Car Show Events, Research Articles, Car Show Guide
- **Company**: About Us, Process, Team

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

## 🛠️ Current Technology Stack

### Frontend Technologies
- **Framework**: React 18 with Vite
- **State Management**: TanStack React Query v5
- **Routing**: wouter (lightweight React routing)
- **Styling**: Tailwind CSS + 39 shadcn/ui components
- **Animations**: Framer Motion (staggered reveals, page transitions)
- **Data Visualization**: Recharts + D3.js for market charts
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React + React Icons

### Backend Technologies  
- **Server**: Express.js with TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **API Architecture**: RESTful endpoints with validation
- **File Processing**: TypeScript execution with tsx

### AI & External APIs
- **Market Research**: Perplexity API for real-time data
- **Content Generation**: Google Gemini API for articles
- **Image Generation**: Gemini API for automotive imagery
- **Data Sources**: Gateway Classic Cars, authentic car show databases

### Development Tools
- **Build Tool**: Vite with hot module replacement
- **Package Manager**: npm with lock file
- **Database Migration**: Drizzle Kit for schema management
- **Type Safety**: TypeScript throughout entire stack

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