/*
  Warnings:

  - You are about to drop the column `claimed` on the `upload_session` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UploadSessionStatus" AS ENUM ('active', 'claimed', 'expired');

-- AlterTable
ALTER TABLE "upload_session" DROP COLUMN "claimed",
ADD COLUMN     "status" "UploadSessionStatus" NOT NULL DEFAULT 'active';
