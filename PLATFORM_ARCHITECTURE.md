# Platform Architecture & Directory Structure

## Project Tree Structure

```
premium-automotive-platform/
├── client/                                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/                         # Homepage components
│   │   │   │   ├── HeroSection.tsx           # Main hero with market stats
│   │   │   │   ├── GatewayVehiclesSection.tsx # Featured vehicles showcase
│   │   │   │   ├── TestimonialsCarousel.tsx  # Customer testimonials
│   │   │   │   └── QuickSearchComponent.tsx  # Intelligent vehicle search
│   │   │   ├── ui/                           # Shadcn/UI components
│   │   │   │   ├── optimized-navigation.tsx # Regional/category navigation
│   │   │   │   ├── card.tsx                 # Vehicle display cards
│   │   │   │   ├── button.tsx               # Interactive buttons
│   │   │   │   ├── input.tsx                # Search inputs
│   │   │   │   └── select.tsx               # Filter dropdowns
│   │   │   └── layout/                       # Layout components
│   │   │       ├── Header.tsx               # Global navigation
│   │   │       └── Footer.tsx               # Site footer
│   │   ├── pages/
│   │   │   ├── HomePage.tsx                  # Main landing page
│   │   │   ├── GatewayVehicles.tsx          # Unified vehicle browser (625+ cars)
│   │   │   ├── CarsForSale.tsx              # Alternative vehicle view
│   │   │   ├── CarShowEvents.tsx            # Global events (223+ shows)
│   │   │   ├── AIAssistant.tsx              # K.I.T.T. chat interface
│   │   │   ├── MarketAnalysis.tsx           # Investment analytics
│   │   │   └── About.tsx                    # Company information
│   │   ├── hooks/
│   │   │   ├── use-auth.tsx                 # Authentication management
│   │   │   └── use-toast.tsx                # Notification system
│   │   ├── lib/
│   │   │   ├── queryClient.ts               # TanStack Query setup
│   │   │   └── utils.ts                     # Utility functions
│   │   └── services/
│   │       ├── gatewayClassicsData.ts       # Gateway vehicle data
│   │       └── directGatewayData.ts         # Direct API integration
│   ├── public/                               # Static assets
│   └── package.json                          # Frontend dependencies
│
├── server/                                   # Express backend API
│   ├── api/                                 # API route handlers
│   │   ├── ai-assistant.ts                  # K.I.T.T. AI endpoints
│   │   ├── market-research.ts               # Perplexity research
│   │   ├── enhanced-configurator.ts         # Vehicle configurator
│   │   └── gemini-image.ts                  # AI image generation
│   ├── services/                            # Business logic services
│   │   ├── dataService.ts                   # Core data operations
│   │   ├── aiService.ts                     # AI/ML integrations
│   │   ├── geminiEventProcessor.ts          # Event processing
│   │   └── midwestCarShowImporter.ts        # Data import services
│   ├── auth.ts                              # Authentication middleware
│   ├── storage.ts                           # Database operations
│   └── routes.ts                            # Main API routing
│
├── db/                                      # Database configuration
│   ├── index.ts                             # Database connection
│   ├── seed.ts                              # Main seeder
│   ├── seed-car-show-events.ts              # 223+ global events
│   ├── seed-gateway-classics.ts             # Gateway inventory
│   └── seed-enhanced-configurator.ts        # Configurator data
│
├── shared/                                  # Shared TypeScript types
│   └── schema.ts                            # Database schema definitions
│
├── scripts/                                 # Data management scripts
│   ├── global-premium-vehicle-expansion.ts  # Worldwide vehicle aggregation
│   ├── rk-motors-perplexity-scraper.ts     # RK Motors integration
│   ├── complete-400-vehicle-expansion.ts    # Mass vehicle import
│   ├── comprehensive-feature-tests.ts       # Platform testing
│   └── unified-cars-migration.ts            # Data migration tools
│
├── public/                                  # Static web assets
├── attached_assets/                         # Research documents
│   ├── Cars for sale general 2025 May.txt   # Market research
│   ├── Gateway cars St. Louis 2025 may.txt  # Gateway inventory
│   ├── Midwest car shows 2025.txt           # Event data
│   └── [research images and documents]
│
└── documentation/                           # Platform documentation
    ├── COMPREHENSIVE_PLATFORM_DOCUMENTATION.md
    ├── PLATFORM_ARCHITECTURE.md
    ├── MONETIZATION_STRATEGY.md
    ├── NAVIGATION_STRUCTURE.md
    └── DATABASE_MAINTENANCE.md
```

## Core Platform Components

### 1. Unified Vehicle Database (625+ Vehicles)
**Location**: `server/routes.ts` - `/api/gateway-vehicles` endpoint
**Function**: Aggregates authenticated vehicles from 32 global sources
**Sources**: Barrett-Jackson, Mecum, RM Sotheby's, Bonhams, RK Motors, Gateway Classic Cars
**Features**: 
- Investment grading (A+ to B+)
- Appreciation rate analysis
- Regional organization (7 global regions)
- Real-time market trends

### 2. Global Car Show Events (223+ Events)
**Location**: `server/routes.ts` - `/api/car-show-events` endpoint
**Function**: Worldwide automotive event aggregation
**Coverage**: North America, Europe, Asia, Australia
**Features**:
- Event calendars and scheduling
- Regional filtering
- Premium event highlighting
- Integration with vehicle recommendations

### 3. AI-Powered Market Intelligence
**Location**: `server/api/ai-assistant.ts` - K.I.T.T. system
**Function**: Intelligent vehicle recommendations and market analysis
**Capabilities**:
- Personalized vehicle matching
- Investment grade scoring
- Market trend prediction
- Portfolio optimization advice

### 4. Advanced Search & Filtering
**Location**: `client/src/pages/GatewayVehicles.tsx`
**Function**: Multi-parameter vehicle discovery
**Filters**:
- Make, model, year, price range
- Investment grade and appreciation rate
- Geographic region and source
- Market trend and valuation confidence

## Database Schema Overview

### Primary Tables
```sql
cars_for_sale (625+ records)
├── Vehicle identification (make, model, year)
├── Pricing and valuation (price, investment_grade, appreciation_rate)
├── Source tracking (source_type, source_name, location_region)
├── Market analysis (market_trend, valuation_confidence)
└── Media and documentation (image_url, description, research_notes)

car_show_events (223+ records)
├── Event details (event_name, venue, dates)
├── Geographic data (city, state, country)
├── Event classification (event_type, category)
└── Logistics (website, contact, pricing)

research_articles (136+ records)
├── Content management (title, content, category)
├── SEO optimization (slug, meta_description)
└── Publishing workflow (status, featured, dates)
```

## API Endpoints Architecture

### Vehicle Management
- `GET /api/gateway-vehicles` - Unified 625+ vehicle database
- `GET /api/cars-for-sale` - Alternative vehicle browsing
- `GET /api/market-insights` - Real-time market analytics

### Event Management  
- `GET /api/car-show-events` - Global automotive events
- `GET /api/car-show-calendar` - Calendar integration
- `GET /api/car-show-search` - Event discovery

### AI Services
- `POST /api/ai/assistant` - K.I.T.T. chat interface
- `GET /api/ai/historical-context` - Vehicle provenance
- `POST /api/ai/performance-prediction` - Technical analysis

### Research & Analytics
- `POST /api/market-research/search` - Perplexity integration
- `GET /api/market-trends` - Investment analytics
- `POST /api/perplexity/configuration` - AI recommendations
- `GET, POST, DELETE /api/itinerary` - User Itinerary Management
- `GET, PUT /api/user/preferences` - User Preferences Management
- `GET, POST /api/comments/event/:eventId` - Event Commenting
- `GET /api/analytics/events` - Event Data Aggregation

## Technology Stack

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive design system
- **Framer Motion** for sophisticated animations
- **Shadcn/UI** for consistent component library
- **TanStack Query** for efficient data management
- **Wouter** for lightweight client-side routing

### Backend Infrastructure
- **Node.js/Express** with TypeScript
- **SQLite** for portable, file-based data storage
- **Drizzle ORM** with `better-sqlite3` driver for type-safe database operations
- **Anthropic Claude** for intelligent AI assistance
- **Google Gemini** for image analysis and generation
- **Perplexity AI** for real-time market research

### Data Sources Integration
- **Barrett-Jackson**: Premium auction house data
- **Mecum Auctions**: Classic car auction results
- **RM Sotheby's**: Luxury vehicle collections
- **Bonhams**: European auction house inventory
- **RK Motors**: Performance restomod specialists
- **Gateway Classic Cars**: Midwest showroom inventory

### AI & Machine Learning
- **Natural Language Processing**: Vehicle description analysis
- **Computer Vision**: Image recognition and classification
- **Predictive Analytics**: Price forecasting and trend analysis
- **Recommendation Engine**: Personalized vehicle matching
- **Market Intelligence**: Real-time valuation algorithms

## Security & Performance

### Data Protection
- **Authentication**: Secure session management
- **Authorization**: Role-based access control
- **Encryption**: End-to-end data protection
- **Validation**: Input sanitization and type checking

### Performance Optimization
- **Caching**: TanStack Query for efficient data fetching
- **Database Indexing**: Optimized query performance
- **CDN Integration**: Fast global content delivery
- **Lazy Loading**: Progressive content loading

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Real-time performance monitoring
- **User Analytics**: Behavior tracking and optimization
- **Database Health**: Automated monitoring and alerts

## Deployment & DevOps

### Development Environment
- **Local Development**: Node.js/Vite development server (`npm run dev`)
- **Database**: Local SQLite database file (`db/local.db`)
- **Version Control**: Git with automated deployment
- **Testing**: Comprehensive feature testing suite

### Production Infrastructure
- **Hosting**: Scalable cloud infrastructure
- **Database**: Production PostgreSQL with replication
- **Monitoring**: 24/7 uptime and performance monitoring
- **Backup**: Automated daily backups with point-in-time recovery

This architecture supports the platform's mission to become the definitive global resource for premium automotive collecting and investment, combining authentic data sources with advanced AI capabilities for an unparalleled user experience.