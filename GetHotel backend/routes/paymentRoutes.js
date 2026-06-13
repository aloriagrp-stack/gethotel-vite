const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, razorpayWebhook, fetchPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', razorpayWebhook);
router.post('/fetch-status/:bookingId', protect, fetchPaymentStatus);

module.exports = router;
