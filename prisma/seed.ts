import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database');
}

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin account');
}

if (password.length < 8) {
  throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
}

const username = email.split('@')[0];
if (!username) {
  throw new Error('ADMIN_EMAIL must contain a valid username');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

try {
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { password: passwordHash, role: 'ADMIN' },
    });
    console.log(`Updated admin account for ${email}`);
  } else {
    const usernameOwner = await prisma.user.findUnique({ where: { username } });
    if (usernameOwner) {
      throw new Error(`Username "${username}" is already in use by another account`);
    }

    await prisma.user.create({
      data: {
        username,
        email,
        firstName: 'Admin',
        lastName: 'User',
        password: passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`Created admin account for ${email}`);
  }
} finally {
  await prisma.$disconnect();
}