-- AlterTable
ALTER TABLE `post` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletionReason` TEXT NULL;
