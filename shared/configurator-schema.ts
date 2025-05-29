import { pgTable, serial, text, integer, decimal, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// AUTHENTIC VEHICLE PLATFORMS - Based on Perplexity Research
export const vehiclePlatforms = pgTable('vehicle_platforms', {
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
export const engineOptions = pgTable('engine_options', {
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
export const transmissionOptions = pgTable('transmission_options', {
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
export const suspensionOptions = pgTable('suspension_options', {
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
export const rearAxleOptions = pgTable('rear_axle_options', {
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
export const fuelSystemOptions = pgTable('fuel_system_options', {
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
export const interiorOptions = pgTable('interior_options', {
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
export const bodyworkOptions = pgTable('bodywork_options', {
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
export const glassOptions = pgTable('glass_options', {
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
export const customerConfigurations = pgTable('customer_configurations', {
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

// RELATIONS
export const vehiclePlatformsRelations = relations(vehiclePlatforms, ({ many }) => ({
  configurations: many(customerConfigurations)
}));

export const customerConfigurationsRelations = relations(customerConfigurations, ({ one }) => ({
  platform: one(vehiclePlatforms, { 
    fields: [customerConfigurations.platformId], 
    references: [vehiclePlatforms.platformId] 
  })
}));

// SCHEMAS
export const vehiclePlatformsInsertSchema = createInsertSchema(vehiclePlatforms, {
  name: (schema) => schema.min(3, "Name must be at least 3 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
  basePrice: (schema) => schema.refine(val => parseFloat(val.toString()) > 0, "Price must be positive")
});
export type VehiclePlatformInsert = z.infer<typeof vehiclePlatformsInsertSchema>;
export const vehiclePlatformsSelectSchema = createSelectSchema(vehiclePlatforms);
export type VehiclePlatform = z.infer<typeof vehiclePlatformsSelectSchema>;

export const engineOptionsInsertSchema = createInsertSchema(engineOptions);
export type EngineOptionInsert = z.infer<typeof engineOptionsInsertSchema>;
export const engineOptionsSelectSchema = createSelectSchema(engineOptions);
export type EngineOption = z.infer<typeof engineOptionsSelectSchema>;

export const transmissionOptionsInsertSchema = createInsertSchema(transmissionOptions);
export type TransmissionOptionInsert = z.infer<typeof transmissionOptionsInsertSchema>;
export const transmissionOptionsSelectSchema = createSelectSchema(transmissionOptions);
export type TransmissionOption = z.infer<typeof transmissionOptionsSelectSchema>;

export const suspensionOptionsInsertSchema = createInsertSchema(suspensionOptions);
export type SuspensionOptionInsert = z.infer<typeof suspensionOptionsInsertSchema>;
export const suspensionOptionsSelectSchema = createSelectSchema(suspensionOptions);
export type SuspensionOption = z.infer<typeof suspensionOptionsSelectSchema>;

export const rearAxleOptionsInsertSchema = createInsertSchema(rearAxleOptions);
export type RearAxleOptionInsert = z.infer<typeof rearAxleOptionsInsertSchema>;
export const rearAxleOptionsSelectSchema = createSelectSchema(rearAxleOptions);
export type RearAxleOption = z.infer<typeof rearAxleOptionsSelectSchema>;

export const fuelSystemOptionsInsertSchema = createInsertSchema(fuelSystemOptions);
export type FuelSystemOptionInsert = z.infer<typeof fuelSystemOptionsInsertSchema>;
export const fuelSystemOptionsSelectSchema = createSelectSchema(fuelSystemOptions);
export type FuelSystemOption = z.infer<typeof fuelSystemOptionsSelectSchema>;

export const interiorOptionsInsertSchema = createInsertSchema(interiorOptions);
export type InteriorOptionInsert = z.infer<typeof interiorOptionsInsertSchema>;
export const interiorOptionsSelectSchema = createSelectSchema(interiorOptions);
export type InteriorOption = z.infer<typeof interiorOptionsSelectSchema>;

export const bodyworkOptionsInsertSchema = createInsertSchema(bodyworkOptions);
export type BodyworkOptionInsert = z.infer<typeof bodyworkOptionsInsertSchema>;
export const bodyworkOptionsSelectSchema = createSelectSchema(bodyworkOptions);
export type BodyworkOption = z.infer<typeof bodyworkOptionsSelectSchema>;

export const glassOptionsInsertSchema = createInsertSchema(glassOptions);
export type GlassOptionInsert = z.infer<typeof glassOptionsInsertSchema>;
export const glassOptionsSelectSchema = createSelectSchema(glassOptions);
export type GlassOption = z.infer<typeof glassOptionsSelectSchema>;

export const customerConfigurationsInsertSchema = createInsertSchema(customerConfigurations);
export type CustomerConfigurationInsert = z.infer<typeof customerConfigurationsInsertSchema>;
export const customerConfigurationsSelectSchema = createSelectSchema(customerConfigurations);
export type CustomerConfiguration = z.infer<typeof customerConfigurationsSelectSchema>;