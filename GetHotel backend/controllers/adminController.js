const prisma = require('../config/db');


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

        const recentRequests = await prisma.partnerRequest.findMany({
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
                totalRevenue: revenueResult._sum.totalPrice || 0,
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
