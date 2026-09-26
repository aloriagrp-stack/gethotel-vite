const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/db');
const { sendBookingEmails } = require('../utils/emailService');

// Initialize Razorpay lazily or handle missing keys
let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('Razorpay Initialized');
    } else {
        console.warn('Razorpay keys missing in .env. Payment features will not work.');
    }
} catch (error) {
    console.error('Razorpay Init Error:', error.message);
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    const { bookingId, amount, isPackage, packageId, title } = req.body;

    if (!razorpay) {
        return res.status(500).json({ success: false, message: 'Razorpay is not configured. Please add Key ID and Secret to .env' });
    }

    try {
        // Support tour package orders or direct amounts
        if (isPackage || (amount && !bookingId)) {
            const amountInPaisa = Math.round(Number(amount) * 100);
            if (!amountInPaisa || amountInPaisa <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid payment amount' });
            }
            const receipt = `pkg_${Date.now()}_${String(packageId || 'custom').slice(0, 10)}`.slice(0, 40);
            const options = {
                amount: amountInPaisa,
                currency: 'INR',
                receipt,
                notes: {
                    type: 'package',
                    packageId: String(packageId || ''),
                    title: String(title || 'Tour Package')
                }
            };
            const order = await razorpay.orders.create(options);
            return res.status(200).json({
                success: true,
                order: order,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                isPackage: true,
                keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_T16NuPtvvs9cRV'
            });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) },
            include: { hotel: true }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Calculate amount based on paymentStatus (12% for partial, 100% for full online paid)
        let amountToPay = 0;
        if (booking.paymentStatus === 'paid') {
            amountToPay = Math.round(booking.totalPrice * 100); // 100% in paisa
        } else {
            amountToPay = Math.round(booking.totalPrice * 0.12 * 100); // 12% in paisa
        }

        const options = {
            amount: amountToPay,
            currency: 'INR',
            receipt: `receipt_booking_${booking.id}`,
        };

        const order = await razorpay.orders.create(options);

        // Update booking with Razorpay Order ID
        await prisma.booking.update({
            where: { id: booking.id },
            data: { razorpayOrderId: order.id }
        });

        res.status(200).json({
            success: true,
            order: order,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            bookingId: booking.id,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_T16NuPtvvs9cRV'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

// Helper to process successful payment, update DB, log transaction, send email notifications
async function processSuccessfulPayment(booking, razorpay_order_id, razorpay_payment_id, razorpay_signature, rawResponse) {
    // Idempotency Check: Prevent duplicate payment processing
    if (booking.status === 'confirmed' && (booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial')) {
        return { success: true, message: 'Payment already processed and verified.' };
    }

    const targetAmountPaid = booking.paymentStatus === 'paid' ? booking.totalPrice : Math.round(booking.totalPrice * 0.12);
    const targetPaymentStatus = booking.paymentStatus === 'paid' ? 'paid' : 'partial';

    // SUCCESS FLOW
    await prisma.$transaction(async (tx) => {
        // Concurrency Control: Lock the Booking row to prevent concurrent race conditions (pessimistic lock)
        const lockedBookings = await tx.$queryRaw`SELECT id, paymentStatus FROM booking WHERE id = ${booking.id} FOR UPDATE`;
        const lockedBooking = lockedBookings[0];
        
        if (lockedBooking && (lockedBooking.paymentStatus === 'paid' || lockedBooking.paymentStatus === 'partial') && lockedBooking.status === 'confirmed') {
            return;
        }

        // 1. Update Booking
        await tx.booking.update({
            where: { id: booking.id },
            data: {
                paymentStatus: targetPaymentStatus,
                amountPaid: targetAmountPaid,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature || null,
                status: 'confirmed'
            }
        });

        // 2. Log Transaction
        await tx.transaction.create({
            data: {
                bookingId: booking.id,
                amount: targetAmountPaid,
                status: 'success',
                gatewayOrderId: razorpay_order_id,
                gatewayPaymentId: razorpay_payment_id,
                gatewaySignature: razorpay_signature || null,
                rawResponse: JSON.stringify(rawResponse)
            }
        });
    });

    // Async Email Notification (Don't block response)
    try {
        const fullBooking = await prisma.booking.findUnique({
            where: { id: booking.id },
            include: { 
                hotel: {
                    include: { user: true }
                }, 
                room: true 
            }
        });
        
        if (fullBooking) {
            sendBookingEmails({
                id: fullBooking.id,
                guestName: `${fullBooking.guestFirstName} ${fullBooking.guestLastName}`,
                guestEmail: fullBooking.guestEmail,
                guestPhone: fullBooking.guestPhone,
                hotel: fullBooking.hotel,
                room: fullBooking.room,
                checkIn: fullBooking.checkIn,
                checkOut: fullBooking.checkOut,
                totalPrice: fullBooking.totalPrice,
                amountPaid: fullBooking.amountPaid
            });
        }
    } catch (emailErr) {
        console.error('Async booking email notification failed:', emailErr);
    }

    return { success: true };
}

// @desc    Verify Payment Signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature
    } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ success: false, message: 'Razorpay secret key is not configured.' });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    if (req.body.isPackage) {
        return res.status(200).json({
            success: true,
            message: 'Tour package payment verified successfully.',
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
        });
    }

    try {
        // Find the booking by Razorpay Order ID
        const booking = await prisma.booking.findUnique({
            where: { razorpayOrderId: razorpay_order_id }
        });

        if (!booking) {
            // For package bookings or direct orders without booking record
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully.',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id
            });
        }

        const result = await processSuccessfulPayment(booking, razorpay_order_id, razorpay_payment_id, razorpay_signature, req.body);
        return res.status(200).json({ success: true, message: 'Payment verified successfully.', ...result });
    } catch (err) {
        console.error('Verification Error:', err);
        return res.status(500).json({ success: false, message: 'Verification process failed' });
    }
};

// @desc    Handle Razorpay Webhook callback
// @route   POST /api/payments/webhook
// @access  Public
exports.razorpayWebhook = async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.warn('[Webhook] Warning: RAZORPAY_WEBHOOK_SECRET is not configured. Webhook ignored.');
        return res.status(200).json({ status: 'ignored', reason: 'secret missing' });
    }

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (expectedSignature !== signature) {
        console.warn('[Webhook] Warning: Invalid signature received on webhook endpoint');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Respond OK immediately to prevent timeouts from Razorpay
    res.status(200).json({ status: 'ok' });

    // Handle asynchronously
    try {
        const event = req.body.event;
        if (event === 'payment.captured') {
            const paymentPayload = req.body.payload.payment.entity;
            const razorpay_order_id = paymentPayload.order_id;
            const razorpay_payment_id = paymentPayload.id;

            console.log(`[Webhook] Processing captured payment for Order: ${razorpay_order_id}`);

            const booking = await prisma.booking.findUnique({
                where: { razorpayOrderId: razorpay_order_id }
            });

            if (booking) {
                await processSuccessfulPayment(booking, razorpay_order_id, razorpay_payment_id, null, req.body);
                console.log(`[Webhook] Booking ${booking.id} verified and confirmed via webhook.`);
            } else {
                console.warn(`[Webhook] No booking matches Razorpay Order: ${razorpay_order_id}`);
            }
        }
    } catch (err) {
        console.error('[Webhook] Error processing callback event:', err);
    }
};

// @desc    Fetch payment status manually from Razorpay API
// @route   POST /api/payments/fetch-status/:bookingId
// @access  Private
exports.fetchPaymentStatus = async (req, res) => {
    const bookingId = parseInt(req.params.bookingId);

    if (!razorpay) {
        return res.status(500).json({ success: false, message: 'Razorpay is not configured.' });
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!booking.razorpayOrderId) {
            return res.status(400).json({ success: false, message: 'No Razorpay Order ID associated with this booking' });
        }

        // Fetch payments for this order ID from Razorpay
        console.log(`[Manual Verify] Fetching payments for Order ID: ${booking.razorpayOrderId}`);
        const payments = await razorpay.orders.fetchPayments(booking.razorpayOrderId);

        if (!payments || !payments.items || payments.items.length === 0) {
            return res.status(200).json({ 
                success: false, 
                message: 'No payments found on Razorpay for this booking yet.', 
                status: booking.status,
                paymentStatus: booking.paymentStatus
            });
        }

        // Find any captured or authorized payment
        const successfulPayment = payments.items.find(p => p.status === 'captured' || p.status === 'authorized');

        if (successfulPayment) {
            console.log(`[Manual Verify] Found successful payment: ${successfulPayment.id}`);
            const result = await processSuccessfulPayment(
                booking, 
                booking.razorpayOrderId, 
                successfulPayment.id, 
                null, 
                successfulPayment
            );
            return res.status(200).json({ 
                success: true, 
                message: 'Payment verified successfully and booking confirmed.', 
                status: 'confirmed',
                paymentStatus: booking.paymentStatus === 'paid' ? 'paid' : 'partial',
                ...result
            });
        }

        return res.status(200).json({ 
            success: false, 
            message: 'No successful payment captured on Razorpay yet.',
            status: booking.status,
            paymentStatus: booking.paymentStatus
        });
    } catch (err) {
        console.error('Fetch Payment Status Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to verify payment status' });
    }
};
