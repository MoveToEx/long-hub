/*
  Warnings:

  - Made the column `createdAt` on table `post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `createdAt` DATETIME(0) NOT NULL,
    MODIFY `updatedAt` DATETIME(0) NOT NULL;
