const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function main() {
  const prs = await prisma.performanceReview.findMany({
    where: { instances: { none: {} } } // PRs without instances
  });
  
  if (prs.length === 0) {
    console.log("No missing instances.");
    return;
  }
  
  const instancesToCreate = [];
  for (const pr of prs) {
    instancesToCreate.push({
      performanceReviewId: pr.id,
      evaluatorType: 'SELF',
      token: uuidv4()
    });
    instancesToCreate.push({
      performanceReviewId: pr.id,
      evaluatorType: 'SUPERVISOR',
      token: uuidv4()
    });
  }
  
  await prisma.evaluationInstance.createMany({ data: instancesToCreate });
  console.log(`Created ${instancesToCreate.length} missing instances.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
