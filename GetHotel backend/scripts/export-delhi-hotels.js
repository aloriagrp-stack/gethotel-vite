const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

(async () => {
    const hotels = await prisma.hotel.findMany({
        where: { isActive: true, city: { contains: "Delhi" } },
        select: {
            id: true, name: true, city: true, address: true,
            pricePerNight: true, starRating: true, guestRating: true, reviewCount: true,
            amenities: true, mainAmenities: true, dining: true,
            room: { select: { id: true, name: true, pricePerNight: true, maxOccupancy: true, status: true } },
        },
    });
    const out = path.join(__dirname, "..", "..", "GetHotel-Vite", "scripts", "fixtures", "delhi-hotels.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(hotels, null, 2), "utf8");
    console.log(`Exported ${hotels.length} Delhi hotels to ${out}`);
    await prisma.$disconnect();
})().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
