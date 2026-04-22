const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.attendancePunch.updateMany({
    data: { isProcessed: false }
  });
  console.log('Reset punches!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
