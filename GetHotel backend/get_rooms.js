const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rooms = await prisma.room.findMany({
        where: { hotelId: 19 }
    });
    console.log('Current rooms for Hotel 19:');
    console.log(JSON.stringify(rooms, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
