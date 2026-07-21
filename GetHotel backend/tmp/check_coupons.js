const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching coupons for Hotel 13...");
    try {
        const coupons = await prisma.coupon.findMany({
            where: { hotelId: 13 }
        });
        console.log("Coupons:", JSON.stringify(coupons, null, 2));
    } catch (err) {
        console.error("Query failed:", err);
    }
    await prisma.$disconnect();
}

main();
