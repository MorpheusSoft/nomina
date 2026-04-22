const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  let count = 0;
  for (const user of users) {
    const existing = await prisma.userTenantAccess.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId: user.tenantId } }
    });
    if (!existing) {
      await prisma.userTenantAccess.create({
        data: {
          userId: user.id,
          tenantId: user.tenantId,
          roleId: user.roleId
        }
      });
      count++;
    }
  }
  console.log(`Backfilled ${count} UserTenantAccess records.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
