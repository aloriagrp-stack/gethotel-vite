const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  const delhi = await prisma.hotel.findMany({
    where: { isActive: true, city: { contains: "Delhi" } },
    select: {
      id: true, name: true, tagline: true, description: true, address: true,
      pricePerNight: true, starRating: true, guestRating: true, reviewCount: true,
      amenities: true, mainAmenities: true, badges: true, hotelUsername: true,
      dining: true, safety: true, policies: true, faqs: true, qualityScore: true,
      isTrending: true, isFeatured: true,
      room: { select: { id: true, name: true, pricePerNight: true, isHourlyEnabled: true, hourlyRates: true, maxOccupancy: true, status: true } },
    },
  });
  console.log("DELHI HOTEL DETAILS:", delhi.length);
  for (const h of delhi) {
    console.log("\n=== " + h.id + " | " + h.name + " | username=" + h.hotelUsername);
    console.log("  tagline:", h.tagline);
    console.log("  address:", h.address);
    console.log("  price:", h.pricePerNight, "| stars:", h.starRating, "| guestRating:", h.guestRating, "| reviews:", h.reviewCount, "| quality:", h.qualityScore);
    console.log("  amenities:", h.amenities);
    console.log("  mainAmenities:", h.mainAmenities);
    console.log("  badges:", h.badges);
    console.log("  rooms:", JSON.stringify(h.room).slice(0, 500));
  }

  const hourlyCount = await prisma.room.count({ where: { isHourlyEnabled: true } });
  console.log("\nHOURLY ROOMS TOTAL:", hourlyCount);

  const allAmenities = await prisma.hotel.findMany({ where: { isActive: true }, select: { amenities: true, mainAmenities: true } });
  const freq = {};
  allAmenities.forEach(h => {
    ["amenities", "mainAmenities"].forEach(k => {
      try {
        const arr = Array.isArray(h[k]) ? h[k] : JSON.parse(h[k] || "[]");
        arr.forEach(a => { const key = String(a).trim().toLowerCase(); freq[key] = (freq[key] || 0) + 1; });
      } catch {}
    });
  });
  console.log("\nAMENITY FREQUENCY (all hotels):");
  Object.entries(freq).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}
main().catch(e => { console.error("ERROR:", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
