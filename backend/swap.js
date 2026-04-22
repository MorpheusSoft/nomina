const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({ where: { email: "lindberghzambrano@gmail.com" }, data: { tenantId: "91be4f61-2483-4a1d-a3d8-5b128c706fe5" } });
  await prisma.user.update({ where: { email: "admin@nebulapayrolls.com" }, data: { tenantId: "d8a7e53d-6a65-471e-bff2-6f5bf6956450" } });
  console.log("Users swapped successfully!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
