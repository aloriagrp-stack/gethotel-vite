const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Updating coupon BASIC_DEAL_823 end date to 2026-12-31...");
    try {
        const res = await prisma.coupon.updateMany({
            where: { code: "BASIC_DEAL_823", hotelId: 13 },
            data: { endDate: new Date("2026-12-31T00:00:00.000Z") }
        });
        console.log("Update result:", res);
    } catch (err) {
        console.error("Update failed:", err);
    }
    await prisma.$disconnect();
}

main();
