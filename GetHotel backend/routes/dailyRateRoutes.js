const express = require('express');
const router = express.Router();
const { getDailyRates, updateDailyRate, bulkUpdateDailyRates } = require('../controllers/dailyRateController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getDailyRates);
router.post('/', protect, authorize('hotel_admin', 'super_admin'), updateDailyRate);
router.post('/bulk', protect, authorize('hotel_admin', 'super_admin'), bulkUpdateDailyRates);

module.exports = router;
