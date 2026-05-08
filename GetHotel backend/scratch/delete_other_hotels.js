const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function cleanup() {
    const KEEP_HOTEL_ID = 6; // hotel shriyansh

    // Find all other hotels
    const others = await p.hotel.findMany({
        where: { id: { not: KEEP_HOTEL_ID } },
        select: { id: true, name: true }
    });

    if (others.length === 0) {
        console.log("✅ No other hotels found. Nothing to delete.");
        return;
    }

    console.log(`Found ${others.length} hotel(s) to delete:`, others.map(h => `[${h.id}] ${h.name}`).join(', '));

    const otherIds = others.map(h => h.id);

    // Delete related records first (foreign key constraints)
    await p.booking.deleteMany({ where: { hotelId: { in: otherIds } } });
    await p.review.deleteMany({ where: { hotelId: { in: otherIds } } });
    await p.room.deleteMany({ where: { hotelId: { in: otherIds } } });
    await p.notification.deleteMany({ where: { hotelId: { in: otherIds } } });
    await p.coupon.deleteMany({ where: { hotelId: { in: otherIds } } });
    await p.staff.deleteMany({ where: { hotelId: { in: otherIds } } });
    await p.hotel.deleteMany({ where: { id: { in: otherIds } } });

    console.log(`✅ Successfully deleted ${others.length} hotel(s). "hotel shriyansh" (id: 6) is safe.`);
    await p.$disconnect();
}

cleanup().catch(e => { console.error(e.message); p.$disconnect(); });
