const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Searching for non-cottage hotels...');
  
  // Find all hotels
  const allHotels = await prisma.hotel.findMany({
    select: { id: true, name: true, description: true }
  });

  const toDelete = allHotels.filter(hotel => {
    const searchStr = `${hotel.name} ${hotel.description}`.toLowerCase();
    return !searchStr.includes('cottage');
  });

  if (toDelete.length === 0) {
    console.log('No non-cottage hotels found.');
    return;
  }

  const idsToDelete = toDelete.map(h => h.id);
  console.log(`Found ${idsToDelete.length} hotels to delete:`, toDelete.map(h => h.name));

  // Handle dependencies manually for these hotels
  console.log('Cleaning up related data...');
  
  await prisma.booking.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.review.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.staff.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.notification.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.coupon.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.payout.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.hotelwallet.deleteMany({ where: { hotelId: { in: idsToDelete } } });
  await prisma.room.deleteMany({ where: { hotelId: { in: idsToDelete } } });

  // Finally delete the hotels
  const result = await prisma.hotel.deleteMany({
    where: { id: { in: idsToDelete } }
  });

  console.log(`Successfully deleted ${result.count} hotels.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
