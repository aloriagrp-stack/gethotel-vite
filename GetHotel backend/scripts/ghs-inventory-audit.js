const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", "..", "GetHotel backend", ".env") });

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  const total = await prisma.hotel.count();
  const active = await prisma.hotel.count({ where: { isActive: true } });
  console.log("TOTAL HOTELS:", total);
  console.log("ACTIVE HOTELS:", active);

  const byCity = await prisma.hotel.groupBy({
    by: ["city"],
    where: { isActive: true },
    _count: { id: true },
  });
  byCity.sort((a, b) => b._count.id - a._count.id);
  console.log("\n--- HOTELS BY CITY (active) ---");
  byCity.slice(0, 40).forEach(c => console.log(`${c.city}: ${c._count.id}`));

  // Delhi addresses — sample to infer localities
  const delhiHotels = await prisma.hotel.findMany({
    where: { isActive: true, city: { contains: "Delhi" } },
    select: { id: true, name: true, address: true, pricePerNight: true, starRating: true, qualityScore: true },
  });
  console.log("\nACTIVE DELHI HOTELS:", delhiHotels.length);
  const sample = delhiHotels.slice(0, 60);
  sample.forEach(h => console.log(`[${h.id}] ${h.name} | ${h.starRating}* | Rs${h.pricePerNight} | ${h.address}`));
}

main()
  .catch(e => { console.error("ERROR:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
