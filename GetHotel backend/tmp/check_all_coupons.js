const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all coupons from the database...");
    try {
        const coupons = await prisma.coupon.findMany({
            include: {
                hotel: { select: { id: true, name: true } }
            }
        });
        console.log(`Total coupons found: ${coupons.length}`);
        coupons.forEach(c => {
            console.log(`- Code: ${c.code} | Value: ${c.discountValue} | Active: ${c.isActive} | Hotel: ${c.hotel ? c.hotel.name + ' (ID: ' + c.hotel.id + ')' : 'Global'}`);
        });
    } catch (err) {
        console.error("Query failed:", err);
    }
    await prisma.$disconnect();
}

main();
