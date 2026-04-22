const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@nebulapay.com' }
  });
  if (admin) {
    await prisma.user.update({
      where: { email: 'admin@nebulapay.com' },
      data: { email: 'admin@nebulapayrolls.com' }
    });
    console.log("Admin email updated successfully to admin@nebulapayrolls.com");
  } else {
    console.log("Admin not found or already updated.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
