import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tenant = await prisma.tenant.create({ data: { name: 'Test Tenant', domain: 'test' } });
  const cc = await prisma.costCenter.create({ data: { name: 'CC1', accountingCode: '01', tenantId: tenant.id } });
  
  try {
    const v = await (prisma as any).costCenterVariable.create({
      data: {
        costCenterId: cc.id,
        code: 'TEST_VAR',
        name: 'Test Variable',
        value: 6,
        validFrom: new Date('2000-01-01T00:00:00Z'),
        validTo: null
      }
    });
    console.log("Success:", v);
  } catch (e) {
    console.error("Error creating:", e);
  }
}
main().finally(() => prisma.$disconnect());
