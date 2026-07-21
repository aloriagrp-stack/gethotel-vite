const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const crypto = require('crypto');
const { razorpayWebhook } = require('../controllers/paymentController');
const prisma = require('../config/db');

// Set a test webhook secret if not already set, or use the one from environment
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_123';
process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

async function test() {
    console.log("Mocking webhook request for Booking 33...");
    
    // Booking 33 has order ID: order_T1EciDPW5Jx2Z2
    const payload = {
        entity: "event",
        event: "payment.captured",
        payload: {
            payment: {
                entity: {
                    id: "pay_mock_webhook_1234",
                    entity: "payment",
                    amount: 100,
                    currency: "INR",
                    status: "captured",
                    order_id: "order_T1EciDPW5Jx2Z2",
                    vpa: "success@razorpay",
                    email: "guest@gmail.com",
                    contact: "+919000000000"
                }
            }
        }
    };

    const payloadString = JSON.stringify(payload);
    
    // Generate valid Razorpay signature
    const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

    const req = {
        headers: {
            'x-razorpay-signature': signature
        },
        body: payload
    };
    
    // Mock response object
    const res = {
        status: function(code) {
            console.log(`Response Status Code: ${code}`);
            return this;
        },
        json: function(data) {
            console.log("Response JSON:", JSON.stringify(data, null, 2));
            return this;
        }
    };

    // Verify initial status of Booking 33
    const initialBooking = await prisma.booking.findUnique({
        where: { id: 33 }
    });
    console.log("Initial Booking 33 Status:", initialBooking.status);

    try {
        await razorpayWebhook(req, res);
        
        // Wait a short moment since webhook processes asynchronously after response
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
        console.error("Error running controller:", err);
    }
    
    // Check booking status in DB after execution
    const updated = await prisma.booking.findUnique({
        where: { id: 33 }
    });
    console.log("\nBooking 33 after Webhook processing:", {
        id: updated.id,
        status: updated.status,
        paymentStatus: updated.paymentStatus,
        amountPaid: updated.amountPaid,
        razorpayPaymentId: updated.razorpayPaymentId
    });

    await prisma.$disconnect();
}

test();
