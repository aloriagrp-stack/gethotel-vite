const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { fetchPaymentStatus } = require('../controllers/paymentController');
const prisma = require('../config/db');

async function test() {
    console.log("Mocking request to verify Booking 35...");
    const req = {
        params: { bookingId: 35 }
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

    try {
        await fetchPaymentStatus(req, res);
    } catch (err) {
        console.error("Error running controller:", err);
    }
    
    // Check booking status in DB after execution
    const updated = await prisma.booking.findUnique({
        where: { id: 35 }
    });
    console.log("\nBooking 35 after verification:", {
        id: updated.id,
        status: updated.status,
        paymentStatus: updated.paymentStatus,
        amountPaid: updated.amountPaid,
        razorpayPaymentId: updated.razorpayPaymentId
    });

    await prisma.$disconnect();
}

test();
