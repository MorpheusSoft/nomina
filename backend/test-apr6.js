const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const punches = await prisma.attendancePunch.findMany({
    where: { timestamp: { gte: new Date('2026-04-05T20:00:00Z'), lte: new Date('2026-04-07T04:00:00Z') } },
    orderBy: { timestamp: 'asc' }
  });
  console.log('Punches Apr 6:', punches.map(p => ({
     d: p.timestamp,
     utcStr: p.timestamp.toISOString(),
     proc: p.isProcessed
  })));

  const daily = await prisma.dailyAttendance.findMany({
    where: { date: new Date('2026-04-06T00:00:00Z') }
  });
  console.log('Daily Apr 6:', daily);
}
main().catch(console.error).finally(() => prisma.$disconnect());
