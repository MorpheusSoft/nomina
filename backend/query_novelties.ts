import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const period = await prisma.payrollPeriod.findUnique({ where: { id: "4a562332-6377-4c33-a496-601c60a2c991" } });
  console.log("Period:", period);
  const novelties = await prisma.workerNovelty.findMany();
  console.log("Novelties:", novelties);
}
main().finally(() => prisma.$disconnect());
