CREATE TABLE IF NOT EXISTS `ai_conversation` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NULL,
  `title` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ai_conversation_userId_idx` (`userId`),
  INDEX `ai_conversation_updatedAt_idx` (`updatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_conversation_memory` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `conversationId` VARCHAR(191) NOT NULL,
  `workflowState` VARCHAR(64) NOT NULL,
  `nextRequiredSlot` VARCHAR(64) NULL,
  `memoryJson` LONGTEXT NOT NULL,
  `lastIntent` VARCHAR(64) NULL,
  `lastAction` VARCHAR(64) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ai_conversation_memory_conversationId_key` (`conversationId`),
  INDEX `ai_conversation_memory_workflowState_idx` (`workflowState`),
  INDEX `ai_conversation_memory_updatedAt_idx` (`updatedAt`),
  CONSTRAINT `ai_conversation_memory_conversationId_fkey`
    FOREIGN KEY (`conversationId`) REFERENCES `ai_conversation`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
