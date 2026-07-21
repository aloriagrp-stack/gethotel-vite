const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Running getTrendingHotels query...");
    try {
        const start = Date.now();
        const hotels = await prisma.hotel.findMany({
            where: { isTrending: true, isActive: true },
            include: { room: true },
            orderBy: [
                { guestRating: 'desc' },
                { reviewCount: 'desc' }
            ]
        });
        console.log(`Query completed in ${Date.now() - start}ms`);
        console.log("Result count:", hotels.length);
        console.log("Hotels:", hotels.map(h => ({ id: h.id, name: h.name, roomsCount: h.room.length })));
    } catch (err) {
        console.error("Query failed:", err);
    }
    await prisma.$disconnect();
}

main();
