const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to database...');
        const hotels = await prisma.hotel.findMany();
        console.log('Success! Found', hotels.length, 'hotels');
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
