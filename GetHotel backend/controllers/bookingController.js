const prisma = require('../config/db');
const { sendBookingEmails } = require('../utils/emailService');

const toValidDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeDateOnly = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    const { hotelId, rooms, checkIn, checkOut, totalGuests, guestInfo, couponCode } = req.body;
    const userId = req.user.id;

    try {
        const checkInDate = toValidDate(checkIn);
        const checkOutDate = toValidDate(checkOut);

        if (!hotelId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ success: false, message: "Valid hotel, check-in, and check-out dates are required." });
        }

        const today = normalizeDateOnly(new Date());
        const checkInDay = normalizeDateOnly(checkInDate);
        const checkOutDay = normalizeDateOnly(checkOutDate);

        const todayLimit = new Date(today);
        todayLimit.setDate(todayLimit.getDate() - 1); // timezone offset buffer
        if (checkInDay < todayLimit) {
            return res.status(400).json({ success: false, message: "Check-in date cannot be in the past." });
        }
        if (checkOutDay <= checkInDay) {
            return res.status(400).json({ success: false, message: "Check-out date must be after the check-in date." });
        }

        const nights = Math.ceil((checkOutDay - checkInDay) / (1000 * 60 * 60 * 24));
        if (nights < 1) {
            return res.status(400).json({ success: false, message: "Stay duration must be at least one night." });
        }
        if (nights > 90) {
            return res.status(400).json({ success: false, message: "Stay duration cannot exceed 90 nights." });
        }

        // 2. FETCH HOTEL & ROOMS TO VERIFY PRICING & AVAILABILITY
        const hotel = await prisma.hotel.findUnique({
            where: { id: parseInt(hotelId) },
            include: { room: true }
        });

        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        let activeRooms = Array.isArray(rooms) ? rooms.map(room => ({
            ...room,
            id: parseInt(room.id),
            quantity: Math.max(1, parseInt(room.quantity) || 1)
        })) : rooms;
        if (!activeRooms || activeRooms.length === 0) {
            if (hotel.room && hotel.room.length > 0) {
                // Use the first room as default if none selected
                activeRooms = [{ id: hotel.room[0].id, quantity: 1 }];
            } else {
                return res.status(400).json({ success: false, message: "This hotel currently has no rooms available for booking." });
            }
        }

        if (!guestInfo?.firstName || !guestInfo?.lastName || !guestInfo?.email || !guestInfo?.phone) {
            return res.status(400).json({ success: false, message: "Guest name, email, and phone are required." });
        }

        let calculatedSubtotal = 0;
        let totalMaxOccupancy = 0;

        for (const selectedRoom of activeRooms) {
            const dbRoom = hotel.room.find(r => r.id === selectedRoom.id);
            if (!dbRoom) return res.status(400).json({ success: false, message: `Room ID ${selectedRoom.id} doesn't exist.` });
            
            // Query daily rates overrides for this room
            const rates = await prisma.dailyrate.findMany({
                where: {
                    roomId: dbRoom.id,
                    date: {
                        gte: checkInDay,
                        lt: checkOutDay
                    }
                }
            });

            const rateMap = {};
            rates.forEach(r => {
                const dStr = r.date.toISOString().split('T')[0];
                rateMap[dStr] = r;
            });

            let roomTotalStayPrice = 0;

            for (let i = 0; i < nights; i++) {
                const currentDay = new Date(checkInDay);
                currentDay.setDate(currentDay.getDate() + i);
                const dStr = currentDay.toISOString().split('T')[0];
                
                const rateOverride = rateMap[dStr];
                if (rateOverride) {
                    roomTotalStayPrice += rateOverride.price;
                } else {
                    roomTotalStayPrice += dbRoom.pricePerNight;
                }
            }

            // Support for variant-specific pricing markup
            let variantMarkup = 0;
            if (selectedRoom.variantIdx !== undefined) {
                try {
                    const variants = typeof dbRoom.variants === 'string' ? JSON.parse(dbRoom.variants) : (dbRoom.variants || []);
                    const selectedVariant = variants[parseInt(selectedRoom.variantIdx)];
                    if (selectedVariant && selectedVariant.price) {
                        variantMarkup = selectedVariant.price - dbRoom.pricePerNight;
                    }
                } catch (e) {
                    console.error("Error parsing room variants:", e);
                }
            }

            const roomStayPriceWithMarkup = roomTotalStayPrice + (variantMarkup * nights);
            calculatedSubtotal += roomStayPriceWithMarkup * selectedRoom.quantity;
            totalMaxOccupancy += dbRoom.maxOccupancy * selectedRoom.quantity;
        }

        if (totalGuests > totalMaxOccupancy) {
            return res.status(400).json({ success: false, message: "Guest count exceeds the maximum occupancy for the selected rooms." });
        }

        // Apply coupon code discount if provided
        let discountAmount = 0;
        if (couponCode) {
            try {
                const activeCoupon = await prisma.coupon.findFirst({
                    where: {
                        hotelId: parseInt(hotelId),
                        code: { equals: couponCode.trim() },
                        isActive: true
                    }
                });
                if (activeCoupon) {
                    discountAmount = Math.round(calculatedSubtotal * (activeCoupon.discountValue / 100));
                }
            } catch (e) {
                console.error("Error applying backend coupon:", e);
            }
        }

        const discountedSubtotal = Math.max(0, calculatedSubtotal - discountAmount);
        
        const totalRoomNights = activeRooms.reduce((sum, r) => sum + (r.quantity * nights), 0);
        const divisor = totalRoomNights > 0 ? totalRoomNights : (nights || 1);
        const averagePricePerRoomNight = discountedSubtotal / divisor;
        
        let gstRate = 0.05;
        if (averagePricePerRoomNight <= 1000) {
            gstRate = 0;
        } else if (averagePricePerRoomNight <= 7500) {
            gstRate = 0.05;
        } else {
            gstRate = 0.18;
        }

        const calculatedTaxes = Math.round(discountedSubtotal * gstRate);
        const calculatedTotal = discountedSubtotal + calculatedTaxes;
        const platformFee = Math.round(calculatedTotal * 0.12); // 12% Booking Fee
        const remainingAtHotel = calculatedTotal - platformFee;

        // 3. ATOMIC TRANSACTION: HOLD INVENTORY + CREATE BOOKING
        const booking = await prisma.$transaction(async (tx) => {
            // Concurrency Control: Lock the Room rows to prevent concurrent double-booking checks (pessimistic lock)
            for (const selectedRoom of activeRooms) {
                await tx.$queryRaw`SELECT id FROM room WHERE id = ${selectedRoom.id} FOR UPDATE`;
            }

            // Re-verify availability within transaction day-by-day
            for (const selectedRoom of activeRooms) {
                const dbRoom = await tx.room.findUnique({ where: { id: selectedRoom.id } });
                if (!dbRoom) throw new Error(`Room ID ${selectedRoom.id} doesn't exist.`);

                const rates = await tx.dailyrate.findMany({
                    where: {
                        roomId: dbRoom.id,
                        date: {
                            gte: checkInDay,
                            lt: checkOutDay
                        }
                    }
                });

                const rateMap = {};
                rates.forEach(r => {
                    const dStr = r.date.toISOString().split('T')[0];
                    rateMap[dStr] = r;
                });

                for (let i = 0; i < nights; i++) {
                    const currentDay = new Date(checkInDay);
                    currentDay.setDate(currentDay.getDate() + i);
                    
                    const nextDay = new Date(currentDay);
                    nextDay.setDate(nextDay.getDate() + 1);

                    const dStr = currentDay.toISOString().split('T')[0];
                    const rateOverride = rateMap[dStr];
                    
                    // If explicitly blocked or available count is overridden
                    const dayLimit = rateOverride !== undefined ? rateOverride.available : dbRoom.totalInventory;

                    // Query bookings overlapping this specific night
                    const activeOnNight = await tx.booking.count({
                        where: {
                            roomId: dbRoom.id,
                            status: { in: ['paid', 'confirmed', 'checked-in', 'held'] },
                            checkIn: { lt: nextDay },
                            checkOut: { gt: currentDay },
                            OR: [
                                { status: 'confirmed' },
                                { status: 'checked-in' },
                                { status: 'paid' },
                                {
                                    AND: [
                                        { status: 'held' },
                                        { holdExpiresAt: { gt: new Date() } }
                                    ]
                                }
                            ]
                        }
                    });

                    if (dayLimit - activeOnNight < selectedRoom.quantity) {
                        throw new Error(`Sorry, the ${dbRoom.name} is no longer available on ${dStr}.`);
                    }
                }
            }

            // Create the booking record
            return await tx.booking.create({
                data: {
                    userId,
                    hotelId: parseInt(hotelId),
                    roomId: activeRooms[0].id,
                    checkIn: checkInDay,
                    checkOut: checkOutDay,
                    totalPrice: calculatedTotal,
                    totalGuests: parseInt(totalGuests),
                    status: req.body.status || 'held',
                    paymentStatus: req.body.paymentStatus || 'pending',
                    amountPaid: (() => {
                        const ps = req.body.paymentStatus;
                        if (ps === 'paid') return req.body.amountPaid || calculatedTotal; // Full online
                        if (ps === 'partial') return req.body.amountPaid || platformFee;  // 12% now
                        return 0; // pending = pay at hotel
                    })(),
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
                    internalNotes: (() => {
                        const ps = req.body.paymentStatus;
                        if (ps === 'paid') return `FULL_ONLINE_PAYMENT: Paid ₹${req.body.amountPaid || calculatedTotal} online | Coupon: ${couponCode || 'None'} | Discount: ₹${discountAmount}`;
                        if (ps === 'partial') return `PARTIAL_PAYMENT: Paid ₹${req.body.amountPaid || platformFee} online (12%) | Balance ₹${remainingAtHotel} at hotel | Coupon: ${couponCode || 'None'} | Discount: ₹${discountAmount}`;
                        return `PAY_AT_HOTEL: Full ₹${calculatedTotal} due at check-in | Coupon: ${couponCode || 'None'} | Discount: ₹${discountAmount}`;
                    })()
                }
            });
        });

        // Trigger emails if the booking is directly created as 'confirmed' or 'paid'
        if (booking && (booking.status === 'confirmed' || booking.status === 'paid')) {
            try {
                const fullBooking = await prisma.booking.findUnique({
                    where: { id: booking.id },
                    include: {
                        hotel: {
                            include: { user: true }
                        },
                        room: true
                    }
                });

                if (fullBooking) {
                    sendBookingEmails({
                        id: fullBooking.id,
                        guestName: `${fullBooking.guestFirstName} ${fullBooking.guestLastName}`,
                        guestEmail: fullBooking.guestEmail,
                        guestPhone: fullBooking.guestPhone,
                        hotel: fullBooking.hotel,
                        room: fullBooking.room,
                        checkIn: fullBooking.checkIn,
                        checkOut: fullBooking.checkOut,
                        totalPrice: fullBooking.totalPrice,
                        amountPaid: fullBooking.amountPaid
                    });
                }
            } catch (emailErr) {
                console.error("Async booking creation email trigger failed:", emailErr);
            }
        }

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

        // Get all hotel IDs reviewed by this user
        const reviews = await prisma.review.findMany({
            where: { userId: req.user.id },
            select: { hotelId: true }
        });
        const reviewedHotelIds = new Set(reviews.map(r => r.hotelId));

        const data = bookings.map(b => ({
            ...b,
            isReviewed: reviewedHotelIds.has(b.hotelId)
        }));

        res.status(200).json({ success: true, count: data.length, data });
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

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (Number.isNaN(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID' });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                hotel: true,
                room: true,
                user: {
                    select: { id: true, name: true, email: true, role: true }
                },
                transactions: true
            }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const isOwner = booking.userId === req.user.id;
        const isHotelOwner = req.user.role === 'hotel_admin' && booking.hotel.userId === req.user.id;
        const isSuperAdmin = req.user.role === 'super_admin';

        if (!isOwner && !isHotelOwner && !isSuperAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
        }

        res.status(200).json({ success: true, data: booking });
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
        
        const statusChangedToConfirmed = (status === 'confirmed' && booking.status !== 'confirmed');

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                status: status || booking.status,
                paymentStatus: paymentStatus || booking.paymentStatus,
                internalNotes: internalNotes !== undefined ? internalNotes : booking.internalNotes
            },
            include: {
                hotel: {
                    include: { user: true }
                },
                room: true
            }
        });

        // Trigger emails if the booking was changed to 'confirmed'
        if (statusChangedToConfirmed) {
            try {
                sendBookingEmails({
                    id: updatedBooking.id,
                    guestName: `${updatedBooking.guestFirstName} ${updatedBooking.guestLastName}`,
                    guestEmail: updatedBooking.guestEmail,
                    guestPhone: updatedBooking.guestPhone,
                    hotel: updatedBooking.hotel,
                    room: updatedBooking.room,
                    checkIn: updatedBooking.checkIn,
                    checkOut: updatedBooking.checkOut,
                    totalPrice: updatedBooking.totalPrice,
                    amountPaid: updatedBooking.amountPaid
                });
            } catch (emailErr) {
                console.error("Async booking update email trigger failed:", emailErr);
            }
        }

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
            where: { id: bookingId },
            include: { hotel: true }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const isOwner = booking.userId === req.user.id;
        const isHotelOwner = req.user.role === 'hotel_admin' && booking.hotel.userId === req.user.id;
        const isSuperAdmin = req.user.role === 'super_admin';

        if (!isOwner && !isHotelOwner && !isSuperAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
        }

        if (['cancelled', 'refunded'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
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

// Concurrency & Expired Bookings Protection: Clean up expired held bookings every 5 minutes in background
setInterval(async () => {
    try {
        const expiredCount = await prisma.booking.updateMany({
            where: {
                status: 'held',
                holdExpiresAt: { lt: new Date() }
            },
            data: {
                status: 'expired'
            }
        });
        if (expiredCount.count > 0) {
            console.log(`[SECURITY] Auto-expired ${expiredCount.count} stale bookings whose hold expired.`);
        }
    } catch (err) {
        console.error('[SECURITY ERROR] Failed to clean up expired bookings:', err);
    }
}, 5 * 60 * 1000).unref();
