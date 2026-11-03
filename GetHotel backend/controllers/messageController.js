const prisma = require('../config/db');

// @desc    Send a message (Guest to Hotel, or Hotel to Guest)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { hotelId, content, targetUserId } = req.body;
        if (!hotelId || !content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Hotel ID and message content are required.' });
        }

        // A message is from 'hotel' ONLY when hotel staff is replying to a guest (targetUserId provided)
        // In the guest chat (/chat), anyone sending messages is a 'user' (guest) inquiring with the property
        const isReplyingAsHotel = (req.user.role === 'hotel_admin' || req.user.role === 'super_admin') && Boolean(targetUserId);
        const sender = isReplyingAsHotel ? 'hotel' : 'user';

        // If hotel staff replies, targetUserId is the guest. Otherwise, req.user.id is the guest.
        const guestUserId = isReplyingAsHotel ? parseInt(targetUserId) : req.user.id;

        const message = await prisma.message.create({
            data: {
                userId: guestUserId,
                hotelId: parseInt(hotelId),
                content: content.trim(),
                sender,
                isRead: false
            },
            include: {
                user: { select: { id: true, name: true, email: true, profileImage: true } },
                hotel: { select: { id: true, name: true, thumbnail: true, city: true } }
            }
        });

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        console.error('sendMessage error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get messages for a hotel (Partner Dashboard)
// @route   GET /api/messages/hotel/:hotelId
// @access  Private (Hotel Admin / Super Admin)
exports.getHotelMessages = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        
        // Verify ownership
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel || (hotel.userId !== req.user.id && req.user.role !== 'super_admin')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!prisma.message) {
            return res.status(200).json({ success: true, data: [] });
        }

        // If partner is viewing a specific guest's thread, mark guest messages as read
        if (req.query.userId) {
            const guestId = parseInt(req.query.userId);
            await prisma.message.updateMany({
                where: {
                    hotelId,
                    userId: guestId,
                    sender: 'user',
                    isRead: false
                },
                data: { isRead: true }
            }).catch(() => {});
        }

        const messages = await prisma.message.findMany({
            where: { hotelId },
            include: {
                user: { select: { id: true, name: true, email: true, profileImage: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error('getHotelMessages error:', err);
        res.status(200).json({ success: true, data: [] });
    }
};

// @desc    Get messages thread between current guest and a specific hotel
// @route   GET /api/messages/thread/:hotelId
// @access  Private (Guest)
exports.getGuestHotelThread = async (req, res) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const userId = req.user.id;

        if (!prisma.message) {
            return res.status(200).json({ success: true, data: [] });
        }

        const messages = await prisma.message.findMany({
            where: {
                hotelId,
                userId
            },
            include: {
                hotel: { select: { id: true, name: true, thumbnail: true, city: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Mark hotel messages to this guest as read
        await prisma.message.updateMany({
            where: {
                hotelId,
                userId,
                sender: 'hotel',
                isRead: false
            },
            data: { isRead: true }
        }).catch(() => {});

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error('getGuestHotelThread error:', err);
        res.status(200).json({ success: true, data: [] });
    }
};

// @desc    Get all messages for a user (Guest overview)
// @route   GET /api/messages/my-messages
// @access  Private
exports.getMyMessages = async (req, res) => {
    try {
        if (!prisma.message) {
            return res.status(200).json({ success: true, data: [] });
        }

        const messages = await prisma.message.findMany({
            where: { userId: req.user.id },
            include: {
                hotel: { select: { id: true, name: true, thumbnail: true, city: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error('getMyMessages error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};
