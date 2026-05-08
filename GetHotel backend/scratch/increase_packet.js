const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('SET GLOBAL max_allowed_packet = 67108864;');
    console.log('Successfully increased max_allowed_packet to 64MB');
  } catch (error) {
    console.error('Failed to increase packet size:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
