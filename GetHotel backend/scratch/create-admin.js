const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const user = await prisma.user.upsert({
            where: { email: 'admin@gethotel.in' },
            update: { 
                role: 'super_admin',
                password: hashedPassword
            },
            create: {
                name: 'Super Admin',
                email: 'admin@gethotel.in',
                password: hashedPassword,
                role: 'super_admin'
            }
        });
        console.log('--- ADMIN CREATED ---');
        console.log('Email: admin@gethotel.in');
        console.log('Password: admin123');
        console.log('Role: super_admin');
        console.log('---------------------');
    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
