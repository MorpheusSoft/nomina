const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const holidays = await prisma.holiday.findMany();
  console.log('Holidays in DB:', holidays);

  const dailies = await prisma.dailyAttendance.findMany({
    where: { date: { gte: new Date('2026-04-01T00:00:00Z'), lte: new Date('2026-04-03T23:59:59Z') } }
  });
  console.log('Daily records for April 1-3:', dailies);

  const summaries = await prisma.attendanceSummary.findMany();
  console.log('Summaries:', summaries);
}
main().catch(console.error).finally(() => prisma.$disconnect());
