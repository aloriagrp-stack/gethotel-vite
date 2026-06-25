const prisma = require('../config/db');
const crypto = require('crypto');

// Helper to parse date string to midnight UTC
const parseDateString = (dStr) => {
    const d = new Date(dStr);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// Helper to format date object to YYYY-MM-DD string, robust to timezone rounding
const formatDateToOtaString = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    d.setUTCHours(d.getUTCHours() + 12);
    return d.toISOString().split('T')[0];
};

// Middleware/Helper to authenticate OTA API requests
const authenticateOtaRequest = async (req) => {
    const apiKey = req.headers['x-ota-api-key'];
    if (!apiKey) {
        throw new Error('API key is missing in X-OTA-API-Key header');
    }

    const hotel = await prisma.hotel.findFirst({
        where: { 
            otaApiKey: apiKey,
            otaEnabled: true
        }
    });

    if (!hotel) {
        throw new Error('Invalid or disabled OTA API Key');
    }

    return hotel;
};

// @desc    Get OTA Settings (API key & status) for a hotel
// @route   GET /api/ota/key/:hotelId
// @access  Private (Hotel Admin, Super Admin)
exports.getOtaSettings = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Authorize: user must own the hotel or be a super admin
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to manage this hotel settings' });
        }

        res.status(200).json({
            success: true,
            data: {
                otaEnabled: hotel.otaEnabled,
                otaApiKey: hotel.otaApiKey // Only return key to authorized admin
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Generate or Rotate OTA API Key
// @route   POST /api/ota/key/:hotelId
// @access  Private (Hotel Admin, Super Admin)
exports.generateOtaKey = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const { otaEnabled } = req.body;

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        let otaApiKey = hotel.otaApiKey;
        // Generate new key if it doesn't exist or if rotating is requested
        if (!otaApiKey || req.body.rotate === true) {
            otaApiKey = 'gh_live_' + crypto.randomBytes(24).toString('hex');
        }

        const updatedHotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                otaApiKey,
                otaEnabled: otaEnabled !== undefined ? otaEnabled : hotel.otaEnabled
            }
        });

        res.status(200).json({
            success: true,
            message: 'OTA Key generated successfully',
            data: {
                otaEnabled: updatedHotel.otaEnabled,
                otaApiKey: updatedHotel.otaApiKey
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update Room Inventory via Channel Manager API
// @route   POST /api/ota/inventory
// @access  Public (Authorised via OTA API Key)
exports.updateOtaInventory = async (req, res) => {
    try {
        const hotel = await authenticateOtaRequest(req);
        const { roomTypeId, updates } = req.body;

        if (!roomTypeId || !Array.isArray(updates)) {
            return res.status(400).json({ success: false, message: 'roomTypeId and updates array are required' });
        }

        // Verify the room belongs to the hotel
        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomTypeId) }
        });

        if (!room || room.hotelId !== hotel.id) {
            return res.status(404).json({ success: false, message: 'Room type not found in this hotel' });
        }

        // Apply inventory updates day-by-day
        for (const update of updates) {
            const { date, available } = update;
            if (!date || available === undefined) continue;

            const targetDate = parseDateString(date);
            const count = parseInt(available) || 0;

            // Update or create dailyrate record
            await prisma.dailyrate.upsert({
                where: {
                    roomId_date: {
                        roomId: room.id,
                        date: targetDate
                    }
                },
                update: {
                    available: count
                },
                create: {
                    roomId: room.id,
                    date: targetDate,
                    available: count,
                    price: room.pricePerNight // Use default price if record doesn't exist
                }
            });
        }

        res.status(200).json({ success: true, message: 'Inventory synced successfully' });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

// @desc    Update Room Rates via Channel Manager API
// @route   POST /api/ota/rates
// @access  Public (Authorised via OTA API Key)
exports.updateOtaRates = async (req, res) => {
    try {
        const hotel = await authenticateOtaRequest(req);
        const { roomTypeId, updates } = req.body;

        if (!roomTypeId || !Array.isArray(updates)) {
            return res.status(400).json({ success: false, message: 'roomTypeId and updates array are required' });
        }

        // Verify the room belongs to the hotel
        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomTypeId) }
        });

        if (!room || room.hotelId !== hotel.id) {
            return res.status(404).json({ success: false, message: 'Room type not found in this hotel' });
        }

        // Apply rate updates day-by-day
        for (const update of updates) {
            const { date, price } = update;
            if (!date || price === undefined) continue;

            const targetDate = parseDateString(date);
            const rateValue = parseFloat(price) || 0;

            // Update or create dailyrate record
            await prisma.dailyrate.upsert({
                where: {
                    roomId_date: {
                        roomId: room.id,
                        date: targetDate
                    }
                },
                update: {
                    price: rateValue
                },
                create: {
                    roomId: room.id,
                    date: targetDate,
                    price: rateValue,
                    available: room.totalInventory // Use default inventory if record doesn't exist
                }
            });
        }

        res.status(200).json({ success: true, message: 'Rates synced successfully' });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

// @desc    Get Reservations via Channel Manager API
// @route   GET /api/ota/reservations
// @access  Public (Authorised via OTA API Key)
exports.getOtaReservations = async (req, res) => {
    try {
        const hotel = await authenticateOtaRequest(req);
        const { since } = req.query;

        let sinceDate = null;
        if (since) {
            sinceDate = new Date(since);
            if (isNaN(sinceDate.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid date format for since query parameter' });
            }
        }

        const bookings = await prisma.booking.findMany({
            where: {
                hotelId: hotel.id,
                ...(sinceDate && {
                    updatedAt: {
                        gte: sinceDate
                    }
                })
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'asc'
            }
        });

        const formattedReservations = bookings.map(b => ({
            bookingId: `GH-${b.id}`,
            hotelId: b.hotelId,
            roomTypeId: b.roomId,
            roomTypeName: b.room?.name || 'Unknown',
            guestName: `${b.guestFirstName} ${b.guestLastName}`.trim() || 'Guest',
            guestEmail: b.guestEmail,
            guestPhone: b.guestPhone,
            checkIn: formatDateToOtaString(b.checkIn),
            checkOut: formatDateToOtaString(b.checkOut),
            status: b.status, // "confirmed", "cancelled", etc.
            totalPrice: b.totalPrice,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt
        }));

        res.status(200).json({
            success: true,
            count: formattedReservations.length,
            data: formattedReservations
        });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

