const express = require('express');
const { suggestRooms } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route: POST /api/admin/ai/suggest-rooms
// Accessible only by logged in Super Admins
router.route('/suggest-rooms')
    .post(protect, authorize('super_admin'), suggestRooms);

module.exports = router;
