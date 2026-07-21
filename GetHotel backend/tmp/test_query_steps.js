const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting step-by-step query diagnostics...");

    try {
        console.log("\nStep 1: Simple Hotel count");
        const t0 = Date.now();
        const cnt = await prisma.hotel.count();
        console.log(`Step 1 done. Count: ${cnt} in ${Date.now() - t0}ms`);
    } catch (err) {
        console.error("Step 1 failed:", err.message);
    }

    try {
        console.log("\nStep 2: Find trending active hotels (no relation, no sorting)");
        const t0 = Date.now();
        const hotels = await prisma.hotel.findMany({
            where: { isTrending: true, isActive: true }
        });
        console.log(`Step 2 done. Found: ${hotels.length} in ${Date.now() - t0}ms`);
    } catch (err) {
        console.error("Step 2 failed:", err.message);
    }

    try {
        console.log("\nStep 3: Find trending active hotels WITH sorting");
        const t0 = Date.now();
        const hotels = await prisma.hotel.findMany({
            where: { isTrending: true, isActive: true },
            orderBy: [
                { guestRating: 'desc' },
                { reviewCount: 'desc' }
            ]
        });
        console.log(`Step 3 done. Found: ${hotels.length} in ${Date.now() - t0}ms`);
    } catch (err) {
        console.error("Step 3 failed:", err.message);
    }

    try {
        console.log("\nStep 4: Find trending active hotels WITH relation (include room)");
        const t0 = Date.now();
        const hotels = await prisma.hotel.findMany({
            where: { isTrending: true, isActive: true },
            include: { room: true }
        });
        console.log(`Step 4 done. Found: ${hotels.length} in ${Date.now() - t0}ms`);
    } catch (err) {
        console.error("Step 4 failed:", err.message);
    }

    await prisma.$disconnect();
}

main();
