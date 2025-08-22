CREATE TABLE `additional_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`image` text NOT NULL,
	`price` text NOT NULL,
	`compatible_models` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`image` text NOT NULL,
	`price` text NOT NULL,
	`compatible_models` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `build_guides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`vehicle_application` text,
	`difficulty_level` text,
	`estimated_cost` text,
	`estimated_time` text,
	`required_skills` text,
	`tools_needed` text,
	`parts_required` text,
	`step_by_step_guide` text,
	`safety_warnings` text,
	`troubleshooting_tips` text,
	`video_url` text,
	`author_name` text,
	`author_credentials` text,
	`views` integer DEFAULT 0,
	`rating` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `builder_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` text NOT NULL,
	`location` text,
	`specialty_focus` text,
	`reputation_tier` text,
	`average_build_cost_range` text,
	`build_time_estimate` text,
	`notable_projects` text,
	`contact_information` text,
	`website_url` text,
	`portfolio_images` text,
	`certifications` text,
	`warranty_offered` integer DEFAULT false,
	`year_established` integer,
	`rating` text,
	`review_count` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `car_show_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_name` text NOT NULL,
	`event_slug` text NOT NULL,
	`venue` text NOT NULL,
	`venue_name` text,
	`address` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`country` text DEFAULT 'USA',
	`zip_code` text,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`event_type` text NOT NULL,
	`event_category` text,
	`description` text,
	`website` text,
	`organizer_name` text,
	`organizer_contact` text,
	`organizer_email` text,
	`organizer_phone` text,
	`entry_fee_spectator` text,
	`entry_fee_participant` text,
	`registration_deadline` integer,
	`capacity` integer,
	`expected_attendance` integer,
	`features` text,
	`amenities` text,
	`vehicle_requirements` text,
	`judging_classes` text,
	`awards` text,
	`parking_info` text,
	`food_vendors` integer DEFAULT false,
	`swap_meet` integer DEFAULT false,
	`live_music` integer DEFAULT false,
	`kids_activities` integer DEFAULT false,
	`weather_contingency` text,
	`special_notes` text,
	`image_url` text,
	`featured` integer DEFAULT false,
	`status` text DEFAULT 'active',
	`source_url` text,
	`data_source` text DEFAULT 'research_documents',
	`verification_status` text DEFAULT 'pending',
	`last_verified` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_show_events_event_slug_unique` ON `car_show_events` (`event_slug`);--> statement-breakpoint
CREATE TABLE `cars_for_sale` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`price` text,
	`source_type` text NOT NULL,
	`source_name` text NOT NULL,
	`location_city` text,
	`location_state` text,
	`location_region` text,
	`category` text,
	`condition` text,
	`mileage` integer,
	`exterior_color` text,
	`interior_color` text,
	`engine` text,
	`transmission` text,
	`investment_grade` text,
	`appreciation_rate` text,
	`market_trend` text,
	`valuation_confidence` text,
	`image_url` text,
	`description` text,
	`features` text,
	`stock_number` text,
	`vin` text,
	`research_notes` text,
	`market_data` text,
	`perplexity_analysis` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cars_for_sale_stock_number_unique` ON `cars_for_sale` (`stock_number`);--> statement-breakpoint
CREATE TABLE `color_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`hex` text NOT NULL,
	`image` text NOT NULL,
	`price` text NOT NULL,
	`type` text NOT NULL,
	`available_for_models` text NOT NULL,
	`popular` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configurator_bodywork_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bodywork_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`material` text NOT NULL,
	`components` text NOT NULL,
	`compatible_platforms` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_bodywork_options_bodywork_id_unique` ON `configurator_bodywork_options` (`bodywork_id`);--> statement-breakpoint
CREATE TABLE `configurator_car_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`year_start` integer NOT NULL,
	`year_end` integer NOT NULL,
	`category` text NOT NULL,
	`base_price` text NOT NULL,
	`popularity` integer DEFAULT 0,
	`image_url` text,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configurator_color_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`color_name` text NOT NULL,
	`color_code` text NOT NULL,
	`finish` text NOT NULL,
	`price` text NOT NULL,
	`category` text NOT NULL,
	`manufacturer` text NOT NULL,
	`popularity` integer DEFAULT 0,
	`image_url` text,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configurator_customer_configurations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`configuration_id` text NOT NULL,
	`customer_email` text,
	`customer_name` text,
	`platform_id` text NOT NULL,
	`engine_id` text,
	`transmission_id` text,
	`suspension_id` text,
	`rear_axle_id` text,
	`fuel_system_id` text,
	`interior_id` text,
	`bodywork_id` text,
	`glass_id` text,
	`color_choice` text,
	`wheel_choice` text,
	`additional_options` text NOT NULL,
	`total_price` text NOT NULL,
	`ai_recommendations` text,
	`configuration_notes` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_customer_configurations_configuration_id_unique` ON `configurator_customer_configurations` (`configuration_id`);--> statement-breakpoint
CREATE TABLE `configurator_fuel_system_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fuel_system_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`flow_rate` integer NOT NULL,
	`features` text NOT NULL,
	`compatible_engines` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_fuel_system_options_fuel_system_id_unique` ON `configurator_fuel_system_options` (`fuel_system_id`);--> statement-breakpoint
CREATE TABLE `configurator_glass_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`glass_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`tint_level` text,
	`safety_rating` text NOT NULL,
	`features` text NOT NULL,
	`compatible_platforms` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_glass_options_glass_id_unique` ON `configurator_glass_options` (`glass_id`);--> statement-breakpoint
CREATE TABLE `configurator_interior_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`package_name` text NOT NULL,
	`description` text NOT NULL,
	`materials` text NOT NULL,
	`features` text NOT NULL,
	`price` text NOT NULL,
	`compatibility` text NOT NULL,
	`manufacturer` text NOT NULL,
	`image_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configurator_rear_axle_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`axle_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`torque_rating` integer NOT NULL,
	`gear_ratios` text NOT NULL,
	`differential_type` text NOT NULL,
	`compatible_platforms` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_rear_axle_options_axle_id_unique` ON `configurator_rear_axle_options` (`axle_id`);--> statement-breakpoint
CREATE TABLE `configurator_suspension_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`suspension_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`adjustable` integer NOT NULL,
	`compatible_platforms` text NOT NULL,
	`features` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_suspension_options_suspension_id_unique` ON `configurator_suspension_options` (`suspension_id`);--> statement-breakpoint
CREATE TABLE `configurator_wheel_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand` text NOT NULL,
	`wheel_name` text NOT NULL,
	`diameter` integer NOT NULL,
	`width` text NOT NULL,
	`offset` integer NOT NULL,
	`price` text NOT NULL,
	`style` text NOT NULL,
	`material` text NOT NULL,
	`compatibility` text NOT NULL,
	`image_url` text,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`project_type` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `engine_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`horsepower` integer NOT NULL,
	`torque` integer NOT NULL,
	`displacement` text NOT NULL,
	`manufacturer` text NOT NULL,
	`fuel_type` text NOT NULL,
	`image` text NOT NULL,
	`price` text NOT NULL,
	`compatible_models` text NOT NULL,
	`mckenney_features` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `engineering_features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `enhanced_engine_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`engine_id` text NOT NULL,
	`name` text NOT NULL,
	`displacement` text NOT NULL,
	`horsepower` integer NOT NULL,
	`torque` integer NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`engine_type` text NOT NULL,
	`fuel_system` text NOT NULL,
	`compression_ratio` text,
	`compatible_platforms` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enhanced_engine_options_engine_id_unique` ON `enhanced_engine_options` (`engine_id`);--> statement-breakpoint
CREATE TABLE `enhanced_interior_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`interior_id` text NOT NULL,
	`name` text NOT NULL,
	`style` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`materials` text NOT NULL,
	`features` text NOT NULL,
	`seating_type` text NOT NULL,
	`gauge_type` text NOT NULL,
	`audio_system` integer NOT NULL,
	`climate_control` integer NOT NULL,
	`compatible_platforms` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enhanced_interior_options_interior_id_unique` ON `enhanced_interior_options` (`interior_id`);--> statement-breakpoint
CREATE TABLE `enhanced_transmission_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transmission_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`speeds` integer NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`torque_rating` integer NOT NULL,
	`compatible_engines` text NOT NULL,
	`features` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enhanced_transmission_options_transmission_id_unique` ON `enhanced_transmission_options` (`transmission_id`);--> statement-breakpoint
CREATE TABLE `enhanced_vehicle_platforms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`base_price` text NOT NULL,
	`image_url` text,
	`body_types` text NOT NULL,
	`base_hp` integer NOT NULL,
	`base_acceleration` text NOT NULL,
	`base_top_speed` integer NOT NULL,
	`market_value` integer NOT NULL,
	`investment_grade` text NOT NULL,
	`appreciation_rate` text NOT NULL,
	`manufacturer` text NOT NULL,
	`year_range` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enhanced_vehicle_platforms_platform_id_unique` ON `enhanced_vehicle_platforms` (`platform_id`);--> statement-breakpoint
CREATE TABLE `event_venues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`venue_name` text NOT NULL,
	`location_city` text,
	`location_state` text,
	`location_country` text DEFAULT 'USA',
	`venue_type` text,
	`capacity` integer,
	`amenities` text,
	`contact_info` text,
	`website_url` text,
	`coordinates` text,
	`parking_available` integer DEFAULT true,
	`food_vendors` integer DEFAULT false,
	`swap_meet` integer DEFAULT false,
	`judging_classes` text,
	`entry_fees` text,
	`trophies_awarded` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `gateway_vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stock_number` text NOT NULL,
	`year` integer NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`engine` text,
	`transmission` text,
	`drivetrain` text,
	`exterior` text,
	`interior` text,
	`mileage` integer,
	`price` text NOT NULL,
	`description` text,
	`features` text,
	`condition` text DEFAULT 'Excellent',
	`location` text DEFAULT 'St. Louis, Missouri',
	`image_url` text,
	`gallery_images` text,
	`vin` text,
	`body_style` text,
	`fuel_type` text,
	`cylinders` integer,
	`displacement` text,
	`horsepower` integer,
	`torque` integer,
	`acceleration` text,
	`top_speed` text,
	`interior_color` text,
	`exterior_color` text,
	`wheel_size` text,
	`tire_size` text,
	`suspension` text,
	`brakes` text,
	`steering` text,
	`air_conditioning` integer DEFAULT false,
	`power_steering` integer DEFAULT false,
	`power_brakes` integer DEFAULT false,
	`power_windows` integer DEFAULT false,
	`power_seats` integer DEFAULT false,
	`heated_seats` integer DEFAULT false,
	`leather_seats` integer DEFAULT false,
	`sunroof` integer DEFAULT false,
	`convertible` integer DEFAULT false,
	`hardtop` integer DEFAULT false,
	`tilt_wheel` integer DEFAULT false,
	`cruise_control` integer DEFAULT false,
	`am_fm_radio` integer DEFAULT false,
	`cd_player` integer DEFAULT false,
	`cassette` integer DEFAULT false,
	`premium_sound` integer DEFAULT false,
	`alarm_security` integer DEFAULT false,
	`keyless_entry` integer DEFAULT false,
	`anti_lock_brakes` integer DEFAULT false,
	`driver_airbag` integer DEFAULT false,
	`passenger_airbag` integer DEFAULT false,
	`side_airbags` integer DEFAULT false,
	`traction_control` integer DEFAULT false,
	`stability_control` integer DEFAULT false,
	`category` text DEFAULT 'classic',
	`investment_grade` text,
	`appreciation_potential` text,
	`rarity` text,
	`restoration_level` text,
	`market_trend` text,
	`comparable_listings` integer,
	`avg_market_price` text,
	`price_variance` text,
	`days_on_market` integer,
	`view_count` integer DEFAULT 0,
	`inquiry_count` integer DEFAULT 0,
	`featured` integer DEFAULT false,
	`sold` integer DEFAULT false,
	`sold_date` integer,
	`sold_price` text,
	`data_source` text DEFAULT 'gateway_classics',
	`last_updated` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gateway_vehicles_stock_number_unique` ON `gateway_vehicles` (`stock_number`);--> statement-breakpoint
CREATE TABLE `hero_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`image_url` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `interior_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`material` text NOT NULL,
	`color` text NOT NULL,
	`image` text NOT NULL,
	`price` text NOT NULL,
	`compatible_models` text NOT NULL,
	`features` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `investment_analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_category` text NOT NULL,
	`investment_horizon` text,
	`expected_return` text,
	`risk_level` text,
	`liquidity_rating` text,
	`market_trends` text,
	`demographic_factors` text,
	`recommendation_score` text,
	`supporting_data` text,
	`last_analyzed` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `luxury_showcases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`short_description` text NOT NULL,
	`video_url` text,
	`hero_image` text NOT NULL,
	`gallery_images` text NOT NULL,
	`detail_sections` text NOT NULL,
	`specifications` text NOT NULL,
	`featured` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `luxury_showcases_slug_unique` ON `luxury_showcases` (`slug`);--> statement-breakpoint
CREATE TABLE `market_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`market_growth_data` text NOT NULL,
	`demographic_data` text NOT NULL,
	`platforms` text NOT NULL,
	`modifications` text NOT NULL,
	`roi` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `market_valuations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_make` text NOT NULL,
	`vehicle_model` text NOT NULL,
	`year_range` text,
	`engine_variant` text,
	`body_style` text,
	`condition_rating` text,
	`hagerty_value` text,
	`auction_high` text,
	`auction_low` text,
	`average_price` text,
	`trend_percentage` text,
	`market_segment` text,
	`investment_grade` text,
	`last_updated` integer,
	`source_data` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `process_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`alt` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`image_url` text NOT NULL,
	`gallery_images` text NOT NULL,
	`specs` text NOT NULL,
	`features` text NOT NULL,
	`client_quote` text,
	`client_name` text,
	`client_location` text,
	`historical_info` text,
	`featured` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `research_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`author` text NOT NULL,
	`publish_date` integer NOT NULL,
	`featured_image` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text NOT NULL,
	`category` text NOT NULL,
	`tags` text NOT NULL,
	`featured` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `research_articles_slug_unique` ON `research_articles` (`slug`);--> statement-breakpoint
CREATE TABLE `simple_transmission_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manufacturer` text NOT NULL,
	`transmission_name` text NOT NULL,
	`type` text NOT NULL,
	`gears` integer NOT NULL,
	`torque_rating` integer NOT NULL,
	`price` text NOT NULL,
	`compatibility` text NOT NULL,
	`image_url` text,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`position` text NOT NULL,
	`image` text NOT NULL,
	`bio` text,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `technical_specifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`component_category` text NOT NULL,
	`part_number` text,
	`manufacturer` text NOT NULL,
	`product_name` text,
	`price_range` text,
	`exact_price` text,
	`compatibility` text,
	`performance_specs` text,
	`installation_difficulty` text,
	`required_tools` text,
	`estimated_labor_hours` text,
	`vendor_url` text,
	`in_stock` integer DEFAULT true,
	`popularity_rank` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quote` text NOT NULL,
	`author_name` text NOT NULL,
	`author_location` text NOT NULL,
	`author_image` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transmission_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`speeds` integer NOT NULL,
	`manufacturer` text NOT NULL,
	`image` text NOT NULL,
	`price` text NOT NULL,
	`compatible_engines` text NOT NULL,
	`compatible_models` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_configurations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`car_model_id` integer NOT NULL,
	`engine_id` integer,
	`transmission_id` integer,
	`color_id` integer,
	`wheel_id` integer,
	`interior_id` integer,
	`selected_ai_options` text,
	`selected_additional_options` text,
	`ai_recommendations` text,
	`total_price` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_itineraries` (
	`user_id` integer NOT NULL,
	`event_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `event_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `car_show_events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`home_location` text,
	`preferred_categories` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vendor_partnerships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` text NOT NULL,
	`category` text NOT NULL,
	`commission_rate` text,
	`revenue_opportunity` text,
	`product_types` text,
	`affiliate_url` text,
	`tracking_code` text,
	`payment_terms` text,
	`minimum_payout` text,
	`contact_info` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `wheel_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`diameter` integer NOT NULL,
	`width` text NOT NULL,
	`material` text NOT NULL,
	`style` text NOT NULL,
	`image` text NOT NULL,
	`price` text NOT NULL,
	`compatible_models` text NOT NULL,
	`created_at` integer NOT NULL
);
