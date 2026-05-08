const express = require('express');
const router = express.Router();
const { sendMessage, getHotelMessages, getMyMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', sendMessage);
router.get('/my-messages', getMyMessages);
router.get('/hotel/:hotelId', getHotelMessages);

module.exports = router;
