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

// Realistic mock locations for localhost testing (mirrors analyticsController)

// @desc    Get trending hotels (public)
// @route   GET /api/hotels/trending
// @access  Public
exports.getTrendingHotels = async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany({
            where: { isTrending: true, isActive: true },
            include: { room: true },
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

