const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, razorpayWebhook, fetchPaymentStatus } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/create-order', optionalAuth, createOrder);
router.post('/verify', optionalAuth, verifyPayment);
router.post('/webhook', razorpayWebhook);
router.post('/fetch-status/:bookingId', optionalAuth, fetchPaymentStatus);

module.exports = router;
