const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching the 5 most recent bookings from the database...");
    const bookings = await prisma.booking.findMany({
        take: 5,
        orderBy: {
            id: 'desc'
        },
        include: {
            hotel: true
        }
    });

    if (bookings.length === 0) {
        console.log("No bookings found in the database.");
    } else {
        bookings.forEach(b => {
            console.log(`- ID: ${b.id} | Status: ${b.status} | Guest: ${b.guestFirstName} ${b.guestLastName} | Email: ${b.guestEmail} | Created: ${b.createdAt}`);
        });
    }
}

main()
    .catch(e => console.error("Database query failed:", e))
    .finally(() => prisma.$disconnect());
