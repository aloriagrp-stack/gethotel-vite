const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All notification routes are protected

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id', markAsRead);

module.exports = router;
