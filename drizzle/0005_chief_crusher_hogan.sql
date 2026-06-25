ALTER TABLE `orders` ADD `recipientName` varchar(256);--> statement-breakpoint
ALTER TABLE `orders` ADD `street` varchar(256);--> statement-breakpoint
ALTER TABLE `orders` ADD `number` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` ADD `complement` varchar(256);--> statement-breakpoint
ALTER TABLE `orders` ADD `addressType` enum('house','apartment','condominium','commercial','other');