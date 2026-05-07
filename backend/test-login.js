const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function run() {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@nebulapayrolls.com' } });
  if (admin) {
    const hash = await bcrypt.hash('123456', 10);
    await prisma.user.update({ where: { id: admin.id }, data: { passwordHash: hash } });
    console.log('Password reset to 123456');
  } else {
    console.log('Admin not found in local db, skipping.');
  }
}
run();
