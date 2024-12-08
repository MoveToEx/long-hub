/*
  Warnings:

  - You are about to alter the column `rating` on the `post` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `rating` ENUM('none', 'moderate', 'violent') NOT NULL DEFAULT 'none';
UPDATE `post` SET rating = 'none' WHERE aggr = 0;
UPDATE `post` SET rating = 'moderate' WHERE aggr > 0 AND aggr <= 5;
UPDATE `post` SET rating = 'violent' WHERE aggr > 5;