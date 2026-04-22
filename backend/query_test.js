const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: 'dfe419b7-ca5e-4815-9b09-67978a064722' },
    include: { payrollGroup: true }
  });
  console.log(period);
  console.log('Group Roots:');
  console.log(period.payrollGroup.rootRegularConceptId);
  console.log(period.payrollGroup.rootVacationConceptId);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
