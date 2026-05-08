require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('DATABASE_URL from env:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

async function main() {
    try {
        await prisma.$connect();
        const hotels = await prisma.hotel.findMany({ take: 1 });
        console.log('SUCCESS - found', hotels.length, 'hotels');
        console.log('First hotel:', hotels[0]?.name);
    } catch (err) {
        console.error('FAILED:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
