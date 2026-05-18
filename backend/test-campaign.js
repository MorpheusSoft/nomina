const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const camps = await prisma.evaluationCampaign.findMany();
  console.log("All campaigns:");
  camps.forEach(c => console.log(c.id, c.name));
}
main();
