const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try { await prisma.$executeRawUnsafe(`SELECT tenant_id FROM salary_histories LIMIT 1`); console.log("salary_histories has tenant_id"); } catch(e) { console.log(e.message); }
  try { await prisma.$executeRawUnsafe(`SELECT tenant_id FROM payroll_receipts LIMIT 1`); console.log("payroll_receipts has tenant_id"); } catch(e) { console.log(e.message); }
}
main();
