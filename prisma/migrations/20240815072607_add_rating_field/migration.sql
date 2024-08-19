-- AlterTable
ALTER TABLE `post` ADD COLUMN `rating` ENUM('None', 'Slight', 'Moderate', 'Violent', 'Extreme') NOT NULL DEFAULT 'None';
