const prisma = require('../config/db');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    const { hotelId, rooms, checkIn, checkOut, totalGuests, guestInfo } = req.body;
    const userId = req.user.id;

    try {
        // 1. DATA VALIDATION
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            return res.status(400).json({ success: false, message: "Check-in date cannot be in the past." });
        }
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ success: false, message: "Check-out date must be after the check-in date." });
        }

        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        if (nights < 1) {
            return res.status(400).json({ success: false, message: "Stay duration must be at least one night." });
        }

        // 2. FETCH HOTEL & ROOMS TO VERIFY PRICING & AVAILABILITY
        const hotel = await prisma.hotel.findUnique({
            where: { id: parseInt(hotelId) },
            include: { room: true }
        });

        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        // Fallback: If no specific rooms provided, use the first available room
        let activeRooms = rooms;
        if (!activeRooms || activeRooms.length === 0) {
            if (hotel.room && hotel.room.length > 0) {
                // Use the first room as default if none selected
                activeRooms = [{ id: hotel.room[0].id.toString(), quantity: 1 }];
            } else {
                return res.status(400).json({ success: false, message: "This hotel currently has no rooms available for booking." });
            }
        }

        let calculatedSubtotal = 0;
        let totalMaxOccupancy = 0;

        for (const selectedRoom of activeRooms) {
            const dbRoom = hotel.room.find(r => r.id === parseInt(selectedRoom.id));
            if (!dbRoom) return res.status(400).json({ success: false, message: `Room ID ${selectedRoom.id} doesn't exist.` });
            
            calculatedSubtotal += dbRoom.pricePerNight * selectedRoom.quantity * nights;
            totalMaxOccupancy += dbRoom.maxOccupancy * selectedRoom.quantity;
        }

        if (totalGuests > totalMaxOccupancy) {
            return res.status(400).json({ success: false, message: "Guest count exceeds the maximum occupancy for the selected rooms." });
        }

        const calculatedTaxes = Math.round(calculatedSubtotal * 0.12);
        const calculatedTotal = calculatedSubtotal + calculatedTaxes;
        const platformFee = Math.round(calculatedTotal * 0.18); // 18% Booking Fee
        const remainingAtHotel = calculatedTotal - platformFee;

        // 3. ATOMIC TRANSACTION: HOLD INVENTORY + CREATE BOOKING
        const booking = await prisma.$transaction(async (tx) => {
            // Re-verify availability within transaction
            for (const selectedRoom of activeRooms) {
                const overlappingBookings = await tx.booking.count({
                    where: {
                        roomId: parseInt(selectedRoom.id),
                        status: { in: ['paid', 'confirmed', 'checked-in', 'held'] },
                        NOT: {
                            OR: [
                                { checkIn: { gte: checkOutDate } },
                                { checkOut: { lte: checkInDate } }
                            ]
                        }
                    }
                });

                const dbRoom = await tx.room.findUnique({ where: { id: parseInt(selectedRoom.id) } });
                if (dbRoom.totalUnits - overlappingBookings < selectedRoom.quantity) {
                    throw new Error(`Sorry, the ${dbRoom.name} is no longer available for these dates.`);
                }
            }

            // Create the booking record
            return await tx.booking.create({
                data: {
                    userId,
                    hotelId: parseInt(hotelId),
                    roomId: parseInt(activeRooms[0].id),
                    checkIn: checkInDate,
                    checkOut: checkOutDate,
                    totalPrice: calculatedTotal,
                    totalGuests: parseInt(totalGuests),
                    status: req.body.status || 'held',
                    paymentStatus: req.body.paymentStatus || 'pending',
                    amountPaid: req.body.paymentStatus === 'paid' ? calculatedTotal : 0,
                    holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    guestFirstName: guestInfo.firstName,
                    guestLastName: guestInfo.lastName,
                    guestEmail: guestInfo.email,
                    guestPhone: guestInfo.phone,
                    specialRequests: guestInfo.specialRequests,
                    isBusiness: guestInfo.isBusinessTrip || false,
                    gstNumber: guestInfo.gstNumber || "",
                    companyName: guestInfo.companyName || "",
                    roomDetails: JSON.stringify(activeRooms),
                    internalNotes: `PARTIAL_PAYMENT_MODEL: Platform Fee ₹${platformFee} | Pay at Hotel ₹${remainingAtHotel}`
                }
            });
        });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(400).json({ success: false, message: error.message || "Booking failed." });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: {
                hotel: true,
                room: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all bookings (Super Admin)
// @route   GET /api/bookings
// @access  Private (Super Admin)
exports.getBookings = async (req, res, next) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: { hotel: true, room: true, user: true }
        });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update booking (Check-in/out/Notes)
// @route   PUT /api/bookings/:id
// @access  Private (Hotel Admin, Super Admin)
exports.updateBooking = async (req, res, next) => {
    try {
        const bookingId = parseInt(req.params.id);
        
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { hotel: true }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Authorization Check
        if (req.user.role === 'hotel_admin') {
            if (booking.hotel.userId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
            }
        } else if (req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { status, paymentStatus, internalNotes } = req.body;
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                status: status || booking.status,
                paymentStatus: paymentStatus || booking.paymentStatus,
                internalNotes: internalNotes !== undefined ? internalNotes : booking.internalNotes
            }
        });

        res.status(200).json({ success: true, data: updatedBooking });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Cancel booking (User or Admin)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { reason } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Authorization: Only the user who booked or an admin
        if (booking.userId !== req.user.id && req.user.role === 'user') {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
        }

        // Policy Check: Free cancellation if check-in is > 24 hours away
        const now = new Date();
        const checkIn = new Date(booking.checkIn);
        const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

        let refundAmount = 0;
        let cancelStatus = 'cancelled';

        if (hoursUntilCheckIn >= 24) {
            // Free cancellation - mark for full refund of amountPaid
            refundAmount = booking.amountPaid;
            cancelStatus = 'refunded';
        } else if (booking.amountPaid > 0) {
            // Late cancellation - 50% penalty
            refundAmount = booking.amountPaid * 0.5;
            cancelStatus = 'cancelled'; // Still cancelled, but with penalty
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                status: cancelStatus,
                paymentStatus: refundAmount > 0 ? 'refunded' : booking.paymentStatus,
                cancellationReason: reason || "User cancelled",
                internalNotes: `Refund Processed: ₹${refundAmount}`
            }
        });

        // Log transaction if refund was processed
        if (refundAmount > 0) {
            await prisma.transaction.create({
                data: {
                    bookingId: bookingId,
                    amount: -refundAmount,
                    status: 'success',
                    gateway: 'refund_engine',
                    rawResponse: JSON.stringify({ note: 'Automated refund calculation' })
                }
            });
        }

        res.status(200).json({ success: true, data: updatedBooking, refundAmount });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
