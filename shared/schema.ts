import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (enhanced with admin role and email)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: integer("is_admin", { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  galleryImages: text("gallery_images", { mode: 'json' }).notNull().$type<string[]>(),
  specs: text("specs", { mode: 'json' }).notNull().$type<Record<string, string>>(),
  features: text("features", { mode: 'json' }).notNull().$type<string[]>(),
  clientQuote: text("client_quote"),
  clientName: text("client_name"),
  clientLocation: text("client_location"),
  historicalInfo: text("historical_info", { mode: 'json' }).$type<Record<string, string>>(),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const projectsInsertSchema = createInsertSchema(projects);
export type InsertProject = z.infer<typeof projectsInsertSchema>;
export type Project = typeof projects.$inferSelect;

// Testimonials table
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quote: text("quote").notNull(),
  authorName: text("author_name").notNull(),
  authorLocation: text("author_location").notNull(),
  authorImage: text("author_image").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const testimonialsInsertSchema = createInsertSchema(testimonials);
export type InsertTestimonial = z.infer<typeof testimonialsInsertSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Team members table
export const teamMembers = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  position: text("position").notNull(),
  image: text("image").notNull(),
  bio: text("bio"),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const teamMembersInsertSchema = createInsertSchema(teamMembers);
export type InsertTeamMember = z.infer<typeof teamMembersInsertSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Companies table
export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description", { mode: 'json' }).notNull().$type<string[]>(),
  image: text("image").notNull(),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const companiesInsertSchema = createInsertSchema(companies);
export type InsertCompany = z.infer<typeof companiesInsertSchema>;
export type Company = typeof companies.$inferSelect;

// Newsletter subscribers table
export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const newsletterSubscribersInsertSchema = createInsertSchema(newsletterSubscribers);
export type InsertNewsletterSubscriber = z.infer<typeof newsletterSubscribersInsertSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Contact form submissions table
export const contactSubmissions = sqliteTable("contact_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  projectType: text("project_type").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const contactSubmissionsInsertSchema = createInsertSchema(contactSubmissions);
export type InsertContactSubmission = z.infer<typeof contactSubmissionsInsertSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Hero content table
export const heroContent = sqliteTable("hero_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const heroContentInsertSchema = createInsertSchema(heroContent);
export type InsertHeroContent = z.infer<typeof heroContentInsertSchema>;
export type HeroContent = typeof heroContent.$inferSelect;

// Engineering features table
export const engineeringFeatures = sqliteTable("engineering_features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const engineeringFeaturesInsertSchema = createInsertSchema(engineeringFeatures);
export type InsertEngineeringFeature = z.infer<typeof engineeringFeaturesInsertSchema>;
export type EngineeringFeature = typeof engineeringFeatures.$inferSelect;

// Market data table
export const marketData = sqliteTable("market_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  marketGrowthData: text("market_growth_data", { mode: 'json' }).notNull(),
  demographicData: text("demographic_data", { mode: 'json' }).notNull(),
  platforms: text("platforms", { mode: 'json' }).notNull().$type<string[]>(),
  modifications: text("modifications", { mode: 'json' }).notNull().$type<string[]>(),
  roi: text("roi").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const marketDataInsertSchema = createInsertSchema(marketData);
export type InsertMarketData = z.infer<typeof marketDataInsertSchema>;
export type MarketData = typeof marketData.$inferSelect;

// Process steps table
export const processSteps = sqliteTable("process_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  alt: text("alt").notNull(),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const processStepsInsertSchema = createInsertSchema(processSteps);
export type InsertProcessStep = z.infer<typeof processStepsInsertSchema>;
export type ProcessStep = typeof processSteps.$inferSelect;

// Luxury Showcase pages table
export const luxuryShowcases = sqliteTable("luxury_showcases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  videoUrl: text("video_url"),
  heroImage: text("hero_image").notNull(),
  galleryImages: text("gallery_images", { mode: 'json' }).notNull().$type<string[]>(),
  detailSections: text("detail_sections", { mode: 'json' }).notNull().$type<{
    title: string;
    content: string;
    image?: string;
    order: number;
  }[]>(),
  specifications: text("specifications", { mode: 'json' }).notNull().$type<{
    category: string;
    items: { label: string; value: string }[];
  }[]>(),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  publishedAt: integer("published_at", { mode: 'timestamp' }),
});

// Research Articles table
export const researchArticles = sqliteTable("research_articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  author: text("author").notNull(),
  publishDate: integer("publish_date", { mode: 'timestamp' }).notNull(),
  featuredImage: text("featured_image").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  tags: text("tags", { mode: 'json' }).notNull().$type<string[]>(),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

export const researchArticlesInsertSchema = createInsertSchema(researchArticles);
export type InsertResearchArticle = z.infer<typeof researchArticlesInsertSchema>;
export type ResearchArticle = typeof researchArticles.$inferSelect;

// Builder profiles table for authentic parts data
export const builderProfiles = sqliteTable("builder_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull(),
  location: text("location"),
  specialtyFocus: text("specialty_focus"),
  reputationTier: text("reputation_tier"),
  averageBuildCostRange: text("average_build_cost_range"),
  buildTimeEstimate: text("build_time_estimate"),
  notableProjects: text("notable_projects"),
  contactInformation: text("contact_information"),
  websiteUrl: text("website_url"),
  portfolioImages: text("portfolio_images", { mode: 'json' }),
  certifications: text("certifications", { mode: 'json' }),
  warrantyOffered: integer("warranty_offered", { mode: 'boolean' }).default(false),
  yearEstablished: integer("year_established"),
  rating: text("rating"),
  reviewCount: integer("review_count").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

// Technical specifications table for authentic parts data
export const technicalSpecifications = sqliteTable("technical_specifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  componentCategory: text("component_category").notNull(),
  partNumber: text("part_number"),
  manufacturer: text("manufacturer").notNull(),
  productName: text("product_name"),
  priceRange: text("price_range"),
  exactPrice: text("exact_price"),
  compatibility: text("compatibility"),
  performanceSpecs: text("performance_specs"),
  installationDifficulty: text("installation_difficulty"),
  requiredTools: text("required_tools", { mode: 'json' }),
  estimatedLaborHours: text("estimated_labor_hours"),
  vendorUrl: text("vendor_url"),
  inStock: integer("in_stock", { mode: 'boolean' }).default(true),
  popularityRank: integer("popularity_rank"),
  createdAt: integer("created_at", { mode: 'timestamp' }),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

// Event venues table for car show data
export const eventVenues = sqliteTable("event_venues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  venueName: text("venue_name").notNull(),
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationCountry: text("location_country").default("USA"),
  venueType: text("venue_type"),
  capacity: integer("capacity"),
  amenities: text("amenities", { mode: 'json' }),
  contactInfo: text("contact_info"),
  websiteUrl: text("website_url"),
  coordinates: text("coordinates"),
  parkingAvailable: integer("parking_available", { mode: 'boolean' }).default(true),
  foodVendors: integer("food_vendors", { mode: 'boolean' }).default(false),
  swapMeet: integer("swap_meet", { mode: 'boolean' }).default(false),
  judgingClasses: text("judging_classes", { mode: 'json' }),
  entryFees: text("entry_fees"),
  trophiesAwarded: integer("trophies_awarded", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

// Build guides table for technical documentation
export const buildGuides = sqliteTable("build_guides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  vehicleApplication: text("vehicle_application"),
  difficultyLevel: text("difficulty_level"),
  estimatedCost: text("estimated_cost"),
  estimatedTime: text("estimated_time"),
  requiredSkills: text("required_skills", { mode: 'json' }),
  toolsNeeded: text("tools_needed", { mode: 'json' }),
  partsRequired: text("parts_required"),
  stepByStepGuide: text("step_by_step_guide"),
  safetyWarnings: text("safety_warnings", { mode: 'json' }),
  troubleshootingTips: text("troubleshooting_tips"),
  videoUrl: text("video_url"),
  authorName: text("author_name"),
  authorCredentials: text("author_credentials"),
  views: integer("views").default(0),
  rating: text("rating"),
  createdAt: integer("created_at", { mode: 'timestamp' }),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

// Investment analytics table for market data
export const investmentAnalytics = sqliteTable("investment_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vehicleCategory: text("vehicle_category").notNull(),
  investmentHorizon: text("investment_horizon"),
  expectedReturn: text("expected_return"),
  riskLevel: text("risk_level"),
  liquidityRating: text("liquidity_rating"),
  marketTrends: text("market_trends"),
  demographicFactors: text("demographic_factors"),
  recommendationScore: text("recommendation_score"),
  supportingData: text("supporting_data"),
  lastAnalyzed: integer("last_analyzed", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }),
});

// Vendor partnerships table for affiliate data
export const vendorPartnerships = sqliteTable("vendor_partnerships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull(),
  category: text("category").notNull(),
  commissionRate: text("commission_rate"),
  revenueOpportunity: text("revenue_opportunity"),
  productTypes: text("product_types", { mode: 'json' }),
  affiliateUrl: text("affiliate_url"),
  trackingCode: text("tracking_code"),
  paymentTerms: text("payment_terms"),
  minimumPayout: text("minimum_payout"),
  contactInfo: text("contact_info"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }),
  updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

// Classic Car Show Events Table - Comprehensive event storage
export const carShowEvents = sqliteTable("car_show_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventName: text("event_name").notNull(),
  eventSlug: text("event_slug").unique().notNull(),
  venue: text("venue").notNull(),
  venueName: text("venue_name"),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").default("USA"),
  zipCode: text("zip_code"),
  startDate: integer("start_date", { mode: 'timestamp' }).notNull(),
  endDate: integer("end_date", { mode: 'timestamp' }),
  eventType: text("event_type").notNull(), // 'auction', 'car_show', 'concours', 'cruise_in', 'swap_meet'
  eventCategory: text("event_category"), // 'classic', 'muscle', 'hot_rod', 'exotic', 'general'
  description: text("description"),
  website: text("website"),
  organizerName: text("organizer_name"),
  organizerContact: text("organizer_contact"),
  organizerEmail: text("organizer_email"),
  organizerPhone: text("organizer_phone"),
  entryFeeSpectator: text("entry_fee_spectator"),
  entryFeeParticipant: text("entry_fee_participant"),
  registrationDeadline: integer("registration_deadline", { mode: 'timestamp' }),
  capacity: integer("capacity"),
  expectedAttendance: integer("expected_attendance"),
  features: text("features"), // JSON string of features array
  amenities: text("amenities"), // JSON string of amenities
  vehicleRequirements: text("vehicle_requirements"),
  judgingClasses: text("judging_classes"), // JSON string of judging categories
  awards: text("awards"), // JSON string of awards/trophies
  parkingInfo: text("parking_info"),
  foodVendors: integer("food_vendors", { mode: 'boolean' }).default(false),
  swapMeet: integer("swap_meet", { mode: 'boolean' }).default(false),
  liveMusic: integer("live_music", { mode: 'boolean' }).default(false),
  kidsActivities: integer("kids_activities", { mode: 'boolean' }).default(false),
  weatherContingency: text("weather_contingency"),
  specialNotes: text("special_notes"),
  imageUrl: text("image_url"),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  status: text("status").default("active"), // 'active', 'cancelled', 'postponed', 'completed'
  sourceUrl: text("source_url"), // Where the event info was found
  dataSource: text("data_source").default("research_documents"), // 'research_documents', 'gemini_processed', 'manual'
  verificationStatus: text("verification_status").default("pending"), // 'pending', 'verified', 'needs_update'
  lastVerified: integer("last_verified", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

export const userItineraries = sqliteTable("user_itineraries", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer("event_id").notNull().references(() => carShowEvents.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.eventId] }),
  };
});

export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  homeLocation: text("home_location", { mode: 'json' }).$type<{ city?: string; state?: string; zip?: string; }>(),
  preferredCategories: text("preferred_categories", { mode: 'json' }).$type<string[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

// ENHANCED CAR CONFIGURATOR TABLES - Based on Authentic Perplexity Research

// AUTHENTIC VEHICLE PLATFORMS
export const configurator_platforms = sqliteTable('configurator_platforms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  platformId: text('platform_id').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  basePrice: text('base_price').notNull(),
  imageUrl: text('image_url'),
  bodyTypes: text('body_types', { mode: 'json' }).$type<string[]>().notNull(),
  baseHp: integer('base_hp').notNull(),
  baseAcceleration: text('base_acceleration').notNull(),
  baseTopSpeed: integer('base_top_speed').notNull(),
  marketValue: integer('market_value').notNull(), // 0-100 rating
  investmentGrade: text('investment_grade').notNull(),
  appreciationRate: text('appreciation_rate').notNull(),
  manufacturer: text('manufacturer').notNull(),
  yearRange: text('year_range').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC ENGINE OPTIONS - Based on Perplexity Research
export const configurator_engines = sqliteTable('configurator_engines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  engineId: text('engine_id').notNull().unique(),
  name: text('name').notNull(),
  displacement: text('displacement').notNull(),
  horsepower: integer('horsepower').notNull(),
  torque: integer('torque').notNull(),
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  engineType: text('engine_type').notNull(), // 'naturally_aspirated', 'supercharged', 'turbocharged'
  fuelSystem: text('fuel_system').notNull(),
  compressionRatio: text('compression_ratio'),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC TRANSMISSION OPTIONS - Based on Perplexity Research
export const configurator_transmissions = sqliteTable('configurator_transmissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  transmissionId: text('transmission_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'manual', 'automatic'
  speeds: integer('speeds').notNull(),
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  torqueRating: integer('torque_rating').notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC SUSPENSION OPTIONS - Based on Perplexity Research
export const configurator_suspensions = sqliteTable('configurator_suspensions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  suspensionId: text('suspension_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'coilover', 'air_suspension', 'ifs_conversion'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  adjustable: integer('adjustable', { mode: 'boolean' }).notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC REAR AXLE OPTIONS - Based on Perplexity Research
export const configurator_rear_axles = sqliteTable('configurator_rear_axles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  axleId: text('axle_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'ford_9_inch', 'dana_60', 'gm_12_bolt'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  torqueRating: integer('torque_rating').notNull(),
  gearRatios: text('gear_ratios', { mode: 'json' }).$type<string[]>().notNull(),
  differentialType: text('differential_type').notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC FUEL SYSTEM OPTIONS - Based on Perplexity Research
export const configurator_fuel_systems = sqliteTable('configurator_fuel_systems', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fuelSystemId: text('fuel_system_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'efi', 'carburetor', 'fuel_injection'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  flowRate: integer('flow_rate').notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC INTERIOR OPTIONS - Based on Perplexity Research
export const configurator_interiors = sqliteTable('configurator_interiors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  interiorId: text('interior_id').notNull().unique(),
  name: text('name').notNull(),
  style: text('style').notNull(), // 'classic', 'vintage_luxury', 'modern_sport', 'custom_bespoke'
  description: text('description').notNull(),
  price: text('price').notNull(),
  materials: text('materials', { mode: 'json' }).$type<string[]>().notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  seatingType: text('seating_type').notNull(),
  gaugeType: text('gauge_type').notNull(),
  audioSystem: integer('audio_system', { mode: 'boolean' }).notNull(),
  climateControl: integer('climate_control', { mode: 'boolean' }).notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC BODYWORK OPTIONS - Based on Perplexity Research
export const configurator_bodyworks = sqliteTable('configurator_bodyworks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bodyworkId: text('bodywork_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'widebody_kit', 'fender_flares', 'custom_fiberglass', 'carbon_fiber'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  material: text('material').notNull(),
  components: text('components', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC GLASS OPTIONS - Based on Perplexity Research
export const configurator_glass_options = sqliteTable('configurator_glass_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  glassId: text('glass_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'tinted', 'tempered_safety', 'custom_windshield', 'power_windows'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  tintLevel: text('tint_level'),
  safetyRating: text('safety_rating').notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// CUSTOMER CONFIGURATIONS
export const customer_configurations = sqliteTable('customer_configurations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  configurationId: text('configuration_id').notNull().unique(),
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  platformId: integer('platform_id').notNull().references(() => configurator_platforms.id),
  engineId: integer('engine_id').references(() => configurator_engines.id),
  transmissionId: integer('transmission_id').references(() => configurator_transmissions.id),
  suspensionId: integer('suspension_id').references(() => configurator_suspensions.id),
  rearAxleId: integer('rear_axle_id').references(() => configurator_rear_axles.id),
  fuelSystemId: integer('fuel_system_id').references(() => configurator_fuel_systems.id),
  interiorId: integer('interior_id').references(() => configurator_interiors.id),
  bodyworkId: integer('bodywork_id').references(() => configurator_bodyworks.id),
  glassId: integer('glass_id').references(() => configurator_glass_options.id),
  colorChoice: text('color_choice'),
  wheelChoice: text('wheel_choice'),
  additionalOptions: text('additional_options', { mode: 'json' }).$type<string[]>(),
  totalPrice: text('total_price').notNull(),
  aiRecommendations: text('ai_recommendations', { mode: 'json' }).$type<any>(),
  configurationNotes: text('configuration_notes'),
  status: text('status').notNull().default('draft'), // 'draft', 'quoted', 'approved', 'in_progress', 'completed'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ENHANCED CONFIGURATOR SCHEMA EXPORTS
export const configuratorPlatformsInsertSchema = createInsertSchema(configurator_platforms);
export type EnhancedVehiclePlatformInsert = z.infer<typeof configuratorPlatformsInsertSchema>;
export type EnhancedVehiclePlatform = typeof configurator_platforms.$inferSelect;

export const configuratorEnginesInsertSchema = createInsertSchema(configurator_engines);
export type EnhancedEngineOptionInsert = z.infer<typeof configuratorEnginesInsertSchema>;
export type EnhancedEngineOption = typeof configurator_engines.$inferSelect;

export const configuratorTransmissionsInsertSchema = createInsertSchema(configurator_transmissions);
export type EnhancedTransmissionOptionInsert = z.infer<typeof configuratorTransmissionsInsertSchema>;
export type EnhancedTransmissionOption = typeof configurator_transmissions.$inferSelect;

export const configuratorSuspensionsInsertSchema = createInsertSchema(configurator_suspensions);
export type ConfiguratorSuspensionOptionInsert = z.infer<typeof configuratorSuspensionsInsertSchema>;
export type ConfiguratorSuspensionOption = typeof configurator_suspensions.$inferSelect;

export const configuratorRearAxlesInsertSchema = createInsertSchema(configurator_rear_axles);
export type ConfiguratorRearAxleOptionInsert = z.infer<typeof configuratorRearAxlesInsertSchema>;
export type ConfiguratorRearAxleOption = typeof configurator_rear_axles.$inferSelect;

export const configuratorFuelSystemsInsertSchema = createInsertSchema(configurator_fuel_systems);
export type ConfiguratorFuelSystemOptionInsert = z.infer<typeof configuratorFuelSystemsInsertSchema>;
export type ConfiguratorFuelSystemOption = typeof configurator_fuel_systems.$inferSelect;

export const configuratorInteriorsInsertSchema = createInsertSchema(configurator_interiors);
export type EnhancedInteriorOptionInsert = z.infer<typeof configuratorInteriorsInsertSchema>;
export type EnhancedInteriorOption = typeof configurator_interiors.$inferSelect;

export const configuratorBodyworksInsertSchema = createInsertSchema(configurator_bodyworks);
export type ConfiguratorBodyworkOptionInsert = z.infer<typeof configuratorBodyworksInsertSchema>;
export type ConfiguratorBodyworkOption = typeof configurator_bodyworks.$inferSelect;

export const configuratorGlassOptionsInsertSchema = createInsertSchema(configurator_glass_options);
export type ConfiguratorGlassOptionInsert = z.infer<typeof configuratorGlassOptionsInsertSchema>;
export type ConfiguratorGlassOption = typeof configurator_glass_options.$inferSelect;

export const customerConfigurationsInsertSchema = createInsertSchema(customer_configurations);
export type ConfiguratorCustomerConfigurationInsert = z.infer<typeof customerConfigurationsInsertSchema>;
export type ConfiguratorCustomerConfiguration = typeof customer_configurations.$inferSelect;


// UNIFIED CARS FOR SALE SYSTEM
// Consolidates Gateway Classic Cars + Regional Research + Market Analysis
export const carsForSale = sqliteTable("cars_for_sale", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Core Vehicle Data
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: text("price"),
  
  // Source & Location Tracking
  sourceType: text("source_type").notNull(), // 'gateway' | 'research' | 'import'
  sourceName: text("source_name").notNull(), // 'Gateway Classic Cars' | 'Hemmings' | etc
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationRegion: text("location_region"), // 'south' | 'midwest' | 'west' | 'northeast'
  
  // Vehicle Details
  category: text("category"), // 'Muscle Cars' | 'Sports Cars' | etc
  condition: text("condition"), // 'Excellent' | 'Good' | 'Driver' | etc
  mileage: integer("mileage"),
  exteriorColor: text("exterior_color"),
  interiorColor: text("interior_color"),
  engine: text("engine"),
  transmission: text("transmission"),
  
  // Investment Analysis Integration
  investmentGrade: text("investment_grade"), // 'A+' | 'A' | 'A-' | 'B+' | etc
  appreciationRate: text("appreciation_rate"), // '35.2%/year'
  marketTrend: text("market_trend"), // 'rising' | 'stable' | 'declining'
  valuationConfidence: text("valuation_confidence"), // '0.85' = 85% confidence
  
  // Media & Documentation
  imageUrl: text("image_url"),
  description: text("description"),
  features: text("features", { mode: 'json' }), // Flexible JSON for various features
  
  // Administrative
  stockNumber: text("stock_number").unique(),
  vin: text("vin"),
  
  // Research Integration
  researchNotes: text("research_notes"),
  marketData: text("market_data", { mode: 'json' }), // Pricing trends, comparable sales, etc
  perplexityAnalysis: text("perplexity_analysis", { mode: 'json' }), // AI-generated market insights
  
  // Timestamps
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

// Unified Cars for Sale schema
export const carsForSaleInsertSchema = createInsertSchema(carsForSale);
export type InsertCarForSale = z.infer<typeof carsForSaleInsertSchema>;
export type CarForSale = typeof carsForSale.$inferSelect;

// Event Comments table
export const eventComments = sqliteTable("event_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer("event_id").notNull().references(() => carShowEvents.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
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

export const userConfigurationsRelations = relations(customer_configurations, ({ one }) => ({
  user: one(users, {
    fields: [customer_configurations.id],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const builderProfilesInsertSchema = createInsertSchema(builderProfiles);
export type InsertBuilderProfile = z.infer<typeof builderProfilesInsertSchema>;
export type BuilderProfile = typeof builderProfiles.$inferSelect;

export const technicalSpecificationsInsertSchema = createInsertSchema(technicalSpecifications);
export type InsertTechnicalSpecification = z.infer<typeof technicalSpecificationsInsertSchema>;
export type TechnicalSpecification = typeof technicalSpecifications.$inferSelect;

export const eventVenuesInsertSchema = createInsertSchema(eventVenues);
export type InsertEventVenue = z.infer<typeof eventVenuesInsertSchema>;
export type EventVenue = typeof eventVenues.$inferSelect;

export const buildGuidesInsertSchema = createInsertSchema(buildGuides);
export type InsertBuildGuide = z.infer<typeof buildGuidesInsertSchema>;
export type BuildGuide = typeof buildGuides.$inferSelect;

export const investmentAnalyticsInsertSchema = createInsertSchema(investmentAnalytics);
export type InsertInvestmentAnalytic = z.infer<typeof investmentAnalyticsInsertSchema>;
export type InvestmentAnalytic = typeof investmentAnalytics.$inferSelect;

export const vendorPartnershipsInsertSchema = createInsertSchema(vendorPartnerships);
export type InsertVendorPartnership = z.infer<typeof vendorPartnershipsInsertSchema>;
export type VendorPartnership = typeof vendorPartnerships.$inferSelect;

export const usersRelations = relations(users, ({ one, many }) => ({
  configurations: many(customer_configurations),
  itineraries: many(userItineraries),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  comments: many(eventComments),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  luxuryShowcase: one(luxuryShowcases, {
    fields: [projects.id],
    references: [luxuryShowcases.projectId],
  }),
}));

export const luxuryShowcaseRelations = relations(luxuryShowcases, ({ one }) => ({
  project: one(projects, {
    fields: [luxuryShowcases.projectId],
    references: [projects.id],
  }),
}));

export const carShowEventsRelations = relations(carShowEvents, ({ many }) => ({
  itineraryItems: many(userItineraries),
  comments: many(eventComments),
}));

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

export const configuratorEnginesRelations = relations(configurator_engines, ({ many }) => ({
	platforms: many(configurator_engines_to_platforms),
}));

export const configuratorPlatformsRelations = relations(configurator_platforms, ({ many }) => ({
	engines: many(configurator_engines_to_platforms),
}));

export const configurator_engines_to_platforms = sqliteTable('configurator_engines_to_platforms', {
  engine_id: integer('engine_id').notNull().references(() => configurator_engines.id),
  platform_id: integer('platform_id').notNull().references(() => configurator_platforms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.engine_id, t.platform_id] }),
}));

export const configuratorTransmissionsRelations = relations(configurator_transmissions, ({ many }) => ({
	engines: many(configurator_transmissions_to_engines),
}));

export const configurator_transmissions_to_engines = sqliteTable('configurator_transmissions_to_engines', {
  transmission_id: integer('transmission_id').notNull().references(() => configurator_transmissions.id),
  engine_id: integer('engine_id').notNull().references(() => configurator_engines.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.transmission_id, t.engine_id] }),
}));

export const configuratorSuspensionsRelations = relations(configurator_suspensions, ({ many }) => ({
	platforms: many(configurator_suspensions_to_platforms),
}));

export const configurator_suspensions_to_platforms = sqliteTable('configurator_suspensions_to_platforms', {
  suspension_id: integer('suspension_id').notNull().references(() => configurator_suspensions.id),
  platform_id: integer('platform_id').notNull().references(() => configurator_platforms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.suspension_id, t.platform_id] }),
}));

export const configuratorRearAxlesRelations = relations(configurator_rear_axles, ({ many }) => ({
	platforms: many(configurator_rear_axles_to_platforms),
}));

export const configurator_rear_axles_to_platforms = sqliteTable('configurator_rear_axles_to_platforms', {
  rear_axle_id: integer('rear_axle_id').notNull().references(() => configurator_rear_axles.id),
  platform_id: integer('platform_id').notNull().references(() => configurator_platforms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.rear_axle_id, t.platform_id] }),
}));

export const configuratorFuelSystemsRelations = relations(configurator_fuel_systems, ({ many }) => ({
	engines: many(configurator_fuel_systems_to_engines),
}));

export const configurator_fuel_systems_to_engines = sqliteTable('configurator_fuel_systems_to_engines', {
  fuel_system_id: integer('fuel_system_id').notNull().references(() => configurator_fuel_systems.id),
  engine_id: integer('engine_id').notNull().references(() => configurator_engines.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.fuel_system_id, t.engine_id] }),
}));

export const configuratorInteriorsRelations = relations(configurator_interiors, ({ many }) => ({
	platforms: many(configurator_interiors_to_platforms),
}));

export const configurator_interiors_to_platforms = sqliteTable('configurator_interiors_to_platforms', {
  interior_id: integer('interior_id').notNull().references(() => configurator_interiors.id),
  platform_id: integer('platform_id').notNull().references(() => configurator_platforms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.interior_id, t.platform_id] }),
}));

export const configuratorBodyworksRelations = relations(configurator_bodyworks, ({ many }) => ({
	platforms: many(configurator_bodyworks_to_platforms),
}));

export const configurator_bodyworks_to_platforms = sqliteTable('configurator_bodyworks_to_platforms', {
  bodywork_id: integer('bodywork_id').notNull().references(() => configurator_bodyworks.id),
  platform_id: integer('platform_id').notNull().references(() => configurator_platforms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.bodywork_id, t.platform_id] }),
}));

export const configuratorGlassOptionsRelations = relations(configurator_glass_options, ({ many }) => ({
	platforms: many(configurator_glass_options_to_platforms),
}));

export const configurator_glass_options_to_platforms = sqliteTable('configurator_glass_options_to_platforms', {
  glass_option_id: integer('glass_option_id').notNull().references(() => configurator_glass_options.id),
  platform_id: integer('platform_id').notNull().references(() => configurator_platforms.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.glass_option_id, t.platform_id] }),
}));
