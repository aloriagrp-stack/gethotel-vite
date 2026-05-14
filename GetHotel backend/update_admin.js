const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gethotelstays.com';
  const password = 'shriyanshking';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Try to find any user with super_admin role
  const admin = await prisma.user.findFirst({
    where: { role: 'super_admin' }
  });

  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: email,
        password: hashedPassword,
        name: 'Super Admin'
      }
    });
    console.log('SUCCESS: Super Admin updated!');
    console.log('Username:', email);
    console.log('Password:', password);
  } else {
    // If no admin exists, create one
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin'
      }
    });
    console.log('SUCCESS: Super Admin created!');
  }
}

main()
  .catch((e) => {
    console.error('ERROR:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
