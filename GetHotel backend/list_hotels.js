const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hotels = await prisma.hotel.findMany({
    select: { id: true, name: true, description: true }
  });
  console.log(JSON.stringify(hotels, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
