const prisma = require('../config/db');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res, next) => {
    try {
        console.log("Fetching hotels from database...");
        const hotels = await prisma.hotel.findMany({
            include: {
                room: true,
                coupon: true
            }
        });
        console.log(`Found ${hotels.length} hotels.`);
        res.status(200).json({ success: true, count: hotels.length, data: hotels });
    } catch (err) {
        console.error("DATABASE_ERROR:", err);
        res.status(500).json({ success: false, message: "Database Connection Error", error: err.message });
    }
};

// @desc    Advanced search for hotels with strong algorithm
// @route   GET /api/hotels/search
// @access  Public
exports.searchHotels = async (req, res, next) => {
    try {
        const { city, checkIn, checkOut, adults, children, rooms, stayType } = req.query;
        const totalGuests = parseInt(adults || 2) + parseInt(children || 0);
        const requiredRooms = parseInt(rooms || 1);

        // 1. Initial Filtering by City and Room Capacity
        let whereClause = {};
        if (city && city !== "All" && city !== "India") {
            whereClause.OR = [
                { city: { contains: city } },
                { address: { contains: city } },
                { name: { contains: city } }
            ];
        }

        // Must have rooms that can fit the guests
        whereClause.room = {
            some: {
                maxOccupancy: { gte: Math.ceil(totalGuests / requiredRooms) }
            }
        };

        const hotels = await prisma.hotel.findMany({
            where: whereClause,
            include: {
                room: true,
                coupon: true,
                booking: {
                    where: {
                        status: { in: ['confirmed', 'checked-in'] },
                        OR: [
                            {
                                AND: [
                                    { checkIn: { lte: new Date(checkIn || new Date()) } },
                                    { checkOut: { gte: new Date(checkIn || new Date()) } }
                                ]
                            },
                            {
                                AND: [
                                    { checkIn: { lte: new Date(checkOut || new Date()) } },
                                    { checkOut: { gte: new Date(checkOut || new Date()) } }
                                ]
                            }
                        ]
                    }
                }
            }
        });

        // 2. Strong Availability Algorithm (Check overlaps)
        const availableHotels = hotels.filter(hotel => {
            // Group bookings by room type
            const activeBookings = hotel.booking.length;
            const totalRoomsCount = hotel.room.length; // Simplified: usually we have inventory counts
            
            // If the hotel has many rooms and few bookings, it's likely available
            // For a production system, we'd check inventory per room type
            return activeBookings < totalRoomsCount * 5; // Assuming each room type has at least 5 units
        });

        // 3. Strong Ranking Algorithm (The 'Secret Sauce')
        // Score = (QualityScore * 0.5) + (Featured * 30) + (Rating * 20)
        const rankedHotels = availableHotels.map(hotel => {
            let rankScore = (hotel.qualityScore || 85) * 0.5;
            if (hotel.isFeatured) rankScore += 30;
            rankScore += (hotel.guestRating || 0) * 4; // 5 stars * 4 = 20 points
            
            // Bonus for trending
            if (hotel.isTrending) rankScore += 10;
            
            return { ...hotel, rankScore };
        }).sort((a, b) => b.rankScore - a.rankScore);

        res.status(200).json({ 
            success: true, 
            count: rankedHotels.length, 
            data: rankedHotels 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = async (req, res, next) => {
    try {
        const hotel = await prisma.hotel.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                room: {
                    select: {
                        id: true, name: true, bedConfiguration: true,
                        sizeM2: true, maxOccupancy: true, pricePerNight: true,
                        minPrice: true, maxPrice: true, variants: true, roomPolicies: true,
                        weeklyDiscount: true, monthlyDiscount: true,
                        amenities: true, images: true, highlights: true, trustPoints: true,
                        description: true, hotelId: true,
                        createdAt: true, updatedAt: true,
                        isHourlyEnabled: true, hourlyRates: true
                    }
                },
                review: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Hotel Admin, Super Admin)
exports.createHotel = async (req, res, next) => {
    try {
        // Check if user is hotel_admin or super_admin
        if (req.user.role !== 'hotel_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to create a hotel' });
        }

        const { 
            name, tagline, description, city, address, pricePerNight, 
            starRating, thumbnail, images, amenities,
            dining, wellness, faqs, safety, policies, mainAmenities
        } = req.body;

        const hotel = await prisma.hotel.create({
            data: {
                name,
                tagline,
                description,
                city,
                address,
                pricePerNight: parseFloat(pricePerNight) || 0,
                starRating: parseInt(starRating) || 3,
                thumbnail,
                images: typeof images !== 'string' ? JSON.stringify(images) : images,
                amenities: typeof amenities !== 'string' ? JSON.stringify(amenities) : amenities,
                dining: typeof dining !== 'string' ? JSON.stringify(dining) : dining,
                wellness: typeof wellness !== 'string' ? JSON.stringify(wellness) : wellness,
                faqs: typeof faqs !== 'string' ? JSON.stringify(faqs) : faqs,
                safety: typeof safety !== 'string' ? JSON.stringify(safety) : safety,
                policies: typeof policies !== 'string' ? JSON.stringify(policies) : policies,
                mainAmenities: typeof mainAmenities !== 'string' ? JSON.stringify(mainAmenities) : mainAmenities,
                userId: req.user.id
            },
        });

        res.status(201).json({ success: true, data: hotel });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Hotel Admin, Super Admin)
exports.updateHotel = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.id);
        let hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Make sure user is hotel owner or super admin
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this hotel' });
        }

        // Filter req.body to only include valid hotel fields
        const validFields = [
            'name', 'tagline', 'description', 'city', 'address', 
            'pricePerNight', 'starRating', 'thumbnail', 'images', 
            'amenities', 'isFeatured', 'isTrending', 'dining', 
            'wellness', 'faqs', 'safety', 'policies', 'hotelUsername',
            'mainAmenities', 'badges', 'bookingAcceptanceRate', 'cancellationRate',
            'complaintsCount', 'noShowRate', 'qualityScore', 'responseSpeed'
        ];

        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (validFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        // Ensure numeric fields are correctly typed
        if (updateData.pricePerNight !== undefined) updateData.pricePerNight = parseFloat(updateData.pricePerNight);
        if (updateData.starRating !== undefined) updateData.starRating = parseInt(updateData.starRating);
        if (updateData.qualityScore !== undefined) updateData.qualityScore = parseFloat(updateData.qualityScore);
        if (updateData.complaintsCount !== undefined) updateData.complaintsCount = parseInt(updateData.complaintsCount);
        if (updateData.bookingAcceptanceRate !== undefined) updateData.bookingAcceptanceRate = parseFloat(updateData.bookingAcceptanceRate);
        if (updateData.cancellationRate !== undefined) updateData.cancellationRate = parseFloat(updateData.cancellationRate);
        if (updateData.noShowRate !== undefined) updateData.noShowRate = parseFloat(updateData.noShowRate);

        // Ensure JSON fields are stringified if sent as objects
        const jsonFields = ['images', 'amenities', 'dining', 'wellness', 'faqs', 'safety', 'policies', 'mainAmenities', 'badges'];
        jsonFields.forEach(field => {
            if (updateData[field] && typeof updateData[field] !== 'string') {
                updateData[field] = JSON.stringify(updateData[field]);
            }
        });

        console.log("Updating hotel with data:", updateData);

        hotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: updateData
        });

        res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        console.error("UPDATE_HOTEL_ERROR:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update hotel", 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Hotel Admin, Super Admin)
exports.deleteHotel = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.id);
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Make sure user is hotel owner or super admin
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this hotel' });
        }

        await prisma.hotel.delete({
            where: { id: hotelId }
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get hotels for logged in admin
// @route   GET /api/hotels/my-hotels
// @access  Private (Hotel Admin, Super Admin)
exports.getMyHotels = async (req, res, next) => {
    try {
        const hotels = await prisma.hotel.findMany({
            where: { userId: req.user.id },
            include: { 
                room: {
                    select: {
                        id: true, name: true, bedConfiguration: true,
                        sizeM2: true, maxOccupancy: true, pricePerNight: true,
                        amenities: true, images: true, highlights: true, trustPoints: true,
                        description: true, hotelId: true,
                        variants: true, roomPolicies: true, minPrice: true, maxPrice: true,
                        weeklyDiscount: true, monthlyDiscount: true,
                        createdAt: true, updatedAt: true
                    }
                },
                booking: {
                    include: {
                        user: { select: { name: true, email: true } },
                        room: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        const hotelsWithRevenue = hotels.map(hotel => {
            const totalRevenue = hotel.booking
                .filter(b => b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + b.totalPrice, 0);
            return { ...hotel, totalRevenue };
        });

        res.status(200).json({
            success: true,
            count: hotelsWithRevenue.length,
            data: hotelsWithRevenue
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create review for hotel
// @route   POST /api/hotels/:id/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        // Check if hotel exists
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Check if user has already reviewed this hotel
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_hotelId: {
                    userId: req.user.id,
                    hotelId: hotelId
                }
            }
        });

        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this hotel' });
        }

        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                userId: req.user.id,
                hotelId: hotelId
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        // Update hotel guestRating and reviewCount
        const reviews = await prisma.review.findMany({
            where: { hotelId: hotelId }
        });

        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = totalRating / reviews.length;

        await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                guestRating: avgRating,
                reviewCount: reviews.length
            }
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reply to a review
// @route   POST /api/hotels/:hotelId/reviews/:reviewId/reply
// @access  Private (Hotel Admin, Super Admin)
exports.replyToReview = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const reviewId = parseInt(req.params.reviewId);
        const { reply } = req.body;

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: { reply }
        });

        res.status(200).json({ success: true, data: updatedReview });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
