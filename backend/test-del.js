const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const tenant = await prisma.tenant.findFirst();
  console.log('Tenant:', tenant ? tenant.id : 'NONE');
}
main();
