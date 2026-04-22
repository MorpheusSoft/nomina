const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuth() {
  const user = await prisma.user.findFirst({
    where: { tenantId: 'cb43998c-3e21-4a6e-a2d6-ccbfdc9cf492' },
    include: { tenant: true }
  });
  if (!user) { console.log('No user found'); return; }
  console.log('User found:', user.email);
  if (user.tenant) {
    console.log('Tenant:', user.tenant.name);
    console.log('IsActive:', user.tenant.isActive);
    console.log('EndDate:', user.tenant.serviceEndDate);
    const endDate = new Date(user.tenant.serviceEndDate).getTime();
    console.log('EndDate.getTime():', endDate);
    console.log('Date.now():', Date.now());
    if (user.tenant.serviceEndDate && endDate < Date.now()) {
      console.log('BLOCKED! Subscription expired.');
    } else {
      console.log('ALLOWED!');
    }
  }
}
testAuth();
