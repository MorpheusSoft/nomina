const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.evaluationCampaign.findUnique({
    where: { id: 'bd6c125d-bbd2-43bb-a5a4-c71d6f2c2ff3' },
    include: { performanceReviews: true }
  });
  console.log(c);
}
main();
