# Skinny's Rod and Custom - Site Documentation

## Site Overview

Skinny's Rod and Custom is a premium digital platform for restomod automotive enthusiasts, providing an immersive and data-driven exploration of classic car transformations and market insights. The platform features advanced, interactive market analysis tools, cutting-edge visualization technologies, and comprehensive research on valuations.

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

## Recent Enhancements

### Model Values Page Enhancements
- Added animated entry effects and transitions
- Implemented breadcrumb navigation for improved user orientation
- Created interactive pricing summary section
- Enhanced visual data presentation with animated charts
- Improved filtering and categorization of model data
- Added 13 accurate model valuations with exact pricing data
- Created comparison between classic and restomod values
- Integrated real auction data from Barrett-Jackson, Mecum, and RM Sotheby's

### Navigation Improvements
- Reorganized navigation into logical categories
- Added descriptive text for each navigation item
- Improved mobile menu organization
- Added breadcrumb component for improved navigation clarity

### Documentation
- Created comprehensive site documentation
- Added detailed code comments
- Documented animation patterns and UI components