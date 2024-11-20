/*
  Warnings:

  - Added the required column `imageURL` to the `template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `template` ADD COLUMN `imageURL` VARCHAR(128) NOT NULL;
