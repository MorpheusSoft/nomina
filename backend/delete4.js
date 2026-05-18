const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const camps = await prisma.evaluationCampaign.findMany({
    include: { performanceReviews: true }
  });
  camps.forEach(c => {
    console.log(`Campaign ${c.name} (${c.id}) - Status: ${c.status} - Reviews: ${c.performanceReviews.length}`);
  });
}
main();
