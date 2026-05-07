const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const policies = await prisma.$queryRaw`SELECT * FROM pg_policies`;
  console.log(policies);
}
main();
