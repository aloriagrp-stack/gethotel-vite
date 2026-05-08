require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    try {
        // Check sizes of room images
        const rooms = await prisma.room.findMany({ select: { id: true, name: true, images: true } });
        for (const r of rooms) {
            const imgSize = r.images ? r.images.length : 0;
            console.log(`Room ${r.id} (${r.name}): images size = ${imgSize} bytes`);
        }
    } catch(e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
