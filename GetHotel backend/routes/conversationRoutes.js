/**
 * Conversation Routes — ChatGPT-style persistent conversation CRUD
 */
const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const {
    listConversations,
    createConversation,
    getConversation,
    updateConversation,
    deleteConversation,
    saveMessage,
    syncConversations
} = require('../controllers/conversationController');

const router = express.Router();

// Allow guests & authenticated users to load/create/save conversations
router.use(optionalAuth);

router.post('/sync', protect, syncConversations);

router.route('/')
    .get(listConversations)
    .post(createConversation);

router.route('/:id')
    .get(getConversation)
    .patch(updateConversation)
    .delete(deleteConversation);

router.route('/:id/messages')
    .post(saveMessage);

module.exports = router;
