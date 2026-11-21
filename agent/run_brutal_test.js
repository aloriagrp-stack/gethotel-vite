const path = require('path');
const backendDir = path.join(__dirname, '..', 'GetHotel backend');
process.chdir(backendDir);

const jwt = require(path.join(backendDir, 'node_modules', 'jsonwebtoken'));
require(path.join(backendDir, 'node_modules', 'dotenv')).config({ path: path.join(backendDir, '.env') });
const prisma = require(path.join(backendDir, 'config', 'db'));

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function runBrutalTest() {
    console.log("=================================================");
    console.log("🔥 STARTING BRUTAL BOOKING & PAYMENT GATEWAY TEST");
    console.log("=================================================");

    // 1. Get an existing user, hotel, and room
    const user = await prisma.user.findFirst({ where: { role: 'user' } }) || await prisma.user.findFirst();
    const hotel = await prisma.hotel.findFirst({ include: { room: true } });
    const room = hotel.room[0];

    console.log(`\n[Setup] Test User ID: ${user.id} (${user.email})`);
    console.log(`[Setup] Hotel: ${hotel.name} (ID: ${hotel.id}), Room: ${room.name} (ID: ${room.id})`);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const dIn = new Date();
    dIn.setDate(dIn.getDate() + 10);
    const dOut = new Date();
    dOut.setDate(dOut.getDate() + 12);

    const checkInStr = dIn.toISOString().split('T')[0];
    const checkOutStr = dOut.toISOString().split('T')[0];

    // =========================================================================
    // TEST 1: User selects Online Payment, then cancels/dismisses modal
    // =========================================================================
    console.log("\n🧪 TEST 1: User selects ONLINE PAYMENT and dismisses/cancels Razorpay...");

    const onlineBookingPayload = {
        hotelId: hotel.id,
        rooms: [{ id: room.id, quantity: 1 }],
        checkIn: checkInStr,
        checkOut: checkOutStr,
        totalGuests: 2,
        status: 'held',
        paymentStatus: 'pending',
        paymentMode: 'pay_full_online',
        guestInfo: {
            firstName: "Brutal",
            lastName: "Tester",
            email: "brutal@gethotelstays.com",
            phone: "+919999999999"
        }
    };

    const res1 = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(onlineBookingPayload)
    });
    const data1 = await res1.json();

    if (!data1.success || !data1.booking?.id) {
        throw new Error(`Failed to create online booking: ${JSON.stringify(data1)}`);
    }
    const bId1 = data1.booking.id;
    console.log(`  -> Online Booking created with ID: ${bId1}`);
    console.log(`  -> Initial Status: '${data1.booking.status}', PaymentStatus: '${data1.booking.paymentStatus}'`);
    console.log(`  -> Internal Notes: '${data1.booking.internalNotes}'`);

    if (data1.booking.status !== 'held') {
        throw new Error(`FAIL: Expected status to be 'held', got '${data1.booking.status}'`);
    }
    if (data1.booking.internalNotes.includes('PAY_AT_HOTEL')) {
        throw new Error(`FAIL: Online booking internalNotes contains PAY_AT_HOTEL!`);
    }
    console.log("  ✅ Check passed: Created as 'held' and NOT 'PAY_AT_HOTEL'.");

    // Simulate user dismissing the Razorpay modal -> Frontend calls cancelBooking
    console.log(`  -> Simulating user clicks Back/Cancel on Razorpay modal...`);
    const cancelRes = await fetch(`http://localhost:5000/api/bookings/${bId1}/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: "Payment window closed by user without paying" })
    });
    const cancelData = await cancelRes.json();
    console.log(`  -> Cancel Response Status: ${cancelRes.status}`);

    // Verify in database
    const dbBooking1 = await prisma.booking.findUnique({ where: { id: bId1 } });
    console.log(`  -> DB Status after cancel: '${dbBooking1.status}', PaymentStatus: '${dbBooking1.paymentStatus}'`);
    if (dbBooking1.status !== 'cancelled') {
        throw new Error(`FAIL: Expected DB status to be 'cancelled', got '${dbBooking1.status}'`);
    }
    if (dbBooking1.paymentStatus !== 'failed') {
        throw new Error(`FAIL: Expected paymentStatus to be 'failed', got '${dbBooking1.paymentStatus}'`);
    }
    console.log("  ✅ Check passed: Cancelled held booking is immediately marked cancelled/failed!");

    // =========================================================================
    // TEST 2: User abandons checkout (closes tab) -> Auto-Expiry Verification
    // =========================================================================
    console.log("\n🧪 TEST 2: User closes tab on Razorpay (abandoned) -> Auto-Expiry Test...");
    const res2 = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(onlineBookingPayload)
    });
    const data2 = await res2.json();
    const bId2 = data2.booking.id;
    console.log(`  -> Created second online booking ID: ${bId2} with status '${data2.booking.status}'`);

    // Manually wind back holdExpiresAt to simulate 10 minutes passing
    await prisma.booking.update({
        where: { id: bId2 },
        data: { holdExpiresAt: new Date(Date.now() - 60000) } // 1 minute in the past
    });
    console.log(`  -> Time elapsed simulated: holdExpiresAt is now in the past.`);

    // User calls getMyBookings
    console.log(`  -> User opens /my-bookings...`);
    const myBookingsRes = await fetch('http://localhost:5000/api/bookings/my-bookings', { headers });
    const myBookingsData = await myBookingsRes.json();
    
    const foundB2 = myBookingsData.data.find(b => b.id === bId2);
    console.log(`  -> In /my-bookings: Booking ${bId2} Status is '${foundB2?.status}', PaymentStatus: '${foundB2?.paymentStatus}'`);

    if (foundB2.status !== 'cancelled') {
        throw new Error(`FAIL: Stale hold was NOT auto-expired to 'cancelled'! Got: '${foundB2?.status}'`);
    }
    if (foundB2.paymentStatus !== 'failed') {
        throw new Error(`FAIL: Stale hold paymentStatus is NOT 'failed'! Got: '${foundB2?.paymentStatus}'`);
    }
    console.log("  ✅ Check passed: Abandoned checkout was AUTOMATICALLY EXPIRED on getMyBookings!");

    // =========================================================================
    // TEST 3: Genuine Pay At Hotel Booking
    // =========================================================================
    console.log("\n🧪 TEST 3: User genuinely chooses PAY AT HOTEL...");
    const payAtHotelPayload = {
        hotelId: hotel.id,
        rooms: [{ id: room.id, quantity: 1 }],
        checkIn: checkInStr,
        checkOut: checkOutStr,
        totalGuests: 2,
        status: 'confirmed',
        paymentStatus: 'pending',
        paymentMode: 'pay_at_hotel',
        guestInfo: {
            firstName: "Genuine",
            lastName: "PayAtHotelGuest",
            email: "genuine@gethotelstays.com",
            phone: "+919888888888"
        }
    };

    const res3 = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(payAtHotelPayload)
    });
    const data3 = await res3.json();
    const bId3 = data3.booking.id;
    console.log(`  -> Pay At Hotel Booking ID: ${bId3}`);
    console.log(`  -> Status: '${data3.booking.status}', PaymentStatus: '${data3.booking.paymentStatus}'`);
    console.log(`  -> Internal Notes: '${data3.booking.internalNotes}'`);

    if (data3.booking.status !== 'confirmed') {
        throw new Error(`FAIL: Genuine Pay At Hotel booking should be 'confirmed', got '${data3.booking.status}'`);
    }
    if (!data3.booking.internalNotes.includes('PAY_AT_HOTEL')) {
        throw new Error(`FAIL: Genuine Pay At Hotel internalNotes missing PAY_AT_HOTEL`);
    }

    // Check getMyBookings for genuine Pay at Hotel
    const myBookingsRes3 = await fetch('http://localhost:5000/api/bookings/my-bookings', { headers });
    const myBookingsData3 = await myBookingsRes3.json();
    const foundB3 = myBookingsData3.data.find(b => b.id === bId3);

    console.log(`  -> In /my-bookings: Booking ${bId3} paymentMode is '${foundB3?.paymentMode}'`);
    if (foundB3.paymentMode !== 'pay_at_hotel') {
        throw new Error(`FAIL: Expected paymentMode to be 'pay_at_hotel', got '${foundB3?.paymentMode}'`);
    }
    console.log("  ✅ Check passed: Genuine Pay at Hotel correctly identified as 'pay_at_hotel'!");

    // Clean up test bookings
    await prisma.booking.deleteMany({
        where: { id: { in: [bId1, bId2, bId3] } }
    });
    console.log("\n[Teardown] Cleaned up temporary test bookings.");

    console.log("\n=================================================");
    console.log("🎯 ALL BRUTAL TESTS PASSED WITH 100% SUCCESS!");
    console.log("=================================================");
    process.exit(0);
}

runBrutalTest().catch(err => {
    console.error("\n❌ BRUTAL TEST FAILED:", err);
    process.exit(1);
});
