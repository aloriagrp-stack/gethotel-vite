const express = require('express');
const {
    submitPartnerRequest,
    getPartnerRequests,
    approvePartnerRequest,
    declinePartnerRequest,
    bulkApprovePartnerRequests,
    bulkDeclinePartnerRequests
} = require('../controllers/partnerController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/request', submitPartnerRequest);
router.get('/requests', protect, authorize('super_admin'), getPartnerRequests);
router.put('/requests/bulk-approve', protect, authorize('super_admin'), bulkApprovePartnerRequests);
router.put('/requests/bulk-decline', protect, authorize('super_admin'), bulkDeclinePartnerRequests);
router.put('/requests/:id/approve', protect, authorize('super_admin'), approvePartnerRequest);
router.put('/requests/:id/decline', protect, authorize('super_admin'), declinePartnerRequest);

module.exports = router;
