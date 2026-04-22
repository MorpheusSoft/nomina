import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  const periods = await prisma.payrollPeriod.findMany({ select: { tenantId: true, status: true, name: true }});
  console.log("Users:", users.map(u => ({ email: u.email, tenantId: u.tenantId })));
  console.log("Periods by tenant:", periods);
}
main().finally(() => prisma.$disconnect());
