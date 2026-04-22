const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const punches = await prisma.attendancePunch.findMany();
  console.log('Punches:', punches.length, 'dates:', [...new Set(punches.map(p => p.timestamp.toISOString().substring(0,10)))]);
  const daily = await prisma.dailyAttendance.findMany();
  console.log('Daily records:', daily.length);
  const periods = await prisma.payrollPeriod.findMany({ select: { name: true, startDate: true, endDate: true } });
  console.log('Periods:', periods);
}
check().finally(() => prisma.$disconnect());
