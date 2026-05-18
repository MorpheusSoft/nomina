const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const camps = await prisma.evaluationCampaign.findMany();
  for (const c of camps) {
    console.log(c.id, c.name, c.tenantId);
  }
}
main();
