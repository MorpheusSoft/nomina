const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.worker.findFirst({ where: { primaryIdentityNumber: 'V-11608546' } })
  .then(w => {
    console.log('Worker Found:', !!w);
    if(w) console.log('DB Date:', w.birthDate, 'Iso:', w.birthDate.toISOString());
  })
  .finally(() => prisma.$disconnect());
