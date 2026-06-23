const express = require('express');
const { 
    getStats, getHotelDetail, getPartners, resetPartnerPassword, assignHotelsToPartner, 
    getAllHotels, getAllBookings, getAdminHotelDetail, updateHotelMetrics, recalculateHotelMetrics, 
    suspendHotel, deleteHotel, getPayouts, approvePayout, createQuickPartner, createBulkHotels, 
    getUsers, getGlobalReviews, deleteReview, createBulkPartnersWithHotels
} = require('../controllers/adminController');
const { getAnalytics } = require('../controllers/analyticsController');
const { updateHomepageConfig, toggleTrending, toggleFeatured } = require('../controllers/homepageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here are protected and require super_admin role
router.use(protect);
router.use(authorize('super_admin'));

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.get('/hotels', getAllHotels);
router.post('/hotels/bulk', createBulkHotels);
router.get('/hotels/:id', getAdminHotelDetail);
router.patch('/hotels/:id/metrics', updateHotelMetrics);
router.post('/hotels/:id/recalculate', recalculateHotelMetrics);
router.put('/hotels/:id/suspend', suspendHotel);
router.put('/hotels/:id/trending', toggleTrending);
router.put('/hotels/:id/featured', toggleFeatured);
router.delete('/hotels/:id', deleteHotel);
router.get('/bookings', getAllBookings);
router.get('/partners', getPartners);
router.post('/partners/quick', createQuickPartner);
router.post('/partners/bulk-with-hotels', createBulkPartnersWithHotels);
router.post('/partners/:id/reset-password', resetPartnerPassword);
router.put('/partners/:id/assign-hotels', assignHotelsToPartner);
router.put('/homepage/config', updateHomepageConfig);
// Payout administration routes
router.get('/payouts', getPayouts);
router.put('/payouts/:id/approve', approvePayout);

// Reviews administration routes
router.get('/reviews', getGlobalReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
