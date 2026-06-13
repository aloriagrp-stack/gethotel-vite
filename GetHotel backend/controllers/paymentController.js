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
    const { bookingId } = req.body;

    if (!razorpay) {
        return res.status(500).json({ success: false, message: 'Razorpay is not configured. Please add Key ID and Secret to .env' });
    }

    try {
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
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            bookingId: booking.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
};

// @desc    Verify Payment Signature
// @route   POST /api/payments/verify
// @access  Private
// exports.verifyPayment = ... (defined below)
exports.verifyPayment = async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        booking_id
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

    try {
        // Find the booking by Razorpay Order ID
        const booking = await prisma.booking.findUnique({
            where: { razorpayOrderId: razorpay_order_id }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found for this order' });
        }

        if (isAuthentic) {
            // Idempotency Check: Prevent duplicate payment processing (Webhook safety)
            if (booking.status === 'confirmed' && (booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial')) {
                return res.status(200).json({ success: true, message: 'Payment already processed and verified.' });
            }

            const targetAmountPaid = booking.paymentStatus === 'paid' ? booking.totalPrice : Math.round(booking.totalPrice * 0.12);
            const targetPaymentStatus = booking.paymentStatus === 'paid' ? 'paid' : 'partial';

            // SUCCESS FLOW
            await prisma.$transaction(async (tx) => {
                // Concurrency Control: Lock the Booking row to prevent concurrent race conditions (pessimistic lock)
                const lockedBookings = await tx.$queryRaw`SELECT id, paymentStatus FROM booking WHERE id = ${booking.id} FOR UPDATE`;
                const lockedBooking = lockedBookings[0];
                
                if (lockedBooking && (lockedBooking.paymentStatus === 'paid' || lockedBooking.paymentStatus === 'partial') && lockedBooking.status === 'confirmed') {
                    // Already processed concurrently by another webhook request
                    return;
                }

                // 1. Update Booking
                await tx.booking.update({
                    where: { id: booking.id },
                    data: {
                        paymentStatus: targetPaymentStatus,
                        amountPaid: targetAmountPaid,
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature,
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
                        gatewaySignature: razorpay_signature,
                        rawResponse: JSON.stringify(req.body)
                    }
                });
            });

            res.status(200).json({ success: true, message: 'Payment verified successfully. Booking Fee collected.' });

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
        } else {
            // FAILED FLOW
            await prisma.transaction.create({
                data: {
                    bookingId: booking.id,
                    amount: booking.totalPrice * 0.12,
                    status: 'failed',
                    gatewayOrderId: razorpay_order_id,
                    gatewayPaymentId: razorpay_payment_id,
                    rawResponse: JSON.stringify({ ...req.body, error: 'Signature mismatch' })
                }
            });

            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: 'failed', paymentStatus: 'failed' }
            });

            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ success: false, message: 'Verification process failed' });
    }
};
