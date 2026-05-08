const prisma = require('../config/db');

// @desc    Get all coupons for a hotel
// @route   GET /api/hotels/:hotelId/coupons
// @access  Private (Hotel Admin, Super Admin)
exports.getCoupons = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);

        // Authorization check
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const coupons = await prisma.coupon.findMany({
            where: { hotelId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a new coupon
// @route   POST /api/hotels/:hotelId/coupons
// @access  Private (Hotel Admin, Super Admin)
exports.createCoupon = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const { code, discountType, discountValue, minBookingAmt, maxDiscount, startDate, endDate, usageLimit } = req.body;

        // Authorization check
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountType,
                discountValue: parseFloat(discountValue),
                minBookingAmt: parseFloat(minBookingAmt || 0),
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                hotelId
            }
        });

        res.status(201).json({ success: true, data: coupon });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Coupon code already exists or invalid data' });
    }
};

// @desc    Toggle coupon status
// @route   PATCH /api/hotels/:hotelId/coupons/:id
// @access  Private
exports.toggleCouponStatus = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const couponId = parseInt(req.params.id);
        const { isActive } = req.body;

        // Authorization check
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // SECURITY: Ensure coupon belongs to the hotel
        const couponToUpdate = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (!couponToUpdate || couponToUpdate.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Coupon not found in this hotel' });
        }

        const coupon = await prisma.coupon.update({
            where: { id: couponId },
            data: { isActive }
        });

        res.status(200).json({ success: true, data: coupon });
    } catch (err) {
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

        // Authorization check
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
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
        res.status(400).json({ success: false, message: err.message });
    }
};
