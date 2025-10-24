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

export const usersRelations = relations(users, ({ one, many }) => ({
  configurations: many(userConfigurations),
  itineraries: many(userItineraries),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  comments: many(eventComments),
}));

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

// Relation between projects and luxury showcases
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

export const luxuryShowcaseInsertSchema = createInsertSchema(luxuryShowcases);
export type InsertLuxuryShowcase = z.infer<typeof luxuryShowcaseInsertSchema>;
export type LuxuryShowcase = typeof luxuryShowcases.$inferSelect;

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

// Car Configurator Schemas - Removed duplicates

// Engine Options table
export const engineOptions = sqliteTable("engine_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  horsepower: integer("horsepower").notNull(),
  torque: integer("torque").notNull(),
  displacement: text("displacement").notNull(),
  manufacturer: text("manufacturer").notNull(),
  fuelType: text("fuel_type").notNull(),
  image: text("image").notNull(),
  price: text("price").notNull(),
  compatibleModels: text("compatible_models", { mode: 'json' }).notNull().$type<number[]>(),
  mcKenneyFeatures: text("mckenney_features", { mode: 'json' }).$type<string[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const engineOptionsInsertSchema = createInsertSchema(engineOptions);
export type InsertEngineOption = z.infer<typeof engineOptionsInsertSchema>;
export type EngineOption = typeof engineOptions.$inferSelect;

// Transmission Options table
export const transmissionOptions = sqliteTable("transmission_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  speeds: integer("speeds").notNull(),
  manufacturer: text("manufacturer").notNull(),
  image: text("image").notNull(),
  price: text("price").notNull(),
  compatibleEngines: text("compatible_engines", { mode: 'json' }).notNull().$type<number[]>(),
  compatibleModels: text("compatible_models", { mode: 'json' }).notNull().$type<number[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const transmissionOptionsInsertSchema = createInsertSchema(transmissionOptions);
export type InsertTransmissionOption = z.infer<typeof transmissionOptionsInsertSchema>;
export type TransmissionOption = typeof transmissionOptions.$inferSelect;

// Color Options table
export const colorOptions = sqliteTable("color_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hex: text("hex").notNull(),
  image: text("image").notNull(),
  price: text("price").notNull(),
  type: text("type").notNull(), // e.g., metallic, matte, gloss
  availableForModels: text("available_for_models", { mode: 'json' }).notNull().$type<number[]>(),
  popular: integer("popular", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const colorOptionsInsertSchema = createInsertSchema(colorOptions);
export type InsertColorOption = z.infer<typeof colorOptionsInsertSchema>;
export type ColorOption = typeof colorOptions.$inferSelect;

// Wheel Options table
export const wheelOptions = sqliteTable("wheel_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  diameter: integer("diameter").notNull(),
  width: text("width").notNull(),
  material: text("material").notNull(),
  style: text("style").notNull(),
  image: text("image").notNull(),
  price: text("price").notNull(),
  compatibleModels: text("compatible_models", { mode: 'json' }).notNull().$type<number[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const wheelOptionsInsertSchema = createInsertSchema(wheelOptions);
export type InsertWheelOption = z.infer<typeof wheelOptionsInsertSchema>;
export type WheelOption = typeof wheelOptions.$inferSelect;

// Interior Options table
export const interiorOptions = sqliteTable("interior_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  material: text("material").notNull(),
  color: text("color").notNull(),
  image: text("image").notNull(),
  price: text("price").notNull(),
  compatibleModels: text("compatible_models", { mode: 'json' }).notNull().$type<number[]>(),
  features: text("features", { mode: 'json' }).notNull().$type<string[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const interiorOptionsInsertSchema = createInsertSchema(interiorOptions);
export type InsertInteriorOption = z.infer<typeof interiorOptionsInsertSchema>;
export type InteriorOption = typeof interiorOptions.$inferSelect;

// AI Integration Options table
export const aiOptions = sqliteTable("ai_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., performance, safety, entertainment
  image: text("image").notNull(),
  price: text("price").notNull(),
  compatibleModels: text("compatible_models", { mode: 'json' }).notNull().$type<number[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const aiOptionsInsertSchema = createInsertSchema(aiOptions);
export type InsertAiOption = z.infer<typeof aiOptionsInsertSchema>;
export type AiOption = typeof aiOptions.$inferSelect;

// Additional Options table
export const additionalOptions = sqliteTable("additional_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., performance, safety, comfort
  image: text("image").notNull(),
  price: text("price").notNull(),
  compatibleModels: text("compatible_models", { mode: 'json' }).notNull().$type<number[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const additionalOptionsInsertSchema = createInsertSchema(additionalOptions);
export type InsertAdditionalOption = z.infer<typeof additionalOptionsInsertSchema>;
export type AdditionalOption = typeof additionalOptions.$inferSelect;

// User Configurations table (for saved configurations)
export const userConfigurations = sqliteTable("user_configurations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  carModelId: integer("car_model_id").notNull(),
  engineId: integer("engine_id"),
  transmissionId: integer("transmission_id"),
  colorId: integer("color_id"),
  wheelId: integer("wheel_id"),
  interiorId: integer("interior_id"),
  selectedAiOptions: text("selected_ai_options", { mode: 'json' }).$type<number[]>(),
  selectedAdditionalOptions: text("selected_additional_options", { mode: 'json' }).$type<number[]>(),
  aiRecommendations: text("ai_recommendations"),
  totalPrice: text("total_price"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

// Relations for user configurations
export const userConfigurationsRelations = relations(userConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [userConfigurations.userId],
    references: [users.id],
  }),
}));

export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  homeLocation: text("home_location", { mode: 'json' }).$type<{ city?: string; state?: string; zip?: string; }>(),
  preferredCategories: text("preferred_categories", { mode: 'json' }).$type<string[]>(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const userConfigurationsInsertSchema = createInsertSchema(userConfigurations);
export type InsertUserConfiguration = z.infer<typeof userConfigurationsInsertSchema>;
export type UserConfiguration = typeof userConfigurations.$inferSelect;

// Enhanced market data tables for comprehensive analytics
export const marketValuations = sqliteTable("market_valuations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  yearRange: text("year_range"),
  engineVariant: text("engine_variant"),
  bodyStyle: text("body_style"),
  conditionRating: text("condition_rating"),
  hagertyValue: text("hagerty_value"),
  auctionHigh: text("auction_high"),
  auctionLow: text("auction_low"),
  averagePrice: text("average_price"),
  trendPercentage: text("trend_percentage"),
  marketSegment: text("market_segment"),
  investmentGrade: text("investment_grade"),
  lastUpdated: integer("last_updated", { mode: 'timestamp' }),
  sourceData: text("source_data"),
  createdAt: integer("created_at", { mode: 'timestamp' }),
});

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

// Schema validation for new tables
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

// Schema validation for all new enhanced tables
export const marketValuationsInsertSchema = createInsertSchema(marketValuations);
export type InsertMarketValuation = z.infer<typeof marketValuationsInsertSchema>;

export const carShowEventsRelations = relations(carShowEvents, ({ many }) => ({
  itineraryItems: many(userItineraries),
  comments: many(eventComments),
}));

export const carShowEventsInsertSchema = createInsertSchema(carShowEvents);
export type InsertCarShowEvent = z.infer<typeof carShowEventsInsertSchema>;
export type CarShowEvent = typeof carShowEvents.$inferSelect;

export const userItineraries = sqliteTable("user_itineraries", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer("event_id").notNull().references(() => carShowEvents.id, { onDelete: 'cascade' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
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

export type MarketValuation = typeof marketValuations.$inferSelect;

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

// Gateway Classic Cars Inventory Table - Authentic vehicle listings
export const gatewayVehicles = sqliteTable("gateway_vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stockNumber: text("stock_number").unique().notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  engine: text("engine"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  exterior: text("exterior"),
  interior: text("interior"),
  mileage: integer("mileage"),
  price: text("price").notNull(),
  description: text("description"),
  features: text("features", { mode: 'json' }),
  condition: text("condition").default("Excellent"),
  location: text("location").default("St. Louis, Missouri"),
  imageUrl: text("image_url"),
  galleryImages: text("gallery_images", { mode: 'json' }),
  vin: text("vin"),
  bodyStyle: text("body_style"),
  fuelType: text("fuel_type"),
  cylinders: integer("cylinders"),
  displacement: text("displacement"),
  horsepower: integer("horsepower"),
  torque: integer("torque"),
  acceleration: text("acceleration"),
  topSpeed: text("top_speed"),
  interiorColor: text("interior_color"),
  exteriorColor: text("exterior_color"),
  wheelSize: text("wheel_size"),
  tireSize: text("tire_size"),
  suspension: text("suspension"),
  brakes: text("brakes"),
  steering: text("steering"),
  airConditioning: integer("air_conditioning", { mode: 'boolean' }).default(false),
  powerSteering: integer("power_steering", { mode: 'boolean' }).default(false),
  powerBrakes: integer("power_brakes", { mode: 'boolean' }).default(false),
  powerWindows: integer("power_windows", { mode: 'boolean' }).default(false),
  powerSeats: integer("power_seats", { mode: 'boolean' }).default(false),
  heatedSeats: integer("heated_seats", { mode: 'boolean' }).default(false),
  leatherSeats: integer("leather_seats", { mode: 'boolean' }).default(false),
  sunroof: integer("sunroof", { mode: 'boolean' }).default(false),
  convertible: integer("convertible", { mode: 'boolean' }).default(false),
  hardtop: integer("hardtop", { mode: 'boolean' }).default(false),
  tiltWheel: integer("tilt_wheel", { mode: 'boolean' }).default(false),
  cruiseControl: integer("cruise_control", { mode: 'boolean' }).default(false),
  amFmRadio: integer("am_fm_radio", { mode: 'boolean' }).default(false),
  cdPlayer: integer("cd_player", { mode: 'boolean' }).default(false),
  cassette: integer("cassette", { mode: 'boolean' }).default(false),
  premium_sound: integer("premium_sound", { mode: 'boolean' }).default(false),
  alarmsecurity: integer("alarm_security", { mode: 'boolean' }).default(false),
  keylessEntry: integer("keyless_entry", { mode: 'boolean' }).default(false),
  antiLockBrakes: integer("anti_lock_brakes", { mode: 'boolean' }).default(false),
  driverAirbag: integer("driver_airbag", { mode: 'boolean' }).default(false),
  passengerAirbag: integer("passenger_airbag", { mode: 'boolean' }).default(false),
  sideAirbags: integer("side_airbags", { mode: 'boolean' }).default(false),
  tractionControl: integer("traction_control", { mode: 'boolean' }).default(false),
  stabilityControl: integer("stability_control", { mode: 'boolean' }).default(false),
  category: text("category").default("classic"), // classic, muscle, exotic, hot_rod, vintage
  investmentGrade: text("investment_grade"), // A+, A, B+, B, C+, C
  appreciationPotential: text("appreciation_potential"), // High, Medium, Low
  rarity: text("rarity"), // Very Rare, Rare, Uncommon, Common
  restorationLevel: text("restoration_level"), // Concours, #1, #2, #3, #4, Project
  marketTrend: text("market_trend"), // Rising, Stable, Declining
  comparableListings: integer("comparable_listings"),
  avgMarketPrice: text("avg_market_price"),
  priceVariance: text("price_variance"),
  daysOnMarket: integer("days_on_market"),
  viewCount: integer("view_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  sold: integer("sold", { mode: 'boolean' }).default(false),
  soldDate: integer("sold_date", { mode: 'timestamp' }),
  soldPrice: text("sold_price"),
  dataSource: text("data_source").default("gateway_classics"),
  lastUpdated: integer("last_updated", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

export const gatewayVehiclesInsertSchema = createInsertSchema(gatewayVehicles);
export type InsertGatewayVehicle = z.infer<typeof gatewayVehiclesInsertSchema>;
export type GatewayVehicle = typeof gatewayVehicles.$inferSelect;

// ENHANCED CAR CONFIGURATOR TABLES - Based on Authentic Perplexity Research

// AUTHENTIC VEHICLE PLATFORMS
export const enhancedVehiclePlatforms = sqliteTable('enhanced_vehicle_platforms', {
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
export const enhancedEngineOptions = sqliteTable('enhanced_engine_options', {
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
  compatiblePlatforms: text('compatible_platforms', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC TRANSMISSION OPTIONS - Based on Perplexity Research
export const enhancedTransmissionOptions = sqliteTable('enhanced_transmission_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  transmissionId: text('transmission_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'manual', 'automatic'
  speeds: integer('speeds').notNull(),
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  torqueRating: integer('torque_rating').notNull(),
  compatibleEngines: text('compatible_engines', { mode: 'json' }).$type<string[]>().notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC SUSPENSION OPTIONS - Based on Perplexity Research
export const configuratorSuspensionOptions = sqliteTable('configurator_suspension_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  suspensionId: text('suspension_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'coilover', 'air_suspension', 'ifs_conversion'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  adjustable: integer('adjustable', { mode: 'boolean' }).notNull(),
  compatiblePlatforms: text('compatible_platforms', { mode: 'json' }).$type<string[]>().notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC REAR AXLE OPTIONS - Based on Perplexity Research
export const configuratorRearAxleOptions = sqliteTable('configurator_rear_axle_options', {
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
  compatiblePlatforms: text('compatible_platforms', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC FUEL SYSTEM OPTIONS - Based on Perplexity Research
export const configuratorFuelSystemOptions = sqliteTable('configurator_fuel_system_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fuelSystemId: text('fuel_system_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'efi', 'carburetor', 'fuel_injection'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  flowRate: integer('flow_rate').notNull(),
  features: text('features', { mode: 'json' }).$type<string[]>().notNull(),
  compatibleEngines: text('compatible_engines', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC INTERIOR OPTIONS - Based on Perplexity Research
export const enhancedInteriorOptions = sqliteTable('enhanced_interior_options', {
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
  compatiblePlatforms: text('compatible_platforms', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC BODYWORK OPTIONS - Based on Perplexity Research
export const configuratorBodyworkOptions = sqliteTable('configurator_bodywork_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bodyworkId: text('bodywork_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'widebody_kit', 'fender_flares', 'custom_fiberglass', 'carbon_fiber'
  description: text('description').notNull(),
  price: text('price').notNull(),
  manufacturer: text('manufacturer').notNull(),
  material: text('material').notNull(),
  components: text('components', { mode: 'json' }).$type<string[]>().notNull(),
  compatiblePlatforms: text('compatible_platforms', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// AUTHENTIC GLASS OPTIONS - Based on Perplexity Research
export const configuratorGlassOptions = sqliteTable('configurator_glass_options', {
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
  compatiblePlatforms: text('compatible_platforms', { mode: 'json' }).$type<string[]>().notNull(),
  installationCost: text('installation_cost').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// CUSTOMER CONFIGURATIONS
export const configuratorCustomerConfigurations = sqliteTable('configurator_customer_configurations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  configurationId: text('configuration_id').notNull().unique(),
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  platformId: text('platform_id').notNull(),
  engineId: text('engine_id'),
  transmissionId: text('transmission_id'),
  suspensionId: text('suspension_id'),
  rearAxleId: text('rear_axle_id'),
  fuelSystemId: text('fuel_system_id'),
  interiorId: text('interior_id'),
  bodyworkId: text('bodywork_id'),
  glassId: text('glass_id'),
  colorChoice: text('color_choice'),
  wheelChoice: text('wheel_choice'),
  additionalOptions: text('additional_options', { mode: 'json' }).$type<string[]>().notNull(),
  totalPrice: text('total_price').notNull(),
  aiRecommendations: text('ai_recommendations', { mode: 'json' }).$type<any>(),
  configurationNotes: text('configuration_notes'),
  status: text('status').notNull().default('draft'), // 'draft', 'quoted', 'approved', 'in_progress', 'completed'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// ENHANCED CONFIGURATOR SCHEMA EXPORTS
export const enhancedVehiclePlatformsInsertSchema = createInsertSchema(enhancedVehiclePlatforms);
export type EnhancedVehiclePlatformInsert = z.infer<typeof enhancedVehiclePlatformsInsertSchema>;
export type EnhancedVehiclePlatform = typeof enhancedVehiclePlatforms.$inferSelect;

export const enhancedEngineOptionsInsertSchema = createInsertSchema(enhancedEngineOptions);
export type EnhancedEngineOptionInsert = z.infer<typeof enhancedEngineOptionsInsertSchema>;
export type EnhancedEngineOption = typeof enhancedEngineOptions.$inferSelect;

export const enhancedTransmissionOptionsInsertSchema = createInsertSchema(enhancedTransmissionOptions);
export type EnhancedTransmissionOptionInsert = z.infer<typeof enhancedTransmissionOptionsInsertSchema>;
export type EnhancedTransmissionOption = typeof enhancedTransmissionOptions.$inferSelect;

export const configuratorSuspensionOptionsInsertSchema = createInsertSchema(configuratorSuspensionOptions);
export type ConfiguratorSuspensionOptionInsert = z.infer<typeof configuratorSuspensionOptionsInsertSchema>;
export type ConfiguratorSuspensionOption = typeof configuratorSuspensionOptions.$inferSelect;

export const configuratorRearAxleOptionsInsertSchema = createInsertSchema(configuratorRearAxleOptions);
export type ConfiguratorRearAxleOptionInsert = z.infer<typeof configuratorRearAxleOptionsInsertSchema>;
export type ConfiguratorRearAxleOption = typeof configuratorRearAxleOptions.$inferSelect;

export const configuratorFuelSystemOptionsInsertSchema = createInsertSchema(configuratorFuelSystemOptions);
export type ConfiguratorFuelSystemOptionInsert = z.infer<typeof configuratorFuelSystemOptionsInsertSchema>;
export type ConfiguratorFuelSystemOption = typeof configuratorFuelSystemOptions.$inferSelect;

export const enhancedInteriorOptionsInsertSchema = createInsertSchema(enhancedInteriorOptions);
export type EnhancedInteriorOptionInsert = z.infer<typeof enhancedInteriorOptionsInsertSchema>;
export type EnhancedInteriorOption = typeof enhancedInteriorOptions.$inferSelect;

export const configuratorBodyworkOptionsInsertSchema = createInsertSchema(configuratorBodyworkOptions);
export type ConfiguratorBodyworkOptionInsert = z.infer<typeof configuratorBodyworkOptionsInsertSchema>;
export type ConfiguratorBodyworkOption = typeof configuratorBodyworkOptions.$inferSelect;

export const configuratorGlassOptionsInsertSchema = createInsertSchema(configuratorGlassOptions);
export type ConfiguratorGlassOptionInsert = z.infer<typeof configuratorGlassOptionsInsertSchema>;
export type ConfiguratorGlassOption = typeof configuratorGlassOptions.$inferSelect;

export const configuratorCustomerConfigurationsInsertSchema = createInsertSchema(configuratorCustomerConfigurations);
export type ConfiguratorCustomerConfigurationInsert = z.infer<typeof configuratorCustomerConfigurationsInsertSchema>;
export type ConfiguratorCustomerConfiguration = typeof configuratorCustomerConfigurations.$inferSelect;

// Car Configurator Tables - Comprehensive step-by-step configuration system

// Available base vehicles for configurator
export const configuratorCarModels = sqliteTable("configurator_car_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  make: text("make").notNull(),
  model: text("model").notNull(),
  yearStart: integer("year_start").notNull(),
  yearEnd: integer("year_end").notNull(),
  category: text("category").notNull(),
  basePrice: text("base_price").notNull(),
  popularity: integer("popularity").default(0),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

// Transmission choices for step-by-step configurator (keeping original simple structure)
export const simpleTransmissionOptions = sqliteTable("simple_transmission_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  manufacturer: text("manufacturer").notNull(),
  transmissionName: text("transmission_name").notNull(),
  type: text("type").notNull(), // manual, automatic, dual-clutch
  gears: integer("gears").notNull(),
  torqueRating: integer("torque_rating").notNull(),
  price: text("price").notNull(),
  compatibility: text("compatibility", { mode: 'json' }).notNull().$type<string[]>(),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

// Paint and finish options for step-by-step configurator
export const configuratorColorOptions = sqliteTable("configurator_color_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  colorName: text("color_name").notNull(),
  colorCode: text("color_code").notNull(),
  finish: text("finish").notNull(), // metallic, pearl, matte, gloss
  price: text("price").notNull(),
  category: text("category").notNull(), // classic, modern, custom
  manufacturer: text("manufacturer").notNull(),
  popularity: integer("popularity").default(0),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

// Wheel packages for step-by-step configurator
export const configuratorWheelOptions = sqliteTable("configurator_wheel_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  brand: text("brand").notNull(),
  wheelName: text("wheel_name").notNull(),
  diameter: integer("diameter").notNull(),
  width: text("width").notNull(),
  offset: integer("offset").notNull(),
  price: text("price").notNull(),
  style: text("style").notNull(), // classic, modern, racing, luxury
  material: text("material").notNull(), // steel, aluminum, forged
  compatibility: text("compatibility", { mode: 'json' }).notNull().$type<string[]>(),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

// Interior packages for step-by-step configurator
export const configuratorInteriorOptions = sqliteTable("configurator_interior_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packageName: text("package_name").notNull(),
  description: text("description").notNull(),
  materials: text("materials", { mode: 'json' }).notNull().$type<string[]>(),
  features: text("features", { mode: 'json' }).notNull().$type<string[]>(),
  price: text("price").notNull(),
  compatibility: text("compatibility", { mode: 'json' }).notNull().$type<string[]>(),
  manufacturer: text("manufacturer").notNull(),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull()
});

// Configurator schemas for existing tables
export const configuratorCarModelsInsertSchema = createInsertSchema(configuratorCarModels);
export type InsertConfiguratorCarModel = z.infer<typeof configuratorCarModelsInsertSchema>;
export type ConfiguratorCarModel = typeof configuratorCarModels.$inferSelect;

export const configuratorColorOptionsInsertSchema = createInsertSchema(configuratorColorOptions);
export type InsertConfiguratorColorOption = z.infer<typeof configuratorColorOptionsInsertSchema>;
export type ConfiguratorColorOption = typeof configuratorColorOptions.$inferSelect;

export const configuratorWheelOptionsInsertSchema = createInsertSchema(configuratorWheelOptions);
export type InsertConfiguratorWheelOption = z.infer<typeof configuratorWheelOptionsInsertSchema>;
export type ConfiguratorWheelOption = typeof configuratorWheelOptions.$inferSelect;

export const configuratorInteriorOptionsInsertSchema = createInsertSchema(configuratorInteriorOptions);
export type InsertConfiguratorInteriorOption = z.infer<typeof configuratorInteriorOptionsInsertSchema>;
export type ConfiguratorInteriorOption = typeof configuratorInteriorOptions.$inferSelect;

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

/**
 * Phase 2 Task 2.1: Price History Table
 * Tracks price changes over time for trend analysis
 * Enables real appreciation rate calculations
 */
export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vehicleId: integer("vehicle_id").notNull().references(() => carsForSale.id, { onDelete: 'cascade' }),
  price: text("price").notNull(), // Stored as text for consistency with carsForSale
  sourceType: text("source_type").notNull(), // 'import', 'update', 'market_analysis'
  sourceName: text("source_name"), // e.g., 'Perplexity Discovery', 'Manual Import'
  recordedDate: integer("recorded_date", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
});

export const priceHistoryInsertSchema = createInsertSchema(priceHistory);
export type InsertPriceHistory = z.infer<typeof priceHistoryInsertSchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
