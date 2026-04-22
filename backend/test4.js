const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const c = await prisma.concept.findFirst({ where: { code: 'D001' } });
  console.log(c.condition);
}
run();
