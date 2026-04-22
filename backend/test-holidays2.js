const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const holidays = await prisma.holiday.findMany();
  console.log('Holidays in DB:', holidays);
}
main().catch(console.error).finally(() => prisma.$disconnect());
