const prisma = require('../config/db');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { hotelId, content } = req.body;
        const userId = req.user.id;
        const sender = req.user.role === 'hotel_admin' || req.user.role === 'super_admin' ? 'hotel' : 'user';

        const message = await prisma.message.create({
            data: {
                userId,
                hotelId: parseInt(hotelId),
                content,
                sender
            }
        });

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get messages for a hotel (Partner Dashboard)
// @route   GET /api/messages/hotel/:hotelId
// @access  Private (Hotel Admin)
exports.getHotelMessages = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        
        // Verify ownership
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel || (hotel.userId !== req.user.id && req.user.role !== 'super_admin')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const messages = await prisma.message.findMany({
            where: { hotelId },
            include: {
                user: { select: { name: true, email: true, profileImage: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get messages for a user
// @route   GET /api/messages/my-messages
// @access  Private
exports.getMyMessages = async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: { userId: req.user.id },
            include: {
                hotel: { select: { name: true, thumbnail: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
