const prisma = require('../config/db');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res, next) => {
    try {
        const hotels = await prisma.hotel.findMany({
            include: {
                room: {
                    select: {
                        id: true, name: true, bedConfiguration: true,
                        sizeM2: true, maxOccupancy: true, pricePerNight: true,
                        amenities: true, description: true, hotelId: true,
                        createdAt: true, updatedAt: true
                    }
                }
            }
        });
        res.status(200).json({ success: true, count: hotels.length, data: hotels });
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
                        amenities: true, description: true, hotelId: true,
                        createdAt: true, updatedAt: true
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
            dining, wellness, faqs, safety, policies
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
            'wellness', 'faqs', 'safety', 'policies', 'hotelUsername'
        ];

        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (validFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        // Ensure numeric fields are correctly typed
        if (updateData.pricePerNight !== undefined) {
            updateData.pricePerNight = parseFloat(updateData.pricePerNight) || hotel.pricePerNight;
        }
        if (updateData.starRating !== undefined) {
            updateData.starRating = parseInt(updateData.starRating) || hotel.starRating;
        }

        // Ensure JSON fields are stringified if sent as objects
        const jsonFields = ['images', 'amenities', 'dining', 'wellness', 'faqs', 'safety', 'policies'];
        jsonFields.forEach(field => {
            if (updateData[field] && typeof updateData[field] !== 'string') {
                updateData[field] = JSON.stringify(updateData[field]);
            }
        });

        hotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: updateData
        });

        res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
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
                        amenities: true, description: true, hotelId: true,
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
