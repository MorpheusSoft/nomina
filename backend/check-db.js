const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const t = await prisma.tenant.findUnique({ where: { id: '91be4f61-2483-4a1d-a3d8-5b128c706fe5' } });
  console.log('legalKnowledgeBase length:', t.legalKnowledgeBase?.length);
}
check();
