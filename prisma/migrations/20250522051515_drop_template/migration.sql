/*
  Warnings:

  - You are about to drop the `template` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "template" DROP CONSTRAINT "template_uploaderId_fkey";

-- DropTable
DROP TABLE "template";
