const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const punches = await prisma.attendancePunch.findMany({
    orderBy: { timestamp: 'asc' }
  });
  console.log('All punches dates:');
  const dows = punches.map(p => {
    const d = new Date(p.timestamp);
    return `${d.toISOString()} (Day ${d.getUTCDay()}) - processed: ${p.isProcessed}`;
  });
  console.table(dows);

  const dailies = await prisma.dailyAttendance.findMany({
    orderBy: { date: 'asc' }
  });
  console.log('Daily attendances:');
  const da = dailies.map(d => ({
    date: d.date.toISOString(),
    day: new Date(d.date).getUTCDay(),
    status: d.status
  }));
  console.table(da);

  const summaries = await prisma.attendanceSummary.findMany();
  console.log('Summaries:');
  const sm = summaries.map(s => ({
    daysWorked: s.daysWorked,
    satWorked: s.saturdaysWorked,
    sunWorked: s.sundaysWorked
  }));
  console.table(sm);
}
main().catch(console.error).finally(() => prisma.$disconnect());
