const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const campaigns = await prisma.evaluationCampaign.findMany();
  for (const c of campaigns) {
    const reviews = await prisma.performanceReview.count({ where: { campaignId: c.id } });
    console.log(c.name, c.status, reviews);
  }
}
main();
