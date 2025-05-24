/*
  Warnings:

  - Added the required column `status` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'deleted');

-- AlterTable
ALTER TABLE "post" ADD COLUMN "status" "Status";

UPDATE "post" SET "status" = 'active';

ALTER TABLE "post"
  ALTER COLUMN "status" SET NOT NULL,
  ALTER COLUMN "imageHash" DROP NOT NULL;
