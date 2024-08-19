/*
  Warnings:

  - The values [Slight,Extreme] on the enum `post_rating` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `rating` ENUM('None', 'Moderate', 'Violent') NOT NULL DEFAULT 'None';
