# Specifications Summary
## Luxury Classic Car Marketplace - Complete Technical Specifications

**Version:** 1.0
**Date:** 2025-11-16
**Status:** READY FOR REVIEW AND APPROVAL

---

## Executive Summary

This document provides a comprehensive overview of all technical specifications for transforming the current Restomod Central platform into a luxury Rolls-Royce themed marketplace with advanced AI capabilities, scaling to **5,000 cars** and **2,000 events**.

All specifications follow a **spec-driven development process** as required. **No implementation will begin until all specs are reviewed and approved.**

---

## Specification Documents

### 📊 [SPEC_01: Database Schema](./SPEC_01_DATABASE_SCHEMA.md)
**PostgreSQL + pgvector Architecture**

**Key Components:**
- 12 core tables with comprehensive relationships
- Vector embeddings (1536-dimensional) for AI search
- Full-text search with PostgreSQL tsvector
- User management with admin controls
- Bookmark system for cars and events
- Scraping schedules and logs
- AI chat conversations and messages
- Price history tracking

**Highlights:**
- Automatic search vector updates via triggers
- Materialized views for analytics
- Row-level security for user data
- Comprehensive indexing strategy (vector + text + composite)

**Migration Path:**
1. SQLite → PostgreSQL migration
2. Add pgvector extension
3. Generate embeddings for existing data
4. Create indexes and constraints

---

### 🔌 [SPEC_02: API Endpoints](./SPEC_02_API_ENDPOINTS.md)
**RESTful API with SSE Streaming**

**Endpoint Categories:**
1. **Authentication** (5 endpoints)
   - Register, Login, Refresh, Password Reset

2. **Car Listings** (5 endpoints)
   - Search with advanced filters
   - CRUD operations (admin only)
   - Price history and similar cars

3. **Events** (4 endpoints)
   - Search, Map view, Details, CRUD

4. **Bookmarks** (3 endpoints)
   - Add, Remove, List user bookmarks

5. **AI Chat** (4 endpoints)
   - SSE streaming chat
   - Conversation history
   - Embedding generation

6. **Admin** (12 endpoints)
   - User management
   - System settings
   - Scraper configuration
   - Analytics dashboard

7. **Vector Search** (1 endpoint)
   - Semantic similarity search

**Features:**
- Rate limiting per user tier
- JWT authentication
- Comprehensive error codes
- Pagination and filtering
- SSE for real-time AI responses

---

### 🎨 [SPEC_03: UI/UX Design](./SPEC_03_UI_UX_DESIGN.md)
**Rolls-Royce Luxury Theme + McKinney Hot Rod Aesthetics**

**Design System:**
- **Colors:** Purple (#6B2C91), Chrome Silver, Hot Rod Red, Gold accents
- **Typography:** Cormorant Garamond (headings), Inter (body), Oswald (display)
- **Components:** Glass cards, chrome buttons, luxury navigation
- **Animations:** Subtle parallax, chrome shine effects, smooth transitions

**Key Components:**
1. **Hero Section** - Cinematic full-screen with gradient overlay
2. **Glass Cards** - Frosted glass effect for listings
3. **AI Chat Widget** - Floating with pulse animation
4. **Event Map** - Interactive with custom markers
5. **Navigation** - Fixed top bar with dropdown menus

**Layouts:**
- Homepage: Hero → Carousel → Insights → Events → Testimonials
- Car Listings: Sidebar filters + 3-column masonry grid
- Car Detail: Gallery → Details + Sidebar → Trends → Events
- Event Map: Full map + Filters + Detail sidebar
- Admin: Sidebar + Dashboard content

**Responsive Breakpoints:**
- Mobile: < 640px (single column)
- Tablet: 640-1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

---

### 🤖 [SPEC_04: AI Chat System](./SPEC_04_AI_CHAT_SYSTEM.md)
**K.I.T.T. (Knowledge Intelligence for Timeless Transportation)**

**Architecture:**
```
Frontend (React) → SSE Stream → Express API
   ↓
Chat Service → Embedding Service (OpenAI)
   ↓
Vector Search (pgvector) → Context Cars/Events
   ↓
Claude 3.5 Sonnet (Streaming Response)
```

**Features:**
1. **Vector-Powered Search**
   - OpenAI ada-002 embeddings (1536-dim)
   - PostgreSQL pgvector similarity search
   - Threshold: 0.7 similarity score

2. **Context-Aware AI**
   - Knows current page
   - Enriched prompts with relevant cars/events
   - Multi-turn conversation memory

3. **Streaming Responses**
   - Server-Sent Events (SSE)
   - Token-by-token delivery
   - Real-time context injection

4. **Admin Analytics**
   - Pricing analysis by make/model/year
   - Market trend detection
   - Anomaly identification (20%+ price variance)
   - Investment recommendations

**Performance:**
- Embedding cache (24-hour TTL)
- Rate limiting (10 msg/min)
- Response time target: <2 seconds

---

### 🕷️ [SPEC_05: Scraping System](./SPEC_05_SCRAPING_SYSTEM.md)
**Automated Data Collection with Anti-Bot Bypass**

**Goal:** 5,000 cars + 2,000 events

**Methods:**
1. **Playwright Stealth** (JavaScript sites)
   - playwright-extra + stealth plugin
   - Human-like mouse movements
   - Random scrolling and delays
   - Fingerprint evasion

2. **Brave Search API** (Discovery)
   - 2,000 free queries/month
   - Discover new listings
   - No bot detection

3. **Perplexity AI** (Hard-to-find sources)
   - AI-powered discovery
   - Structured data extraction
   - Event aggregation

**Anti-Bot Strategies:**
- Rotating residential proxies (Bright Data/Oxylabs)
- Random user agents and headers
- Request fingerprinting evasion
- Rate limiting (20 req/min max)
- robots.txt compliance

**Data Pipeline:**
```
Scraping → Normalization → Validation → Deduplication
   ↓
Embedding Generation → PostgreSQL Insert → Success Log
```

**Target Sources:**
**Cars (4,375 new):**
- ClassicCars.com: 1,500
- Bring a Trailer: 800
- Hemmings: 1,000
- eBay Motors: 600
- Cars & Bids: 500
- Others: 975

**Events (1,777 new):**
- Goodguys: 250
- AACA: 300
- Eventbrite: 400
- Facebook Events: 350
- Others: 477

**Scheduling:**
- Daily: High-priority sources (3 AM)
- Twice weekly: Medium-priority (Sun/Wed)
- Monthly: Low-priority (1st of month)

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] PostgreSQL migration + pgvector setup
- [ ] Database schema implementation
- [ ] API endpoint scaffolding
- [ ] Authentication system

**Deliverables:**
- Migrated database with embeddings
- Working auth endpoints
- User management CRUD

---

### Phase 2: Core Features (Week 3-4)
- [ ] AI chat widget (frontend + backend)
- [ ] Vector search implementation
- [ ] SSE streaming responses
- [ ] Luxury theme implementation

**Deliverables:**
- Working AI chat on all pages
- Rolls-Royce themed UI
- Vector-powered search

---

### Phase 3: Data Collection (Week 4-5)
- [ ] Playwright scraper setup
- [ ] Brave API integration
- [ ] Perplexity AI integration
- [ ] Data processing pipeline

**Deliverables:**
- 3+ working scrapers
- Job queue with Redis
- Admin scraper dashboard

---

### Phase 4: Scaling (Week 5-6)
- [ ] Scale to 5,000 cars (automated scraping)
- [ ] Scale to 2,000 events (automated scraping)
- [ ] Admin dashboard with analytics
- [ ] User bookmarking system

**Deliverables:**
- 5,000+ car listings
- 2,000+ events
- Full admin panel

---

### Phase 5: Polish & Launch (Week 7-8)
- [ ] Event map view with markers
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Production deployment

**Deliverables:**
- Interactive event map
- <3s page load times
- 95%+ uptime
- Launch-ready platform

---

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS + ShadCN UI
- **Animation:** Framer Motion
- **State:** TanStack Query
- **Routing:** Wouter
- **Maps:** Mapbox GL JS

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express
- **Database:** PostgreSQL 15 + pgvector
- **ORM:** Drizzle ORM
- **Caching:** Redis
- **Queue:** Bull

### AI & ML
- **Chat:** Anthropic Claude 3.5 Sonnet
- **Embeddings:** OpenAI ada-002
- **Research:** Perplexity AI
- **Search:** PostgreSQL pgvector

### Scraping
- **Browser:** Playwright + stealth plugin
- **API:** Brave Search, Perplexity
- **Proxies:** Bright Data / Oxylabs

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (frontend) / Railway (backend)
- **Monitoring:** Sentry

---

## Budget Estimate

### Development Costs (One-time)
- **Database Migration:** 1-2 weeks @ $5,000
- **AI Chat System:** 2-3 weeks @ $10,000
- **Scraping System:** 3-4 weeks @ $12,000
- **UI/UX Design:** 3-4 weeks @ $10,000
- **Testing & QA:** 1-2 weeks @ $4,000

**Total Development:** $41,000 - $51,000

---

### Monthly Operating Costs

**Infrastructure:**
- PostgreSQL (Neon/Supabase): $50-200/month
- Redis (Upstash): $20-50/month
- CDN/Storage (Cloudflare): $20-100/month
- Domain + SSL: $2/month

**APIs:**
- Anthropic Claude: $100-500/month
- OpenAI Embeddings: $50-200/month
- Perplexity AI: $20-200/month
- Brave Search: Free (2K/month)
- Mapbox: $50/month

**Scraping:**
- Residential Proxies: $100-300/month
- Playwright: Free

**Total Monthly:** $412 - $1,602/month

---

## Success Metrics

### Launch Targets
- ✅ 5,000+ car listings
- ✅ 2,000+ events with map view
- ✅ AI chat on all pages (<2s response)
- ✅ Admin dashboard with full analytics
- ✅ User bookmarking system
- ✅ Automated scraping (80%+ success rate)
- ✅ Luxury Rolls-Royce theme
- ✅ <3s page load times
- ✅ 95%+ uptime

### Post-Launch (3 months)
- 10,000 monthly active users
- 5,000+ bookmarks created
- 1,000+ AI chat conversations
- $50k+ in facilitated sales
- 50+ community-added events

---

## Risk Assessment

### High Risk
1. **Anti-bot detection failure**
   - **Mitigation:** Multi-method approach, proxy rotation, manual fallback

2. **AI accuracy issues**
   - **Mitigation:** Vector search validation, human review, feedback loops

3. **Data quality problems**
   - **Mitigation:** Validation pipelines, deduplication, manual review queue

### Medium Risk
1. **Scaling costs exceed budget**
   - **Mitigation:** Start with free tiers, optimize queries, cache aggressively

2. **Development timeline delays**
   - **Mitigation:** Phased rollout, MVP first, iterate

### Low Risk
1. **User adoption slow**
   - **Mitigation:** Marketing strategy, SEO optimization, social proof

---

## Security Considerations

### Data Protection
- **HTTPS:** Enforced on all endpoints
- **JWT:** Secure token-based auth
- **API Keys:** Encrypted at rest
- **Passwords:** Bcrypt hashing (10 rounds)

### Access Control
- **RBAC:** Admin vs. User roles
- **Row-level security:** Users see only their data
- **Rate limiting:** Prevent abuse

### Compliance
- **GDPR:** Data export, deletion, consent
- **CCPA:** California privacy compliance
- **robots.txt:** Respect site policies

---

## Testing Strategy

### Unit Tests
- Database queries (Drizzle ORM)
- API endpoints (Supertest)
- Vector search accuracy
- Data normalization

### Integration Tests
- End-to-end user flows
- AI chat conversations
- Scraping pipelines
- Payment processing (future)

### Performance Tests
- Load testing (k6)
- Database query optimization
- API response times
- Vector search latency

### User Acceptance Tests
- Beta user testing
- A/B testing for UI
- Feedback collection

---

## Approval Process

### Required Approvals

**SPEC_01: Database Schema**
- [ ] Database tables and relationships
- [ ] Vector column specifications
- [ ] Index strategy
- [ ] Migration plan

**SPEC_02: API Endpoints**
- [ ] Endpoint paths and methods
- [ ] Request/response formats
- [ ] Authentication strategy
- [ ] Rate limiting rules

**SPEC_03: UI/UX Design**
- [ ] Color palette (Rolls-Royce theme)
- [ ] Typography choices
- [ ] Component designs
- [ ] Page layouts

**SPEC_04: AI Chat System**
- [ ] Architecture and data flow
- [ ] Embedding strategy
- [ ] Vector search implementation
- [ ] Streaming approach

**SPEC_05: Scraping System**
- [ ] Scraping methods
- [ ] Anti-bot strategies
- [ ] Target sources
- [ ] Legal compliance

---

## Next Steps

1. **Review all specifications** (You are here!)
2. **Provide feedback and approval**
3. **Prioritize features** (Must-have vs. Nice-to-have)
4. **Approve budget** ($41k-51k dev + $412-1,602/mo ops)
5. **Set timeline** (8-12 weeks recommended)
6. **Begin Phase 1 implementation**

---

## Questions for Stakeholder

Before implementation begins, please confirm:

1. **Budget Approval:**
   - [ ] Approve $41k-51k development budget
   - [ ] Approve $412-1,602/month operating budget

2. **Feature Priority:**
   - [ ] Confirm must-have features for MVP
   - [ ] Identify nice-to-have features for v2

3. **Timeline:**
   - [ ] Approve 8-12 week timeline
   - [ ] Set launch target date

4. **Design:**
   - [ ] Approve Rolls-Royce luxury theme
   - [ ] Request design mockups before implementation?

5. **Data Sources:**
   - [ ] Approve scraping target sources
   - [ ] Any sources to avoid for legal reasons?

6. **AI Features:**
   - [ ] Approve AI chat on all pages
   - [ ] Approve admin AI analytics

---

## Contact

For questions or clarifications on any specification:
- Review individual spec documents in `/docs/`
- Request design mockups or prototypes
- Schedule technical review meeting

---

**Status:** ✅ SPECIFICATIONS COMPLETE - AWAITING APPROVAL
**Date:** 2025-11-16
**Next Action:** Stakeholder review and approval
**Implementation Start:** Upon approval

---

## Appendix: File Structure

```
/docs/
├── SPEC_01_DATABASE_SCHEMA.md         (32KB)
├── SPEC_02_API_ENDPOINTS.md           (45KB)
├── SPEC_03_UI_UX_DESIGN.md            (38KB)
├── SPEC_04_AI_CHAT_SYSTEM.md          (42KB)
├── SPEC_05_SCRAPING_SYSTEM.md         (55KB)
└── SPECIFICATIONS_SUMMARY.md          (This file)

Total: 212KB of comprehensive specifications
```

---

**All specifications follow industry best practices and are production-ready upon approval.** 🚀
