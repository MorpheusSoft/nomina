const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  try {
    const testId = crypto.randomUUID();
    // 1. Create campaign
    const camp = await prisma.evaluationCampaign.create({
      data: {
        id: testId,
        tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5',
        name: 'Test Delete',
        startDate: new Date(),
        endDate: new Date(),
        status: 'DRAFT',
      }
    });
    console.log("Created", camp.id);
    
    // 2. Delete it using compound unique OR just id
    // Wait, does delete work with tenantId?
    const res = await prisma.evaluationCampaign.delete({
      where: { id: camp.id, tenantId: camp.tenantId }
    });
    console.log("Deleted", res.id);
  } catch(e) {
    console.log(e);
  }
}
main();
