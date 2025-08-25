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
CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configurator_bodyworks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bodywork_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`material` text NOT NULL,
	`components` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_bodyworks_bodywork_id_unique` ON `configurator_bodyworks` (`bodywork_id`);--> statement-breakpoint
CREATE TABLE `configurator_bodyworks_to_platforms` (
	`bodywork_id` integer NOT NULL,
	`platform_id` integer NOT NULL,
	PRIMARY KEY(`bodywork_id`, `platform_id`),
	FOREIGN KEY (`bodywork_id`) REFERENCES `configurator_bodyworks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`platform_id`) REFERENCES `configurator_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `configurator_engines` (
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
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_engines_engine_id_unique` ON `configurator_engines` (`engine_id`);--> statement-breakpoint
CREATE TABLE `configurator_engines_to_platforms` (
	`engine_id` integer NOT NULL,
	`platform_id` integer NOT NULL,
	PRIMARY KEY(`engine_id`, `platform_id`),
	FOREIGN KEY (`engine_id`) REFERENCES `configurator_engines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`platform_id`) REFERENCES `configurator_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `configurator_fuel_systems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fuel_system_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`flow_rate` integer NOT NULL,
	`features` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_fuel_systems_fuel_system_id_unique` ON `configurator_fuel_systems` (`fuel_system_id`);--> statement-breakpoint
CREATE TABLE `configurator_fuel_systems_to_engines` (
	`fuel_system_id` integer NOT NULL,
	`engine_id` integer NOT NULL,
	PRIMARY KEY(`fuel_system_id`, `engine_id`),
	FOREIGN KEY (`fuel_system_id`) REFERENCES `configurator_fuel_systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`engine_id`) REFERENCES `configurator_engines`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_glass_options_glass_id_unique` ON `configurator_glass_options` (`glass_id`);--> statement-breakpoint
CREATE TABLE `configurator_glass_options_to_platforms` (
	`glass_option_id` integer NOT NULL,
	`platform_id` integer NOT NULL,
	PRIMARY KEY(`glass_option_id`, `platform_id`),
	FOREIGN KEY (`glass_option_id`) REFERENCES `configurator_glass_options`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`platform_id`) REFERENCES `configurator_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `configurator_interiors` (
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
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_interiors_interior_id_unique` ON `configurator_interiors` (`interior_id`);--> statement-breakpoint
CREATE TABLE `configurator_interiors_to_platforms` (
	`interior_id` integer NOT NULL,
	`platform_id` integer NOT NULL,
	PRIMARY KEY(`interior_id`, `platform_id`),
	FOREIGN KEY (`interior_id`) REFERENCES `configurator_interiors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`platform_id`) REFERENCES `configurator_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `configurator_platforms` (
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
CREATE UNIQUE INDEX `configurator_platforms_platform_id_unique` ON `configurator_platforms` (`platform_id`);--> statement-breakpoint
CREATE TABLE `configurator_rear_axles` (
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
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_rear_axles_axle_id_unique` ON `configurator_rear_axles` (`axle_id`);--> statement-breakpoint
CREATE TABLE `configurator_rear_axles_to_platforms` (
	`rear_axle_id` integer NOT NULL,
	`platform_id` integer NOT NULL,
	PRIMARY KEY(`rear_axle_id`, `platform_id`),
	FOREIGN KEY (`rear_axle_id`) REFERENCES `configurator_rear_axles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`platform_id`) REFERENCES `configurator_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `configurator_suspensions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`suspension_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`adjustable` integer NOT NULL,
	`features` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_suspensions_suspension_id_unique` ON `configurator_suspensions` (`suspension_id`);--> statement-breakpoint
CREATE TABLE `configurator_suspensions_to_platforms` (
	`suspension_id` integer NOT NULL,
	`platform_id` integer NOT NULL,
	PRIMARY KEY(`suspension_id`, `platform_id`),
	FOREIGN KEY (`suspension_id`) REFERENCES `configurator_suspensions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`platform_id`) REFERENCES `configurator_platforms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `configurator_transmissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transmission_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`speeds` integer NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`manufacturer` text NOT NULL,
	`torque_rating` integer NOT NULL,
	`features` text NOT NULL,
	`installation_cost` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configurator_transmissions_transmission_id_unique` ON `configurator_transmissions` (`transmission_id`);--> statement-breakpoint
CREATE TABLE `configurator_transmissions_to_engines` (
	`transmission_id` integer NOT NULL,
	`engine_id` integer NOT NULL,
	PRIMARY KEY(`transmission_id`, `engine_id`),
	FOREIGN KEY (`transmission_id`) REFERENCES `configurator_transmissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`engine_id`) REFERENCES `configurator_engines`(`id`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `customer_configurations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`configuration_id` text NOT NULL,
	`customer_email` text,
	`customer_name` text,
	`platform_id` integer NOT NULL,
	`engine_id` integer,
	`transmission_id` integer,
	`suspension_id` integer,
	`rear_axle_id` integer,
	`fuel_system_id` integer,
	`interior_id` integer,
	`bodywork_id` integer,
	`glass_id` integer,
	`color_choice` text,
	`wheel_choice` text,
	`additional_options` text,
	`total_price` text NOT NULL,
	`ai_recommendations` text,
	`configuration_notes` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `configurator_platforms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`engine_id`) REFERENCES `configurator_engines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transmission_id`) REFERENCES `configurator_transmissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`suspension_id`) REFERENCES `configurator_suspensions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rear_axle_id`) REFERENCES `configurator_rear_axles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fuel_system_id`) REFERENCES `configurator_fuel_systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`interior_id`) REFERENCES `configurator_interiors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bodywork_id`) REFERENCES `configurator_bodyworks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`glass_id`) REFERENCES `configurator_glass_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_configurations_configuration_id_unique` ON `customer_configurations` (`configuration_id`);--> statement-breakpoint
CREATE TABLE `engineering_features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`user_id` integer NOT NULL,
	`event_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `car_show_events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
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
CREATE TABLE `hero_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`image_url` text NOT NULL,
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
