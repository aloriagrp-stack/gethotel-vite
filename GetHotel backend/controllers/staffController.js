const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all staff for a hotel
// @route   GET /api/hotels/:hotelId/staff
// @access  Private (Hotel Admin, Super Admin)
exports.getStaff = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);

        // Authorization check
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const staff = await prisma.staff.findMany({
            where: { hotelId },
            include: {
                user: {
                    select: { name: true, email: true, profileImage: true }
                }
            }
        });

        res.status(200).json({ success: true, count: staff.length, data: staff });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add staff to hotel
// @route   POST /api/hotels/:hotelId/staff
// @access  Private (Hotel Admin, Super Admin)
exports.addStaff = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const { email, role, name, password } = req.body;

        // Authorization check
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Check if user exists, if not create one
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password || 'Staff@123', salt);
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'user' // Staff are regular users with a Staff record
                }
            });
        }

        // Add to staff table
        const staff = await prisma.staff.create({
            data: {
                userId: user.id,
                hotelId,
                role
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        res.status(201).json({ success: true, data: staff });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Staff member already exists or invalid data' });
    }
};

// @desc    Remove staff
// @route   DELETE /api/hotels/:hotelId/staff/:staffId
// @access  Private (Hotel Admin, Super Admin)
exports.removeStaff = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const staffId = parseInt(req.params.staffId);

        // Authorization check
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // SECURITY: Ensure staff belongs to the hotel
        const staffToRemove = await prisma.staff.findUnique({ where: { id: staffId } });
        if (!staffToRemove || staffToRemove.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Staff member not found in this hotel' });
        }

        await prisma.staff.delete({
            where: { id: staffId }
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
