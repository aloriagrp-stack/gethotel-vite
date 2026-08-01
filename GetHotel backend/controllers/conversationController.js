/**
 * Conversation Controller — ChatGPT-style persistent conversation CRUD
 * 
 * Endpoints:
 *   GET    /api/conversations          — List user's conversations
 *   POST   /api/conversations          — Create new conversation
 *   GET    /api/conversations/:id      — Load conversation + all messages
 *   PATCH  /api/conversations/:id      — Rename / archive
 *   DELETE /api/conversations/:id      — Soft delete
 *   POST   /api/conversations/:id/messages — Save a message
 */
const crypto = require('crypto');
const prisma = require('../config/db');

/**
 * @desc    List all conversations for the authenticated user
 * @route   GET /api/conversations
 * @access  Private
 */
exports.listConversations = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.json({ success: true, conversations: [] });
        }
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;

        const totalUserConversations = await prisma.ai_conversation.count({
            where: { userId, deleted: false }
        });

        const conversations = await prisma.ai_conversation.findMany({
            where: {
                userId,
                deleted: false
            },
            select: {
                id: true,
                title: true,
                archived: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip: offset
        });

        const formattedConversations = conversations.map((conv, idx) => ({
            ...conv,
            chatNumber: totalUserConversations - (offset + idx),
            displayTitle: conv.title || `Chat #${totalUserConversations - (offset + idx)}`
        }));

        return res.json({ success: true, conversations: formattedConversations, total: totalUserConversations });
    } catch (err) {
        console.error('[ConversationCtrl] List error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to load conversations.' });
    }
};

/**
 * @desc    Create a new conversation (Supports authenticated & guest mode)
 * @route   POST /api/conversations
 * @access  Public (Optional Auth)
 */
exports.createConversation = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const { title, firstMessage } = req.body;

        const id = crypto.randomUUID();
        const conversationTitle = title || (firstMessage ? firstMessage.slice(0, 60) : 'New Chat');

        const conversation = await prisma.ai_conversation.create({
            data: {
                id,
                userId,
                title: conversationTitle
            }
        });

        return res.json({ success: true, conversation: { id: conversation.id, title: conversation.title } });
    } catch (err) {
        console.error('[ConversationCtrl] Create error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to create conversation.' });
    }
};

/**
 * @desc    Sync guest conversations to user account upon sign-in
 * @route   POST /api/conversations/sync
 * @access  Private
 */
exports.syncConversations = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const { conversationIds = [] } = req.body;
        if (Array.isArray(conversationIds) && conversationIds.length > 0) {
            await prisma.ai_conversation.updateMany({
                where: {
                    id: { in: conversationIds },
                    userId: null
                },
                data: { userId }
            });
        }
        return res.json({ success: true, message: 'Conversations synced to account successfully!' });
    } catch (err) {
        console.error('[ConversationCtrl] Sync error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to sync conversations.' });
    }
};

/**
 * @desc    Load a conversation with all its messages
 * @route   GET /api/conversations/:id
 * @access  Private (owner only)
 */
exports.getConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;

        const conversation = await prisma.ai_conversation.findUnique({
            where: { id: conversationId },
            include: {
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
            }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        // Security: only owner can access (if linked to a user)
        if (conversation.userId && req.user && conversation.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        if (conversation.deleted) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        // Parse metadata JSON for each message
        const messages = conversation.messages.map(m => {
            let parsedMetadata = null;
            if (m.metadata) {
                try {
                    parsedMetadata = JSON.parse(m.metadata);
                } catch {
                    parsedMetadata = null;
                }
            }
            return {
                id: m.id,
                role: m.role,
                content: m.content,
                metadata: parsedMetadata,
                createdAt: m.createdAt
            };
        });

        return res.json({
            success: true,
            conversation: {
                id: conversation.id,
                title: conversation.title,
                archived: conversation.archived,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            },
            messages
        });
    } catch (err) {
        console.error('[ConversationCtrl] Get error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to load conversation.' });
    }
};

/**
 * @desc    Update conversation (rename, archive)
 * @route   PATCH /api/conversations/:id
 * @access  Private (owner only)
 */
exports.updateConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;
        const { title, archived } = req.body;

        const conversation = await prisma.ai_conversation.findUnique({
            where: { id: conversationId },
            select: { userId: true, deleted: true }
        });

        if (!conversation || conversation.deleted) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        if (conversation.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = String(title).slice(0, 255);
        if (archived !== undefined) updateData.archived = Boolean(archived);

        const updated = await prisma.ai_conversation.update({
            where: { id: conversationId },
            data: updateData,
            select: { id: true, title: true, archived: true, updatedAt: true }
        });

        return res.json({ success: true, conversation: updated });
    } catch (err) {
        console.error('[ConversationCtrl] Update error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to update conversation.' });
    }
};

/**
 * @desc    Soft-delete a conversation
 * @route   DELETE /api/conversations/:id
 * @access  Private (owner only)
 */
exports.deleteConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;

        const conversation = await prisma.ai_conversation.findUnique({
            where: { id: conversationId },
            select: { userId: true }
        });

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        if (conversation.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        await prisma.ai_conversation.update({
            where: { id: conversationId },
            data: { deleted: true }
        });

        return res.json({ success: true, message: 'Conversation deleted.' });
    } catch (err) {
        console.error('[ConversationCtrl] Delete error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to delete conversation.' });
    }
};

/**
 * @desc    Save a message to a conversation
 * @route   POST /api/conversations/:id/messages
 * @access  Private (owner only)
 */
exports.saveMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id;
        const { role, content, metadata } = req.body;

        if (!role || !content) {
            return res.status(400).json({ success: false, message: 'role and content are required.' });
        }

        if (!['user', 'ai'].includes(role)) {
            return res.status(400).json({ success: false, message: 'role must be "user" or "ai".' });
        }

        // Verify ownership
        const conversation = await prisma.ai_conversation.findUnique({
            where: { id: conversationId },
            select: { userId: true, deleted: true }
        });

        if (!conversation || conversation.deleted) {
            return res.status(404).json({ success: false, message: 'Conversation not found.' });
        }

        if (conversation.userId && req.user && conversation.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const metadataStr = metadata ? JSON.stringify(metadata) : null;

        const message = await prisma.ai_message.create({
            data: {
                conversationId,
                role,
                content,
                metadata: metadataStr
            }
        });

        // Touch conversation updatedAt
        await prisma.ai_conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        return res.json({
            success: true,
            message: {
                id: message.id,
                role: message.role,
                content: message.content,
                metadata: metadata || null,
                createdAt: message.createdAt
            }
        });
    } catch (err) {
        console.error('[ConversationCtrl] SaveMessage error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to save message.' });
    }
};
