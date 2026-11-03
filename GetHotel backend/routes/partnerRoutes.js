const express = require('express');
const {
    submitPartnerRequest,
    getPartnerRequests,
    approvePartnerRequest,
    declinePartnerRequest,
    bulkApprovePartnerRequests,
    bulkDeclinePartnerRequests,
    getBankDetails,
    saveBankDetails,
    getPartnerPayouts,
    requestPartnerPayout
} = require('../controllers/partnerController');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const partnerRequestValidation = [
    check('hotelName', 'Hotel name must be a string').optional().isString().trim(),
    check('hotelUsername', 'Valid hotel username must be a string').optional().isString().trim(),
    check('tagline', 'Tagline must be a string').optional().isString().trim(),
    check('description', 'Description must be a string').optional().isString().trim(),
    check('address', 'Address must be a string').optional().isString().trim(),
    check('city', 'City must be a string').optional().isString().trim(),
    check('pricePerNight', 'Please enter a valid positive price per night').optional().isFloat({ min: 0 }),
    check('userName', 'User name is required and must be a string').notEmpty().isString().trim(),
    check('userEmail', 'Please include a valid email address').isEmail().normalizeEmail(),
    check('userPhone', 'Please include a valid phone number').notEmpty().isString().trim(),
    check('partnerPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validate
];

router.post('/request', partnerRequestValidation, submitPartnerRequest);
router.get('/requests', protect, authorize('super_admin'), getPartnerRequests);
router.put('/requests/bulk-approve', protect, authorize('super_admin'), bulkApprovePartnerRequests);
router.put('/requests/bulk-decline', protect, authorize('super_admin'), bulkDeclinePartnerRequests);
router.put('/requests/:id/approve', protect, authorize('super_admin'), approvePartnerRequest);
router.put('/requests/:id/decline', protect, authorize('super_admin'), declinePartnerRequest);

// Bank Account & Payout Details for Partners
router.get('/bank-details/:hotelId', protect, authorize('hotel_admin', 'super_admin', 'admin', 'partner', 'superadmin'), getBankDetails);
router.post('/bank-details/:hotelId', protect, authorize('hotel_admin', 'super_admin', 'admin', 'partner', 'superadmin'), saveBankDetails);
router.put('/bank-details/:hotelId', protect, authorize('hotel_admin', 'super_admin', 'admin', 'partner', 'superadmin'), saveBankDetails);

// Payout History & Withdrawal Requests for Partners
router.get('/payouts/:hotelId', protect, authorize('hotel_admin', 'super_admin', 'admin', 'partner', 'superadmin'), getPartnerPayouts);
router.post('/payouts/:hotelId', protect, authorize('hotel_admin', 'super_admin', 'admin', 'partner', 'superadmin'), requestPartnerPayout);

module.exports = router;
