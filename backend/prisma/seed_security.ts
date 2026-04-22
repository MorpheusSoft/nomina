import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial security data...');
  // Find at least one tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('No tenant found. Run main seed first.');
    return;
  }

  // Create Master Role
  const role = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'SuperAdmin',
      permissions: ['ALL_ACCESS']
    }
  });

  // Create Admin User
  const passwordHash = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@nebulapayrolls.com' },
    update: { roleId: role.id, passwordHash, tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      roleId: role.id,
      email: 'admin@nebulapayrolls.com',
      passwordHash,
      firstName: 'Neo',
      lastName: 'Admin'
    }
  });

  console.log(`Security Seed Complete.`);
  console.log(`Admin User Created: ${user.email} / pass: 123456`);
}

main().catch(e => {
  console.error(e);
}).finally(() => {
  prisma.$disconnect();
});
