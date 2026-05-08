const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/gethotel';
console.log('[db.js] Connecting to DB:', DATABASE_URL);

const prisma = new PrismaClient({
    datasources: {
        db: { url: DATABASE_URL },
    },
});

module.exports = prisma;
