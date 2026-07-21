const prisma = require('../config/db');

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'super_admin' }
    });
    console.log('Super admins in database:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
