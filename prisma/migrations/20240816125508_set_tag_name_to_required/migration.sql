/*
  Warnings:

  - Made the column `name` on table `tag` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `tag` MODIFY `name` VARCHAR(255) NOT NULL;
