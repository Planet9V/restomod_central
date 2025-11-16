# Database Schema Specification v1.0
## Luxury Classic Car Marketplace - PostgreSQL + pgvector

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** DRAFT - Awaiting Approval

---

## 1. Database Technology Stack

### Primary Database
- **Engine:** PostgreSQL 15+
- **Extensions:**
  - `pgvector` - Vector similarity search for AI
  - `pg_trgm` - Trigram indexing for fuzzy text search
  - `uuid-ossp` - UUID generation
  - `pg_cron` - Scheduled tasks (scraping jobs)

### ORM & Migrations
- **ORM:** Drizzle ORM
- **Migration Tool:** Drizzle Kit
- **Type Safety:** TypeScript with Zod validation

### Connection
- **Pool Size:** 10-20 connections
- **Timeout:** 30 seconds
- **SSL:** Required in production

---

## 2. Core Tables

### 2.1 users
**Purpose:** User authentication and profiles

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'USA',

  -- Account status
  is_admin BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,

  -- Password reset
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_enabled ON users(enabled);
CREATE INDEX idx_users_admin ON users(is_admin);
```

**Drizzle Schema:**
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("USA"),
  isAdmin: boolean("is_admin").default(false),
  enabled: boolean("enabled").default(true),
  emailVerified: boolean("email_verified").default(false),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});
```

---

### 2.2 cars_for_sale
**Purpose:** Primary vehicle listings with AI embeddings

```sql
CREATE TABLE cars_for_sale (
  id SERIAL PRIMARY KEY,

  -- Core vehicle data
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Vehicle details
  vin VARCHAR(17) UNIQUE,
  stock_number VARCHAR(50) UNIQUE,
  mileage INTEGER,
  exterior_color VARCHAR(100),
  interior_color VARCHAR(100),
  engine VARCHAR(255),
  transmission VARCHAR(100),
  drivetrain VARCHAR(50), -- 'RWD', 'FWD', 'AWD', '4WD'
  fuel_type VARCHAR(50), -- 'Gasoline', 'Diesel', 'Electric', 'Hybrid'
  body_style VARCHAR(50), -- 'Coupe', 'Sedan', 'Convertible', 'Wagon', etc.

  -- Location
  location_city VARCHAR(100),
  location_state VARCHAR(50),
  location_country VARCHAR(50) DEFAULT 'USA',
  location_region VARCHAR(50), -- 'West', 'South', 'Midwest', 'Northeast'
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Source tracking
  source_type VARCHAR(50) NOT NULL, -- 'gateway', 'classiccars', 'bring_a_trailer', etc.
  source_name VARCHAR(100) NOT NULL,
  source_url TEXT,

  -- Media
  image_url TEXT,
  gallery_images JSONB, -- Array of image URLs
  video_url TEXT,

  -- Description & features
  title TEXT,
  description TEXT,
  features JSONB, -- Flexible JSON for various features
  modifications JSONB, -- List of modifications

  -- Condition & history
  condition VARCHAR(50), -- 'Excellent', 'Good', 'Fair', 'Driver', 'Project'
  restoration_level VARCHAR(50), -- 'Concours', '#1', '#2', '#3', '#4', 'Unrestored'
  ownership_history TEXT,
  service_records BOOLEAN DEFAULT false,

  -- Investment analysis
  investment_grade VARCHAR(10), -- 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+'
  appreciation_rate DECIMAL(5, 2), -- 35.2 = 35.2% per year
  market_trend VARCHAR(20), -- 'rising', 'stable', 'declining'
  valuation_confidence DECIMAL(3, 2), -- 0.85 = 85% confidence
  rarity_score INTEGER, -- 0-100

  -- Market data
  market_data JSONB, -- Comparable sales, price trends, etc.
  avg_market_price DECIMAL(12, 2),
  price_variance DECIMAL(5, 2), -- Percentage vs market avg

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,

  -- AI & search
  embedding vector(1536), -- OpenAI ada-002 embeddings
  search_vector tsvector, -- Full-text search

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'pending', 'archived'
  featured BOOLEAN DEFAULT false,
  sold_date TIMESTAMP,
  sold_price DECIMAL(12, 2),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  scraped_at TIMESTAMP,
  verified_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_cars_make ON cars_for_sale(make);
CREATE INDEX idx_cars_model ON cars_for_sale(model);
CREATE INDEX idx_cars_year ON cars_for_sale(year);
CREATE INDEX idx_cars_price ON cars_for_sale(price);
CREATE INDEX idx_cars_location_state ON cars_for_sale(location_state);
CREATE INDEX idx_cars_source_type ON cars_for_sale(source_type);
CREATE INDEX idx_cars_status ON cars_for_sale(status);
CREATE INDEX idx_cars_featured ON cars_for_sale(featured);
CREATE INDEX idx_cars_investment_grade ON cars_for_sale(investment_grade);

-- Vector similarity search index
CREATE INDEX ON cars_for_sale USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search index
CREATE INDEX idx_cars_search ON cars_for_sale USING gin(search_vector);

-- Composite indexes for common queries
CREATE INDEX idx_cars_make_model_year ON cars_for_sale(make, model, year);
CREATE INDEX idx_cars_status_featured ON cars_for_sale(status, featured);
```

---

### 2.3 car_show_events
**Purpose:** Automotive events with geolocation and AI embeddings

```sql
CREATE TABLE car_show_events (
  id SERIAL PRIMARY KEY,

  -- Event basics
  event_name VARCHAR(255) NOT NULL,
  event_slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- Location
  venue_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(50) DEFAULT 'USA',
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Date & time
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  registration_deadline TIMESTAMP,

  -- Event classification
  event_type VARCHAR(50) NOT NULL, -- 'car_show', 'auction', 'concours', 'cruise_in', 'swap_meet'
  event_category VARCHAR(50), -- 'classic', 'muscle', 'hot_rod', 'exotic', 'jdm', 'general'

  -- Vehicle focus (Phase 5 enhancements)
  vehicle_makes JSONB, -- ['Ford', 'Chevrolet']
  vehicle_models JSONB, -- ['Mustang', 'Camaro']
  primary_vehicle_focus VARCHAR(20), -- 'make' | 'model' | 'category' | 'era' | 'general'

  -- Organizer info
  organizer_name VARCHAR(255),
  organizer_email VARCHAR(255),
  organizer_phone VARCHAR(50),
  website TEXT,

  -- Entry & fees
  entry_fee_spectator DECIMAL(8, 2),
  entry_fee_participant DECIMAL(8, 2),

  -- Event details
  capacity INTEGER,
  expected_attendance_min INTEGER,
  expected_attendance_max INTEGER,
  features JSONB, -- ['live_music', 'food_vendors', 'awards_ceremony']
  amenities JSONB, -- ['parking', 'restrooms', 'shade', 'seating']
  judging_classes JSONB, -- ['Best in Show', 'People\'s Choice']
  awards JSONB, -- List of trophies/prizes

  -- Flags
  food_vendors BOOLEAN DEFAULT false,
  swap_meet BOOLEAN DEFAULT false,
  live_music BOOLEAN DEFAULT false,
  kids_activities BOOLEAN DEFAULT false,

  -- Media
  image_url TEXT,
  gallery_images JSONB,

  -- Source tracking
  source_url TEXT,
  data_source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'scraped', 'api'

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'postponed', 'completed'
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,

  -- AI & search
  embedding vector(1536),
  search_vector tsvector,

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_events_city ON car_show_events(city);
CREATE INDEX idx_events_state ON car_show_events(state);
CREATE INDEX idx_events_start_date ON car_show_events(start_date);
CREATE INDEX idx_events_type ON car_show_events(event_type);
CREATE INDEX idx_events_category ON car_show_events(event_category);
CREATE INDEX idx_events_status ON car_show_events(status);
CREATE INDEX idx_events_featured ON car_show_events(featured);

-- Vector similarity search
CREATE INDEX ON car_show_events USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Full-text search
CREATE INDEX idx_events_search ON car_show_events USING gin(search_vector);

-- Geospatial index for nearby events
CREATE INDEX idx_events_location ON car_show_events USING gist (ll_to_earth(latitude, longitude));
```

---

### 2.4 user_bookmarks
**Purpose:** Save cars and events for later

```sql
CREATE TABLE user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL, -- 'car' | 'event'
  item_id INTEGER NOT NULL,

  -- Optional notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_item ON user_bookmarks(item_type, item_id);
CREATE UNIQUE INDEX idx_bookmarks_unique ON user_bookmarks(user_id, item_type, item_id);
```

---

### 2.5 admin_settings
**Purpose:** System configuration and API keys

```sql
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50), -- 'api_key', 'database', 'scraper', 'general'
  is_encrypted BOOLEAN DEFAULT false,
  description TEXT,

  -- Audit trail
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id)
);

-- Examples:
-- { key: 'anthropic_api_key', value: 'sk-ant-...', type: 'api_key', encrypted: true }
-- { key: 'max_scrape_batch_size', value: '100', type: 'scraper', encrypted: false }
-- { key: 'default_currency', value: 'USD', type: 'general', encrypted: false }
```

---

### 2.6 scraping_schedules
**Purpose:** Configure automated scraping jobs

```sql
CREATE TABLE scraping_schedules (
  id SERIAL PRIMARY KEY,

  -- Source identification
  source_name VARCHAR(100) NOT NULL,
  source_type VARCHAR(50), -- 'playwright', 'brave_api', 'perplexity', 'api'
  source_url TEXT,

  -- Scheduling
  schedule_cron VARCHAR(100), -- '0 2 * * *' = daily at 2am
  enabled BOOLEAN DEFAULT true,

  -- Configuration
  config JSONB, -- Selectors, proxies, delays, etc.

  -- Anti-bot strategies
  use_stealth BOOLEAN DEFAULT false,
  use_proxy BOOLEAN DEFAULT false,
  proxy_type VARCHAR(50), -- 'residential', 'datacenter', 'rotating'
  user_agent VARCHAR(255),

  -- Rate limiting
  max_requests_per_minute INTEGER DEFAULT 10,
  delay_between_requests_ms INTEGER DEFAULT 2000,

  -- Execution tracking
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  last_status VARCHAR(50), -- 'success', 'failed', 'partial'
  consecutive_failures INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.7 scraping_logs
**Purpose:** Track scraping job executions

```sql
CREATE TABLE scraping_logs (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES scraping_schedules(id) ON DELETE CASCADE,

  -- Execution details
  status VARCHAR(50) NOT NULL, -- 'running', 'success', 'failed', 'partial'
  items_scraped INTEGER DEFAULT 0,
  items_inserted INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,

  -- Error tracking
  errors JSONB, -- Array of error messages
  error_summary TEXT,

  -- Performance
  duration_seconds INTEGER,
  memory_used_mb INTEGER,

  -- Timestamps
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP
);

-- Index for recent logs
CREATE INDEX idx_scraping_logs_schedule ON scraping_logs(schedule_id, started_at DESC);
```

---

### 2.8 ai_chat_conversations
**Purpose:** Store AI chat history

```sql
CREATE TABLE ai_chat_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,

  -- Conversation metadata
  title VARCHAR(255), -- Auto-generated from first message
  page_context VARCHAR(100), -- 'homepage', 'car_detail', 'event_map', etc.

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.9 ai_chat_messages
**Purpose:** Individual chat messages

```sql
CREATE TABLE ai_chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,

  -- AI metadata (for assistant messages)
  model VARCHAR(50), -- 'claude-3-5-sonnet-20241022'
  tokens_used INTEGER,
  response_time_ms INTEGER,

  -- Vector search context (if used)
  context_cars JSONB, -- Cars retrieved for context
  context_events JSONB, -- Events retrieved for context

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for retrieving conversation messages
CREATE INDEX idx_chat_messages_conversation ON ai_chat_messages(conversation_id, created_at);
```

---

### 2.10 price_history
**Purpose:** Track price changes for trend analysis

```sql
CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES cars_for_sale(id) ON DELETE CASCADE,

  -- Price data
  price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Source tracking
  source_type VARCHAR(50) NOT NULL, -- 'import', 'update', 'market_analysis'
  source_name VARCHAR(100),

  -- Timestamps
  recorded_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for price trend queries
CREATE INDEX idx_price_history_vehicle ON price_history(vehicle_id, recorded_date DESC);
```

---

## 3. Supporting Tables

### 3.1 user_activity_log
**Purpose:** Audit trail for user actions

```sql
CREATE TABLE user_activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Activity details
  action VARCHAR(100) NOT NULL, -- 'login', 'bookmark_car', 'view_event', etc.
  resource_type VARCHAR(50), -- 'car', 'event', 'user'
  resource_id INTEGER,

  -- Request metadata
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for user activity queries
CREATE INDEX idx_activity_user_date ON user_activity_log(user_id, created_at DESC);
```

---

### 3.2 email_notifications
**Purpose:** Track sent email notifications

```sql
CREATE TABLE email_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  -- Email details
  notification_type VARCHAR(50) NOT NULL, -- 'event_reminder', 'price_drop', 'welcome'
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Database Functions & Triggers

### 4.1 Update search_vector on INSERT/UPDATE

```sql
CREATE OR REPLACE FUNCTION update_cars_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.make, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cars_search_vector_update
BEFORE INSERT OR UPDATE ON cars_for_sale
FOR EACH ROW
EXECUTE FUNCTION update_cars_search_vector();
```

### 4.2 Update events search_vector

```sql
CREATE OR REPLACE FUNCTION update_events_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.event_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_search_vector_update
BEFORE INSERT OR UPDATE ON car_show_events
FOR EACH ROW
EXECUTE FUNCTION update_events_search_vector();
```

### 4.3 Auto-update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars_for_sale
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON car_show_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. Migration Strategy

### Phase 1: SQLite to PostgreSQL
1. Export existing SQLite data to JSON/CSV
2. Create PostgreSQL schema with migrations
3. Import data with transformations
4. Validate data integrity
5. Add indexes and constraints
6. Switch connection string

### Phase 2: Add Vector Support
1. Install pgvector extension
2. Add embedding columns
3. Generate embeddings for existing data
4. Create vector indexes
5. Test vector search performance

### Phase 3: Add New Tables
1. Create admin_settings table
2. Create scraping_schedules table
3. Create ai_chat_conversations table
4. Create price_history table
5. Seed initial data

---

## 6. Performance Considerations

### Indexes
- Primary indexes on all foreign keys
- Composite indexes for common queries
- Vector indexes with appropriate list size
- Partial indexes for filtered queries

### Partitioning (Future)
- Partition price_history by year
- Partition scraping_logs by month
- Partition user_activity_log by month

### Materialized Views (Future)
```sql
CREATE MATERIALIZED VIEW car_market_stats AS
SELECT
  make,
  model,
  year,
  COUNT(*) as listing_count,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  AVG(appreciation_rate) as avg_appreciation
FROM cars_for_sale
WHERE status = 'active'
GROUP BY make, model, year;

-- Refresh daily
CREATE INDEX ON car_market_stats(make, model, year);
```

---

## 7. Data Validation Rules

### cars_for_sale
- year: Between 1900 and current year + 1
- price: >= 0
- mileage: >= 0
- investment_grade: Must be in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']
- status: Must be in ['active', 'sold', 'pending', 'archived']

### car_show_events
- start_date: Must be in the future (for new events)
- end_date: Must be >= start_date
- latitude: Between -90 and 90
- longitude: Between -180 and 180

### user_bookmarks
- No duplicate bookmarks per user
- item_id must exist in corresponding table

---

## 8. Security Considerations

### Sensitive Data
- Password hashes: Use bcrypt with salt
- API keys in admin_settings: Encrypt at rest
- Payment info: Never store, use tokens

### Access Control
- Row-level security (RLS) for user bookmarks
- Admin-only access to admin_settings
- User can only modify their own data

### SQL Injection Prevention
- Use parameterized queries (Drizzle ORM handles this)
- Validate all user inputs
- Escape special characters in search

---

## 9. Backup & Recovery

### Backup Strategy
- **Frequency:** Daily full backup, hourly incrementals
- **Retention:** 30 days
- **Storage:** AWS S3 or equivalent
- **Encryption:** At rest and in transit

### Recovery Plan
- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 1 hour
- **Testing:** Monthly restore drills

---

## 10. Approval Checklist

- [ ] Review table structures and relationships
- [ ] Approve column data types and constraints
- [ ] Verify indexes for performance
- [ ] Confirm migration strategy
- [ ] Validate security measures
- [ ] Approve backup and recovery plan

---

**Status:** READY FOR REVIEW
**Next Step:** Await approval before implementation
**Implementation Time:** 1-2 weeks (including migration and testing)
