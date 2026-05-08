// Simulate exactly what server.js does
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Step 1: Env loaded. DATABASE_URL =', process.env.DATABASE_URL);

// Load config/db.js - same as controllers do
const prisma = require('../config/db');

console.log('Step 2: Prisma instance created');

async function testQuery() {
    try {
        console.log('Step 3: Calling prisma.$connect()...');
        await prisma.$connect();
        console.log('Step 4: $connect() succeeded');

        console.log('Step 5: Calling prisma.hotel.findMany()...');
        const hotels = await prisma.hotel.findMany({ take: 1 });
        console.log('Step 6: SUCCESS! Hotels:', hotels.length);
    } catch(err) {
        console.error('FAILED at step:', err.message);
        console.error('Error code:', err.code);
        console.error('Full error:', err);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}
testQuery();
