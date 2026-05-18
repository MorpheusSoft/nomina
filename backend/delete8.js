const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.evaluationCampaign.delete({
      where: { id: 'bd6c125d-bbd2-43bb-a5a4-c71d6f2c2ff3', tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5' }
    });
    console.log("Deleted", res);
  } catch(e) {
    console.error("Error", e);
  }
}
main();
