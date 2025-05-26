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

// Car Configurator Schemas

// Car Models table
export const carModels = pgTable("car_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  yearStart: integer("year_start").notNull(),
  yearEnd: integer("year_end"),
  manufacturer: text("manufacturer").notNull(),
  bodyTypes: jsonb("body_types").notNull().$type<string[]>(),
  mainImage: text("main_image").notNull(),
  galleryImages: jsonb("gallery_images").notNull().$type<string[]>(),
  featured: boolean("featured").default(false),
  restomodCount: integer("restomod_count").default(0),
  historicalInfo: text("historical_info"),
  marketTrend: jsonb("market_trend").$type<{
    year: number;
    value: number;
  }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carModelsInsertSchema = createInsertSchema(carModels);
export type InsertCarModel = z.infer<typeof carModelsInsertSchema>;
export type CarModel = typeof carModels.$inferSelect;

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
  carModelId: integer("car_model_id").references(() => carModels.id, { onDelete: 'cascade' }).notNull(),
  engineId: integer("engine_id").references(() => engineOptions.id, { onDelete: 'cascade' }),
  transmissionId: integer("transmission_id").references(() => transmissionOptions.id, { onDelete: 'cascade' }),
  colorId: integer("color_id").references(() => colorOptions.id, { onDelete: 'cascade' }),
  wheelId: integer("wheel_id").references(() => wheelOptions.id, { onDelete: 'cascade' }),
  interiorId: integer("interior_id").references(() => interiorOptions.id, { onDelete: 'cascade' }),
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
  carModel: one(carModels, {
    fields: [userConfigurations.carModelId],
    references: [carModels.id],
  }),
  engine: one(engineOptions, {
    fields: [userConfigurations.engineId],
    references: [engineOptions.id],
  }),
  transmission: one(transmissionOptions, {
    fields: [userConfigurations.transmissionId],
    references: [transmissionOptions.id],
  }),
  color: one(colorOptions, {
    fields: [userConfigurations.colorId],
    references: [colorOptions.id],
  }),
  wheel: one(wheelOptions, {
    fields: [userConfigurations.wheelId],
    references: [wheelOptions.id],
  }),
  interior: one(interiorOptions, {
    fields: [userConfigurations.interiorId],
    references: [interiorOptions.id],
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
export const marketValuationsInsertSchema = createInsertSchema(marketValuations);
export type InsertMarketValuation = z.infer<typeof marketValuationsInsertSchema>;
export type MarketValuation = typeof marketValuations.$inferSelect;

export const builderProfilesInsertSchema = createInsertSchema(builderProfiles);
export type InsertBuilderProfile = z.infer<typeof builderProfilesInsertSchema>;
export type BuilderProfile = typeof builderProfiles.$inferSelect;


