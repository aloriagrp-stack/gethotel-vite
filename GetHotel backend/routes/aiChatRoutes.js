const express = require('express');
const { chat, getRooms } = require('../controllers/aiController');

const router = express.Router();

router.route('/chat').post(chat);
router.route('/rooms').post(getRooms);

module.exports = router;
