const express = require('express');
const { 
    getStats, getHotelDetail, getPartners, resetPartnerPassword, assignHotelsToPartner, 
    getAllHotels, getAllBookings, getAdminHotelDetail, updateHotelMetrics, recalculateHotelMetrics, 
    suspendHotel, deleteHotel, getPayouts, approvePayout, createQuickPartner, createBulkHotels, 
    getUsers, getGlobalReviews, deleteReview, createBulkPartnersWithHotels,
    bulkUpdatePromotions, bulkDeletePromotions
} = require('../controllers/adminController');
const { getAnalytics } = require('../controllers/analyticsController');
const { getAIChatAnalytics } = require('../controllers/adminAiChatController');
const { updateHomepageConfig, toggleTrending, toggleFeatured, updateTrendingBulk } = require('../controllers/homepageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here are protected and require super_admin role
router.use(protect);
router.use(authorize('super_admin'));

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/ai-chats', getAIChatAnalytics);
router.get('/users', getUsers);
router.get('/hotels', getAllHotels);
router.post('/hotels/bulk', createBulkHotels);
router.post('/hotels/bulk-promotion', bulkUpdatePromotions);
router.post('/hotels/bulk-delete-promotion', bulkDeletePromotions);
router.get('/hotels/:id', getAdminHotelDetail);
router.patch('/hotels/:id/metrics', updateHotelMetrics);
router.post('/hotels/:id/recalculate', recalculateHotelMetrics);
router.put('/hotels/:id/suspend', suspendHotel);
router.put('/hotels/trending/bulk', updateTrendingBulk);
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

// Hotel Agent Importer administration routes
const hotelImporterController = require('../controllers/hotelImporterController');
router.get('/importer/stats', hotelImporterController.getImporterStats);
router.get('/importer/hotels', hotelImporterController.getExportHotels);
router.post('/importer/import', hotelImporterController.importHotels);
router.post('/importer/sync', hotelImporterController.syncNewHotels);
router.post('/importer/verify-pairing', hotelImporterController.verifyPairingCode);

// Package administration routes
const packageController = require('../controllers/packageController');
router.post('/packages/import-json', packageController.importPackagesJson);
router.put('/packages/hero-config', packageController.updateHeroConfig);
router.get('/packages/hero-config', packageController.getHeroConfig);

module.exports = router;
