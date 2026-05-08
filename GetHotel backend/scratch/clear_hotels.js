const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Cleaning up all hotels and related data...');
        
        // Due to foreign key constraints, we should delete in a specific order if Cascade is not set
        // But since we want to clear EVERYTHING related to hotels:
        
        await prisma.booking.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.room.deleteMany({});
        await prisma.notification.deleteMany({});
        await prisma.coupon.deleteMany({});
        await prisma.staff.deleteMany({});
        await prisma.hotel.deleteMany({});
        
        console.log('Successfully cleared all hotel data.');
    } catch (e) {
        console.error('Error during cleanup:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
