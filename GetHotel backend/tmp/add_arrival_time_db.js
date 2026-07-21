const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$executeRawUnsafe(`ALTER TABLE booking ADD COLUMN arrivalTime VARCHAR(50) DEFAULT NULL;`);
    console.log("Successfully executed raw query. Result:", result);
  } catch (err) {
    console.error("Error executing raw query:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
