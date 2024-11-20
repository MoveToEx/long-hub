/*
  Warnings:

  - Made the column `imageURL` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `imageURL` VARCHAR(128) NOT NULL;
