const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const campaigns = await prisma.evaluationCampaign.findMany();
  console.log(campaigns.map(c => ({id: c.id, name: c.name, status: c.status})));
}
main();
