const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const policies = await prisma.$queryRaw`SELECT * FROM pg_policies WHERE tablename IN ('salary_histories', 'employment_records', 'payroll_receipts', 'departments')`;
  console.log(policies);
}
main();
