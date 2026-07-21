const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all hotels...");
    try {
        const hotels = await prisma.hotel.findMany({
            select: {
                id: true,
                name: true,
                isActive: true,
                city: true,
                address: true
            }
        });
        const slugify = (text) => {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        };
        console.log(`Found ${hotels.length} hotels:`);
        hotels.forEach(h => {
            console.log(`ID: ${h.id} | Active: ${h.isActive} | Name: "${h.name}" | City: "${h.city}" | Address: "${h.address}"`);
        });
    } catch (err) {
        console.error("Query failed:", err);
    }
    await prisma.$disconnect();
}

main();
