-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "text_embedding" vector(1024);
