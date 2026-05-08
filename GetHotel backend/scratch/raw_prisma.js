const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient({
    datasources: { db: { url: 'mysql://root:@127.0.0.1:3306/gethotel' } },
    log: ['query', 'error', 'warn']
});

p.hotel.findMany({ take: 1 })
    .then(r => { console.log('OK:', r.length, 'hotels'); return p.$disconnect(); })
    .catch(e => { console.error('ERR:', e.message); return p.$disconnect(); });
