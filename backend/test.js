const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const reviews = await prisma.performanceReview.findMany({ where: { campaignId: '0c7659da-00d9-4824-a740-4f514bf6f6e5' } });
  console.log("Reviews for campaign:", reviews.length);
}
main();
