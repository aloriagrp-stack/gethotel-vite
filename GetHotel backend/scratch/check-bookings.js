const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const bookings = await prisma.booking.findMany({
        include: {
            hotel: true,
            user: true
        }
    });
    console.log(`Total bookings: ${bookings.length}`);
    bookings.forEach(b => {
        console.log(`ID: ${b.id}, Hotel: ${b.hotel.name}, User: ${b.user.name}, Status: ${b.status}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
