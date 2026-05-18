const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.$queryRaw`DELETE FROM evaluation_campaigns WHERE id = '0c7659da-00d9-4824-a740-4f514bf6f6e5'::uuid;`
    console.log("Deleted count raw:", res);
  } catch(e) {
    console.log(e.code, e.meta)
  }
}
main();
