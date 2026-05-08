const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { id: true, name: true, email: true, role: true } })
  .then(users => { console.log(JSON.stringify(users, null, 2)); })
  .catch(e => console.error(e.message))
  .finally(() => p.$disconnect());
