-- AlterTable
ALTER TABLE `post` ADD COLUMN `imageURL` VARCHAR(128) NULL;
UPDATE `post` SET `imageURL` = '';