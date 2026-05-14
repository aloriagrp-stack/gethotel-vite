SET FOREIGN_KEY_CHECKS = 0;
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;


CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'user',
  `nameLastChangedAt` datetime(3) DEFAULT NULL,
  `profileImage` longtext DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `user`
--













-- Dump completed on 2026-05-11 14:43:12



-- Pre-seeding Super Admin user
INSERT INTO `user` (`name`, `email`, `password`, `role`, `updatedAt`) VALUES ('Super Admin', 'aloriagrp@gmail.com', '', 'admin', NOW(3));


-- Pre-seeding Super Admin user
INSERT INTO `user` (`name`, `email`, `password`, `role`, `updatedAt`) VALUES ('shriyansh', 'aloriagrp@gmail.com', '.yxwwfZBRLbCj34.cVpmS0l.7Dg7LX4oy/arXXcRZT9Sta.', 'super_admin', NOW(3));
-- Table structure for table `hotel`
--

DROP TABLE IF EXISTS `hotel`;


CREATE TABLE `hotel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `tagline` varchar(191) DEFAULT NULL,
  `description` text NOT NULL,
  `city` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `pricePerNight` double NOT NULL,
  `starRating` int(11) NOT NULL DEFAULT 3,
  `guestRating` double NOT NULL DEFAULT 0,
  `reviewCount` int(11) NOT NULL DEFAULT 0,
  `thumbnail` longtext DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `isTrending` tinyint(1) NOT NULL DEFAULT 0,
  `dining` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dining`)),
  `wellness` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`wellness`)),
  `faqs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`faqs`)),
  `safety` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`safety`)),
  `policies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`policies`)),
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `hotelUsername` varchar(191) DEFAULT NULL,
  `badges` text DEFAULT NULL,
  `bookingAcceptanceRate` double NOT NULL DEFAULT 100,
  `cancellationRate` double NOT NULL DEFAULT 0,
  `complaintsCount` int(11) NOT NULL DEFAULT 0,
  `noShowRate` double NOT NULL DEFAULT 0,
  `qualityScore` double NOT NULL DEFAULT 85,
  `responseSpeed` varchar(191) DEFAULT 'Fast',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Hotel_hotelUsername_key` (`hotelUsername`),
  KEY `Hotel_userId_fkey` (`userId`),
  CONSTRAINT `Hotel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `hotel`
--




--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;


CREATE TABLE `room` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `bedConfiguration` varchar(191) DEFAULT NULL,
  `sizeM2` int(11) DEFAULT NULL,
  `maxOccupancy` int(11) NOT NULL DEFAULT 2,
  `pricePerNight` double NOT NULL,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `hotelId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Room_hotelId_fkey` (`hotelId`),
  CONSTRAINT `Room_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `room`
--




--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;


CREATE TABLE `booking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `hotelId` int(11) NOT NULL,
  `roomId` int(11) NOT NULL,
  `checkIn` datetime(3) NOT NULL,
  `checkOut` datetime(3) NOT NULL,
  `totalPrice` double NOT NULL,
  `totalGuests` int(11) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'held',
  `paymentStatus` varchar(191) NOT NULL DEFAULT 'pending',
  `amountPaid` double NOT NULL DEFAULT 0,
  `razorpayOrderId` varchar(191) DEFAULT NULL,
  `razorpayPaymentId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `companyName` varchar(191) DEFAULT NULL,
  `gstNumber` varchar(191) DEFAULT NULL,
  `guestEmail` varchar(191) NOT NULL DEFAULT '',
  `guestFirstName` varchar(191) NOT NULL DEFAULT '',
  `guestLastName` varchar(191) NOT NULL DEFAULT '',
  `guestPhone` varchar(191) NOT NULL DEFAULT '',
  `isBusiness` tinyint(1) NOT NULL DEFAULT 0,
  `roomDetails` text DEFAULT NULL,
  `specialRequests` text DEFAULT NULL,
  `holdExpiresAt` datetime(3) DEFAULT NULL,
  `razorpaySignature` text DEFAULT NULL,
  `cancellationReason` text DEFAULT NULL,
  `internalNotes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Booking_razorpayOrderId_key` (`razorpayOrderId`),
  UNIQUE KEY `Booking_razorpayPaymentId_key` (`razorpayPaymentId`),
  KEY `Booking_userId_fkey` (`userId`),
  KEY `Booking_hotelId_fkey` (`hotelId`),
  KEY `Booking_roomId_fkey` (`roomId`),
  CONSTRAINT `Booking_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `booking`
--




--
-- Table structure for table `coupon`
--

DROP TABLE IF EXISTS `coupon`;


CREATE TABLE `coupon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(191) NOT NULL,
  `discountType` varchar(191) NOT NULL DEFAULT 'percentage',
  `discountValue` double NOT NULL,
  `minBookingAmt` double NOT NULL DEFAULT 0,
  `maxDiscount` double DEFAULT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `usageLimit` int(11) DEFAULT NULL,
  `usedCount` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `hotelId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Coupon_code_key` (`code`),
  KEY `Coupon_hotelId_fkey` (`hotelId`),
  CONSTRAINT `Coupon_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `coupon`
--




--
-- Table structure for table `dailyrate`
--

DROP TABLE IF EXISTS `dailyrate`;


CREATE TABLE `dailyrate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime(3) NOT NULL,
  `price` double NOT NULL,
  `available` int(11) NOT NULL DEFAULT 1,
  `roomId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DailyRate_roomId_date_key` (`roomId`,`date`),
  CONSTRAINT `DailyRate_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `dailyrate`
--




--
-- Table structure for table `hotelwallet`
--

DROP TABLE IF EXISTS `hotelwallet`;


CREATE TABLE `hotelwallet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hotelId` int(11) NOT NULL,
  `totalRevenue` double NOT NULL DEFAULT 0,
  `availableBalance` double NOT NULL DEFAULT 0,
  `pendingPayouts` double NOT NULL DEFAULT 0,
  `commissionRate` double NOT NULL DEFAULT 15,
  `lastPayoutDate` datetime(3) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hotelWallet_hotelId_key` (`hotelId`),
  CONSTRAINT `hotelWallet_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `hotelwallet`
--




--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;


CREATE TABLE `notification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `hotelId` int(11) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'info',
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `Notification_userId_fkey` (`userId`),
  KEY `Notification_hotelId_fkey` (`hotelId`),
  CONSTRAINT `Notification_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `notification`
--




--
-- Table structure for table `partnerrequest`
--

DROP TABLE IF EXISTS `partnerrequest`;


CREATE TABLE `partnerrequest` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hotelName` varchar(191) NOT NULL,
  `tagline` varchar(191) DEFAULT NULL,
  `description` text NOT NULL,
  `address` varchar(191) NOT NULL,
  `city` varchar(191) NOT NULL,
  `pricePerNight` double NOT NULL,
  `userName` varchar(191) NOT NULL,
  `userEmail` varchar(191) NOT NULL,
  `userPhone` varchar(191) NOT NULL,
  `partnerPassword` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `hotelUsername` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `partnerrequest`
--




--
-- Table structure for table `payout`
--

DROP TABLE IF EXISTS `payout`;


CREATE TABLE `payout` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hotelId` int(11) NOT NULL,
  `amount` double NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `bankReference` varchar(191) DEFAULT NULL,
  `payoutDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `payout_hotelId_idx` (`hotelId`),
  CONSTRAINT `payout_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `payout`
--




--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;


CREATE TABLE `review` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `hotelId` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `cleanliness` int(11) NOT NULL DEFAULT 5,
  `comfort` int(11) NOT NULL DEFAULT 5,
  `location` int(11) NOT NULL DEFAULT 5,
  `partnerReply` text DEFAULT NULL,
  `staff` int(11) NOT NULL DEFAULT 5,
  `valueForMoney` int(11) NOT NULL DEFAULT 5,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Review_userId_hotelId_key` (`userId`,`hotelId`),
  KEY `Review_hotelId_fkey` (`hotelId`),
  CONSTRAINT `Review_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `review`
--




--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;


CREATE TABLE `transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bookingId` int(11) NOT NULL,
  `amount` double NOT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'INR',
  `status` varchar(191) NOT NULL,
  `gateway` varchar(191) NOT NULL DEFAULT 'razorpay',
  `gatewayOrderId` varchar(191) DEFAULT NULL,
  `gatewayPaymentId` varchar(191) DEFAULT NULL,
  `gatewaySignature` text DEFAULT NULL,
  `rawResponse` longtext DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `transaction_bookingId_idx` (`bookingId`),
  CONSTRAINT `transaction_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `booking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `transaction`
--




--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;


CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `hotelId` int(11) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'receptionist',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Staff_userId_hotelId_key` (`userId`,`hotelId`),
  KEY `Staff_hotelId_fkey` (`hotelId`),
  CONSTRAINT `Staff_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Staff_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Dumping data for table `staff`
--




--

SET FOREIGN_KEY_CHECKS = 1;

