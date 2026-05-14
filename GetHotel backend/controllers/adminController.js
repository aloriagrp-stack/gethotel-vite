const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getStats = async (req, res) => {
    try {
        const totalHotels = await prisma.hotel.count();
        const totalUsers = await prisma.user.count({
            where: { role: 'user' }
        });
        const totalBookings = await prisma.booking.count();
        
        // Sum of total price for paid bookings
        const revenueResult = await prisma.booking.aggregate({
            _sum: {
                totalPrice: true
            },
            where: {
                paymentStatus: 'paid'
            }
        });

        const totalRevenue = revenueResult._sum.totalPrice || 0;
        const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

        // Group by city for top destinations
        const topDestinationsRaw = await prisma.hotel.groupBy({
            by: ['city'],
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 4
        });

        const topDestinations = topDestinationsRaw.map(dest => ({
            city: dest.city,
            percentage: totalHotels > 0 ? Math.round((dest._count.id / totalHotels) * 100) : 0
        }));

        const recentRequests = await prisma.partnerrequest.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                hotelName: true,
                status: true,
                createdAt: true
            }
        });

        res.json({
            success: true,
            data: {
                totalHotels,
                totalUsers,
                totalBookings,
                totalRevenue,
                avgBookingValue,
                topDestinations,
                conversionRate: totalBookings > 0 ? 4.2 : 0, // Simplified for now, or based on visits
                abandonedRate: 18.5,
                repeatGuestRate: 22.8,
                recentRequests
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHotelDetail = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.id);
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, createdAt: true }
                },
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

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Calculate total revenue for this hotel
        const totalRevenue = hotel.booking
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + b.totalPrice, 0);

        res.json({ 
            success: true, 
            data: { ...hotel, totalRevenue } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all partners (hotel admins)
// @route   GET /api/admin/partners
// @access  Private (Super Admin)
exports.getPartners = async (req, res) => {
    try {
        const partners = await prisma.user.findMany({
            where: {
                role: 'hotel_admin'
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                hotel: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            count: partners.length,
            data: partners
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset partner password
// @route   POST /api/admin/partners/:id/reset-password
// @access  Private (Super Admin)
exports.resetPartnerPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const partnerId = parseInt(req.params.id);

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Please provide a valid password (min 6 chars)' });
        }

        const partner = await prisma.user.findUnique({
            where: { id: partnerId }
        });

        if (!partner || partner.role !== 'hotel_admin') {
            return res.status(404).json({ success: false, message: 'Partner not found' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { id: partnerId },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all hotels
// @route   GET /api/admin/hotels
// @access  Private (Super Admin)
exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany({
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: hotels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Super Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                hotel: { select: { name: true } },
                room: { select: { name: true } },
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single hotel detail for admin
// @route   GET /api/admin/hotels/:id
// @access  Private (Super Admin)
exports.getAdminHotelDetail = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.id);
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                room: true,
                booking: {
                    include: {
                        user: { select: { name: true, email: true } },
                        room: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50 // last 50 bookings
                }
            }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        res.json({ success: true, data: hotel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update hotel performance metrics
// @route   PATCH /api/admin/hotels/:id/metrics
// @access  Private (Super Admin)
exports.updateHotelMetrics = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.id);
        const { qualityScore, badges, cancellationRate, responseSpeed } = req.body;

        const hotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                qualityScore: qualityScore !== undefined ? parseFloat(qualityScore) : undefined,
                badges: badges !== undefined ? (Array.isArray(badges) ? badges.join(',') : badges) : undefined,
                cancellationRate: cancellationRate !== undefined ? parseFloat(cancellationRate) : undefined,
                responseSpeed: responseSpeed !== undefined ? responseSpeed : undefined
            }
        });

        res.json({ success: true, data: hotel, message: 'Metrics updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auto-recalculate hotel performance metrics
// @route   POST /api/admin/hotels/:id/recalculate
// @access  Private (Super Admin)
exports.recalculateHotelMetrics = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.id);
        
        // 1. Fetch relevant data
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: {
                booking: true,
                review: true
            }
        });

        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        const totalBookings = hotel.booking.length;
        const cancelledBookings = hotel.booking.filter(b => b.status === 'cancelled').length;
        const completedBookings = hotel.booking.filter(b => b.status === 'checked-out' || b.status === 'confirmed').length;

        // 2. Calculate Rates
        const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
        const acceptanceRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 100;
        
        // 3. Average Rating (0-5 to 0-100)
        const avgRating = hotel.review.length > 0 
            ? (hotel.review.reduce((sum, r) => sum + r.rating, 0) / hotel.review.length) * 20 
            : 80; // Default to 80 if no reviews

        // 4. Final Quality Score Formula
        // 40% Acceptance, 40% Rating, 20% Low Cancellation
        let qualityScore = (acceptanceRate * 0.4) + (avgRating * 0.4) + ((100 - cancellationRate) * 0.2);
        
        // Adjustment for Response Speed
        if (hotel.responseSpeed === 'Instant') qualityScore += 5;
        if (hotel.responseSpeed === 'Slow') qualityScore -= 10;

        // Clamp between 0-100
        qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

        // 5. Update Hotel
        const updatedHotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                qualityScore,
                cancellationRate: Math.round(cancellationRate),
                bookingAcceptanceRate: Math.round(acceptanceRate)
            }
        });

        res.json({ 
            success: true, 
            data: updatedHotel, 
            message: `Metrics recalculated! New Score: ${qualityScore}%` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
