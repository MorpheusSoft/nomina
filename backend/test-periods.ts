import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const periods = await prisma.payrollPeriod.findMany();
  console.log("All periods:", periods);
}
main().finally(() => prisma.$disconnect());
