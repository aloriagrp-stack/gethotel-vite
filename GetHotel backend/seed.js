const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data with strict JSON formats...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create a Partner User
  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      role: 'hotel_admin'
    }
  });

  // 2. Create Hotels
  const hotelsData = [
    { name: 'The Taj Palace', city: 'New Delhi', address: 'Sardar Patel Marg', pricePerNight: 15000, description: 'Luxury at its best', tagline: 'The pride of India' },
    { name: 'Oberoi Amarvilas', city: 'Agra', address: 'Taj East Gate Road', pricePerNight: 25000, description: 'View of the Taj Mahal', tagline: 'A monument to love' },
    { name: 'Rambagh Palace', city: 'Jaipur', address: 'Bhawani Singh Road', pricePerNight: 20000, description: 'Royal heritage', tagline: 'Live like a King' },
    { name: 'The Leela Mumbai', city: 'Mumbai', address: 'Sahar', pricePerNight: 12000, description: 'Business and luxury', tagline: 'Mumbai Essence' }
  ];

  for (const h of hotelsData) {
    const hotel = await prisma.hotel.create({
      data: {
        ...h,
        userId: partnerUser.id,
        thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
        amenities: JSON.stringify(['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945']),
        badges: JSON.stringify(['Trusted Partner', 'Top Selling'])
      }
    });

    // 3. Create a Room for this hotel
    const room = await prisma.room.create({
      data: {
        name: 'Deluxe King Room',
        pricePerNight: h.pricePerNight,
        maxOccupancy: 2,
        hotelId: hotel.id,
        description: 'Spacious room with king size bed',
        amenities: JSON.stringify(['AC', 'TV', 'Mini Bar']),
        images: JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945'])
      }
    });

    // 4. Create some Bookings for this room
    await prisma.booking.create({
      data: {
        userId: partnerUser.id, 
        hotelId: hotel.id,
        roomId: room.id,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000 * 2),
        totalPrice: h.pricePerNight * 2,
        totalGuests: 2,
        paymentStatus: 'paid',
        status: 'confirmed',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestEmail: 'customer@example.com',
        guestPhone: '9876543210'
      }
    });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('ERROR:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
