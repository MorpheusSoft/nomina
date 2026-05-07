const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "payroll_receipts" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "tenant_isolation_policy" ON "payroll_receipts" FOR SELECT TO oracle_readonly 
      USING (
        worker_id IN (
          SELECT id FROM workers 
          WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid 
          AND (
            current_setting('app.has_confidential', true) = 'true' 
            OR NOT (id IN (SELECT worker_id FROM employment_records WHERE is_confidential = true))
          )
        )
      );
    `);
    console.log("payroll_receipts RLS applied successfully");
  } catch(e) {
    console.log("Error payroll_receipts:", e.message);
  }
}
main();
