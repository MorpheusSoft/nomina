import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const periods = await prisma.payrollPeriod.findMany();
  console.log(periods.map(p => p.status));
}
main().finally(() => prisma.$disconnect());
