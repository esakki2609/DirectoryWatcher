/*
  Warnings:

  - You are about to drop the `filedeleted` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `filedeleted` DROP FOREIGN KEY `FileDeleted_configurationId_fkey`;

-- AlterTable
ALTER TABLE `configuration` ADD COLUMN `files_add_count` INTEGER NULL,
    ADD COLUMN `files_delete_count` INTEGER NULL;

-- DropTable
DROP TABLE `filedeleted`;
