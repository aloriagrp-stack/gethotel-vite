const express = require('express');
const { register, login, getMe, sendOTP, verifyOTP, sendChangePasswordOTP, verifyChangePasswordOTP, sendChangeEmailOTP, verifyChangeEmailOTP } = require('../controllers/authController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const { check } = require('express-validator');
const { validate } = require('../middleware/validate');

router.post('/register', [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validate
], register);

router.post('/send-otp', [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validate
], sendOTP);

router.post('/verify-otp', [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('otp', 'OTP is required').notEmpty(),
    validate
], verifyOTP);

router.post('/login', [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    validate
], login);

router.post('/google', [
    check('idToken', 'idToken is required').notEmpty(),
    validate
], require('../controllers/authController').googleLogin);

router.get('/me', protect, getMe);
router.post('/change-password/send-otp', protect, sendChangePasswordOTP);
router.post('/change-password/verify-otp', protect, verifyChangePasswordOTP);
router.post('/change-email/send-otp', protect, sendChangeEmailOTP);
router.post('/change-email/verify-otp', protect, verifyChangeEmailOTP);
router.post('/impersonate/:id', protect, authorize('super_admin'), require('../controllers/authController').impersonate);

module.exports = router;
