const { PrismaClient } = require('@prisma/client');

// Connect to the production database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://vgyuvmpi_gethotel_db:shriyanshking@103.108.220.145:3306/vgyuvmpi_gethotel_db?connection_limit=5"
    }
  }
});

async function main() {
    console.log("Searching for hourly-enabled rooms in the PRODUCTION database...");
    try {
        const rooms = await prisma.room.findMany({
            where: {
                isHourlyEnabled: true
            },
            include: {
                hotel: {
                    select: {
                        id: true,
                        name: true,
                        isTrending: true,
                        isActive: true
                    }
                }
            }
        });
        console.log(`Found ${rooms.length} hourly rooms in PRODUCTION:`);
        rooms.forEach(r => {
            console.log(`Room ID: ${r.id} | Name: "${r.name}" | Hourly: ${r.isHourlyEnabled} | Hotel: "${r.hotel?.name}" (ID: ${r.hotel?.id}, Trending: ${r.hotel?.isTrending}, Active: ${r.hotel?.isActive})`);
        });

        console.log("\nChecking all active hotels in PRODUCTION:");
        const hotels = await prisma.hotel.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                isTrending: true,
                room: {
                    select: {
                        id: true,
                        name: true,
                        isHourlyEnabled: true
                    }
                }
            }
        });
        hotels.forEach(h => {
            const hourlyRoomsCount = h.room.filter(r => r.isHourlyEnabled).length;
            console.log(`Hotel: "${h.name}" (ID: ${h.id}, Trending: ${h.isTrending}) | Total Rooms: ${h.room.length} | Hourly Rooms: ${hourlyRoomsCount}`);
        });

    } catch (err) {
        console.error("Error connecting to production database:", err);
    }
    await prisma.$disconnect();
}

main();
