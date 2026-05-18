const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const instance = await prisma.evaluationInstance.findFirst();
  console.log(instance.token);
}
main().catch(console.error).finally(() => prisma.$disconnect());
