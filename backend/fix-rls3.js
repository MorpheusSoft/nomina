const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "salary_histories" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "tenant_isolation_policy" ON "salary_histories" FOR SELECT TO oracle_readonly 
      USING (
        employment_record_id IN (
          SELECT id FROM employment_records 
          WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid 
          AND (
            current_setting('app.has_confidential', true) = 'true' 
            OR is_confidential = false
          )
        )
      );
    `);
    console.log("salary_histories RLS applied successfully");
  } catch(e) {
    console.log("Error salary_histories:", e.message);
  }

  try {
    const prCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'payroll_receipts'`;
    console.log("payroll_receipts columns:", prCols.map(c=>c.column_name));
  } catch(e) {}
}
main();
