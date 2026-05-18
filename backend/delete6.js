const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const camps = await prisma.evaluationCampaign.findMany();
  console.log(camps.map(c => ({id: c.id, name: c.name})));
}
main();
