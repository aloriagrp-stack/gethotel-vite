const express = require('express');
const {
    submitPartnerRequest,
    getPartnerRequests,
    approvePartnerRequest
} = require('../controllers/partnerController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/request', submitPartnerRequest);
router.get('/requests', protect, authorize('super_admin'), getPartnerRequests);
router.put('/requests/:id/approve', protect, authorize('super_admin'), approvePartnerRequest);

module.exports = router;
