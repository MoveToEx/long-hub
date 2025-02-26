-- AlterTable
ALTER TABLE `deletion_request` MODIFY `status` ENUM('pending', 'cancelled', 'dismissed', 'approved', 'revoked') NOT NULL DEFAULT 'pending';
