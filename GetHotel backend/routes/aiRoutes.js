// AI Routes - v2.6 deploy 15Jun2026
const express = require('express');
const { suggestRooms, convertWebP, importReviews, bulkOnboardPreview, bulkOnboardConfirm, bulkOnboardHistory } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route: POST /api/admin/ai/suggest-rooms
// Accessible only by logged in Super Admins
router.route('/suggest-rooms')
    .post(protect, authorize('super_admin'), suggestRooms);

// Route: POST /api/admin/ai/convert-webp
// Accessible only by logged in Super Admins
router.route('/convert-webp')
    .post(protect, authorize('super_admin'), convertWebP);

// Route: POST /api/admin/ai/import-reviews
// Accessible only by logged in Super Admins
router.route('/import-reviews')
    .post(protect, authorize('super_admin'), importReviews);

// Route: POST /api/admin/ai/bulk-onboard-preview
// Accessible only by logged in Super Admins
router.route('/bulk-onboard-preview')
    .post(protect, authorize('super_admin'), bulkOnboardPreview);

// Route: POST /api/admin/ai/bulk-onboard-confirm
// Accessible only by logged in Super Admins
router.route('/bulk-onboard-confirm')
    .post(protect, authorize('super_admin'), bulkOnboardConfirm);

// Route: GET /api/admin/ai/bulk-onboard-history
// Accessible only by logged in Super Admins
router.route('/bulk-onboard-history')
    .get(protect, authorize('super_admin'), bulkOnboardHistory);

module.exports = router;
