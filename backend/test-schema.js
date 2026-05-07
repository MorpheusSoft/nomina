const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const columns = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'salary_histories'
  `;
  console.log("salary_histories columns:", columns);
}
main();
