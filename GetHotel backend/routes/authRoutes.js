const express = require('express');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', require('../controllers/authController').googleLogin);
router.get('/me', protect, getMe);
router.post('/impersonate/:id', protect, authorize('super_admin'), require('../controllers/authController').impersonate);

module.exports = router;
