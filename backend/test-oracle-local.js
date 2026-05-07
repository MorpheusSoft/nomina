const { PrismaClient } = require('@prisma/client');
const { OracleService } = require('./dist/src/oracle/oracle.service.js');
const prisma = new PrismaClient();

async function run() {
  const service = new OracleService(prisma);
  try {
    let tenant = await prisma.tenant.findFirst();
    await prisma.tenant.update({ where: { id: tenant.id }, data: { hasOracleAccess: true } });
    const res = await service.generateConcept(tenant.id, "segun el CCP del 2019, cual es la formula del calculo del tiempo de viaje");
    console.log(res);
  } catch(e) {
    console.error("ERROR", e);
  }
}
run();
