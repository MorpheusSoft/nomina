const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const data = { maxActiveWorkers: 3, isActive: true, hasWorkerPortalAccess: false, logoUrl: null, contactPhone: null, serviceEndDate: '2026-04-13T00:00:00.000Z' };

async function test() {
  const t = await prisma.tenant.update({
    where: { id: 'cb43998c-3e21-4a6e-a2d6-ccbfdc9cf492' },
      data: {
        maxActiveWorkers: data.maxActiveWorkers ? parseInt(data.maxActiveWorkers.toString(), 10) : undefined,
        isActive: data.isActive,
        hasWorkerPortalAccess: data.hasWorkerPortalAccess,
        logoUrl: data.logoUrl,
        contactPhone: data.contactPhone,
        serviceEndDate: data.serviceEndDate !== undefined ? (data.serviceEndDate ? new Date(data.serviceEndDate) : null) : undefined
      }
  });
  console.log('Update result:', t);
}
test();
