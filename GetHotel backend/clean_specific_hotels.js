const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up all hotels except "cottage yes please"...');
  
  // Find all hotels
  const allHotels = await prisma.hotel.findMany({
    select: { id: true, name: true }
  });

  const toDelete = allHotels.filter(hotel => {
    const name = hotel.name.toLowerCase();
    return !name.includes('cottage yes please');
  });

  if (toDelete.length === 0) {
    console.log('No other hotels found.');
    return;
  }

  const idsToDelete = toDelete.map(h => h.id);
  console.log(`Deleting ${idsToDelete.length} hotels:`, toDelete.map(h => h.name));

  // Handle dependencies
  await prisma.booking.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.review.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.staff.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.notification.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.coupon.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.payout.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.hotelwallet.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.room.deleteMany({ where: { hotelId: { in: idsToDelete } } });

  const result = await prisma.hotel.deleteMany({
    where: { id: { in: idsToDelete } }
  });

  console.log(`Successfully deleted ${result.count} hotels.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
