const express = require('express');
const { getStats, getHotelDetail, getPartners, resetPartnerPassword, getAllHotels, getAllBookings, getAdminHotelDetail, updateHotelMetrics, recalculateHotelMetrics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here are protected and require super_admin role
router.use(protect);
router.use(authorize('super_admin'));

router.get('/stats', getStats);
router.get('/hotels', getAllHotels);
router.get('/hotels/:id', getAdminHotelDetail);
router.patch('/hotels/:id/metrics', updateHotelMetrics);
router.post('/hotels/:id/recalculate', recalculateHotelMetrics);
router.get('/bookings', getAllBookings);
router.get('/partners', getPartners);
router.post('/partners/:id/reset-password', resetPartnerPassword);

module.exports = router;
