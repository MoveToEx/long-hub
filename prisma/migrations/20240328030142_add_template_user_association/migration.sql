-- AlterTable
ALTER TABLE `template` ADD COLUMN `uploaderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `template` ADD CONSTRAINT `template_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
