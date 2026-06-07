const express = require('express');
const router = express.Router();
const { 
    getOtaSettings, 
    generateOtaKey, 
    updateOtaInventory, 
    updateOtaRates,
    getOtaReservations
} = require('../controllers/otaController');
const { protect, authorize } = require('../middleware/auth');

// Private Settings routes (requires dashboard user to be logged in)
router.route('/key/:hotelId')
    .get(protect, authorize('hotel_admin', 'super_admin'), getOtaSettings)
    .post(protect, authorize('hotel_admin', 'super_admin'), generateOtaKey);

// Public OTA sync endpoints (authorized via custom X-OTA-API-Key header validation in controller)
router.post('/inventory', updateOtaInventory);
router.post('/rates', updateOtaRates);
router.get('/reservations', getOtaReservations);

module.exports = router;
