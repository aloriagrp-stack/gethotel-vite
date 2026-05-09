const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up mock data...');

  // 1. Find the hotel to KEEP
  const keepHotel = await prisma.hotel.findFirst({
    where: {
      name: {
        contains: 'Cottage Yes Please'
      }
    }
  });

  if (!keepHotel) {
    console.log('WARNING: "Hotel Cottage Yes Please" not found! No data deleted to be safe.');
    return;
  }

  console.log(`Keeping Hotel: ${keepHotel.name} (ID: ${keepHotel.id})`);

  // 2. Delete all bookings NOT related to this hotel
  const deletedBookings = await prisma.booking.deleteMany({
    where: {
      NOT: {
        hotelId: keepHotel.id
      }
    }
  });
  console.log(`Deleted ${deletedBookings.count} mock bookings.`);

  // 3. Delete all rooms NOT related to this hotel
  const deletedRooms = await prisma.room.deleteMany({
    where: {
      NOT: {
        hotelId: keepHotel.id
      }
    }
  });
  console.log(`Deleted ${deletedRooms.count} mock rooms.`);

  // 4. Delete all hotels NOT this one
  const deletedHotels = await prisma.hotel.deleteMany({
    where: {
      NOT: {
        id: keepHotel.id
      }
    }
  });
  console.log(`Deleted ${deletedHotels.count} mock hotels.`);

  // 5. Delete all partner requests (mock ones)
  const deletedRequests = await prisma.partnerrequest.deleteMany({});
  console.log(`Deleted all mock partner requests.`);

  console.log('Database cleanup finished successfully!');
}

main()
  .catch((e) => {
    console.error('ERROR:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
