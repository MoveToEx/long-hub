/*
  Warnings:

  - Made the column `text` on table `post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageHash` on table `post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aggr` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `text` TEXT,
    MODIFY `image` VARCHAR(255),
    MODIFY `imageHash` VARCHAR(255),
    MODIFY `aggr` FLOAT DEFAULT 0;
