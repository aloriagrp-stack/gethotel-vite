const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'aloriagrp@gmail.com';
  const password = 'shriyansh12';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.findUnique({
    where: { email: email }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        role: 'hotel_admin' // Ensure role is correct
      }
    });
    console.log('SUCCESS: Partner account (aloriagrp@gmail.com) updated and password reset to: shriyansh12');
  } else {
    // If user doesn't exist, create it
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: 'Aloria Partner',
        role: 'hotel_admin'
      }
    });
    console.log('SUCCESS: Partner account (aloriagrp@gmail.com) created with password: shriyansh12');
  }
}

main()
  .catch((e) => {
    console.error('ERROR:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
