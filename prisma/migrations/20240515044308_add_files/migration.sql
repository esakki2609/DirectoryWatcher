-- CreateTable
CREATE TABLE `Configuration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directory` VARCHAR(191) NOT NULL,
    `interval` INTEGER NOT NULL,
    `magicString` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskRun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `runtime` INTEGER NULL,
    `magicStringCount` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `configurationId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileAdded` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `taskRunId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileDeleted` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `taskRunId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaskRun` ADD CONSTRAINT `TaskRun_configurationId_fkey` FOREIGN KEY (`configurationId`) REFERENCES `Configuration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAdded` ADD CONSTRAINT `FileAdded_taskRunId_fkey` FOREIGN KEY (`taskRunId`) REFERENCES `TaskRun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileDeleted` ADD CONSTRAINT `FileDeleted_taskRunId_fkey` FOREIGN KEY (`taskRunId`) REFERENCES `TaskRun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
