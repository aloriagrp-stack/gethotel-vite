const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Verifying Natraj Yes Please (ID 13) coupon validity...");
    try {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // 1. Fetch hotel rooms
        const rooms = await prisma.room.findMany({
            where: { hotelId: 13 }
        });
        console.log(`Found ${rooms.length} rooms.`);

        // 2. Fetch coupons
        const coupons = await prisma.coupon.findMany({
            where: { hotelId: 13 }
        });
        
        console.log("All coupons in DB:");
        coupons.forEach(c => {
            console.log(`- Code: ${c.code} | Active: ${c.isActive} | Start: ${c.startDate.toISOString().split('T')[0]} | End: ${c.endDate.toISOString().split('T')[0]}`);
        });

        // 3. Filter coupons by validity
        const activeCoupons = coupons.filter(c => {
            const isActive = c.isActive !== false;
            if (!isActive) return false;
            const startStr = c.startDate.toISOString().split('T')[0];
            const endStr = c.endDate.toISOString().split('T')[0];
            return todayStr >= startStr && todayStr <= endStr;
        });

        console.log("Active coupons according to validation:");
        activeCoupons.forEach(c => {
            console.log(`- Code: ${c.code} | Discount: ${c.discountValue}%`);
        });

        if (activeCoupons.length > 0) {
            console.log("\n✅ SUCCESS: Expired status resolved! The promotion is active and valid for today.");
        } else {
            console.log("\n❌ FAILED: No active coupon found.");
        }

    } catch (err) {
        console.error("Verification failed:", err);
    }
    await prisma.$disconnect();
}

main();
