const express = require('express');
const { getStats, getHotelDetail } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here are protected and require super_admin role
router.use(protect);
router.use(authorize('super_admin'));

router.get('/stats', getStats);
router.get('/hotels/:id', getHotelDetail);

module.exports = router;
