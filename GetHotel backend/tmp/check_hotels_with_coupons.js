const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching hotels with coupons...");
    try {
        const hotels = await prisma.hotel.findMany({
            include: {
                coupon: true
            }
        });
        console.log(`Total hotels: ${hotels.length}`);
        hotels.forEach(h => {
            if (h.coupon && h.coupon.length > 0) {
                console.log(`- Hotel: ${h.name} (ID: ${h.id}) has ${h.coupon.length} coupons:`);
                h.coupon.forEach(c => {
                    console.log(`  * ${c.code} (${c.discountValue}%)`);
                });
            }
        });
    } catch (err) {
        console.error("Query failed:", err);
    }
    await prisma.$disconnect();
}

main();
