const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking trending and active status of hotels...");
    try {
        const total = await prisma.hotel.count();
        const active = await prisma.hotel.count({ where: { isActive: true } });
        const trending = await prisma.hotel.count({ where: { isTrending: true } });
        const activeTrending = await prisma.hotel.count({ where: { isActive: true, isTrending: true } });

        console.log(`Total: ${total}`);
        console.log(`Active: ${active}`);
        console.log(`Trending: ${trending}`);
        console.log(`Active & Trending: ${activeTrending}`);

        const trendingHotels = await prisma.hotel.findMany({
            where: { isTrending: true },
            select: { id: true, name: true, isActive: true }
        });
        console.log("Trending hotels in DB:", trendingHotels);
    } catch (err) {
        console.error("Error:", err);
    }
    await prisma.$disconnect();
}

main();
