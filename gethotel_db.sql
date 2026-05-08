-- GetHotel Database Schema
-- Generated from Prisma Schema

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS `DailyRate`;
DROP TABLE IF EXISTS `Review`;
DROP TABLE IF EXISTS `Booking`;
DROP TABLE IF EXISTS `Room`;
DROP TABLE IF EXISTS `Hotel`;
DROP TABLE IF EXISTS `User`;

-- Create User Table
CREATE TABLE `User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'user',
  `nameLastChangedAt` DATETIME(3) NULL,
  `profileImage` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Hotel Table
CREATE TABLE `Hotel` (
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
  `thumbnail` VARCHAR(191) NULL,
  `images` JSON NULL,
  `amenities` JSON NULL,
  `isFeatured` TINYINT(1) NOT NULL DEFAULT 0,
  `isTrending` TINYINT(1) NOT NULL DEFAULT 0,
  `dining` JSON NULL,
  `wellness` JSON NULL,
  `faqs` JSON NULL,
  `safety` JSON NULL,
  `policies` JSON NULL,
  `userId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Hotel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Room Table
CREATE TABLE `Room` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `bedConfiguration` VARCHAR(191) NULL,
  `sizeM2` INT NULL,
  `maxOccupancy` INT NOT NULL DEFAULT 2,
  `pricePerNight` DOUBLE NOT NULL,
  `amenities` JSON NULL,
  `images` JSON NULL,
  `hotelId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Room_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `Hotel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Booking Table
CREATE TABLE `Booking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `hotelId` INT NOT NULL,
  `roomId` INT NOT NULL,
  `checkIn` DATETIME(3) NOT NULL,
  `checkOut` DATETIME(3) NOT NULL,
  `totalPrice` DOUBLE NOT NULL,
  `totalGuests` INT NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'unpaid',
  `amountPaid` DOUBLE NOT NULL DEFAULT 0,
  `razorpayOrderId` VARCHAR(191) NULL UNIQUE,
  `razorpayPaymentId` VARCHAR(191) NULL UNIQUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Booking_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `Hotel` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Review Table
CREATE TABLE `Review` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `hotelId` INT NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Review_userId_hotelId_key`(`userId`, `hotelId`),
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Review_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `Hotel` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create DailyRate Table
CREATE TABLE `DailyRate` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATETIME(3) NOT NULL,
  `price` DOUBLE NOT NULL,
  `available` INT NOT NULL DEFAULT 1,
  `roomId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `DailyRate_roomId_date_key`(`roomId`, `date`),
  CONSTRAINT `DailyRate_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed Data
-- Create Admin User (password: password123, hashed)
INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Admin User', 'admin@gethotel.com', '$2a$10$7/O9f9H3FjI/qE6K8UvYyeZ1f8I9F5f5f5f5f5f5f5f5f5f5f5f', 'super_admin');

-- Create Initial Hotels
INSERT INTO `Hotel` (`id`, `name`, `tagline`, `description`, `city`, `address`, `pricePerNight`, `starRating`, `guestRating`, `reviewCount`, `thumbnail`, `images`, `amenities`, `isFeatured`, `isTrending`, `userId`) VALUES
(1, 'The Grand Meridian', 'Where luxury meets comfort in the heart of the city', 'An iconic 5-star landmark offering unparalleled luxury, world-class dining, and breathtaking city views.', 'Mumbai', 'Nariman Point, Marine Drive, Mumbai 400 021', 12500, 5, 9.2, 1842, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', '[\"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80\", \"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80\"]', '[\"wifi\", \"pool\", \"spa\", \"gym\", \"restaurant\"]', 1, 1, 1),
(2, 'Serenity Beach Resort', 'Wake up to the sound of waves every morning', 'A breathtaking beachfront resort nestled along pristine white sands.', 'Goa', 'Calangute Beach Road, North Goa, 403516', 18000, 5, 9.5, 2310, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', '[\"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80\", \"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80\"]', '[\"wifi\", \"pool\", \"beach_access\", \"bar\", \"yoga\"]', 1, 1, 1);

-- Create Rooms for Hotels
INSERT INTO `Room` (`id`, `name`, `bedConfiguration`, `sizeM2`, `maxOccupancy`, `pricePerNight`, `amenities`, `hotelId`) VALUES
(1, 'Deluxe King Room', 'King Size', 45, 2, 12500, '[\"AC\", \"TV\", \"Mini Bar\", \"Sea View\"]', 1),
(2, 'Executive Suite', 'Super King', 75, 3, 18750, '[\"AC\", \"TV\", \"Kitchenette\", \"Balcony\"]', 1),
(3, 'Deluxe King Room', 'King Size', 45, 2, 18000, '[\"AC\", \"TV\", \"Mini Bar\", \"Sea View\"]', 2);

SET FOREIGN_KEY_CHECKS = 1;
