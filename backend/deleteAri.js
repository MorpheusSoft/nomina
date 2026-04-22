const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.workerAriForm.deleteMany().then(() => console.log('Borrados con exito')).catch(console.error).finally(() => prisma.$disconnect());
