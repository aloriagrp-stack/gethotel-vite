const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/hero-config', packageController.getHeroConfig);
router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageByIdOrSlug);

// Admin-protected routes
router.put('/hero-config', protect, authorize('admin', 'superadmin', 'super_admin'), packageController.updateHeroConfig);
router.post('/import-json', protect, authorize('admin', 'superadmin', 'super_admin'), packageController.importPackagesJson);
router.post('/ai-suggest', protect, authorize('admin', 'superadmin', 'super_admin'), packageController.aiSuggestTours);
router.post('/', protect, authorize('admin', 'superadmin', 'super_admin', 'hotel_admin'), packageController.createPackage);
router.post('/upload-image', protect, authorize('admin', 'superadmin', 'super_admin', 'hotel_admin'), packageController.uploadImage);
router.put('/:id', protect, authorize('admin', 'superadmin', 'super_admin', 'hotel_admin'), packageController.updatePackage);
router.delete('/:id', protect, authorize('admin', 'superadmin', 'super_admin', 'hotel_admin'), packageController.deletePackage);

module.exports = router;
