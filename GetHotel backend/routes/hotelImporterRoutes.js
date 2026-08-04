const express = require('express');
const router = express.Router();
const hotelImporterController = require('../controllers/hotelImporterController');
const { protect, authorize } = require('../middleware/auth');

// Public/Extension Endpoint: Chrome Extension posts scraped hotels directly here
router.post('/scraped-hotel', hotelImporterController.saveScrapedHotel);
router.get('/scraped-hotels', hotelImporterController.getScrapedHotels);
router.delete('/scraped-hotel/:id', hotelImporterController.deleteScrapedHotel);

// All other importer endpoints require Admin / Super Admin authorization
router.use(protect);
router.use(authorize('admin', 'super_admin', 'superadmin'));

router.get('/stats', hotelImporterController.getImporterStats);
router.get('/hotels', hotelImporterController.getExportHotels);
router.post('/import', hotelImporterController.importHotels);
router.delete('/scraped-hotel/:id', hotelImporterController.deleteScrapedHotel);
router.post('/sync', hotelImporterController.syncNewHotels);
router.post('/verify-pairing', hotelImporterController.verifyPairingCode);

module.exports = router;
