const prisma = require('../config/db');

// Bulletproof JSON Normalizer
const normalizeJsonField = (data) => {
    if (!data) return "[]";
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([parsed]);
        } catch (e) {
            if (data.includes(',')) return JSON.stringify(data.split(',').map(s => s.trim()).filter(Boolean));
            return JSON.stringify([data]);
        }
    }
    if (Array.isArray(data)) return JSON.stringify(data);
    return JSON.stringify([data]);
};

// @desc    Get rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const rooms = await prisma.room.findMany({
            where: { hotelId: hotelId }
        });

        // 10 minute hold window for pending bookings
        const holdThreshold = new Date(Date.now() - 10 * 60 * 1000);

        // Fetch all bookings that could affect availability
        const activeBookings = await prisma.booking.findMany({
            where: {
                hotelId: hotelId,
                status: { in: ['confirmed', 'checked-in', 'pending'] },
                OR: [
                    { status: 'confirmed' },
                    { status: 'checked-in' },
                    { 
                        AND: [
                            { status: 'pending' },
                            { createdAt: { gte: holdThreshold } }
                        ]
                    }
                ]
            }
        });

        // Map availability to each room
        const roomsWithAvailability = rooms.map(room => {
            // Count how many of this room type are booked/held
            const bookedCount = activeBookings.reduce((count, b) => {
                // If it's the primary room ID
                if (b.roomId === room.id) return count + 1;
                
                // Also check roomDetails JSON for multi-room bookings
                try {
                    if (b.roomDetails) {
                        const details = JSON.parse(b.roomDetails);
                        const rInfo = details.find((ri) => ri.id === room.id.toString());
                        if (rInfo) return count + rInfo.quantity;
                    }
                } catch (e) {}
                
                return count;
            }, 0);

            // Simple logic: If we have room inventory tracking in DB, we'd use that.
            // For now, let's assume each room type has a default 'totalUnits' of 5 if not specified
            const totalUnits = 5; 
            const availableUnits = Math.max(0, totalUnits - bookedCount);

            return {
                ...room,
                availableUnits,
                isAvailable: availableUnits > 0
            };
        });

        res.status(200).json({ success: true, count: roomsWithAvailability.length, data: roomsWithAvailability });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add room to hotel
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private (Hotel Admin, Super Admin)
exports.addRoom = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        
        // Check if hotel exists and user is authorized
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to add a room to this hotel' });
        }

        const { 
            name, description, pricePerNight, maxOccupancy, 
            bedConfiguration, sizeM2, amenities, images, 
            highlights, trustPoints, roomPolicies, 
            minPrice, maxPrice, weeklyDiscount, monthlyDiscount, variants,
            isHourlyEnabled, hourlyRates 
        } = req.body;
        
        const roomData = {
            hotelId,
            name,
            description,
            pricePerNight: parseFloat(pricePerNight) || 0,
            maxOccupancy: parseInt(maxOccupancy) || 2,
            bedConfiguration: bedConfiguration || "1 King Bed",
            sizeM2: parseInt(sizeM2) || 0,
            amenities: normalizeJsonField(amenities),
            images: normalizeJsonField(images),
            highlights: normalizeJsonField(highlights),
            trustPoints: normalizeJsonField(trustPoints),
            roomPolicies: normalizeJsonField(roomPolicies),
            minPrice: parseFloat(minPrice) || 0,
            maxPrice: parseFloat(maxPrice) || 0,
            weeklyDiscount: parseInt(weeklyDiscount) || 0,
            monthlyDiscount: parseInt(monthlyDiscount) || 0,
            variants: normalizeJsonField(variants),
            isHourlyEnabled: isHourlyEnabled === true || isHourlyEnabled === 'true',
            hourlyRates: typeof hourlyRates === 'string' ? hourlyRates : JSON.stringify(hourlyRates || {})
        };

        const room = await prisma.room.create({
            data: roomData
        });

        res.status(201).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update room
// @route   PUT /api/hotels/:hotelId/rooms/:roomId
// @access  Private (Hotel Admin, Super Admin)
exports.updateRoom = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const roomId = parseInt(req.params.roomId);
        
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // SECURITY: Ensure room belongs to the hotel
        const roomToUpdate = await prisma.room.findUnique({ where: { id: roomId } });
        
        if (isNaN(roomId)) {
            return res.status(400).json({ success: false, message: 'Invalid Room ID' });
        }

        if (!roomToUpdate || roomToUpdate.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Room not found in this hotel' });
        }

        const { 
            name, description, pricePerNight, maxOccupancy, 
            bedConfiguration, sizeM2, amenities, images, 
            highlights, trustPoints, roomPolicies,
            minPrice, maxPrice, weeklyDiscount, monthlyDiscount, variants,
            isHourlyEnabled, hourlyRates
        } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (pricePerNight !== undefined) updateData.pricePerNight = parseFloat(pricePerNight);
        if (maxOccupancy !== undefined) updateData.maxOccupancy = parseInt(maxOccupancy);
        if (bedConfiguration !== undefined) updateData.bedConfiguration = bedConfiguration;
        if (sizeM2 !== undefined) updateData.sizeM2 = parseInt(sizeM2);
        
        if (amenities !== undefined) updateData.amenities = normalizeJsonField(amenities);
        if (images !== undefined) updateData.images = normalizeJsonField(images);
        if (highlights !== undefined) updateData.highlights = normalizeJsonField(highlights);
        if (trustPoints !== undefined) updateData.trustPoints = normalizeJsonField(trustPoints);
        if (roomPolicies !== undefined) updateData.roomPolicies = normalizeJsonField(roomPolicies);
        
        if (minPrice !== undefined) updateData.minPrice = parseFloat(minPrice);
        if (maxPrice !== undefined) updateData.maxPrice = parseFloat(maxPrice);
        if (weeklyDiscount !== undefined) updateData.weeklyDiscount = parseInt(weeklyDiscount);
        if (monthlyDiscount !== undefined) updateData.monthlyDiscount = parseInt(monthlyDiscount);
        if (variants !== undefined) updateData.variants = normalizeJsonField(variants);
        
        if (isHourlyEnabled !== undefined) updateData.isHourlyEnabled = isHourlyEnabled === true || isHourlyEnabled === 'true';
        if (hourlyRates !== undefined) updateData.hourlyRates = typeof hourlyRates === 'string' ? hourlyRates : JSON.stringify(hourlyRates || {});

        console.log(">>> UPDATING ROOM:", roomId);
        console.log(">>> DATA:", JSON.stringify(updateData, null, 2).slice(0, 500) + "...");

        const room = await prisma.room.update({
            where: { id: roomId },
            data: updateData
        });

        res.status(200).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/hotels/:hotelId/rooms/:roomId
// @access  Private (Hotel Admin, Super Admin)
exports.deleteRoom = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const roomId = parseInt(req.params.roomId);
        
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // SECURITY: Ensure room belongs to the hotel
        const roomToDelete = await prisma.room.findUnique({ where: { id: roomId } });
        if (!roomToDelete || roomToDelete.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Room not found in this hotel' });
        }

        await prisma.room.delete({
            where: { id: roomId }
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
