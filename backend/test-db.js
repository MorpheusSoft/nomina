const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const reviews = await prisma.performanceReview.findMany({
    where: { status: 'COMPLETED', aiConsensusFeedback: { not: null } }
  });
  reviews.forEach(r => {
    let fb = typeof r.aiConsensusFeedback === 'string' ? JSON.parse(r.aiConsensusFeedback) : r.aiConsensusFeedback;
    console.log("Review ID:", r.id);
    console.log("Competency count:", fb?.competencyScores?.length);
    console.log("Scores:", fb?.competencyScores);
  });
}
main();
