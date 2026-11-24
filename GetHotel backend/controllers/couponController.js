const prisma = require('../config/db');

// Helper to safely parse dates in YYYY-MM-DD, DD-MM-YYYY, or ISO formats
const parseDateSafe = (val) => {
    if (!val) return undefined;
    if (val instanceof Date && !isNaN(val.getTime())) return val;
    if (typeof val === 'string') {
        const dmyMatch = val.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (dmyMatch) {
            const day = parseInt(dmyMatch[1], 10);
            const month = parseInt(dmyMatch[2], 10) - 1;
            const year = parseInt(dmyMatch[3], 10);
            const parsed = new Date(year, month, day);
            if (!isNaN(parsed.getTime())) return parsed;
        }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
};

// Helper to verify hotel existence and authorization
const verifyHotelAccess = async (hotelId, user) => {
    if (!hotelId || isNaN(hotelId)) {
        return { authorized: false, status: 400, message: 'Invalid hotel ID' };
    }
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
        return { authorized: false, status: 404, message: 'Hotel not found' };
    }

    const isSuperAdmin = ['super_admin', 'superadmin', 'admin'].includes(user.role);
    const isOwner = hotel.userId === user.id;
    let isStaff = false;
    if (!isSuperAdmin && !isOwner) {
        const staffMember = await prisma.staff.findFirst({ where: { hotelId, userId: user.id } });
        if (staffMember) isStaff = true;
    }

    if (!isSuperAdmin && !isOwner && !isStaff) {
        return { authorized: false, status: 403, message: 'Not authorized to manage coupons for this hotel' };
    }
    return { authorized: true, hotel };
};

// @desc    Get all coupons for a hotel
// @route   GET /api/hotels/:hotelId/coupons
// @access  Private (Hotel Admin, Super Admin)
exports.getCoupons = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        if (!hotelId || isNaN(hotelId)) {
            return res.status(400).json({ success: false, message: 'Invalid hotel ID' });
        }

        // Check if hotel exists
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        const coupons = await prisma.coupon.findMany({
            where: { hotelId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } catch (err) {
        console.error('getCoupons error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a new coupon
// @route   POST /api/hotels/:hotelId/coupons
// @access  Private (Hotel Admin, Super Admin)
exports.createCoupon = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const access = await verifyHotelAccess(hotelId, req.user);
        if (!access.authorized) {
            return res.status(access.status).json({ success: false, message: access.message });
        }

        const { code, discountType, discountValue, minBookingAmt, maxDiscount, startDate, endDate, usageLimit, promoType, targetAudience, minStay, applyToRooms } = req.body;

        const parsedStartDate = parseDateSafe(startDate) || new Date();
        const parsedEndDate = parseDateSafe(endDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const coupon = await prisma.coupon.create({
            data: {
                code: (code || `PROMO${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase(),
                discountType: discountType || "percentage",
                discountValue: parseFloat(discountValue),
                minBookingAmt: parseFloat(minBookingAmt || 0),
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                promoType: promoType || "standard",
                minStay: parseInt(minStay || 1),
                targetAudience: targetAudience || "all",
                applyToRooms: applyToRooms || "all",
                hotelId
            }
        });

        res.status(201).json({ success: true, data: coupon });
    } catch (err) {
        console.error('createCoupon error:', err);
        res.status(400).json({ success: false, message: 'Coupon code already exists or invalid data' });
    }
};

// @desc    Update an existing coupon
// @route   PUT /api/hotels/:hotelId/coupons/:id
// @access  Private (Hotel Admin, Super Admin)
exports.updateCoupon = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const couponId = parseInt(req.params.id);
        if (!couponId || isNaN(couponId)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
        }

        const access = await verifyHotelAccess(hotelId, req.user);
        if (!access.authorized) {
            return res.status(access.status).json({ success: false, message: access.message });
        }

        // SECURITY: Ensure coupon belongs to the hotel
        const couponToUpdate = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (!couponToUpdate || couponToUpdate.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Coupon not found in this hotel' });
        }

        const { code, discountType, discountValue, minBookingAmt, maxDiscount, startDate, endDate, usageLimit, promoType, targetAudience, minStay, applyToRooms } = req.body;

        const updateData = {};
        if (code) updateData.code = code.toUpperCase();
        if (discountType) updateData.discountType = discountType;
        if (discountValue !== undefined && discountValue !== '') updateData.discountValue = parseFloat(discountValue);
        if (minBookingAmt !== undefined) updateData.minBookingAmt = parseFloat(minBookingAmt || 0);
        if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
        if (startDate) {
            const d = parseDateSafe(startDate);
            if (d) updateData.startDate = d;
        }
        if (endDate) {
            const d = parseDateSafe(endDate);
            if (d) updateData.endDate = d;
        }
        if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
        if (promoType !== undefined) updateData.promoType = promoType;
        if (minStay !== undefined) updateData.minStay = parseInt(minStay || 1);
        if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
        if (applyToRooms !== undefined) updateData.applyToRooms = applyToRooms;

        const coupon = await prisma.coupon.update({
            where: { id: couponId },
            data: updateData
        });

        res.status(200).json({ success: true, data: coupon });
    } catch (err) {
        console.error('updateCoupon error:', err);
        res.status(400).json({ success: false, message: err.message || 'Coupon update failed or invalid data' });
    }
};

// @desc    Toggle coupon status
// @route   PATCH /api/hotels/:hotelId/coupons/:id
// @access  Private
exports.toggleCouponStatus = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const couponId = parseInt(req.params.id);
        if (!couponId || isNaN(couponId)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
        }

        const access = await verifyHotelAccess(hotelId, req.user);
        if (!access.authorized) {
            return res.status(access.status).json({ success: false, message: access.message });
        }

        // SECURITY: Ensure coupon belongs to the hotel
        const couponToUpdate = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (!couponToUpdate || couponToUpdate.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Coupon not found in this hotel' });
        }

        const { isActive } = req.body;
        const coupon = await prisma.coupon.update({
            where: { id: couponId },
            data: { isActive: Boolean(isActive) }
        });

        res.status(200).json({ success: true, data: coupon });
    } catch (err) {
        console.error('toggleCouponStatus error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/hotels/:hotelId/coupons/:id
// @access  Private
exports.deleteCoupon = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const couponId = parseInt(req.params.id);
        if (!couponId || isNaN(couponId)) {
            return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
        }

        const access = await verifyHotelAccess(hotelId, req.user);
        if (!access.authorized) {
            return res.status(access.status).json({ success: false, message: access.message });
        }

        // SECURITY: Ensure coupon belongs to the hotel
        const couponToDelete = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (!couponToDelete || couponToDelete.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Coupon not found in this hotel' });
        }

        await prisma.coupon.delete({
            where: { id: couponId }
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('deleteCoupon error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};
