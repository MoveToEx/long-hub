/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `configuration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "configuration_key_key" ON "configuration"("key");
