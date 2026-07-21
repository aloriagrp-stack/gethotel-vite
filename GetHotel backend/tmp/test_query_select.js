const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting optimized query test using select...");
    try {
        const start = Date.now();
        const hotels = await prisma.hotel.findMany({
            where: { isTrending: true, isActive: true },
            select: {
                id: true,
                name: true,
                city: true,
                address: true,
                pricePerNight: true,
                starRating: true,
                guestRating: true,
                reviewCount: true,
                thumbnail: true,
                isFeatured: true,
                isTrending: true,
                isActive: true,
                room: {
                    select: {
                        id: true,
                        name: true,
                        pricePerNight: true,
                        isHourlyEnabled: true,
                        hourlyRates: true
                    }
                }
            },
            orderBy: [
                { guestRating: 'desc' },
                { reviewCount: 'desc' }
            ]
        });
        console.log(`Optimized query completed in ${Date.now() - start}ms`);
        console.log("Result count:", hotels.length);
        console.log("Hotels:", JSON.stringify(hotels, null, 2));
    } catch (err) {
        console.error("Optimized query failed:", err);
    }
    await prisma.$disconnect();
}

main();
