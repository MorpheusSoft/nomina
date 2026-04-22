const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.payrollPeriod.findFirst({ where: { name: '1ra Quincena de Abril 2026' } });
  console.log(p);
}
run();
