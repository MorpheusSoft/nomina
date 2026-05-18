const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const reviewCount = await prisma.performanceReview.count({
      where: { campaignId: '0c7659da-00d9-4824-a740-4f514bf6f6e5' }
    });
    console.log("Reviews:", reviewCount);
    
    // The issue might be that Prisma throws when record is not found in delete. Let's see if we pass correct tenantId
    const camp = await prisma.evaluationCampaign.findUnique({
      where: { id: '0c7659da-00d9-4824-a740-4f514bf6f6e5' }
    });
    console.log("Campaign exists:", !!camp);
  } catch(e) {
    console.error("Error", e.message);
  }
}
main();
