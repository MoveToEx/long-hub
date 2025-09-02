-- AlterTable
ALTER TABLE "user" ADD COLUMN     "preference" JSONB NOT NULL DEFAULT '{}';
