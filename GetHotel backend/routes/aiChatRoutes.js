const express = require('express');
const { chat, getRooms, debugHotels } = require('../controllers/aiController');

const router = express.Router();

router.route('/chat').post(chat);
router.route('/rooms').post(getRooms);
router.route('/debug-hotels').get(debugHotels);

module.exports = router;
