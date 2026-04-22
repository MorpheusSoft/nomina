const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const vars = await prisma.globalVariable.findMany({ where: { code: { contains: 'fin_de_mes' } } });
  console.log('Global', vars);
  const vars2 = await prisma.payrollGroupVariable.findMany({ where: { code: { contains: 'fin_de_mes' } } });
  console.log('Group', vars2);
}
run();
