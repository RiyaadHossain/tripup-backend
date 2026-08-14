import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/src/prisma/client';
import { SUPER_ADMIN_ROLE } from '../src/common/constants/permissions.constant';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('🌱  Starting Super Admin seed...\n');

  // 1. Ensure the Super Admin role exists
  const superAdminRole = await prisma.role.upsert({
    where: { name: SUPER_ADMIN_ROLE },
    update: {},
    create: {
      name: SUPER_ADMIN_ROLE,
      description: 'Unrestricted access to all features. Cannot be deleted.',
    },
  });
  console.log(`  ✔  Role "${SUPER_ADMIN_ROLE}" verified (id: ${superAdminRole.id})`);

  // 2. Prepare user details
  const SUPER_ADMIN_EMAIL = 'admin@tripup.com';
  const SUPER_ADMIN_PASSWORD = 'Admin@1234';
  const SUPER_ADMIN_NAME = 'Super Admin';

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  // 3. Create or update the Super Admin user
  const user = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      name: SUPER_ADMIN_NAME,
      passwordHash,
      roleId: superAdminRole.id,
      needPasswordChange: false, // Pre-verified, bypass mandatory password change
    },
    create: {
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      roleId: superAdminRole.id,
      needPasswordChange: false, // Pre-verified, bypass mandatory password change
    },
  });

  console.log(`  ✔  Super Admin user created/updated successfully:`);
  console.log(`     - Email: ${user.email}`);
  console.log(`     - Password: ${SUPER_ADMIN_PASSWORD}`);
  console.log(`     - Status: Active & Manually Verified (Need Password Change: false)`);
  console.log('\n✅  Super Admin seed completed successfully.\n');
}

main()
  .catch((e) => {
    console.error('❌  Super Admin seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
