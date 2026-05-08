const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true }
        });
        console.log('Users:', JSON.stringify(users, null, 2));

        const hotels = await prisma.hotel.findMany({
            select: { id: true, name: true, userId: true }
        });
        console.log('Hotels:', JSON.stringify(hotels, null, 2));
    } catch (err) {
        console.error('Fetch failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
