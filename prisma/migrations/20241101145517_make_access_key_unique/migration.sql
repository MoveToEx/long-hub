/*
  Warnings:

  - A unique constraint covering the columns `[accessKey]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_accessKey_key` ON `user`(`accessKey`);
