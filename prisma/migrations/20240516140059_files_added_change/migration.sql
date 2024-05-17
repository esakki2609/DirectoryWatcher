/*
  Warnings:

  - You are about to drop the column `taskRunId` on the `fileadded` table. All the data in the column will be lost.
  - You are about to drop the column `taskRunId` on the `filedeleted` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `fileadded` DROP FOREIGN KEY `FileAdded_taskRunId_fkey`;

-- DropForeignKey
ALTER TABLE `filedeleted` DROP FOREIGN KEY `FileDeleted_taskRunId_fkey`;

-- AlterTable
ALTER TABLE `fileadded` DROP COLUMN `taskRunId`,
    ADD COLUMN `configurationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `filedeleted` DROP COLUMN `taskRunId`,
    ADD COLUMN `configurationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FileAdded` ADD CONSTRAINT `FileAdded_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `Configuration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileDeleted` ADD CONSTRAINT `FileDeleted_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `Configuration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
