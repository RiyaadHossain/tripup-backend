/**
 * Seed: Permissions + Super Admin Role + Super Admin User
 *
 * Generates all module × action permission combinations, creates the
 * Super Admin role, assigns all permissions to it, and creates an
 * initial Super Admin user.
 *
 * Run:
 *   npm run seed:permissions
 *
 * Safe to re-run (uses upsert throughout).
 */

import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/src/prisma/client';
import {
  APP_MODULES,
  PERMISSION_ACTIONS,
  SUPER_ADMIN_ROLE,
} from '../src/common/constants/permissions.constant';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ---------------------------------------------------------------------------
// Configurable seed values — change before first run if needed
// ---------------------------------------------------------------------------
const SUPER_ADMIN_EMAIL = 'admin@tripup.com';
const SUPER_ADMIN_PASSWORD = 'Admin@1234';
const SUPER_ADMIN_NAME = 'Super Admin';

async function main() {
  console.log('🌱  Starting permission seed...\n');

  // 1. Upsert all permissions (12 modules × 4 actions = 48 records)
  const permissionIds: string[] = [];

  for (const module of APP_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { module_action: { module, action: action as any } },
        update: {},
        create: { module, action: action as any },
      });
      permissionIds.push(permission.id);
      console.log(`  ✔  ${module}.${action.toLowerCase()}`);
    }
  }

  console.log(`\n  Created / verified ${permissionIds.length} permissions.\n`);

  // 2. Upsert the Super Admin role
  const superAdminRole = await prisma.role.upsert({
    where: { name: SUPER_ADMIN_ROLE },
    update: {},
    create: {
      name: SUPER_ADMIN_ROLE,
      description: 'Unrestricted access to all features. Cannot be deleted.',
    },
  });

  console.log(`  ✔  Role: "${SUPER_ADMIN_ROLE}" (id: ${superAdminRole.id})\n`);

  // 3. Assign all permissions to Super Admin (idempotent — skip existing pairs)
  for (const permissionId of permissionIds) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId,
      },
    });
  }

  console.log(
    `  ✔  All ${permissionIds.length} permissions assigned to "${SUPER_ADMIN_ROLE}".\n`,
  );

  // 4. Upsert the initial Super Admin user
  const existingUser = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (existingUser) {
    // Only update the role link if it isn't already set
    if (existingUser.roleId !== superAdminRole.id) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { roleId: superAdminRole.id },
      });
      console.log(`  ✔  Updated role for existing user: ${SUPER_ADMIN_EMAIL}`);
    } else {
      console.log(`  ✔  Super Admin user already exists: ${SUPER_ADMIN_EMAIL}`);
    }
  } else {
    const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
    await prisma.user.create({
      data: {
        name: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        passwordHash,
        roleId: superAdminRole.id,
      },
    });
    console.log(`✔ Created Super Admin user: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Default password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('⚠️ Change this password immediately after first login!\n');
  }

  console.log('\n✅  Seed completed successfully.\n');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
