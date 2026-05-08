const prisma = require('../config/db');

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

        const roomData = { ...req.body };
        
        // Ensure numeric fields are correctly typed
        roomData.hotelId = hotelId;
        roomData.pricePerNight = parseFloat(req.body.pricePerNight) || 0;
        roomData.maxOccupancy = parseInt(req.body.maxOccupancy) || 2;
        roomData.sizeM2 = parseInt(req.body.sizeM2) || 0;

        // Ensure JSON fields are stringified if sent as objects
        if (roomData.images && typeof roomData.images !== 'string') {
            roomData.images = JSON.stringify(roomData.images);
        }
        if (roomData.amenities && typeof roomData.amenities !== 'string') {
            roomData.amenities = JSON.stringify(roomData.amenities);
        }

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
        if (!roomToUpdate || roomToUpdate.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Room not found in this hotel' });
        }

        const updateData = { ...req.body };

        if (updateData.pricePerNight !== undefined) {
            updateData.pricePerNight = parseFloat(updateData.pricePerNight) || roomToUpdate.pricePerNight;
        }
        if (updateData.maxOccupancy !== undefined) {
            updateData.maxOccupancy = parseInt(updateData.maxOccupancy) || roomToUpdate.maxOccupancy;
        }
        if (updateData.sizeM2 !== undefined) {
            updateData.sizeM2 = parseInt(updateData.sizeM2) || roomToUpdate.sizeM2;
        }

        // Ensure JSON fields are stringified if sent as objects
        if (updateData.images && typeof updateData.images !== 'string') {
            updateData.images = JSON.stringify(updateData.images);
        }
        if (updateData.amenities && typeof updateData.amenities !== 'string') {
            updateData.amenities = JSON.stringify(updateData.amenities);
        }

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
