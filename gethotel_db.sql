-- GetHotel Database Schema (Synced with Prisma Schema)
-- Optimized for Strict MySQL / Shared Hosting
SET FOREIGN_KEY_CHECKS = 0;

-- 1. DROP ALL TABLES IN PERFECT ORDER (Child tables first)
DROP TABLE IF EXISTS `revenuelog`;     -- Child of booking
DROP TABLE IF EXISTS `transaction`;    -- Child of booking
DROP TABLE IF EXISTS `dailyrate`;      -- Child of room
DROP TABLE IF EXISTS `booking`;        -- Child of user, hotel, room
DROP TABLE IF EXISTS `room`;           -- Child of hotel
DROP TABLE IF EXISTS `review`;         -- Child of user, hotel
DROP TABLE IF EXISTS `staff`;          -- Child of user, hotel
DROP TABLE IF EXISTS `notification`;   -- Child of user, hotel
DROP TABLE IF EXISTS `coupon`;         -- Child of hotel
DROP TABLE IF EXISTS `payout`;         -- Child of hotel
DROP TABLE IF EXISTS `hotelwallet`;    -- Child of hotel
DROP TABLE IF EXISTS `partnerprofile`; -- Child of user
DROP TABLE IF EXISTS `hotel`;          -- Child of user
DROP TABLE IF EXISTS `user`;           -- Root table
DROP TABLE IF EXISTS `partnerrequest`; -- Standalone
DROP TABLE IF EXISTS `enquiry`;        -- Standalone
DROP TABLE IF EXISTS `newsletter`;     -- Standalone

SET FOREIGN_KEY_CHECKS = 1; -- Re-enable to be safe before creating
SET FOREIGN_KEY_CHECKS = 0; -- Disable again just in case for creation

-- NOW CREATE TABLES

-- 1. User Table
CREATE TABLE `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'user',
  `nameLastChangedAt` DATETIME(3) NULL,
  `profileImage` LONGTEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Hotel Table
CREATE TABLE `hotel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `tagline` VARCHAR(191) NULL,
  `description` TEXT NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `pricePerNight` DOUBLE NOT NULL,
  `starRating` INT NOT NULL DEFAULT 3,
  `guestRating` DOUBLE NOT NULL DEFAULT 0,
  `reviewCount` INT NOT NULL DEFAULT 0,
  `thumbnail` LONGTEXT NULL,
  `images` LONGTEXT NULL,
  `amenities` LONGTEXT NULL,
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0,
  `isTrending` TINYINT(1) NOT NULL DEFAULT 0,
  `dining` LONGTEXT NULL,
  `wellness` LONGTEXT NULL,
  `faqs` LONGTEXT NULL,
  `safety` LONGTEXT NULL,
  `policies` LONGTEXT NULL,
  `userId` INT NOT NULL,
  `hotelUsername` VARCHAR(191) NULL UNIQUE,
  `badges` TEXT NULL,
  `bookingAcceptanceRate` DOUBLE NOT NULL DEFAULT 100,
  `cancellationRate` DOUBLE NOT NULL DEFAULT 0,
  `complaintsCount` INT NOT NULL DEFAULT 0,
  `noShowRate` DOUBLE NOT NULL DEFAULT 0,
  `qualityScore` DOUBLE NOT NULL DEFAULT 85,
  `responseSpeed` VARCHAR(191) DEFAULT 'Fast',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Hotel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Room Table
CREATE TABLE `room` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `bedConfiguration` VARCHAR(191) NULL,
  `sizeM2` INT NULL,
  `maxOccupancy` INT NOT NULL DEFAULT 2,
  `pricePerNight` DOUBLE NOT NULL,
  `amenities` LONGTEXT NULL,
  `images` LONGTEXT NULL,
  `description` TEXT NULL,
  `hotelId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Room_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Booking Table
CREATE TABLE `booking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `hotelId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `checkIn` DATETIME(3) NOT NULL,
  `checkOut` DATETIME(3) NOT NULL,
  `totalPrice` DOUBLE NOT NULL,
  `totalGuests` INT NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'held',
  `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `amountPaid` DOUBLE NOT NULL DEFAULT 0,
  `razorpayOrderId` VARCHAR(191) NULL UNIQUE,
  `razorpayPaymentId` VARCHAR(191) NULL UNIQUE,
  `razorpaySignature` TEXT NULL,
  `companyName` VARCHAR(191) NULL,
  `gstNumber` VARCHAR(191) NULL,
  `guestEmail` VARCHAR(191) NOT NULL DEFAULT '',
  `guestFirstName` VARCHAR(191) NOT NULL DEFAULT '',
  `guestLastName` VARCHAR(191) NOT NULL DEFAULT '',
  `guestPhone` VARCHAR(191) NOT NULL DEFAULT '',
  `isBusiness` TINYINT(1) NOT NULL DEFAULT 0,
  `roomDetails` TEXT NULL,
  `specialRequests` TEXT NULL,
  `holdExpiresAt` DATETIME(3) NULL,
  `cancellationReason` TEXT NULL,
  `internalNotes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `Booking_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Partner Request Table
CREATE TABLE `partnerrequest` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hotelName` VARCHAR(191) NOT NULL,
  `tagline` VARCHAR(191) NULL,
  `description` TEXT NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `pricePerNight` DOUBLE NOT NULL,
  `userName` VARCHAR(191) NOT NULL,
  `userEmail` VARCHAR(191) NOT NULL,
  `userPhone` VARCHAR(191) NOT NULL,
  `partnerPassword` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `hotelUsername` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Transaction Table
CREATE TABLE `transaction` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bookingId` INT NOT NULL,
  `amount` DOUBLE NOT NULL,
  `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(191) NOT NULL,
  `gateway` VARCHAR(191) NOT NULL DEFAULT 'razorpay',
  `gatewayOrderId` VARCHAR(191) NULL,
  `gatewayPaymentId` VARCHAR(191) NULL,
  `gatewaySignature` TEXT NULL,
  `rawResponse` LONGTEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `Transaction_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Daily Rate Table
CREATE TABLE `dailyrate` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATETIME(3) NOT NULL,
  `price` DOUBLE NOT NULL,
  `available` INT NOT NULL DEFAULT 1,
  `roomId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `DailyRate_roomId_date_key` (`roomId`, `date`),
  CONSTRAINT `DailyRate_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Coupon Table
CREATE TABLE `coupon` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `discountType` VARCHAR(191) NOT NULL DEFAULT 'percentage',
  `discountValue` DOUBLE NOT NULL,
  `minBookingAmt` DOUBLE NOT NULL DEFAULT 0,
  `maxDiscount` DOUBLE NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate?` DATETIME(3) NOT NULL,
  `usageLimit` INT NULL,
  `usedCount` INT NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `hotelId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Coupon_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notification Table
CREATE TABLE `notification` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `hotelId` INT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'info',
  `isRead` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Notification_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Staff Table
CREATE TABLE `staff` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `hotelId` INT NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'receptionist',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `Staff_userId_hotelId_key` (`userId`, `hotelId`),
  CONSTRAINT `Staff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Staff_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Review Table
CREATE TABLE `review` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `hotelId` INT NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `cleanliness` INT NOT NULL DEFAULT 5,
  `comfort` INT NOT NULL DEFAULT 5,
  `location` INT NOT NULL DEFAULT 5,
  `staff` INT NOT NULL DEFAULT 5,
  `valueForMoney` INT NOT NULL DEFAULT 5,
  `partnerReply` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY `Review_userId_hotelId_key` (`userId`, `hotelId`),
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Review_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Payout Table
CREATE TABLE `payout` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hotelId` INT NOT NULL,
  `amount` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `bankReference` VARCHAR(191) NULL,
  `payoutDate` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT `Payout_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Hotel Wallet Table
CREATE TABLE `hotelwallet` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hotelId` INT NOT NULL UNIQUE,
  `totalRevenue` DOUBLE NOT NULL DEFAULT 0,
  `availableBalance` DOUBLE NOT NULL DEFAULT 0,
  `pendingPayouts` DOUBLE NOT NULL DEFAULT 0,
  `commissionRate` DOUBLE NOT NULL DEFAULT 15,
  `lastPayoutDate` DATETIME(3) NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `hotelWallet_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Super Admin (Password: admin123)
INSERT INTO `user` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Super Admin', 'admin@gethotelstays.com', '$2b$10$WEiMSDOHtXlgNf2TwAuLqO2i4XPOaTIhNTAzR2ghOUN7Zu6F1AsP2', 'super_admin');

SET FOREIGN_KEY_CHECKS = 1;
