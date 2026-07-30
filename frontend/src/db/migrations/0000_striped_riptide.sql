CREATE TABLE `beans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`roaster` text,
	`origin` text,
	`process` text,
	`roast_level` text,
	`roast_date` text,
	`grams` real,
	`price` real,
	`currency` text DEFAULT 'PHP' NOT NULL,
	`bought_at` text,
	`photo_uri` text,
	`photo_path` text,
	`notes` text,
	`is_finished` integer DEFAULT false NOT NULL,
	`finished_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `beans_updated_at_idx` ON `beans` (`updated_at`);--> statement-breakpoint
CREATE TABLE `brews` (
	`id` text PRIMARY KEY NOT NULL,
	`bean_id` text,
	`method` text NOT NULL,
	`dose_g` real,
	`water_g` real,
	`temp_c` real,
	`grind` text,
	`time_seconds` integer,
	`rating` real,
	`notes` text,
	`brewed_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `brews_updated_at_idx` ON `brews` (`updated_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT 'YENN' NOT NULL,
	`units` text DEFAULT 'metric' NOT NULL,
	`default_method` text DEFAULT 'v60' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`onboarded` integer DEFAULT false NOT NULL,
	`last_synced_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bean_id` text,
	`method` text NOT NULL,
	`dose_g` real,
	`water_g` real,
	`temp_c` real,
	`grind` text,
	`time_seconds` integer,
	`notes` text,
	`source_brew_id` text,
	`times_used` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `recipes_updated_at_idx` ON `recipes` (`updated_at`);