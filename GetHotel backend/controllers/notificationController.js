const prisma = require('../config/db');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await prisma.notification.update({
            where: { 
                id: parseInt(req.params.id),
                userId: req.user.id // Security: ensure it belongs to user
            },
            data: { isRead: true }
        });

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Helper function to create notifications (Internal use)
exports.createNotification = async (userId, hotelId, title, message, type = 'info') => {
    try {
        return await prisma.notification.create({
            data: {
                userId,
                hotelId,
                title,
                message,
                type
            }
        });
    } catch (err) {
        console.error('Failed to create notification', err);
    }
};
