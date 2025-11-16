/**
 * PostgreSQL Schema for Luxury Classic Car Marketplace
 * Phase 1, Task 1.1.4 - Complete Database Migration from SQLite to PostgreSQL
 *
 * Based on:
 * - docs/SPEC_01_DATABASE_SCHEMA.md
 * - shared/schema.ts (SQLite original)
 *
 * PostgreSQL 15+ with pgvector extension
 * Author: Database Architect Agent
 * Date: 2025-11-16
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
  inet,
} from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

/**
 * CORE TABLE: users
 * User authentication and profiles with enhanced admin capabilities
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("USA"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  enabled: boolean("enabled").default(true),
  emailVerified: boolean("email_verified").default(false),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
}, (table) => {
  return {
    emailIdx: index("idx_users_email").on(table.email),
    enabledIdx: index("idx_users_enabled").on(table.enabled),
    adminIdx: index("idx_users_admin").on(table.isAdmin),
  };
});

export const usersRelations = relations(users, ({ one, many }) => ({
  configurations: many(userConfigurations),
  itineraries: many(userItineraries),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  comments: many(eventComments),
  bookmarks: many(userBookmarks),
  conversations: many(aiChatConversations),
  activityLogs: many(userActivityLog),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  homeLocation: jsonb("home_location").$type<{ city?: string; state?: string; zip?: string; }>(),
  preferredCategories: jsonb("preferred_categories").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// User Bookmarks (NEW from SPEC_01)
export const userBookmarks = pgTable("user_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: varchar("item_type", { length: 20 }).notNull(), // 'car' | 'event'
  itemId: integer("item_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index("idx_bookmarks_user").on(table.userId),
    itemIdx: index("idx_bookmarks_item").on(table.itemType, table.itemId),
    uniqueIdx: uniqueIndex("idx_bookmarks_unique").on(table.userId, table.itemType, table.itemId),
  };
});

export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [userBookmarks.userId],
    references: [users.id],
  }),
}));

export const userBookmarksInsertSchema = createInsertSchema(userBookmarks);
export type InsertUserBookmark = z.infer<typeof userBookmarksInsertSchema>;
export type UserBookmark = typeof userBookmarks.$inferSelect;

// ============================================================================
// ADMIN & SYSTEM SETTINGS
// ============================================================================

// Admin Settings (NEW from SPEC_01)
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value"),
  settingType: varchar("setting_type", { length: 50 }), // 'api_key', 'database', 'scraper', 'general'
  isEncrypted: boolean("is_encrypted").default(false),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const adminSettingsInsertSchema = createInsertSchema(adminSettings);
export type InsertAdminSetting = z.infer<typeof adminSettingsInsertSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;

// ============================================================================
// SCRAPING INFRASTRUCTURE (NEW from SPEC_01)
// ============================================================================

export const scrapingSchedules = pgTable("scraping_schedules", {
  id: serial("id").primaryKey(),
  sourceName: varchar("source_name", { length: 100 }).notNull(),
  sourceType: varchar("source_type", { length: 50 }), // 'playwright', 'brave_api', 'perplexity', 'api'
  sourceUrl: text("source_url"),
  scheduleCron: varchar("schedule_cron", { length: 100 }), // '0 2 * * *' = daily at 2am
  enabled: boolean("enabled").default(true),
  config: jsonb("config"), // Selectors, proxies, delays, etc.
  useStealth: boolean("use_stealth").default(false),
  useProxy: boolean("use_proxy").default(false),
  proxyType: varchar("proxy_type", { length: 50 }), // 'residential', 'datacenter', 'rotating'
  userAgent: varchar("user_agent", { length: 255 }),
  maxRequestsPerMinute: integer("max_requests_per_minute").default(10),
  delayBetweenRequestsMs: integer("delay_between_requests_ms").default(2000),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  lastStatus: varchar("last_status", { length: 50 }), // 'success', 'failed', 'partial'
  consecutiveFailures: integer("consecutive_failures").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scrapingSchedulesRelations = relations(scrapingSchedules, ({ many }) => ({
  logs: many(scrapingLogs),
}));

export const scrapingSchedulesInsertSchema = createInsertSchema(scrapingSchedules);
export type InsertScrapingSchedule = z.infer<typeof scrapingSchedulesInsertSchema>;
export type ScrapingSchedule = typeof scrapingSchedules.$inferSelect;

export const scrapingLogs = pgTable("scraping_logs", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").references(() => scrapingSchedules.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 50 }).notNull(), // 'running', 'success', 'failed', 'partial'
  itemsScraped: integer("items_scraped").default(0),
  itemsInserted: integer("items_inserted").default(0),
  itemsUpdated: integer("items_updated").default(0),
  itemsFailed: integer("items_failed").default(0),
  errors: jsonb("errors"), // Array of error messages
  errorSummary: text("error_summary"),
  durationSeconds: integer("duration_seconds"),
  memoryUsedMb: integer("memory_used_mb"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => {
  return {
    scheduleIdx: index("idx_scraping_logs_schedule").on(table.scheduleId),
  };
});

export const scrapingLogsRelations = relations(scrapingLogs, ({ one }) => ({
  schedule: one(scrapingSchedules, {
    fields: [scrapingLogs.scheduleId],
    references: [scrapingSchedules.id],
  }),
}));

export const scrapingLogsInsertSchema = createInsertSchema(scrapingLogs);
export type InsertScrapingLog = z.infer<typeof scrapingLogsInsertSchema>;
export type ScrapingLog = typeof scrapingLogs.$inferSelect;

// ============================================================================
// AI CHAT SYSTEM (NEW from SPEC_01)
// ============================================================================

export const aiChatConversations = pgTable("ai_chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }), // Auto-generated from first message
  pageContext: varchar("page_context", { length: 100 }), // 'homepage', 'car_detail', 'event_map', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
});

export const aiChatConversationsRelations = relations(aiChatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiChatConversations.userId],
    references: [users.id],
  }),
  messages: many(aiChatMessages),
}));

export const aiChatConversationsInsertSchema = createInsertSchema(aiChatConversations);
export type InsertAiChatConversation = z.infer<typeof aiChatConversationsInsertSchema>;
export type AiChatConversation = typeof aiChatConversations.$inferSelect;

export const aiChatMessages = pgTable("ai_chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => aiChatConversations.id, { onDelete: 'cascade' }),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  model: varchar("model", { length: 50 }), // 'claude-3-5-sonnet-20241022'
  tokensUsed: integer("tokens_used"),
  responseTimeMs: integer("response_time_ms"),
  contextCars: jsonb("context_cars"), // Cars retrieved for context
  contextEvents: jsonb("context_events"), // Events retrieved for context
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    conversationIdx: index("idx_chat_messages_conversation").on(table.conversationId, table.createdAt),
  };
});

export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
  conversation: one(aiChatConversations, {
    fields: [aiChatMessages.conversationId],
    references: [aiChatConversations.id],
  }),
}));

export const aiChatMessagesInsertSchema = createInsertSchema(aiChatMessages);
export type InsertAiChatMessage = z.infer<typeof aiChatMessagesInsertSchema>;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;

// ============================================================================
// MARKETPLACE - CARS FOR SALE (with pgvector support)
// ============================================================================

/**
 * UNIFIED CARS FOR SALE SYSTEM
 * Consolidates Gateway Classic Cars + Regional Research + Market Analysis
 * Includes vector(1536) embedding for AI-powered search
 */
export const carsForSale = pgTable("cars_for_sale", {
  id: serial("id").primaryKey(),

  // Core Vehicle Data
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),

  // Source & Location Tracking
  sourceType: varchar("source_type", { length: 50 }).notNull(), // 'gateway' | 'research' | 'import'
  sourceName: varchar("source_name", { length: 100 }).notNull(),
  sourceUrl: text("source_url"),
  locationCity: varchar("location_city", { length: 100 }),
  locationState: varchar("location_state", { length: 50 }),
  locationCountry: varchar("location_country", { length: 50 }).default("USA"),
  locationRegion: varchar("location_region", { length: 50 }), // 'south' | 'midwest' | 'west' | 'northeast'
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Vehicle Details
  category: varchar("category", { length: 100 }), // 'Muscle Cars' | 'Sports Cars' | etc
  condition: varchar("condition", { length: 50 }), // 'Excellent' | 'Good' | 'Driver' | etc
  mileage: integer("mileage"),
  exteriorColor: varchar("exterior_color", { length: 100 }),
  interiorColor: varchar("interior_color", { length: 100 }),
  engine: varchar("engine", { length: 255 }),
  transmission: varchar("transmission", { length: 100 }),
  drivetrain: varchar("drivetrain", { length: 50 }), // 'RWD', 'FWD', 'AWD', '4WD'
  fuelType: varchar("fuel_type", { length: 50 }), // 'Gasoline', 'Diesel', 'Electric', 'Hybrid'
  bodyStyle: varchar("body_style", { length: 50 }), // 'Coupe', 'Sedan', 'Convertible', 'Wagon', etc.

  // Investment Analysis Integration
  investmentGrade: varchar("investment_grade", { length: 10 }), // 'A+' | 'A' | 'A-' | 'B+' | etc
  appreciationRate: decimal("appreciation_rate", { precision: 5, scale: 2 }), // 35.2 = 35.2% per year
  marketTrend: varchar("market_trend", { length: 20 }), // 'rising' | 'stable' | 'declining'
  valuationConfidence: decimal("valuation_confidence", { precision: 3, scale: 2 }), // 0.85 = 85% confidence
  rarityScore: integer("rarity_score"), // 0-100

  // Media & Documentation
  imageUrl: text("image_url"),
  galleryImages: jsonb("gallery_images"), // Array of image URLs
  videoUrl: text("video_url"),
  title: text("title"),
  description: text("description"),
  features: jsonb("features"), // Flexible JSON for various features
  modifications: jsonb("modifications"), // List of modifications

  // Condition & history
  restorationLevel: varchar("restoration_level", { length: 50 }), // 'Concours', '#1', '#2', '#3', '#4', 'Unrestored'
  ownershipHistory: text("ownership_history"),
  serviceRecords: boolean("service_records").default(false),

  // Market data
  marketData: jsonb("market_data"), // Pricing trends, comparable sales, etc
  avgMarketPrice: decimal("avg_market_price", { precision: 12, scale: 2 }),
  priceVariance: decimal("price_variance", { precision: 5, scale: 2 }), // Percentage vs market avg
  perplexityAnalysis: jsonb("perplexity_analysis"), // AI-generated market insights

  // Administrative
  stockNumber: varchar("stock_number", { length: 50 }).unique(),
  vin: varchar("vin", { length: 17 }).unique(),

  // Research Integration
  researchNotes: text("research_notes"),

  // Engagement metrics
  viewCount: integer("view_count").default(0),
  bookmarkCount: integer("bookmark_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),

  // AI & search - VECTOR EMBEDDING (OpenAI ada-002 embeddings)
  embedding: vector("embedding", { dimensions: 1536 }),

  // Status
  status: varchar("status", { length: 20 }).default("active"), // 'active', 'sold', 'pending', 'archived'
  featured: boolean("featured").default(false),
  soldDate: timestamp("sold_date"),
  soldPrice: decimal("sold_price", { precision: 12, scale: 2 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  scrapedAt: timestamp("scraped_at"),
  verifiedAt: timestamp("verified_at"),
}, (table) => {
  return {
    makeIdx: index("idx_cars_make").on(table.make),
    modelIdx: index("idx_cars_model").on(table.model),
    yearIdx: index("idx_cars_year").on(table.year),
    priceIdx: index("idx_cars_price").on(table.price),
    locationStateIdx: index("idx_cars_location_state").on(table.locationState),
    sourceTypeIdx: index("idx_cars_source_type").on(table.sourceType),
    statusIdx: index("idx_cars_status").on(table.status),
    featuredIdx: index("idx_cars_featured").on(table.featured),
    investmentGradeIdx: index("idx_cars_investment_grade").on(table.investmentGrade),
    makeModelYearIdx: index("idx_cars_make_model_year").on(table.make, table.model, table.year),
    statusFeaturedIdx: index("idx_cars_status_featured").on(table.status, table.featured),
  };
});

export const carsForSaleRelations = relations(carsForSale, ({ many }) => ({
  priceHistory: many(priceHistory),
}));

export const carsForSaleInsertSchema = createInsertSchema(carsForSale);
export type InsertCarForSale = z.infer<typeof carsForSaleInsertSchema>;
export type CarForSale = typeof carsForSale.$inferSelect;

// Price History (NEW from SPEC_01)
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => carsForSale.id, { onDelete: 'cascade' }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  sourceType: varchar("source_type", { length: 50 }).notNull(), // 'import', 'update', 'market_analysis'
  sourceName: varchar("source_name", { length: 100 }),
  recordedDate: timestamp("recorded_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    vehicleIdx: index("idx_price_history_vehicle").on(table.vehicleId, table.recordedDate),
  };
});

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  vehicle: one(carsForSale, {
    fields: [priceHistory.vehicleId],
    references: [carsForSale.id],
  }),
}));

export const priceHistoryInsertSchema = createInsertSchema(priceHistory);
export type InsertPriceHistory = z.infer<typeof priceHistoryInsertSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;

// ============================================================================
// CAR SHOW EVENTS (with pgvector support)
// ============================================================================

/**
 * Classic Car Show Events Table
 * Comprehensive event storage with geolocation and AI embeddings
 */
export const carShowEvents = pgTable("car_show_events", {
  id: serial("id").primaryKey(),

  // Event basics
  eventName: varchar("event_name", { length: 255 }).notNull(),
  eventSlug: varchar("event_slug", { length: 255 }).unique().notNull(),
  description: text("description"),

  // Location
  venue: varchar("venue", { length: 255 }).notNull(),
  venueName: varchar("venue_name", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  country: varchar("country", { length: 50 }).default("USA"),
  zipCode: varchar("zip_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Date & time
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  registrationDeadline: timestamp("registration_deadline"),

  // Event classification
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'auction', 'car_show', 'concours', 'cruise_in', 'swap_meet'
  eventCategory: varchar("event_category", { length: 50 }), // 'classic', 'muscle', 'hot_rod', 'exotic', 'general'

  // Vehicle focus (Phase 5 enhancements)
  vehicleMakes: jsonb("vehicle_makes"), // JSON array: ['Ford', 'Chevrolet', 'Dodge']
  vehicleModels: jsonb("vehicle_models"), // JSON array: ['Mustang', 'Camaro', 'Charger']
  primaryVehicleFocus: varchar("primary_vehicle_focus", { length: 20 }), // 'make' | 'model' | 'category' | 'era' | 'general'

  // Organizer info
  organizerName: varchar("organizer_name", { length: 255 }),
  organizerContact: varchar("organizer_contact", { length: 255 }),
  organizerEmail: varchar("organizer_email", { length: 255 }),
  organizerPhone: varchar("organizer_phone", { length: 50 }),
  website: text("website"),

  // Entry & fees
  entryFeeSpectator: decimal("entry_fee_spectator", { precision: 8, scale: 2 }),
  entryFeeParticipant: decimal("entry_fee_participant", { precision: 8, scale: 2 }),

  // Event details
  capacity: integer("capacity"),
  expectedAttendance: integer("expected_attendance"),
  expectedAttendanceMin: integer("expected_attendance_min"),
  expectedAttendanceMax: integer("expected_attendance_max"),
  features: jsonb("features"), // ['live_music', 'food_vendors', 'awards_ceremony']
  amenities: jsonb("amenities"), // ['parking', 'restrooms', 'shade', 'seating']
  vehicleRequirements: text("vehicle_requirements"),
  judgingClasses: jsonb("judging_classes"), // ['Best in Show', 'People\'s Choice']
  awards: jsonb("awards"), // List of trophies/prizes
  parkingInfo: text("parking_info"),
  weatherContingency: text("weather_contingency"),
  specialNotes: text("special_notes"),

  // Flags
  foodVendors: boolean("food_vendors").default(false),
  swapMeet: boolean("swap_meet").default(false),
  liveMusic: boolean("live_music").default(false),
  kidsActivities: boolean("kids_activities").default(false),

  // Media
  imageUrl: text("image_url"),
  galleryImages: jsonb("gallery_images"),

  // Source tracking
  sourceUrl: text("source_url"),
  dataSource: varchar("data_source", { length: 50 }).default("research_documents"), // 'research_documents', 'gemini_processed', 'manual'
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending"), // 'pending', 'verified', 'needs_update'
  lastVerified: timestamp("last_verified"),

  // Status
  status: varchar("status", { length: 20 }).default("active"), // 'active', 'cancelled', 'postponed', 'completed'
  featured: boolean("featured").default(false),

  // AI & search - VECTOR EMBEDDING (OpenAI ada-002 embeddings)
  embedding: vector("embedding", { dimensions: 1536 }),

  // Engagement metrics
  viewCount: integer("view_count").default(0),
  bookmarkCount: integer("bookmark_count").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
}, (table) => {
  return {
    cityIdx: index("idx_events_city").on(table.city),
    stateIdx: index("idx_events_state").on(table.state),
    startDateIdx: index("idx_events_start_date").on(table.startDate),
    eventTypeIdx: index("idx_events_type").on(table.eventType),
    categoryIdx: index("idx_events_category").on(table.eventCategory),
    statusIdx: index("idx_events_status").on(table.status),
    featuredIdx: index("idx_events_featured").on(table.featured),
  };
});

export const carShowEventsRelations = relations(carShowEvents, ({ many }) => ({
  itineraryItems: many(userItineraries),
  comments: many(eventComments),
}));

export const carShowEventsInsertSchema = createInsertSchema(carShowEvents);
export type InsertCarShowEvent = z.infer<typeof carShowEventsInsertSchema>;
export type CarShowEvent = typeof carShowEvents.$inferSelect;

// User Itineraries (join table)
export const userItineraries = pgTable("user_itineraries", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer("event_id").notNull().references(() => carShowEvents.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.eventId] }),
  };
});

export const userItinerariesRelations = relations(userItineraries, ({ one }) => ({
  user: one(users, {
    fields: [userItineraries.userId],
    references: [users.id],
  }),
  event: one(carShowEvents, {
    fields: [userItineraries.eventId],
    references: [carShowEvents.id],
  }),
}));

// Event Comments
export const eventComments = pgTable("event_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer("event_id").notNull().references(() => carShowEvents.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventCommentsRelations = relations(eventComments, ({ one }) => ({
  user: one(users, {
    fields: [eventComments.userId],
    references: [users.id],
  }),
  event: one(carShowEvents, {
    fields: [eventComments.eventId],
    references: [carShowEvents.id],
  }),
}));

export type EventComment = typeof eventComments.$inferSelect;

// ============================================================================
// SUPPORTING TABLES
// ============================================================================

export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  action: varchar("action", { length: 100 }).notNull(), // 'login', 'bookmark_car', 'view_event', etc.
  resourceType: varchar("resource_type", { length: 50 }), // 'car', 'event', 'user'
  resourceId: integer("resource_id"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userDateIdx: index("idx_activity_user_date").on(table.userId, table.createdAt),
  };
});

export const userActivityLogInsertSchema = createInsertSchema(userActivityLog);
export type InsertUserActivityLog = z.infer<typeof userActivityLogInsertSchema>;
export type UserActivityLog = typeof userActivityLog.$inferSelect;

export const emailNotifications = pgTable("email_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // 'event_reminder', 'price_drop', 'welcome'
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'sent', 'failed'
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailNotificationsInsertSchema = createInsertSchema(emailNotifications);
export type InsertEmailNotification = z.infer<typeof emailNotificationsInsertSchema>;
export type EmailNotification = typeof emailNotifications.$inferSelect;

// ============================================================================
// LEGACY CMS TABLES (from original SQLite schema)
// ============================================================================

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: text("image_url").notNull(),
  galleryImages: jsonb("gallery_images").notNull().$type<string[]>(),
  specs: jsonb("specs").notNull().$type<Record<string, string>>(),
  features: jsonb("features").notNull().$type<string[]>(),
  clientQuote: text("client_quote"),
  clientName: varchar("client_name", { length: 255 }),
  clientLocation: varchar("client_location", { length: 255 }),
  historicalInfo: jsonb("historical_info").$type<Record<string, string>>(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  luxuryShowcase: one(luxuryShowcases, {
    fields: [projects.id],
    references: [luxuryShowcases.projectId],
  }),
}));

export const projectsInsertSchema = createInsertSchema(projects);
export type InsertProject = z.infer<typeof projectsInsertSchema>;
export type Project = typeof projects.$inferSelect;

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorLocation: varchar("author_location", { length: 255 }).notNull(),
  authorImage: text("author_image").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testimonialsInsertSchema = createInsertSchema(testimonials);
export type InsertTestimonial = z.infer<typeof testimonialsInsertSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),
  image: text("image").notNull(),
  bio: text("bio"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembersInsertSchema = createInsertSchema(teamMembers);
export type InsertTeamMember = z.infer<typeof teamMembersInsertSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: jsonb("description").notNull().$type<string[]>(),
  image: text("image").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companiesInsertSchema = createInsertSchema(companies);
export type InsertCompany = z.infer<typeof companiesInsertSchema>;
export type Company = typeof companies.$inferSelect;

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribersInsertSchema = createInsertSchema(newsletterSubscribers);
export type InsertNewsletterSubscriber = z.infer<typeof newsletterSubscribersInsertSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  projectType: varchar("project_type", { length: 100 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSubmissionsInsertSchema = createInsertSchema(contactSubmissions);
export type InsertContactSubmission = z.infer<typeof contactSubmissionsInsertSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export const heroContent = pgTable("hero_content", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const heroContentInsertSchema = createInsertSchema(heroContent);
export type InsertHeroContent = z.infer<typeof heroContentInsertSchema>;
export type HeroContent = typeof heroContent.$inferSelect;

export const engineeringFeatures = pgTable("engineering_features", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const engineeringFeaturesInsertSchema = createInsertSchema(engineeringFeatures);
export type InsertEngineeringFeature = z.infer<typeof engineeringFeaturesInsertSchema>;
export type EngineeringFeature = typeof engineeringFeatures.$inferSelect;

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  marketGrowthData: jsonb("market_growth_data").notNull(),
  demographicData: jsonb("demographic_data").notNull(),
  platforms: jsonb("platforms").notNull().$type<string[]>(),
  modifications: jsonb("modifications").notNull().$type<string[]>(),
  roi: varchar("roi", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketDataInsertSchema = createInsertSchema(marketData);
export type InsertMarketData = z.infer<typeof marketDataInsertSchema>;
export type MarketData = typeof marketData.$inferSelect;

export const processSteps = pgTable("process_steps", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  alt: varchar("alt", { length: 255 }).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const processStepsInsertSchema = createInsertSchema(processSteps);
export type InsertProcessStep = z.infer<typeof processStepsInsertSchema>;
export type ProcessStep = typeof processSteps.$inferSelect;

export const luxuryShowcases = pgTable("luxury_showcases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  videoUrl: text("video_url"),
  heroImage: text("hero_image").notNull(),
  galleryImages: jsonb("gallery_images").notNull().$type<string[]>(),
  detailSections: jsonb("detail_sections").notNull().$type<{
    title: string;
    content: string;
    image?: string;
    order: number;
  }[]>(),
  specifications: jsonb("specifications").notNull().$type<{
    category: string;
    items: { label: string; value: string }[];
  }[]>(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

export const luxuryShowcaseRelations = relations(luxuryShowcases, ({ one }) => ({
  project: one(projects, {
    fields: [luxuryShowcases.projectId],
    references: [projects.id],
  }),
}));

export const luxuryShowcaseInsertSchema = createInsertSchema(luxuryShowcases);
export type InsertLuxuryShowcase = z.infer<typeof luxuryShowcaseInsertSchema>;
export type LuxuryShowcase = typeof luxuryShowcases.$inferSelect;

export const researchArticles = pgTable("research_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  author: varchar("author", { length: 255 }).notNull(),
  publishDate: timestamp("publish_date").notNull(),
  featuredImage: text("featured_image").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: jsonb("tags").notNull().$type<string[]>(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchArticlesInsertSchema = createInsertSchema(researchArticles);
export type InsertResearchArticle = z.infer<typeof researchArticlesInsertSchema>;
export type ResearchArticle = typeof researchArticles.$inferSelect;

// ============================================================================
// CAR CONFIGURATOR TABLES (Original simplified)
// ============================================================================

export const engineOptions = pgTable("engine_options", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  horsepower: integer("horsepower").notNull(),
  torque: integer("torque").notNull(),
  displacement: varchar("displacement", { length: 100 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }).notNull(),
  fuelType: varchar("fuel_type", { length: 50 }).notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  mcKenneyFeatures: jsonb("mckenney_features").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const engineOptionsInsertSchema = createInsertSchema(engineOptions);
export type InsertEngineOption = z.infer<typeof engineOptionsInsertSchema>;
export type EngineOption = typeof engineOptions.$inferSelect;

export const transmissionOptions = pgTable("transmission_options", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  speeds: integer("speeds").notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }).notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  compatibleEngines: jsonb("compatible_engines").notNull().$type<number[]>(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transmissionOptionsInsertSchema = createInsertSchema(transmissionOptions);
export type InsertTransmissionOption = z.infer<typeof transmissionOptionsInsertSchema>;
export type TransmissionOption = typeof transmissionOptions.$inferSelect;

export const colorOptions = pgTable("color_options", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  hex: varchar("hex", { length: 7 }).notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // e.g., metallic, matte, gloss
  availableForModels: jsonb("available_for_models").notNull().$type<number[]>(),
  popular: boolean("popular").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const colorOptionsInsertSchema = createInsertSchema(colorOptions);
export type InsertColorOption = z.infer<typeof colorOptionsInsertSchema>;
export type ColorOption = typeof colorOptions.$inferSelect;

export const wheelOptions = pgTable("wheel_options", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  diameter: integer("diameter").notNull(),
  width: varchar("width", { length: 50 }).notNull(),
  material: varchar("material", { length: 100 }).notNull(),
  style: varchar("style", { length: 100 }).notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wheelOptionsInsertSchema = createInsertSchema(wheelOptions);
export type InsertWheelOption = z.infer<typeof wheelOptionsInsertSchema>;
export type WheelOption = typeof wheelOptions.$inferSelect;

export const interiorOptions = pgTable("interior_options", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  material: varchar("material", { length: 100 }).notNull(),
  color: varchar("color", { length: 100 }).notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  features: jsonb("features").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interiorOptionsInsertSchema = createInsertSchema(interiorOptions);
export type InsertInteriorOption = z.infer<typeof interiorOptionsInsertSchema>;
export type InteriorOption = typeof interiorOptions.$inferSelect;

export const aiOptions = pgTable("ai_options", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., performance, safety, entertainment
  image: text("image").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiOptionsInsertSchema = createInsertSchema(aiOptions);
export type InsertAiOption = z.infer<typeof aiOptionsInsertSchema>;
export type AiOption = typeof aiOptions.$inferSelect;

export const additionalOptions = pgTable("additional_options", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., performance, safety, comfort
  image: text("image").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const additionalOptionsInsertSchema = createInsertSchema(additionalOptions);
export type InsertAdditionalOption = z.infer<typeof additionalOptionsInsertSchema>;
export type AdditionalOption = typeof additionalOptions.$inferSelect;

export const userConfigurations = pgTable("user_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  carModelId: integer("car_model_id").notNull(),
  engineId: integer("engine_id"),
  transmissionId: integer("transmission_id"),
  colorId: integer("color_id"),
  wheelId: integer("wheel_id"),
  interiorId: integer("interior_id"),
  selectedAiOptions: jsonb("selected_ai_options").$type<number[]>(),
  selectedAdditionalOptions: jsonb("selected_additional_options").$type<number[]>(),
  aiRecommendations: text("ai_recommendations"),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userConfigurationsRelations = relations(userConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [userConfigurations.userId],
    references: [users.id],
  }),
}));

export const userConfigurationsInsertSchema = createInsertSchema(userConfigurations);
export type InsertUserConfiguration = z.infer<typeof userConfigurationsInsertSchema>;
export type UserConfiguration = typeof userConfigurations.$inferSelect;

// ============================================================================
// MARKET ANALYTICS & INVESTMENT TABLES
// ============================================================================

export const marketValuations = pgTable("market_valuations", {
  id: serial("id").primaryKey(),
  vehicleMake: varchar("vehicle_make", { length: 100 }).notNull(),
  vehicleModel: varchar("vehicle_model", { length: 100 }).notNull(),
  yearRange: varchar("year_range", { length: 50 }),
  engineVariant: varchar("engine_variant", { length: 255 }),
  bodyStyle: varchar("body_style", { length: 100 }),
  conditionRating: varchar("condition_rating", { length: 50 }),
  hagertyValue: decimal("hagerty_value", { precision: 12, scale: 2 }),
  auctionHigh: decimal("auction_high", { precision: 12, scale: 2 }),
  auctionLow: decimal("auction_low", { precision: 12, scale: 2 }),
  averagePrice: decimal("average_price", { precision: 12, scale: 2 }),
  trendPercentage: decimal("trend_percentage", { precision: 5, scale: 2 }),
  marketSegment: varchar("market_segment", { length: 100 }),
  investmentGrade: varchar("investment_grade", { length: 10 }),
  lastUpdated: timestamp("last_updated"),
  sourceData: text("source_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketValuationsInsertSchema = createInsertSchema(marketValuations);
export type InsertMarketValuation = z.infer<typeof marketValuationsInsertSchema>;
export type MarketValuation = typeof marketValuations.$inferSelect;

export const builderProfiles = pgTable("builder_profiles", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  specialtyFocus: varchar("specialty_focus", { length: 255 }),
  reputationTier: varchar("reputation_tier", { length: 50 }),
  averageBuildCostRange: varchar("average_build_cost_range", { length: 100 }),
  buildTimeEstimate: varchar("build_time_estimate", { length: 100 }),
  notableProjects: text("notable_projects"),
  contactInformation: text("contact_information"),
  websiteUrl: text("website_url"),
  portfolioImages: jsonb("portfolio_images"),
  certifications: jsonb("certifications"),
  warrantyOffered: boolean("warranty_offered").default(false),
  yearEstablished: integer("year_established"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const builderProfilesInsertSchema = createInsertSchema(builderProfiles);
export type InsertBuilderProfile = z.infer<typeof builderProfilesInsertSchema>;
export type BuilderProfile = typeof builderProfiles.$inferSelect;

export const technicalSpecifications = pgTable("technical_specifications", {
  id: serial("id").primaryKey(),
  componentCategory: varchar("component_category", { length: 100 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }).notNull(),
  productName: varchar("product_name", { length: 255 }),
  priceRange: varchar("price_range", { length: 100 }),
  exactPrice: decimal("exact_price", { precision: 12, scale: 2 }),
  compatibility: text("compatibility"),
  performanceSpecs: text("performance_specs"),
  installationDifficulty: varchar("installation_difficulty", { length: 50 }),
  requiredTools: jsonb("required_tools"),
  estimatedLaborHours: decimal("estimated_labor_hours", { precision: 5, scale: 2 }),
  vendorUrl: text("vendor_url"),
  inStock: boolean("in_stock").default(true),
  popularityRank: integer("popularity_rank"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const technicalSpecificationsInsertSchema = createInsertSchema(technicalSpecifications);
export type InsertTechnicalSpecification = z.infer<typeof technicalSpecificationsInsertSchema>;
export type TechnicalSpecification = typeof technicalSpecifications.$inferSelect;

export const eventVenues = pgTable("event_venues", {
  id: serial("id").primaryKey(),
  venueName: varchar("venue_name", { length: 255 }).notNull(),
  locationCity: varchar("location_city", { length: 100 }),
  locationState: varchar("location_state", { length: 50 }),
  locationCountry: varchar("location_country", { length: 50 }).default("USA"),
  venueType: varchar("venue_type", { length: 100 }),
  capacity: integer("capacity"),
  amenities: jsonb("amenities"),
  contactInfo: text("contact_info"),
  websiteUrl: text("website_url"),
  coordinates: varchar("coordinates", { length: 100 }),
  parkingAvailable: boolean("parking_available").default(true),
  foodVendors: boolean("food_vendors").default(false),
  swapMeet: boolean("swap_meet").default(false),
  judgingClasses: jsonb("judging_classes"),
  entryFees: varchar("entry_fees", { length: 100 }),
  trophiesAwarded: boolean("trophies_awarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventVenuesInsertSchema = createInsertSchema(eventVenues);
export type InsertEventVenue = z.infer<typeof eventVenuesInsertSchema>;
export type EventVenue = typeof eventVenues.$inferSelect;

export const buildGuides = pgTable("build_guides", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  vehicleApplication: varchar("vehicle_application", { length: 255 }),
  difficultyLevel: varchar("difficulty_level", { length: 50 }),
  estimatedCost: varchar("estimated_cost", { length: 100 }),
  estimatedTime: varchar("estimated_time", { length: 100 }),
  requiredSkills: jsonb("required_skills"),
  toolsNeeded: jsonb("tools_needed"),
  partsRequired: text("parts_required"),
  stepByStepGuide: text("step_by_step_guide"),
  safetyWarnings: jsonb("safety_warnings"),
  troubleshootingTips: text("troubleshooting_tips"),
  videoUrl: text("video_url"),
  authorName: varchar("author_name", { length: 255 }),
  authorCredentials: varchar("author_credentials", { length: 500 }),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const buildGuidesInsertSchema = createInsertSchema(buildGuides);
export type InsertBuildGuide = z.infer<typeof buildGuidesInsertSchema>;
export type BuildGuide = typeof buildGuides.$inferSelect;

export const investmentAnalytics = pgTable("investment_analytics", {
  id: serial("id").primaryKey(),
  vehicleCategory: varchar("vehicle_category", { length: 100 }).notNull(),
  investmentHorizon: varchar("investment_horizon", { length: 50 }),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }),
  riskLevel: varchar("risk_level", { length: 50 }),
  liquidityRating: varchar("liquidity_rating", { length: 50 }),
  marketTrends: text("market_trends"),
  demographicFactors: text("demographic_factors"),
  recommendationScore: decimal("recommendation_score", { precision: 3, scale: 2 }),
  supportingData: text("supporting_data"),
  lastAnalyzed: timestamp("last_analyzed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const investmentAnalyticsInsertSchema = createInsertSchema(investmentAnalytics);
export type InsertInvestmentAnalytic = z.infer<typeof investmentAnalyticsInsertSchema>;
export type InvestmentAnalytic = typeof investmentAnalytics.$inferSelect;

export const vendorPartnerships = pgTable("vendor_partnerships", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  revenueOpportunity: varchar("revenue_opportunity", { length: 100 }),
  productTypes: jsonb("product_types"),
  affiliateUrl: text("affiliate_url"),
  trackingCode: varchar("tracking_code", { length: 255 }),
  paymentTerms: text("payment_terms"),
  minimumPayout: decimal("minimum_payout", { precision: 12, scale: 2 }),
  contactInfo: text("contact_info"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorPartnershipsInsertSchema = createInsertSchema(vendorPartnerships);
export type InsertVendorPartnership = z.infer<typeof vendorPartnershipsInsertSchema>;
export type VendorPartnership = typeof vendorPartnerships.$inferSelect;

export const gatewayVehicles = pgTable("gateway_vehicles", {
  id: serial("id").primaryKey(),
  stockNumber: varchar("stock_number", { length: 50 }).unique().notNull(),
  year: integer("year").notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  engine: varchar("engine", { length: 255 }),
  transmission: varchar("transmission", { length: 100 }),
  drivetrain: varchar("drivetrain", { length: 50 }),
  exterior: varchar("exterior", { length: 100 }),
  interior: varchar("interior", { length: 100 }),
  mileage: integer("mileage"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  features: jsonb("features"),
  condition: varchar("condition", { length: 50 }).default("Excellent"),
  location: varchar("location", { length: 255 }).default("St. Louis, Missouri"),
  imageUrl: text("image_url"),
  galleryImages: jsonb("gallery_images"),
  vin: varchar("vin", { length: 17 }),
  bodyStyle: varchar("body_style", { length: 100 }),
  fuelType: varchar("fuel_type", { length: 50 }),
  cylinders: integer("cylinders"),
  displacement: varchar("displacement", { length: 100 }),
  horsepower: integer("horsepower"),
  torque: integer("torque"),
  acceleration: varchar("acceleration", { length: 100 }),
  topSpeed: varchar("top_speed", { length: 100 }),
  interiorColor: varchar("interior_color", { length: 100 }),
  exteriorColor: varchar("exterior_color", { length: 100 }),
  wheelSize: varchar("wheel_size", { length: 50 }),
  tireSize: varchar("tire_size", { length: 50 }),
  suspension: varchar("suspension", { length: 255 }),
  brakes: varchar("brakes", { length: 255 }),
  steering: varchar("steering", { length: 100 }),
  airConditioning: boolean("air_conditioning").default(false),
  powerSteering: boolean("power_steering").default(false),
  powerBrakes: boolean("power_brakes").default(false),
  powerWindows: boolean("power_windows").default(false),
  powerSeats: boolean("power_seats").default(false),
  heatedSeats: boolean("heated_seats").default(false),
  leatherSeats: boolean("leather_seats").default(false),
  sunroof: boolean("sunroof").default(false),
  convertible: boolean("convertible").default(false),
  hardtop: boolean("hardtop").default(false),
  tiltWheel: boolean("tilt_wheel").default(false),
  cruiseControl: boolean("cruise_control").default(false),
  amFmRadio: boolean("am_fm_radio").default(false),
  cdPlayer: boolean("cd_player").default(false),
  cassette: boolean("cassette").default(false),
  premiumSound: boolean("premium_sound").default(false),
  alarmSecurity: boolean("alarm_security").default(false),
  keylessEntry: boolean("keyless_entry").default(false),
  antiLockBrakes: boolean("anti_lock_brakes").default(false),
  driverAirbag: boolean("driver_airbag").default(false),
  passengerAirbag: boolean("passenger_airbag").default(false),
  sideAirbags: boolean("side_airbags").default(false),
  tractionControl: boolean("traction_control").default(false),
  stabilityControl: boolean("stability_control").default(false),
  category: varchar("category", { length: 100 }).default("classic"),
  investmentGrade: varchar("investment_grade", { length: 10 }),
  appreciationPotential: varchar("appreciation_potential", { length: 50 }),
  rarity: varchar("rarity", { length: 50 }),
  restorationLevel: varchar("restoration_level", { length: 50 }),
  marketTrend: varchar("market_trend", { length: 50 }),
  comparableListings: integer("comparable_listings"),
  avgMarketPrice: decimal("avg_market_price", { precision: 12, scale: 2 }),
  priceVariance: decimal("price_variance", { precision: 5, scale: 2 }),
  daysOnMarket: integer("days_on_market"),
  viewCount: integer("view_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),
  featured: boolean("featured").default(false),
  sold: boolean("sold").default(false),
  soldDate: timestamp("sold_date"),
  soldPrice: decimal("sold_price", { precision: 12, scale: 2 }),
  dataSource: varchar("data_source", { length: 100 }).default("gateway_classics"),
  lastUpdated: timestamp("last_updated"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gatewayVehiclesInsertSchema = createInsertSchema(gatewayVehicles);
export type InsertGatewayVehicle = z.infer<typeof gatewayVehiclesInsertSchema>;
export type GatewayVehicle = typeof gatewayVehicles.$inferSelect;

// ============================================================================
// ENHANCED CONFIGURATOR TABLES (Research-based)
// ============================================================================

export const configuratorCarModels = pgTable("configurator_car_models", {
  id: serial("id").primaryKey(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  yearStart: integer("year_start").notNull(),
  yearEnd: integer("year_end").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
  popularity: integer("popularity").default(0),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const configuratorCarModelsInsertSchema = createInsertSchema(configuratorCarModels);
export type InsertConfiguratorCarModel = z.infer<typeof configuratorCarModelsInsertSchema>;
export type ConfiguratorCarModel = typeof configuratorCarModels.$inferSelect;

/**
 * ============================================================================
 * NOTES ON VECTOR SEARCH SETUP
 * ============================================================================
 *
 * After running migrations, execute these SQL commands manually:
 *
 * 1. Enable pgvector extension:
 *    CREATE EXTENSION IF NOT EXISTS vector;
 *
 * 2. Create vector similarity search indexes:
 *    CREATE INDEX ON cars_for_sale USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
 *    CREATE INDEX ON car_show_events USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
 *
 * 3. Create tsvector columns and indexes for full-text search:
 *    ALTER TABLE cars_for_sale ADD COLUMN search_vector tsvector;
 *    ALTER TABLE car_show_events ADD COLUMN search_vector tsvector;
 *
 *    CREATE INDEX idx_cars_search ON cars_for_sale USING gin(search_vector);
 *    CREATE INDEX idx_events_search ON car_show_events USING gin(search_vector);
 *
 * 4. Create update triggers (see SPEC_01_DATABASE_SCHEMA.md for full trigger definitions)
 *
 * ============================================================================
 */
