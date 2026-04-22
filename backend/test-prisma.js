const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.costCenter.create({
      data: { name: "Oficina Caracas", accountingCode: "-01", tenantId: "91be4f61-2483-4a1d-a3d8-5b128c706fe5" }
    });
    console.log(res);
  } catch(e) { console.error(e.message); }
}
main();
