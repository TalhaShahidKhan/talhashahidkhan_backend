import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to initialize Prisma');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Wiping database...');

  try {
    // We execute deletes in a transaction to ensure everything succeeds or fails together.
    // Deletions are ordered to respect foreign key constraints (child records first).
    const [
      sessions,
      actionTokens,
      serviceRequests,
      servicePackageRequests,
      posts,
      services,
      servicePackages,
      projects,
      experiences,
      contacts,
      users,
    ] = await prisma.$transaction([
      prisma.authSession.deleteMany(),
      prisma.authActionToken.deleteMany(),
      prisma.serviceRequest.deleteMany(),
      prisma.servicePackageRequest.deleteMany(),
      prisma.post.deleteMany(),
      prisma.service.deleteMany(),
      prisma.servicePackage.deleteMany(),
      prisma.project.deleteMany(),
      prisma.experience.deleteMany(),
      prisma.contact.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log('✅ Database wiped successfully!');
    console.log('Deleted records summary:');
    console.log(`- Users: ${users.count}`);
    console.log(`- Auth Sessions: ${sessions.count}`);
    console.log(`- Auth Action Tokens: ${actionTokens.count}`);
    console.log(`- Posts: ${posts.count}`);
    console.log(`- Services: ${services.count}`);
    console.log(`- Service Packages: ${servicePackages.count}`);
    console.log(`- Service Requests: ${serviceRequests.count}`);
    console.log(`- Service Package Requests: ${servicePackageRequests.count}`);
    console.log(`- Projects: ${projects.count}`);
    console.log(`- Experiences: ${experiences.count}`);
    console.log(`- Contacts: ${contacts.count}`);
  } catch (error) {
    console.error('❌ Failed to wipe database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
