import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (enhanced with admin role and email)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  galleryImages: jsonb("gallery_images").notNull().$type<string[]>(),
  specs: jsonb("specs").notNull().$type<Record<string, string>>(),
  features: jsonb("features").notNull().$type<string[]>(),
  clientQuote: text("client_quote"),
  clientName: text("client_name"),
  clientLocation: text("client_location"),
  historicalInfo: jsonb("historical_info").$type<Record<string, string>>(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectsInsertSchema = createInsertSchema(projects);
export type InsertProject = z.infer<typeof projectsInsertSchema>;
export type Project = typeof projects.$inferSelect;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  authorName: text("author_name").notNull(),
  authorLocation: text("author_location").notNull(),
  authorImage: text("author_image").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testimonialsInsertSchema = createInsertSchema(testimonials);
export type InsertTestimonial = z.infer<typeof testimonialsInsertSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Team members table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  image: text("image").notNull(),
  bio: text("bio"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembersInsertSchema = createInsertSchema(teamMembers);
export type InsertTeamMember = z.infer<typeof teamMembersInsertSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: jsonb("description").notNull().$type<string[]>(),
  image: text("image").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companiesInsertSchema = createInsertSchema(companies);
export type InsertCompany = z.infer<typeof companiesInsertSchema>;
export type Company = typeof companies.$inferSelect;

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribersInsertSchema = createInsertSchema(newsletterSubscribers);
export type InsertNewsletterSubscriber = z.infer<typeof newsletterSubscribersInsertSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Contact form submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  projectType: text("project_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSubmissionsInsertSchema = createInsertSchema(contactSubmissions);
export type InsertContactSubmission = z.infer<typeof contactSubmissionsInsertSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Hero content table
export const heroContent = pgTable("hero_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const heroContentInsertSchema = createInsertSchema(heroContent);
export type InsertHeroContent = z.infer<typeof heroContentInsertSchema>;
export type HeroContent = typeof heroContent.$inferSelect;

// Engineering features table
export const engineeringFeatures = pgTable("engineering_features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const engineeringFeaturesInsertSchema = createInsertSchema(engineeringFeatures);
export type InsertEngineeringFeature = z.infer<typeof engineeringFeaturesInsertSchema>;
export type EngineeringFeature = typeof engineeringFeatures.$inferSelect;

// Market data table
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  marketGrowthData: jsonb("market_growth_data").notNull(),
  demographicData: jsonb("demographic_data").notNull(),
  platforms: jsonb("platforms").notNull().$type<string[]>(),
  modifications: jsonb("modifications").notNull().$type<string[]>(),
  roi: text("roi").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketDataInsertSchema = createInsertSchema(marketData);
export type InsertMarketData = z.infer<typeof marketDataInsertSchema>;
export type MarketData = typeof marketData.$inferSelect;

// Process steps table
export const processSteps = pgTable("process_steps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  alt: text("alt").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const processStepsInsertSchema = createInsertSchema(processSteps);
export type InsertProcessStep = z.infer<typeof processStepsInsertSchema>;
export type ProcessStep = typeof processSteps.$inferSelect;

// Luxury Showcase pages table
export const luxuryShowcases = pgTable("luxury_showcases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  slug: text("slug").notNull().unique(),
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
export const researchArticles = pgTable("research_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  author: text("author").notNull(),
  publishDate: timestamp("publish_date").defaultNow().notNull(),
  featuredImage: text("featured_image").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").notNull().$type<string[]>(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const researchArticlesInsertSchema = createInsertSchema(researchArticles);
export type InsertResearchArticle = z.infer<typeof researchArticlesInsertSchema>;
export type ResearchArticle = typeof researchArticles.$inferSelect;

// Car Configurator Schemas - Removed duplicates

// Engine Options table
export const engineOptions = pgTable("engine_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  horsepower: integer("horsepower").notNull(),
  torque: integer("torque").notNull(),
  displacement: text("displacement").notNull(),
  manufacturer: text("manufacturer").notNull(),
  fuelType: text("fuel_type").notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  mcKenneyFeatures: jsonb("mckenney_features").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const engineOptionsInsertSchema = createInsertSchema(engineOptions);
export type InsertEngineOption = z.infer<typeof engineOptionsInsertSchema>;
export type EngineOption = typeof engineOptions.$inferSelect;

// Transmission Options table
export const transmissionOptions = pgTable("transmission_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  speeds: integer("speeds").notNull(),
  manufacturer: text("manufacturer").notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibleEngines: jsonb("compatible_engines").notNull().$type<number[]>(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transmissionOptionsInsertSchema = createInsertSchema(transmissionOptions);
export type InsertTransmissionOption = z.infer<typeof transmissionOptionsInsertSchema>;
export type TransmissionOption = typeof transmissionOptions.$inferSelect;

// Color Options table
export const colorOptions = pgTable("color_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hex: text("hex").notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // e.g., metallic, matte, gloss
  availableForModels: jsonb("available_for_models").notNull().$type<number[]>(),
  popular: boolean("popular").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const colorOptionsInsertSchema = createInsertSchema(colorOptions);
export type InsertColorOption = z.infer<typeof colorOptionsInsertSchema>;
export type ColorOption = typeof colorOptions.$inferSelect;

// Wheel Options table
export const wheelOptions = pgTable("wheel_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  diameter: integer("diameter").notNull(),
  width: text("width").notNull(),
  material: text("material").notNull(),
  style: text("style").notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wheelOptionsInsertSchema = createInsertSchema(wheelOptions);
export type InsertWheelOption = z.infer<typeof wheelOptionsInsertSchema>;
export type WheelOption = typeof wheelOptions.$inferSelect;

// Interior Options table
export const interiorOptions = pgTable("interior_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  material: text("material").notNull(),
  color: text("color").notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  features: jsonb("features").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interiorOptionsInsertSchema = createInsertSchema(interiorOptions);
export type InsertInteriorOption = z.infer<typeof interiorOptionsInsertSchema>;
export type InteriorOption = typeof interiorOptions.$inferSelect;

// AI Integration Options table
export const aiOptions = pgTable("ai_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., performance, safety, entertainment
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiOptionsInsertSchema = createInsertSchema(aiOptions);
export type InsertAiOption = z.infer<typeof aiOptionsInsertSchema>;
export type AiOption = typeof aiOptions.$inferSelect;

// Additional Options table
export const additionalOptions = pgTable("additional_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., performance, safety, comfort
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibleModels: jsonb("compatible_models").notNull().$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const additionalOptionsInsertSchema = createInsertSchema(additionalOptions);
export type InsertAdditionalOption = z.infer<typeof additionalOptionsInsertSchema>;
export type AdditionalOption = typeof additionalOptions.$inferSelect;

// User Configurations table (for saved configurations)
export const userConfigurations = pgTable("user_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  carModelId: integer("car_model_id").notNull(),
  engineId: integer("engine_id"),
  transmissionId: integer("transmission_id"),
  colorId: integer("color_id"),
  wheelId: integer("wheel_id"),
  interiorId: integer("interior_id"),
  selectedAiOptions: jsonb("selected_ai_options").$type<number[]>(),
  selectedAdditionalOptions: jsonb("selected_additional_options").$type<number[]>(),
  aiRecommendations: text("ai_recommendations"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for user configurations
export const userConfigurationsRelations = relations(userConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [userConfigurations.userId],
    references: [users.id],
  }),
}));

export const userConfigurationsInsertSchema = createInsertSchema(userConfigurations);
export type InsertUserConfiguration = z.infer<typeof userConfigurationsInsertSchema>;
export type UserConfiguration = typeof userConfigurations.$inferSelect;

// Enhanced market data tables for comprehensive analytics
export const marketValuations = pgTable("market_valuations", {
  id: serial("id").primaryKey(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  yearRange: text("year_range"),
  engineVariant: text("engine_variant"),
  bodyStyle: text("body_style"),
  conditionRating: text("condition_rating"),
  hagertyValue: decimal("hagerty_value", { precision: 12, scale: 2 }),
  auctionHigh: decimal("auction_high", { precision: 12, scale: 2 }),
  auctionLow: decimal("auction_low", { precision: 12, scale: 2 }),
  averagePrice: decimal("average_price", { precision: 12, scale: 2 }),
  trendPercentage: decimal("trend_percentage", { precision: 5, scale: 2 }),
  marketSegment: text("market_segment"),
  investmentGrade: text("investment_grade"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  sourceData: text("source_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const builderProfiles = pgTable("builder_profiles", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  location: text("location"),
  specialtyFocus: text("specialty_focus"),
  reputationTier: text("reputation_tier"),
  averageBuildCostRange: text("average_build_cost_range"),
  buildTimeEstimate: text("build_time_estimate"),
  notableProjects: text("notable_projects"),
  contactInformation: text("contact_information"),
  websiteUrl: text("website_url"),
  portfolioImages: text("portfolio_images").array(),
  certifications: text("certifications").array(),
  warrantyOffered: boolean("warranty_offered").default(false),
  yearEstablished: integer("year_established"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema validation for new tables
// Technical specifications table for authentic parts data
export const technicalSpecifications = pgTable("technical_specifications", {
  id: serial("id").primaryKey(),
  componentCategory: text("component_category").notNull(),
  partNumber: text("part_number"),
  manufacturer: text("manufacturer").notNull(),
  productName: text("product_name"),
  priceRange: text("price_range"),
  exactPrice: decimal("exact_price", { precision: 10, scale: 2 }),
  compatibility: text("compatibility"),
  performanceSpecs: text("performance_specs"),
  installationDifficulty: text("installation_difficulty"),
  requiredTools: text("required_tools").array(),
  estimatedLaborHours: decimal("estimated_labor_hours", { precision: 4, scale: 1 }),
  vendorUrl: text("vendor_url"),
  inStock: boolean("in_stock").default(true),
  popularityRank: integer("popularity_rank"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event venues table for car show data
export const eventVenues = pgTable("event_venues", {
  id: serial("id").primaryKey(),
  venueName: text("venue_name").notNull(),
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationCountry: text("location_country").default("USA"),
  venueType: text("venue_type"),
  capacity: integer("capacity"),
  amenities: text("amenities").array(),
  contactInfo: text("contact_info"),
  websiteUrl: text("website_url"),
  coordinates: text("coordinates"),
  parkingAvailable: boolean("parking_available").default(true),
  foodVendors: boolean("food_vendors").default(false),
  swapMeet: boolean("swap_meet").default(false),
  judgingClasses: text("judging_classes").array(),
  entryFees: text("entry_fees"),
  trophiesAwarded: boolean("trophies_awarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Build guides table for technical documentation
export const buildGuides = pgTable("build_guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  vehicleApplication: text("vehicle_application"),
  difficultyLevel: text("difficulty_level"),
  estimatedCost: text("estimated_cost"),
  estimatedTime: text("estimated_time"),
  requiredSkills: text("required_skills").array(),
  toolsNeeded: text("tools_needed").array(),
  partsRequired: text("parts_required"),
  stepByStepGuide: text("step_by_step_guide"),
  safetyWarnings: text("safety_warnings").array(),
  troubleshootingTips: text("troubleshooting_tips"),
  videoUrl: text("video_url"),
  authorName: text("author_name"),
  authorCredentials: text("author_credentials"),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investment analytics table for market data
export const investmentAnalytics = pgTable("investment_analytics", {
  id: serial("id").primaryKey(),
  vehicleCategory: text("vehicle_category").notNull(),
  investmentHorizon: text("investment_horizon"),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }),
  riskLevel: text("risk_level"),
  liquidityRating: text("liquidity_rating"),
  marketTrends: text("market_trends"),
  demographicFactors: text("demographic_factors"),
  recommendationScore: decimal("recommendation_score", { precision: 3, scale: 1 }),
  supportingData: text("supporting_data"),
  lastAnalyzed: timestamp("last_analyzed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor partnerships table for affiliate data
export const vendorPartnerships = pgTable("vendor_partnerships", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  category: text("category").notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  revenueOpportunity: text("revenue_opportunity"),
  productTypes: text("product_types").array(),
  affiliateUrl: text("affiliate_url"),
  trackingCode: text("tracking_code"),
  paymentTerms: text("payment_terms"),
  minimumPayout: decimal("minimum_payout", { precision: 8, scale: 2 }),
  contactInfo: text("contact_info"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classic Car Show Events Table - Comprehensive event storage
export const carShowEvents = pgTable("car_show_events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventSlug: text("event_slug").unique().notNull(),
  venue: text("venue").notNull(),
  venueName: text("venue_name"),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").default("USA"),
  zipCode: text("zip_code"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
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
  registrationDeadline: timestamp("registration_deadline"),
  capacity: integer("capacity"),
  expectedAttendance: integer("expected_attendance"),
  features: text("features"), // JSON string of features array
  amenities: text("amenities"), // JSON string of amenities
  vehicleRequirements: text("vehicle_requirements"),
  judgingClasses: text("judging_classes"), // JSON string of judging categories
  awards: text("awards"), // JSON string of awards/trophies
  parkingInfo: text("parking_info"),
  foodVendors: boolean("food_vendors").default(false),
  swapMeet: boolean("swap_meet").default(false),
  liveMusic: boolean("live_music").default(false),
  kidsActivities: boolean("kids_activities").default(false),
  weatherContingency: text("weather_contingency"),
  specialNotes: text("special_notes"),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
  status: text("status").default("active"), // 'active', 'cancelled', 'postponed', 'completed'
  sourceUrl: text("source_url"), // Where the event info was found
  dataSource: text("data_source").default("research_documents"), // 'research_documents', 'gemini_processed', 'manual'
  verificationStatus: text("verification_status").default("pending"), // 'pending', 'verified', 'needs_update'
  lastVerified: timestamp("last_verified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Schema validation for all new enhanced tables
export const marketValuationsInsertSchema = createInsertSchema(marketValuations);
export type InsertMarketValuation = z.infer<typeof marketValuationsInsertSchema>;

export const carShowEventsInsertSchema = createInsertSchema(carShowEvents);
export type InsertCarShowEvent = z.infer<typeof carShowEventsInsertSchema>;
export type CarShowEvent = typeof carShowEvents.$inferSelect;
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
export const gatewayVehicles = pgTable("gateway_vehicles", {
  id: serial("id").primaryKey(),
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
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  features: text("features").array(),
  condition: text("condition").default("Excellent"),
  location: text("location").default("St. Louis, Missouri"),
  imageUrl: text("image_url"),
  galleryImages: text("gallery_images").array(),
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
  premium_sound: boolean("premium_sound").default(false),
  alarmsecurity: boolean("alarm_security").default(false),
  keylessEntry: boolean("keyless_entry").default(false),
  antiLockBrakes: boolean("anti_lock_brakes").default(false),
  driverAirbag: boolean("driver_airbag").default(false),
  passengerAirbag: boolean("passenger_airbag").default(false),
  sideAirbags: boolean("side_airbags").default(false),
  tractionControl: boolean("traction_control").default(false),
  stabilityControl: boolean("stability_control").default(false),
  category: text("category").default("classic"), // classic, muscle, exotic, hot_rod, vintage
  investmentGrade: text("investment_grade"), // A+, A, B+, B, C+, C
  appreciationPotential: text("appreciation_potential"), // High, Medium, Low
  rarity: text("rarity"), // Very Rare, Rare, Uncommon, Common
  restorationLevel: text("restoration_level"), // Concours, #1, #2, #3, #4, Project
  marketTrend: text("market_trend"), // Rising, Stable, Declining
  comparableListings: integer("comparable_listings"),
  avgMarketPrice: decimal("avg_market_price", { precision: 10, scale: 2 }),
  priceVariance: decimal("price_variance", { precision: 5, scale: 2 }),
  daysOnMarket: integer("days_on_market"),
  viewCount: integer("view_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),
  featured: boolean("featured").default(false),
  sold: boolean("sold").default(false),
  soldDate: timestamp("sold_date"),
  soldPrice: decimal("sold_price", { precision: 10, scale: 2 }),
  dataSource: text("data_source").default("gateway_classics"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const gatewayVehiclesInsertSchema = createInsertSchema(gatewayVehicles);
export type InsertGatewayVehicle = z.infer<typeof gatewayVehiclesInsertSchema>;
export type GatewayVehicle = typeof gatewayVehicles.$inferSelect;

// ENHANCED CAR CONFIGURATOR TABLES - Based on Authentic Perplexity Research

// AUTHENTIC VEHICLE PLATFORMS
export const enhancedVehiclePlatforms = pgTable('enhanced_vehicle_platforms', {
  id: serial('id').primaryKey(),
  platformId: text('platform_id').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  bodyTypes: jsonb('body_types').$type<string[]>().notNull(),
  baseHp: integer('base_hp').notNull(),
  baseAcceleration: decimal('base_acceleration', { precision: 3, scale: 1 }).notNull(),
  baseTopSpeed: integer('base_top_speed').notNull(),
  marketValue: integer('market_value').notNull(), // 0-100 rating
  investmentGrade: text('investment_grade').notNull(),
  appreciationRate: text('appreciation_rate').notNull(),
  manufacturer: text('manufacturer').notNull(),
  yearRange: text('year_range').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC ENGINE OPTIONS - Based on Perplexity Research
export const enhancedEngineOptions = pgTable('enhanced_engine_options', {
  id: serial('id').primaryKey(),
  engineId: text('engine_id').notNull().unique(),
  name: text('name').notNull(),
  displacement: text('displacement').notNull(),
  horsepower: integer('horsepower').notNull(),
  torque: integer('torque').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  manufacturer: text('manufacturer').notNull(),
  engineType: text('engine_type').notNull(), // 'naturally_aspirated', 'supercharged', 'turbocharged'
  fuelSystem: text('fuel_system').notNull(),
  compressionRatio: text('compression_ratio'),
  compatiblePlatforms: jsonb('compatible_platforms').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC TRANSMISSION OPTIONS - Based on Perplexity Research
export const enhancedTransmissionOptions = pgTable('enhanced_transmission_options', {
  id: serial('id').primaryKey(),
  transmissionId: text('transmission_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'manual', 'automatic'
  speeds: integer('speeds').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  manufacturer: text('manufacturer').notNull(),
  torqueRating: integer('torque_rating').notNull(),
  compatibleEngines: jsonb('compatible_engines').$type<string[]>().notNull(),
  features: jsonb('features').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC SUSPENSION OPTIONS - Based on Perplexity Research
export const configuratorSuspensionOptions = pgTable('configurator_suspension_options', {
  id: serial('id').primaryKey(),
  suspensionId: text('suspension_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'coilover', 'air_suspension', 'ifs_conversion'
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  manufacturer: text('manufacturer').notNull(),
  adjustable: boolean('adjustable').notNull(),
  compatiblePlatforms: jsonb('compatible_platforms').$type<string[]>().notNull(),
  features: jsonb('features').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC REAR AXLE OPTIONS - Based on Perplexity Research
export const configuratorRearAxleOptions = pgTable('configurator_rear_axle_options', {
  id: serial('id').primaryKey(),
  axleId: text('axle_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'ford_9_inch', 'dana_60', 'gm_12_bolt'
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  manufacturer: text('manufacturer').notNull(),
  torqueRating: integer('torque_rating').notNull(),
  gearRatios: jsonb('gear_ratios').$type<string[]>().notNull(),
  differentialType: text('differential_type').notNull(),
  compatiblePlatforms: jsonb('compatible_platforms').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC FUEL SYSTEM OPTIONS - Based on Perplexity Research
export const configuratorFuelSystemOptions = pgTable('configurator_fuel_system_options', {
  id: serial('id').primaryKey(),
  fuelSystemId: text('fuel_system_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'efi', 'carburetor', 'fuel_injection'
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  manufacturer: text('manufacturer').notNull(),
  flowRate: integer('flow_rate').notNull(),
  features: jsonb('features').$type<string[]>().notNull(),
  compatibleEngines: jsonb('compatible_engines').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC INTERIOR OPTIONS - Based on Perplexity Research
export const enhancedInteriorOptions = pgTable('enhanced_interior_options', {
  id: serial('id').primaryKey(),
  interiorId: text('interior_id').notNull().unique(),
  name: text('name').notNull(),
  style: text('style').notNull(), // 'classic', 'vintage_luxury', 'modern_sport', 'custom_bespoke'
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  materials: jsonb('materials').$type<string[]>().notNull(),
  features: jsonb('features').$type<string[]>().notNull(),
  seatingType: text('seating_type').notNull(),
  gaugeType: text('gauge_type').notNull(),
  audioSystem: boolean('audio_system').notNull(),
  climateControl: boolean('climate_control').notNull(),
  compatiblePlatforms: jsonb('compatible_platforms').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC BODYWORK OPTIONS - Based on Perplexity Research
export const configuratorBodyworkOptions = pgTable('configurator_bodywork_options', {
  id: serial('id').primaryKey(),
  bodyworkId: text('bodywork_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'widebody_kit', 'fender_flares', 'custom_fiberglass', 'carbon_fiber'
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  manufacturer: text('manufacturer').notNull(),
  material: text('material').notNull(),
  components: jsonb('components').$type<string[]>().notNull(),
  compatiblePlatforms: jsonb('compatible_platforms').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AUTHENTIC GLASS OPTIONS - Based on Perplexity Research
export const configuratorGlassOptions = pgTable('configurator_glass_options', {
  id: serial('id').primaryKey(),
  glassId: text('glass_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'tinted', 'tempered_safety', 'custom_windshield', 'power_windows'
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  manufacturer: text('manufacturer').notNull(),
  tintLevel: text('tint_level'),
  safetyRating: text('safety_rating').notNull(),
  features: jsonb('features').$type<string[]>().notNull(),
  compatiblePlatforms: jsonb('compatible_platforms').$type<string[]>().notNull(),
  installationCost: decimal('installation_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// CUSTOMER CONFIGURATIONS
export const configuratorCustomerConfigurations = pgTable('configurator_customer_configurations', {
  id: serial('id').primaryKey(),
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
  additionalOptions: jsonb('additional_options').$type<string[]>().notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  aiRecommendations: jsonb('ai_recommendations').$type<any>(),
  configurationNotes: text('configuration_notes'),
  status: text('status').notNull().default('draft'), // 'draft', 'quoted', 'approved', 'in_progress', 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
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
export const configuratorCarModels = pgTable("configurator_car_models", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  yearStart: integer("year_start").notNull(),
  yearEnd: integer("year_end").notNull(),
  category: text("category").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  popularity: integer("popularity").default(0),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Transmission choices for step-by-step configurator (keeping original simple structure)
export const simpleTransmissionOptions = pgTable("simple_transmission_options", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(),
  transmissionName: text("transmission_name").notNull(),
  type: text("type").notNull(), // manual, automatic, dual-clutch
  gears: integer("gears").notNull(),
  torqueRating: integer("torque_rating").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibility: jsonb("compatibility").notNull().$type<string[]>(),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Paint and finish options for step-by-step configurator
export const configuratorColorOptions = pgTable("configurator_color_options", {
  id: serial("id").primaryKey(),
  colorName: text("color_name").notNull(),
  colorCode: text("color_code").notNull(),
  finish: text("finish").notNull(), // metallic, pearl, matte, gloss
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // classic, modern, custom
  manufacturer: text("manufacturer").notNull(),
  popularity: integer("popularity").default(0),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Wheel packages for step-by-step configurator
export const configuratorWheelOptions = pgTable("configurator_wheel_options", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  wheelName: text("wheel_name").notNull(),
  diameter: integer("diameter").notNull(),
  width: decimal("width", { precision: 4, scale: 1 }).notNull(),
  offset: integer("offset").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  style: text("style").notNull(), // classic, modern, racing, luxury
  material: text("material").notNull(), // steel, aluminum, forged
  compatibility: jsonb("compatibility").notNull().$type<string[]>(),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Interior packages for step-by-step configurator
export const configuratorInteriorOptions = pgTable("configurator_interior_options", {
  id: serial("id").primaryKey(),
  packageName: text("package_name").notNull(),
  description: text("description").notNull(),
  materials: jsonb("materials").notNull().$type<string[]>(),
  features: jsonb("features").notNull().$type<string[]>(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibility: jsonb("compatibility").notNull().$type<string[]>(),
  manufacturer: text("manufacturer").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Customer configurations for step-by-step configurator
export const configuratorUserConfigurations = pgTable("configurator_user_configurations", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // Optional - can be null for anonymous configs
  carModelId: integer("car_model_id").references(() => configuratorCarModels.id).notNull(),
  engineId: integer("engine_id").references(() => configuratorEngineOptions.id),
  transmissionId: integer("transmission_id").references(() => configuratorTransmissionOptions.id),
  colorId: integer("color_id").references(() => configuratorColorOptions.id),
  wheelId: integer("wheel_id").references(() => configuratorWheelOptions.id),
  interiorId: integer("interior_id").references(() => configuratorInteriorOptions.id),
  additionalOptions: jsonb("additional_options").$type<string[]>(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  configurationName: text("configuration_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Configurator schemas
export const configuratorCarModelsInsertSchema = createInsertSchema(configuratorCarModels);
export type InsertConfiguratorCarModel = z.infer<typeof configuratorCarModelsInsertSchema>;
export type ConfiguratorCarModel = typeof configuratorCarModels.$inferSelect;

export const configuratorEngineOptionsInsertSchema = createInsertSchema(configuratorEngineOptions);
export type InsertConfiguratorEngineOption = z.infer<typeof configuratorEngineOptionsInsertSchema>;
export type ConfiguratorEngineOption = typeof configuratorEngineOptions.$inferSelect;

export const configuratorTransmissionOptionsInsertSchema = createInsertSchema(configuratorTransmissionOptions);
export type InsertConfiguratorTransmissionOption = z.infer<typeof configuratorTransmissionOptionsInsertSchema>;
export type ConfiguratorTransmissionOption = typeof configuratorTransmissionOptions.$inferSelect;

export const configuratorColorOptionsInsertSchema = createInsertSchema(configuratorColorOptions);
export type InsertConfiguratorColorOption = z.infer<typeof configuratorColorOptionsInsertSchema>;
export type ConfiguratorColorOption = typeof configuratorColorOptions.$inferSelect;

export const configuratorWheelOptionsInsertSchema = createInsertSchema(configuratorWheelOptions);
export type InsertConfiguratorWheelOption = z.infer<typeof configuratorWheelOptionsInsertSchema>;
export type ConfiguratorWheelOption = typeof configuratorWheelOptions.$inferSelect;

export const configuratorInteriorOptionsInsertSchema = createInsertSchema(configuratorInteriorOptions);
export type InsertConfiguratorInteriorOption = z.infer<typeof configuratorInteriorOptionsInsertSchema>;
export type ConfiguratorInteriorOption = typeof configuratorInteriorOptions.$inferSelect;

export const configuratorUserConfigurationsInsertSchema = createInsertSchema(configuratorUserConfigurations);
export type InsertConfiguratorUserConfiguration = z.infer<typeof configuratorUserConfigurationsInsertSchema>;
export type ConfiguratorUserConfiguration = typeof configuratorUserConfigurations.$inferSelect;


