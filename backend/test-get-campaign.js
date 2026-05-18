const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.evaluationCampaign.findFirst();
  if (!c) {
    console.log("No campaigns found");
    return;
  }
  try {
    const campaign = await prisma.evaluationCampaign.findUnique({
      where: { id: c.id, tenantId: c.tenantId },
      include: {
        performanceReviews: {
          include: {
            evaluatee: true,
            supervisor: true,
            instances: true
          }
        }
      }
    });
    console.log("SUCCESS");
  } catch (e) {
    console.error("ERROR:", e);
  }
}
main();
