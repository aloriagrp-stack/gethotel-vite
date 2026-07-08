const prisma = require('../config/db');

// @desc    Get homepage configuration (public)
// @route   GET /api/homepage/config
// @access  Public
exports.getHomepageConfig = async (req, res) => {
    try {
        const rows = await prisma.homepage_config.findMany();
        const config = {};
        rows.forEach(row => {
            try {
                config[row.key] = JSON.parse(row.value);
            } catch (_) {
                config[row.key] = row.value;
            }
        });
        res.json({ success: true, data: config });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update homepage configuration (admin only)
// @route   PUT /api/admin/homepage/config
// @access  Private (super_admin)
exports.updateHomepageConfig = async (req, res) => {
    try {
        const updates = req.body; // { key: value, key2: value2 }
        
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ success: false, message: 'Request body must be an object of key-value pairs' });
        }

        const results = [];
        for (const [key, value] of Object.entries(updates)) {
            const strValue = typeof value === 'string' ? value : JSON.stringify(value);
            const result = await prisma.homepage_config.upsert({
                where: { key },
                update: { value: strValue },
                create: { key, value: strValue }
            });
            results.push(result);
        }

        res.json({ success: true, message: 'Homepage configuration updated', data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Toggle trending status for a hotel
// @route   PUT /api/admin/hotels/:id/trending
// @access  Private (super_admin)
exports.toggleTrending = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.id);
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        const updated = await prisma.hotel.update({
            where: { id: hotelId },
            data: { isTrending: !hotel.isTrending }
        });

        res.json({
            success: true,
            message: updated.isTrending ? 'Hotel marked as trending' : 'Hotel removed from trending',
            data: updated
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Toggle featured status for a hotel
// @route   PUT /api/admin/hotels/:id/featured
// @access  Private (super_admin)
exports.toggleFeatured = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.id);
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        const updated = await prisma.hotel.update({
            where: { id: hotelId },
            data: { isFeatured: !hotel.isFeatured }
        });

        res.json({
            success: true,
            message: updated.isFeatured ? 'Hotel marked as featured' : 'Hotel removed from featured',
            data: updated
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update trending status for multiple hotels in bulk
// @route   PUT /api/admin/hotels/trending/bulk
// @access  Private (super_admin)
exports.updateTrendingBulk = async (req, res) => {
    try {
        const { hotelIds } = req.body; // Array of IDs of hotels that should be trending
        if (!Array.isArray(hotelIds)) {
            return res.status(400).json({ success: false, message: 'hotelIds must be an array of numbers' });
        }

        const numericIds = hotelIds.map(id => parseInt(id)).filter(id => !isNaN(id));

        // Use a Prisma transaction to ensure all updates happen atomically
        await prisma.$transaction([
            // 1. Set isTrending = false for all hotels not in the list
            prisma.hotel.updateMany({
                where: { id: { notIn: numericIds } },
                data: { isTrending: false }
            }),
            // 2. Set isTrending = true for all hotels in the list
            prisma.hotel.updateMany({
                where: { id: { in: numericIds } },
                data: { isTrending: true }
            })
        ]);

        res.json({ success: true, message: 'Trending status updated successfully in bulk' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Realistic mock locations for localhost testing (mirrors analyticsController)

// @desc    Get trending hotels (public)
// @route   GET /api/hotels/trending
// @access  Public
exports.getTrendingHotels = async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany({
            where: { isTrending: true, isActive: true },
            select: {
                id: true,
                name: true,
                city: true,
                address: true,
                pricePerNight: true,
                starRating: true,
                guestRating: true,
                reviewCount: true,
                thumbnail: true,
                isFeatured: true,
                isTrending: true,
                isActive: true,
                room: {
                    select: {
                        id: true,
                        name: true,
                        pricePerNight: true,
                        isHourlyEnabled: true,
                        hourlyRates: true
                    }
                }
            },
            orderBy: [
                { guestRating: 'desc' },
                { reviewCount: 'desc' }
            ]
        });

        res.json({
            success: true,
            data: hotels,
            detectedCity: null,
            isLocalized: false
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

