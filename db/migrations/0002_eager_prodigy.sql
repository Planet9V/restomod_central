CREATE TABLE `price_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer NOT NULL,
	`price` text NOT NULL,
	`source_type` text NOT NULL,
	`source_name` text,
	`recorded_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `cars_for_sale`(`id`) ON UPDATE no action ON DELETE cascade
);
