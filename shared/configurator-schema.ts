import { pgTable, serial, text, integer, decimal, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Car Configurator Tables - Clean implementation for step-by-step process

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

// Engine swap options for step-by-step configurator
export const configuratorEngineOptions = pgTable("configurator_engine_options", {
  id: serial("id").primaryKey(),
  manufacturer: text("manufacturer").notNull(),
  engineName: text("engine_name").notNull(),
  displacement: text("displacement").notNull(),
  horsepower: integer("horsepower").notNull(),
  torque: integer("torque").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compatibility: jsonb("compatibility").notNull().$type<string[]>(),
  fuelType: text("fuel_type").notNull(),
  aspirationType: text("aspiration_type").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Transmission choices for step-by-step configurator
export const configuratorTransmissionOptions = pgTable("configurator_transmission_options", {
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

// Configurator relations
export const configuratorCarModelsRelations = relations(configuratorCarModels, ({ many }) => ({
  configurations: many(configuratorUserConfigurations)
}));

export const configuratorEngineOptionsRelations = relations(configuratorEngineOptions, ({ many }) => ({
  configurations: many(configuratorUserConfigurations)
}));

export const configuratorTransmissionOptionsRelations = relations(configuratorTransmissionOptions, ({ many }) => ({
  configurations: many(configuratorUserConfigurations)
}));

export const configuratorColorOptionsRelations = relations(configuratorColorOptions, ({ many }) => ({
  configurations: many(configuratorUserConfigurations)
}));

export const configuratorWheelOptionsRelations = relations(configuratorWheelOptions, ({ many }) => ({
  configurations: many(configuratorUserConfigurations)
}));

export const configuratorInteriorOptionsRelations = relations(configuratorInteriorOptions, ({ many }) => ({
  configurations: many(configuratorUserConfigurations)
}));

export const configuratorUserConfigurationsRelations = relations(configuratorUserConfigurations, ({ one }) => ({
  carModel: one(configuratorCarModels, { fields: [configuratorUserConfigurations.carModelId], references: [configuratorCarModels.id] }),
  engine: one(configuratorEngineOptions, { fields: [configuratorUserConfigurations.engineId], references: [configuratorEngineOptions.id] }),
  transmission: one(configuratorTransmissionOptions, { fields: [configuratorUserConfigurations.transmissionId], references: [configuratorTransmissionOptions.id] }),
  color: one(configuratorColorOptions, { fields: [configuratorUserConfigurations.colorId], references: [configuratorColorOptions.id] }),
  wheels: one(configuratorWheelOptions, { fields: [configuratorUserConfigurations.wheelId], references: [configuratorWheelOptions.id] }),
  interior: one(configuratorInteriorOptions, { fields: [configuratorUserConfigurations.interiorId], references: [configuratorInteriorOptions.id] })
}));

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