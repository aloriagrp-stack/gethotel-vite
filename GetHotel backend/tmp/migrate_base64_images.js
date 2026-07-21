const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { recursiveProcessBase64 } = require('../middleware/imageUpload');

async function migrate() {
    console.log("Starting optimized step-by-step DB base64 images migration...");

    // 1. Migrate Hotels
    const hotelIds = await prisma.hotel.findMany({
        select: { id: true, name: true }
    });
    console.log(`Found ${hotelIds.length} hotels. Processing one by one...`);

    for (const hInfo of hotelIds) {
        console.log(`\n[Hotel] Querying details for ID ${hInfo.id} (${hInfo.name})...`);
        const h = await prisma.hotel.findUnique({
            where: { id: hInfo.id },
            select: { id: true, name: true, thumbnail: true, images: true }
        });

        let updated = false;
        const updateData = {};

        if (h.thumbnail && h.thumbnail.startsWith('data:image/')) {
            console.log(`  -> Converting thumbnail for "${h.name}" (size: ${h.thumbnail.length} chars)...`);
            updateData.thumbnail = await recursiveProcessBase64(h.thumbnail);
            updated = true;
        }

        if (h.images && (h.images.includes('data:image/') || h.images.includes('base64'))) {
            console.log(`  -> Converting images for "${h.name}" (size: ${h.images.length} chars)...`);
            updateData.images = await recursiveProcessBase64(h.images);
            updated = true;
        }

        if (updated) {
            await prisma.hotel.update({
                where: { id: h.id },
                data: updateData
            });
            console.log(`  -> ✅ Successfully updated Hotel ID ${h.id}`);
        } else {
            console.log(`  -> No base64 images found for "${h.name}".`);
        }
    }

    // 2. Migrate Rooms
    const roomIds = await prisma.room.findMany({
        select: { id: true, name: true }
    });
    console.log(`\nFound ${roomIds.length} rooms. Processing one by one...`);

    for (const rInfo of roomIds) {
        const r = await prisma.room.findUnique({
            where: { id: rInfo.id },
            select: { id: true, name: true, images: true }
        });

        let updated = false;
        const updateData = {};

        if (r.images && (r.images.includes('data:image/') || r.images.includes('base64'))) {
            console.log(`[Room] Converting images for Room ID ${r.id} (${r.name}, size: ${r.images.length} chars)...`);
            updateData.images = await recursiveProcessBase64(r.images);
            updated = true;
        }

        if (updated) {
            await prisma.room.update({
                where: { id: r.id },
                data: updateData
            });
            console.log(`  -> ✅ Successfully updated Room ID ${r.id}`);
        }
    }

    console.log("\nMigration finished successfully!");
    await prisma.$disconnect();
}

migrate().catch(err => {
    console.error("Migration failed:", err);
});
