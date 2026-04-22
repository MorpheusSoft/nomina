const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.concept.findFirst({ where: { code: 'A001' } });
  if (c) console.log(`Formula for ${c.code} (${c.name}): ${c.formulaAmount}`);
  else console.log('A001 not found.');
  
  // Let's also find all group variables
  const vars = await prisma.payrollGroupVariable.findMany({ 
    include: { payrollGroup: { select: { name: true } } } 
  });
  console.log('Group Variables:', vars.map(v => `${v.code} (${v.value})`));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
