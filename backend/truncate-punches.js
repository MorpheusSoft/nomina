const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function truncatePunches() {
  const result = await prisma.attendancePunch.deleteMany({});
  console.log(`Borradas ${result.count} marcas de asistencia.`);
}

truncatePunches()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
