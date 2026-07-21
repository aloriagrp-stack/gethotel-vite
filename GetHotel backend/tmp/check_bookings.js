const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching bookings...");
    try {
        const bookings = await prisma.booking.findMany({
            take: 10,
            orderBy: { id: 'desc' },
            include: {
                hotel: { select: { name: true } },
                room: { select: { name: true } }
            }
        });
        console.log(`Found ${bookings.length} recent bookings:`);
        bookings.forEach(b => {
            console.log(`ID: ${b.id} | Status: ${b.status} | Payment: ${b.paymentStatus} | Price: ${b.totalPrice} | Paid: ${b.amountPaid} | Razorpay Order: ${b.razorpayOrderId} | Guest: ${b.guestFirstName} ${b.guestLastName}`);
        });
    } catch (err) {
        console.error("Query failed:", err);
    }
    await prisma.$disconnect();
}

main();
