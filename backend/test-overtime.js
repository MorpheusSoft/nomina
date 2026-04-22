const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dailies = await prisma.dailyAttendance.findMany({
    where: { date: new Date('2026-04-04T00:00:00Z') }
  });
  console.log('Daily attendances for Apr 4 (Sat):', dailies);
}
main().catch(console.error).finally(() => prisma.$disconnect());
