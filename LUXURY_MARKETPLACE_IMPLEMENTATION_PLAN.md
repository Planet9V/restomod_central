# Luxury Classic Car Marketplace - Implementation Plan
## Rolls-Royce Themed Platform with Advanced AI

**Target:** Scale from 625 to 5,000 cars | 223 to 2,000 events
**Timeline:** 8-12 weeks
**Stack:** Next.js, PostgreSQL + pgvector, ShadCN UI, Tailwind, AI Chat

---

## Phase 1: Database & Infrastructure (Week 1-2)

### 1.1 PostgreSQL with pgvector Setup
**Current:** SQLite with basic schema
**Target:** PostgreSQL with vector embeddings for AI

**Tasks:**
- [ ] Install pgvector extension
- [ ] Migrate SQLite schema to PostgreSQL
- [ ] Add vector columns to cars_for_sale and car_show_events
- [ ] Create embeddings for all existing content
- [ ] Set up connection pooling (pg-pool)

**Schema Additions:**
```sql
-- Vector embeddings for AI search
ALTER TABLE cars_for_sale ADD COLUMN embedding vector(1536);
ALTER TABLE car_show_events ADD COLUMN embedding vector(1536);

-- User bookmarks
CREATE TABLE user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'car' or 'event'
  item_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced user profiles
ALTER TABLE users ADD COLUMN city VARCHAR(100);
ALTER TABLE users ADD COLUMN enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;

-- Admin settings
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50), -- 'api_key', 'database', 'scraper'
  is_encrypted BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id)
);

-- Scraping schedules
CREATE TABLE scraping_schedules (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(100) NOT NULL,
  source_type VARCHAR(50), -- 'playwright', 'brave_api', 'perplexity'
  url TEXT,
  schedule_cron VARCHAR(100), -- '0 2 * * *' = daily at 2am
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  config JSONB, -- Anti-bot strategies, selectors, etc
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scraping logs
CREATE TABLE scraping_logs (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES scraping_schedules(id),
  status VARCHAR(50), -- 'success', 'failed', 'partial'
  items_scraped INTEGER DEFAULT 0,
  errors TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

---

## Phase 2: Luxury Design System (Week 2-3)

### 2.1 Rolls-Royce Theme Implementation
**Inspiration:**
- Rolls-Royce website: Minimalist luxury, expansive whitespace
- McKinney Hot Rods: Bold typography, automotive heritage

**Color Palette:**
```css
:root {
  /* Primary Luxury */
  --rr-purple: #6B2C91;        /* Rolls-Royce signature purple */
  --rr-silver: #C0C0C0;        /* Chrome accent */
  --rr-black: #1A1A1A;         /* Deep black */
  --rr-white: #FEFEFE;         /* Pure white */

  /* McKinney Accents */
  --hot-rod-red: #C41E3A;      /* Classic hot rod red */
  --chrome-gold: #D4AF37;      /* Polished chrome/gold */
  --garage-grey: #4A4A4A;      /* Workshop grey */

  /* Backgrounds */
  --luxury-bg: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
  --card-bg: rgba(255, 255, 255, 0.03);
  --glass-bg: rgba(255, 255, 255, 0.05);
}
```

**Typography:**
```css
/* Headings: Luxury serif */
--font-heading: 'Playfair Display', 'Cormorant Garamond', serif;

/* Body: Clean sans-serif */
--font-body: 'Inter', 'Roboto', sans-serif;

/* Display: Bold statements */
--font-display: 'Oswald', 'Bebas Neue', sans-serif;
```

**Components to Create:**
- LuxuryHero: Full-screen hero with parallax
- GlassCard: Frosted glass effect cards
- ChromeButton: Metallic button with shine animation
- VehicleShowcase: 3D tilt effect for car cards
- EventTimeline: Elegant timeline for events

### 2.2 Key UI Patterns
1. **Homepage:** Cinematic hero → Featured vehicles carousel → Upcoming events → AI chat prompt
2. **Car Listings:** Masonry grid with hover animations → Filter sidebar → Sort by investment grade
3. **Event Map:** Interactive map with clustered markers → Side panel with event details
4. **Admin Dashboard:** Dark mode analytics → Real-time stats → User management table

---

## Phase 3: AI Chat Integration (Week 3-4)

### 3.1 Global AI Chat Widget
**Features:**
- Persistent chat bubble on all pages
- Context-aware responses (knows what page user is on)
- Vector search integration for accurate answers
- Natural language queries: "Find me a 1969 Mustang under $50k near Chicago"

**Implementation:**
```typescript
// client/src/components/ai/GlobalAIChat.tsx
- Floating chat button (bottom-right)
- Expandable chat window (400px width)
- Message history with user/assistant bubbles
- Streaming responses (SSE)
- Quick actions: "Find cars", "Nearby events", "Market trends"
- Voice input option (optional)
```

**Backend Service:**
```typescript
// server/services/ai/chatService.ts
- embedQuery(): Convert user question to vector
- vectorSearch(): Search cars/events using pgvector
- generateResponse(): Stream Claude response
- contextEnrichment(): Add page context to prompts
```

**API Endpoints:**
```
POST /api/ai/chat
  - Body: { message, conversationId, pageContext }
  - Response: SSE stream of chunks

GET /api/ai/suggestions
  - Returns: Quick action suggestions based on page

POST /api/ai/embed
  - Body: { content, type }
  - Response: { embedding: number[] }
```

### 3.2 Admin AI Analytics
**Features:**
- Price prediction models by make/model/year
- Market trend analysis with visualizations
- Investment recommendations
- Anomaly detection (unusually priced vehicles)

**Dashboard Widgets:**
- Price Trend Forecasts (Chart.js line charts)
- Hot Market Indicators (Rising/Falling badges)
- AI-Generated Market Reports (Auto-generated insights)
- Pricing Recommendations (Suggest optimal pricing)

---

## Phase 4: Advanced Scraping System (Week 4-5)

### 4.1 Anti-Bot Detection Bypass
**Strategy:** Multi-method approach with rotation

**Method 1: Playwright Stealth**
```typescript
// server/services/scraping/playwrightScraper.ts
- playwright-extra with stealth plugin
- Residential proxy rotation
- Random user agents
- Human-like mouse movements
- Random delays between actions
- Cookie management
```

**Method 2: Brave Search API**
```typescript
// server/services/scraping/braveApiScraper.ts
- Official API: 2,000 free queries/month
- Structured data extraction
- No bot detection issues
- Rate limiting compliance
```

**Method 3: Perplexity AI Scraping**
```typescript
// server/services/scraping/perplexityScraper.ts
- Ask Perplexity to find car listings
- Parse structured responses
- Verify data before insertion
- Use for hard-to-scrape sources
```

**Method 4: Rotating Proxies + Headers**
```typescript
// Residential proxy pool
- Bright Data / Oxylabs integration
- IP rotation every N requests
- Geographic targeting
- Request fingerprinting randomization
```

### 4.2 Target Sources (5000 Cars Goal)
**Current: 625 cars** → **Target: 5000 cars**

**New Sources to Add:**
1. **ClassicCars.com** (1500 listings) - Playwright
2. **Bring a Trailer** (800 listings) - API scraping
3. **Hemmings** (1000 listings) - Playwright stealth
4. **eBay Motors Classics** (600 listings) - API
5. **Cars & Bids** (500 listings) - Playwright
6. **Mecum Auctions** (400 listings) - Perplexity + verification
7. **Barrett-Jackson** (200 listings) - Manual + API

**Scraping Schedule:**
```typescript
// Examples:
{
  sourceName: "ClassicCars.com",
  sourceType: "playwright",
  url: "https://classiccars.com/listings/find/all-years",
  scheduleCron: "0 3 * * *", // 3 AM daily
  config: {
    stealth: true,
    proxy: "residential",
    selectors: {
      listing: ".listing-card",
      title: ".listing-title",
      price: ".listing-price",
      ...
    }
  }
}
```

### 4.3 Event Scraping (2000 Events Goal)
**Current: 223 events** → **Target: 2000 events**

**Sources:**
1. **Goodguys Rod & Custom** - API + Playwright
2. **NSRA Events** - Web scraping
3. **AACA Calendar** - Structured data
4. **Local Car Clubs** - Perplexity discovery
5. **Facebook Events API** - Graph API
6. **Eventbrite Automotive** - API

**Event Data Requirements:**
- Name, Date, Location (city, state, coordinates)
- Type, Category, Description
- Entry fees, Registration deadlines
- Contact info, Website, Images

---

## Phase 5: Admin Dashboard (Week 5-6)

### 5.1 User Management
**Features:**
- User list table with search/filter
- Add new users (admin creation)
- Edit user details (name, email, city, role)
- Enable/Disable accounts (soft delete)
- Reset passwords (generate temp password)
- View user activity (logins, bookmarks, comments)

**Component:**
```typescript
// client/src/pages/admin/UserManagement.tsx
<AdminLayout>
  <UserTable
    users={users}
    onEdit={handleEdit}
    onDisable={handleDisable}
    onResetPassword={handleResetPassword}
  />
  <UserModal
    mode="create" | "edit"
    user={selectedUser}
    onSave={handleSave}
  />
</AdminLayout>
```

**API Endpoints:**
```
GET /api/admin/users
POST /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id (soft delete)
POST /api/admin/users/:id/reset-password
POST /api/admin/users/:id/toggle-status
```

### 5.2 System Configuration
**Settings Management:**

**1. Database Settings:**
- Connection string (encrypted)
- Pool size, timeout settings
- Backup schedules
- Migration history

**2. API Keys:**
- Anthropic Claude API key
- Google Gemini API key
- Perplexity API key
- Brave Search API key
- Map API key (Mapbox/Google Maps)

**3. Scraper Configuration:**
- Enable/disable scrapers
- Schedule adjustments
- Proxy settings
- Rate limits

**Component:**
```typescript
// client/src/pages/admin/SystemSettings.tsx
<Tabs>
  <TabPanel value="database">
    <DatabaseConfig />
  </TabPanel>
  <TabPanel value="api-keys">
    <ApiKeyManager />
  </TabPanel>
  <TabPanel value="scrapers">
    <ScraperScheduler />
  </TabPanel>
</Tabs>
```

### 5.3 Analytics Dashboard
**Metrics:**
- Total cars, events, users
- Recent activity (last 7/30 days)
- Popular searches
- Bookmark trends
- AI chat usage
- Price trend charts
- Investment grade distribution

**AI-Powered Insights:**
```typescript
// Weekly auto-generated report
- Market movers (biggest price changes)
- Hot categories (most interest)
- Geographic trends (which regions are hot)
- Investment opportunities (undervalued cars)
- Event attendance predictions
```

**Visualizations:**
- Line charts: Price trends over time
- Bar charts: Cars by make/year distribution
- Pie charts: Investment grade breakdown
- Heat maps: Geographic concentration
- Tables: Top 10 most viewed, bookmarked, etc.

---

## Phase 6: User Features (Week 6-7)

### 6.1 Enhanced User Profiles
**Registration Fields:**
- Name (first, last)
- Email (unique, validated)
- Password (hashed with bcrypt)
- City (for local recommendations)

**Profile Page:**
```typescript
// client/src/pages/UserProfile.tsx
<ProfileLayout>
  <ProfileHeader user={user} />
  <ProfileTabs>
    <Tab label="My Bookmarks">
      <BookmarkedCars />
      <BookmarkedEvents />
    </Tab>
    <Tab label="Settings">
      <AccountSettings />
    </Tab>
  </ProfileTabs>
</ProfileLayout>
```

### 6.2 Bookmark System
**Features:**
- Bookmark cars and events with one click
- Organized bookmark collections
- Notifications for bookmarked events (7 days before)
- Export bookmarks (CSV, PDF)

**Implementation:**
```typescript
// client/src/components/BookmarkButton.tsx
- Heart icon (outline when not bookmarked, filled when bookmarked)
- Optimistic updates (instant UI feedback)
- Toast notifications
- Login required (redirect to auth if not logged in)

// API
POST /api/bookmarks
  Body: { itemType: 'car' | 'event', itemId: number }

DELETE /api/bookmarks/:id

GET /api/bookmarks
  Query: ?type=car|event&page=1&limit=20
```

### 6.3 Personalized Recommendations
**AI-Driven Suggestions:**
- Based on bookmarks and browsing history
- "You might also like..." sections
- Email digests with new matches
- Price alerts for bookmarked cars

---

## Phase 7: Map Views (Week 7-8)

### 7.1 Event Map
**Library:** Mapbox GL JS (or Google Maps)

**Features:**
- Interactive map with event markers
- Clustered markers for dense areas
- Color-coded by event type
- Click marker → Event details sidebar
- Filter by date range, category, distance
- "Events near me" geolocation

**Component:**
```typescript
// client/src/components/maps/EventMap.tsx
<MapContainer>
  <Map
    markers={events}
    onMarkerClick={showEventDetails}
    clusters={true}
  />
  <EventSidebar
    event={selectedEvent}
    onClose={closeSidebar}
  />
  <MapControls>
    <DateRangePicker />
    <CategoryFilter />
    <RadiusSlider />
  </MapControls>
</MapContainer>
```

**Data Processing:**
```typescript
// Geocode events without coordinates
- Use Mapbox Geocoding API
- Cache coordinates in database
- Bulk geocode existing events
```

### 7.2 Car Listings Map (Bonus)
- Show car locations on map
- Filter by make, year, price
- "Cars near me" feature

---

## Phase 8: Search & Filter Enhancements (Week 8)

### 8.1 Advanced Search
**Current:** Basic filtering
**Target:** Multi-faceted search with AI

**Features:**
- Text search with autocomplete
- Make/model/year dropdowns
- Price range sliders
- Investment grade filters
- Location radius search
- Sort by: relevance, price, date, popularity

### 8.2 Vector Search Integration
**Natural Language Queries:**
```
"Find me a blue convertible muscle car under 60k"
→ Vector similarity search
→ Filter by category, color, price
→ Return ranked results
```

**Implementation:**
```sql
-- Vector similarity search
SELECT * FROM cars_for_sale
ORDER BY embedding <-> $1
LIMIT 20;
```

---

## Phase 9: Performance & Scaling (Week 9-10)

### 9.1 Database Optimization
- Indexes on frequently queried columns
- Materialized views for analytics
- Pagination for large result sets
- Query optimization with EXPLAIN ANALYZE

### 9.2 Caching Strategy
- Redis for frequently accessed data
- Browser caching for static assets
- CDN for images (Cloudflare/AWS CloudFront)
- Service worker for offline support

### 9.3 Image Optimization
- Compress images (WebP format)
- Lazy loading below the fold
- Responsive images (srcset)
- Thumbnail generation

---

## Phase 10: Testing & Deployment (Week 10-12)

### 10.1 Testing
- Unit tests (Vitest)
- Integration tests (Supertest)
- E2E tests (Playwright)
- Load testing (k6)

### 10.2 Deployment
**Option 1: Vercel (Recommended)**
- Next.js optimized
- Automatic deployments
- Edge functions for AI chat

**Option 2: AWS**
- EC2 for backend
- RDS for PostgreSQL
- S3 + CloudFront for assets
- ECS for containerized deployment

**Option 3: Railway/Render**
- Simple deployment
- Built-in PostgreSQL
- Auto-scaling

### 10.3 Monitoring
- Error tracking (Sentry)
- Analytics (Plausible/PostHog)
- Uptime monitoring (UptimeRobot)
- Performance monitoring (Lighthouse CI)

---

## Implementation Priority

### Week 1-2: Foundation
1. PostgreSQL migration + pgvector
2. Database schema enhancements
3. Admin settings infrastructure

### Week 3-4: Core Features
4. AI chat widget (all pages)
5. Luxury theme implementation
6. User bookmarking system

### Week 5-6: Admin & Scraping
7. Admin dashboard with user management
8. Scraping system with anti-bot bypass
9. Event map view

### Week 7-8: Scale & Polish
10. Scale to 5000 cars (automated scraping)
11. Scale to 2000 events (automated scraping)
12. Advanced search with vector similarity

### Week 9-10: Testing & Launch
13. Performance optimization
14. Comprehensive testing
15. Production deployment

---

## Technical Stack Summary

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + ShadCN UI
- Framer Motion (animations)
- TanStack Query (data fetching)
- Mapbox GL JS (maps)

**Backend:**
- Node.js + Express
- PostgreSQL 15 + pgvector
- Drizzle ORM
- Redis (caching)

**AI & ML:**
- Anthropic Claude (chat, analysis)
- OpenAI Embeddings (vectors)
- Perplexity API (research)

**Scraping:**
- Playwright (stealth mode)
- Brave Search API
- Residential proxies

**DevOps:**
- Docker (containerization)
- GitHub Actions (CI/CD)
- Vercel/AWS (hosting)

---

## Success Metrics

**By Launch:**
- ✅ 5,000+ classic car listings
- ✅ 2,000+ car events with map view
- ✅ AI chat on all pages with <2s response time
- ✅ Full admin dashboard with analytics
- ✅ User bookmarking and profiles
- ✅ Automated scraping (80% success rate)
- ✅ Luxury Rolls-Royce theme
- ✅ Mobile-responsive design
- ✅ <3s page load times
- ✅ 95%+ uptime

**Post-Launch:**
- 10,000 monthly active users
- 5,000+ bookmarks created
- 1,000+ AI chat conversations
- 50+ events added by community
- $50k+ in facilitated vehicle sales

---

## Budget Estimate

**Infrastructure:**
- PostgreSQL hosting: $50-200/month (Neon, Supabase, RDS)
- Redis caching: $20-50/month
- CDN/Storage: $20-100/month
- Domain + SSL: $20/year

**APIs:**
- Anthropic Claude: $100-500/month (pay per use)
- OpenAI Embeddings: $50-200/month
- Brave Search: Free (2k queries/month)
- Perplexity: $20-200/month
- Mapbox: Free tier → $50/month

**Scraping:**
- Residential proxies: $100-300/month (if needed)
- Playwright stealth: Free (open source)

**Total Monthly:** $360-1,600/month (scales with usage)

---

## Risk Mitigation

**Risk 1: Anti-bot detection**
- **Mitigation:** Multi-method approach, rotate strategies, manual fallback

**Risk 2: Data quality**
- **Mitigation:** Validation pipelines, AI verification, manual review queue

**Risk 3: Scaling costs**
- **Mitigation:** Start with free tiers, optimize queries, cache aggressively

**Risk 4: AI accuracy**
- **Mitigation:** Vector search validation, human-in-the-loop, feedback loops

---

## Next Steps

1. **Review this plan** - Approve scope, timeline, budget
2. **Set up PostgreSQL** - Migrate from SQLite, install pgvector
3. **Design approval** - Review Rolls-Royce theme mockups
4. **Start Phase 1** - Database migration and schema enhancements

**Ready to begin?** Let me know which phase to start with, or if you'd like me to proceed with the full implementation! 🚀
