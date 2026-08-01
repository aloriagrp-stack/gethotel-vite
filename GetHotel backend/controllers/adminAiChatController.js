/**
 * Admin AI Chat Controller — Super Admin AI Analytics & Lead Conversion Tracking
 * 
 * Endpoints:
 *   GET /api/admin/ai-chats — List all traveler AI conversations with duration, message count, and booking status
 */

const prisma = require('../config/db');

/**
 * Format duration in seconds into human-readable string (e.g. "4m 20s" or "45s")
 */
function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return 'Instant (<1m)';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
}

/**
 * @desc    Get AI Chat sessions analytics & conversion tracking for Super Admin
 * @route   GET /api/admin/ai-chats
 * @access  Private (Super Admin)
 */
exports.getAIChatAnalytics = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 200);
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search ? req.query.search.trim().toLowerCase() : '';

        let conversations = [];
        try {
            // Fetch all conversations with associated user and messages
            conversations = await prisma.ai_conversation.findMany({
                where: {
                    deleted: false,
                    ...(search && {
                        OR: [
                            { title: { contains: search } },
                            { user: { name: { contains: search } } },
                            { user: { email: { contains: search } } }
                        ]
                    })
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            createdAt: true
                        }
                    },
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        select: {
                            id: true,
                            role: true,
                            content: true,
                            metadata: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
                skip: offset
            });
        } catch (dbErr) {
            console.error('[AdminAIChatCtrl] Prisma findMany warning:', dbErr.message);
            // Fix 0000-00-00 datetimes if any
            try {
                await prisma.$executeRawUnsafe("UPDATE ai_conversation SET updatedAt = NOW() WHERE updatedAt IS NULL OR updatedAt = '0000-00-00 00:00:00'");
                await prisma.$executeRawUnsafe("UPDATE ai_conversation SET createdAt = NOW() WHERE createdAt IS NULL OR createdAt = '0000-00-00 00:00:00'");
            } catch (e) {}
            conversations = [];
        }

        // Get total conversation count
        const totalCount = await prisma.ai_conversation.count({ where: { deleted: false } });

        // Fetch all bookings to correlate with AI chats
        const allBookings = await prisma.booking.findMany({
            select: {
                id: true,
                userId: true,
                guestEmail: true,
                totalPrice: true,
                status: true,
                paymentStatus: true,
                checkIn: true,
                checkOut: true,
                createdAt: true,
                hotel: {
                    select: { name: true, city: true }
                },
                room: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        let totalMessagesExchanged = 0;
        let totalDurationSeconds = 0;
        let convertedBookingsCount = 0;

        const sessions = conversations.map((conv, index) => {
            const messages = conv.messages || [];
            const msgCount = messages.length;
            totalMessagesExchanged += msgCount;

            const firstMsgTime = messages.length > 0 ? new Date(messages[0].createdAt) : new Date(conv.createdAt);
            const lastMsgTime = messages.length > 0 ? new Date(messages[messages.length - 1].createdAt) : new Date(conv.updatedAt);
            
            const durationSeconds = Math.max(0, Math.round((lastMsgTime - firstMsgTime) / 1000));
            totalDurationSeconds += durationSeconds;

            // Determine user profile & login type
            const isRegisteredUser = !!conv.user;
            const userName = conv.user ? conv.user.name : (messages.find(m => m.metadata && m.metadata.guestName)?.metadata?.guestName || "Guest Traveler");
            const userEmail = conv.user ? conv.user.email : (messages.find(m => m.metadata && m.metadata.guestEmail)?.metadata?.guestEmail || "Guest");
            const profileImage = conv.user ? conv.user.profileImage : null;
            const isGoogleUser = profileImage && profileImage.includes("googleusercontent");

            // Correlate with booking: check if this user or email has a booking created around or after this chat
            const matchingBooking = allBookings.find(b => {
                if (conv.userId && b.userId === conv.userId) return true;
                if (userEmail && userEmail !== 'Guest' && b.guestEmail.toLowerCase() === userEmail.toLowerCase()) return true;
                return false;
            });

            if (matchingBooking) {
                convertedBookingsCount++;
            }

            return {
                id: conv.id,
                sessionNumber: totalCount - (offset + index), // Sequential session ID badge
                title: conv.title || "Trip Planning Inquiry",
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
                messageCount: msgCount,
                durationSeconds: durationSeconds,
                durationFormatted: formatDuration(durationSeconds),
                user: {
                    id: conv.userId || null,
                    name: userName,
                    email: userEmail,
                    profileImage: profileImage,
                    isRegistered: isRegisteredUser,
                    provider: isGoogleUser ? "Google Auth" : (isRegisteredUser ? "Account" : "Guest Mode")
                },
                isBooked: !!matchingBooking,
                booking: matchingBooking ? {
                    id: matchingBooking.id,
                    hotelName: matchingBooking.hotel?.name || "Hotel",
                    roomName: matchingBooking.room?.name || "Standard Room",
                    city: matchingBooking.hotel?.city || "",
                    totalPrice: matchingBooking.totalPrice,
                    status: matchingBooking.status,
                    paymentStatus: matchingBooking.paymentStatus,
                    checkIn: matchingBooking.checkIn,
                    checkOut: matchingBooking.checkOut,
                    createdAt: matchingBooking.createdAt
                } : null,
                messages: messages.map(m => {
                    let meta = null;
                    try {
                        meta = typeof m.metadata === 'string' ? JSON.parse(m.metadata) : m.metadata;
                    } catch { /* ignore */ }
                    return {
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        metadata: meta,
                        createdAt: m.createdAt
                    };
                })
            };
        });

        const avgDurationSeconds = conversations.length > 0 ? Math.round(totalDurationSeconds / conversations.length) : 0;
        const conversionRate = conversations.length > 0 ? parseFloat(((convertedBookingsCount / conversations.length) * 100).toFixed(1)) : 0;

        return res.json({
            success: true,
            summary: {
                totalSessions: totalCount,
                totalMessages: totalMessagesExchanged,
                avgDurationFormatted: formatDuration(avgDurationSeconds),
                convertedBookings: convertedBookingsCount,
                conversionRatePercent: conversionRate
            },
            sessions
        });
    } catch (err) {
        console.error('[AdminAIChatCtrl] Error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch AI chat analytics.' });
    }
};
