/*
  Warnings:

  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `permission` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accessKey` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passwordHash` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `permission` INTEGER NOT NULL DEFAULT 0,
    MODIFY `accessKey` VARCHAR(255) NOT NULL,
    MODIFY `passwordHash` VARCHAR(255) NOT NULL,
    MODIFY `createdAt` DATETIME(0) NOT NULL;
