const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shifts = await prisma.shiftTemplate.findMany();
  console.log('ShiftTemplates:', shifts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
