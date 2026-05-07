const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "salary_histories" ENABLE ROW LEVEL SECURITY;`);
  await prisma.$executeRawUnsafe(`
    CREATE POLICY "tenant_isolation_policy" ON "salary_histories" FOR SELECT TO oracle_readonly 
    USING (
      tenant_id = current_setting('app.current_tenant_id', true)::uuid 
      AND (
        current_setting('app.has_confidential', true) = 'true' 
        OR employment_record_id IN (SELECT id FROM employment_records WHERE is_confidential = false)
      )
    );
  `);
  
  await prisma.$executeRawUnsafe(`ALTER TABLE "payroll_receipts" ENABLE ROW LEVEL SECURITY;`);
  await prisma.$executeRawUnsafe(`
    CREATE POLICY "tenant_isolation_policy" ON "payroll_receipts" FOR SELECT TO oracle_readonly 
    USING (
      tenant_id = current_setting('app.current_tenant_id', true)::uuid 
      AND (
        current_setting('app.has_confidential', true) = 'true' 
        OR worker_id IN (SELECT worker_id FROM employment_records WHERE is_confidential = false)
      )
    );
  `);
  console.log("RLS applied successfully");
}
main();
