const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        name: true,
        city: true
      }
    });
    console.log('HOTELS_DATA_START');
    console.log(JSON.stringify(hotels, null, 2));
    console.log('HOTELS_DATA_END');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
