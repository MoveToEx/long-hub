-- CreateTable
CREATE TABLE `post` (
    `id` CHAR(36) NOT NULL,
    `text` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `imageHash` VARCHAR(255) NULL,
    `aggr` FLOAT NULL DEFAULT 0,
    `createdAt` DATETIME(0) NULL,
    `updatedAt` DATETIME(0) NULL,
    `uploaderId` INTEGER NULL,

    INDEX `uploaderId`(`uploaderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taggedpost` (
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `postId` CHAR(36) NOT NULL,
    `tagId` INTEGER NOT NULL,

    INDEX `tagId`(`tagId`),
    PRIMARY KEY (`postId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template` (
    `name` VARCHAR(255) NOT NULL,
    `offsetX` INTEGER NULL,
    `offsetY` INTEGER NULL,
    `rectHeight` INTEGER NULL,
    `rectWidth` INTEGER NULL,
    `style` VARCHAR(255) NULL,
    `image` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `permission` INTEGER NULL,
    `accessKey` VARCHAR(255) NULL,
    `passwordHash` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_ibfk_1` FOREIGN KEY (`uploaderId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taggedpost` ADD CONSTRAINT `taggedpost_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taggedpost` ADD CONSTRAINT `taggedpost_ibfk_2` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

