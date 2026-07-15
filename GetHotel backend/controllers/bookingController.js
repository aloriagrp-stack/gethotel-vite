const prisma = require('../config/db');
const { sendBookingEmails } = require('../utils/emailService');

const toValidDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeDateOnly = (date) => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    const { hotelId, rooms, checkIn, checkOut, totalGuests, guestInfo, couponCode, arrivalTime, stayType, duration } = req.body;
    const userId = req.user.id;

    try {
        const checkInDate = toValidDate(checkIn);
        const checkOutDate = toValidDate(checkOut);

        if (!hotelId || !checkInDate || (stayType !== 'hourly' && !checkOutDate)) {
            return res.status(400).json({ success: false, message: "Valid hotel, check-in, and check-out dates are required." });
        }

        const today = normalizeDateOnly(new Date());
        const checkInDay = normalizeDateOnly(checkInDate);
        const checkOutDay = checkOutDate ? normalizeDateOnly(checkOutDate) : checkInDay;

        if (checkInDay < today) {
            return res.status(400).json({ success: false, message: "Check-in date cannot be in the past." });
        }

        let nights = 1;
        if (stayType !== 'hourly') {
            if (checkOutDay <= checkInDay) {
                return res.status(400).json({ success: false, message: "Check-out date must be after the check-in date." });
            }

            nights = Math.ceil((checkOutDay - checkInDay) / (1000 * 60 * 60 * 24));
            if (nights < 1) {
                return res.status(400).json({ success: false, message: "Stay duration must be at least one night." });
            }
            if (nights > 90) {
                return res.status(400).json({ success: false, message: "Stay duration cannot exceed 90 nights." });
            }
        }

        // 2. FETCH HOTEL & ROOMS TO VERIFY PRICING & AVAILABILITY
        const hotel = await prisma.hotel.findUnique({
            where: { id: parseInt(hotelId) },
            include: { room: true }
        });

        if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

        // Fallback: If no specific rooms provided, use the first available room
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
            
            let roomTotalStayPrice = 0;

            if (stayType === 'hourly') {
                const hourlyRatesObj = typeof dbRoom.hourlyRates === 'string' 
                    ? JSON.parse(dbRoom.hourlyRates || '{}') 
                    : (dbRoom.hourlyRates || {});
                const reqDuration = duration || '3';
                const hrPrice = Number(hourlyRatesObj[reqDuration] || hourlyRatesObj[String(reqDuration)] || dbRoom.pricePerNight * 0.3);
                roomTotalStayPrice = hrPrice;
            } else {
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

                for (let i = 0; i < nights; i++) {
                    const currentDay = new Date(checkInDay);
                    currentDay.setUTCDate(currentDay.getUTCDate() + i);
                    const dStr = currentDay.toISOString().split('T')[0];
                    
                    const rateOverride = rateMap[dStr];
                    if (rateOverride) {
                        roomTotalStayPrice += rateOverride.price;
                    } else {
                        roomTotalStayPrice += dbRoom.pricePerNight;
                    }
                }
            }

            // Support for variant-specific pricing markup
            let variantMarkup = 0;
            if (stayType !== 'hourly' && selectedRoom.variantIdx !== undefined) {
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
            const activeCoupon = await prisma.coupon.findFirst({
                where: {
                    hotelId: parseInt(hotelId),
                    code: { equals: couponCode.trim() },
                    isActive: true
                }
            });

            if (!activeCoupon) {
                return res.status(400).json({ success: false, message: "Invalid or expired coupon code." });
            }

            // Date validation (compare with server local/UTC date)
            const today = new Date();
            today.setHours(0,0,0,0);
            
            const start = new Date(activeCoupon.startDate);
            const end = new Date(activeCoupon.endDate);
            const compareStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const compareEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            if (today < compareStart || today > compareEnd) {
                return res.status(400).json({ success: false, message: "This coupon is either not active yet or has expired." });
            }

            // Min Stay validation
            if (activeCoupon.minStay && nights < activeCoupon.minStay) {
                return res.status(400).json({ success: false, message: `Minimum stay of ${activeCoupon.minStay} nights is required for this offer.` });
            }

            // Min Booking Amount validation
            if (activeCoupon.minBookingAmt && calculatedSubtotal < activeCoupon.minBookingAmt) {
                return res.status(400).json({ success: false, message: `This coupon requires a minimum booking amount of ₹${activeCoupon.minBookingAmt}.` });
            }

            // Apply to specific rooms check
            if (activeCoupon.applyToRooms && activeCoupon.applyToRooms !== 'all') {
                const allowedRooms = activeCoupon.applyToRooms.split(',').map(id => id.trim());
                const isRoomAllowed = activeRooms.some(r => allowedRooms.includes(String(r.id)));
                if (!isRoomAllowed) {
                    return res.status(400).json({ success: false, message: "This coupon is not valid for the selected room category." });
                }
            }

            // Advanced promo type check
            const type = activeCoupon.promoType || 'standard';

            if (type === 'mobile_only') {
                const userAgent = req.headers['user-agent'] || '';
                const isMobileUA = /mobile|android|iphone|ipad|phone/i.test(userAgent);
                if (!isMobileUA) {
                    return res.status(400).json({ success: false, message: "This coupon is exclusive to mobile device bookings." });
                }
            }

            else if (type === 'last_minute') {
                const checkInDate = new Date(checkInDay);
                const checkInDayObj = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
                const diffDays = Math.ceil((checkInDayObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0 || diffDays > 1) {
                    return res.status(400).json({ success: false, message: "Last minute deals are only valid for bookings checking in today or tomorrow." });
                }
            }

            else if (type === 'early_bird') {
                const checkInDate = new Date(checkInDay);
                const checkInDayObj = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
                const diffDays = Math.round((checkInDayObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 7) {
                    return res.status(400).json({ success: false, message: "Early bird specials require booking at least 7 days in advance." });
                }
            }

            else if (type === 'weekend') {
                const checkInDate = new Date(checkInDay);
                const dayOfWeek = checkInDate.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
                if (dayOfWeek !== 0 && dayOfWeek !== 5 && dayOfWeek !== 6) {
                    return res.status(400).json({ success: false, message: "Weekend deals are only valid for check-in on Friday, Saturday, or Sunday." });
                }
            }

            else if (type === 'long_stay') {
                const requiredNights = Math.max(3, Number(activeCoupon.minStay) || 3);
                if (nights < requiredNights) {
                    return res.status(400).json({ success: false, message: `Long stay incentive requires booking a stay of at least ${requiredNights} nights.` });
                }
            }

            // Calculate discount
            if (activeCoupon.discountType === 'percentage') {
                discountAmount = Math.round(calculatedSubtotal * (activeCoupon.discountValue / 100));
            } else {
                discountAmount = Math.round(activeCoupon.discountValue);
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
                    currentDay.setUTCDate(currentDay.getUTCDate() + i);
                    
                    const nextDay = new Date(currentDay);
                    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

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
                    arrivalTime: arrivalTime || null,
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
