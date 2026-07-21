const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://vgyuvmpi_gethotel_db:shriyanshking@103.108.220.145:3306/vgyuvmpi_gethotel_db?connection_limit=5"
    }
  }
});

async function main() {
    console.log("Running production query test...");
    try {
        const stayType = 'hourly';
        let whereClause = { isActive: true };

        if (stayType === 'hourly') {
            const trendingHourlyCount = await prisma.hotel.count({
                where: {
                    isTrending: true,
                    isActive: true,
                    room: {
                        some: { isHourlyEnabled: true }
                    }
                }
            });
            console.log("trendingHourlyCount:", trendingHourlyCount);

            if (trendingHourlyCount > 0) {
                whereClause.isTrending = true;
                whereClause.room = {
                    some: { isHourlyEnabled: true }
                };
            } else {
                whereClause.room = {
                    some: { isHourlyEnabled: true }
                };
            }
        }

        console.log("whereClause:", JSON.stringify(whereClause, null, 2));

        const hotels = await prisma.hotel.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                isTrending: true,
                isActive: true,
                room: {
                    select: {
                        id: true,
                        name: true,
                        isHourlyEnabled: true
                    }
                }
            }
        });

        console.log("Resulting hotels count:", hotels.length);
        hotels.forEach(h => {
            console.log(`Hotel ID: ${h.id} | Name: "${h.name}" | Trending: ${h.isTrending} | Rooms Count: ${h.room.length}`);
        });

    } catch (e) {
        console.error("Query failed:", e);
    }
    await prisma.$disconnect();
}

main();
