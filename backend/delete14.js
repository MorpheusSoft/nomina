const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.evaluationCampaign.deleteMany({
      where: { id: '0c7659da-00d9-4824-a740-4f514bf6f6e5' }
    });
    console.log("Deleted count:", res.count);
  } catch(e) {
    console.log(e.code, e.meta)
  }
}
main();
