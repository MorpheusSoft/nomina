const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.worker.findFirst({ where: { primaryIdentityNumber: 'V-11608546' } })
  .then(worker => {
    if(!worker) return console.log('no worker');
    const expectedDate = new Date(worker.birthDate).toISOString().split('T')[0];
    const inputDate = new Date('1972-10-26').toISOString().split('T')[0];
    console.log('Worker date:', expectedDate, 'Input date:', inputDate);
  })
  .finally(() => prisma.$disconnect());
