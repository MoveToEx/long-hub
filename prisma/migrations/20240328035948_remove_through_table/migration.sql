/*
  Warnings:

  - You are about to drop the `taggedpost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `taggedpost` DROP FOREIGN KEY `taggedpost_ibfk_1`;

-- DropForeignKey
ALTER TABLE `taggedpost` DROP FOREIGN KEY `taggedpost_ibfk_2`;

-- DropTable
DROP TABLE `taggedpost`;

-- CreateTable
CREATE TABLE `_postTotag` (
    `A` CHAR(36) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_postTotag_AB_unique`(`A`, `B`),
    INDEX `_postTotag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_postTotag` ADD CONSTRAINT `_postTotag_A_fkey` FOREIGN KEY (`A`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_postTotag` ADD CONSTRAINT `_postTotag_B_fkey` FOREIGN KEY (`B`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
