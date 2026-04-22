const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const workers = await prisma.worker.findMany({ select: { primaryIdentityNumber: true } });
  console.log('DB Workers Identities:', workers.map(w => `"${w.primaryIdentityNumber}"`));
}
check().finally(() => prisma.$disconnect());
