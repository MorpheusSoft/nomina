import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenantId = '91be4f61-2483-4a1d-a3d8-5b128c706fe5';

  // 0. Create Root Tenant
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: 'Pegaso Corporation SaaS',
      taxId: 'J-12345678-9',
    }
  });
  
  // 1. Create a Payroll Group
  const obreros = await prisma.payrollGroup.create({
    data: { name: 'Sindicato Obreros Test', tenantId }
  });

  // 2. Create Master Concept
  const rootConcept = await prisma.concept.create({
    data: {
      tenantId,
      code: 'INICIO_REG',
      name: 'Nómina Regular',
      type: 'EARNING',
      formulaAmount: '0',
      executionSequence: 10,
      payrollGroupConcepts: {
        create: { payrollGroupId: obreros.id }
      }
    }
  });

  // 3. Create Child Concepts
  const sueldo = await prisma.concept.create({
    data: {
      tenantId,
      code: 'SUELDO_BASE',
      name: 'Sueldo Básico Test',
      type: 'EARNING',
      formulaAmount: 'worked_days * (base_salary / 30)',
      executionSequence: 20
    }
  });

  const sso = await prisma.concept.create({
    data: {
      tenantId,
      code: 'RET_SSO',
      name: 'Retención SSO Test',
      type: 'DEDUCTION',
      formulaAmount: '(base_salary * 12 / 52) * 0.04 * 4',
      executionSequence: 30
    }
  });

  // 4. Bind Tree
  await prisma.conceptDependency.createMany({
    data: [
      { parentConceptId: rootConcept.id, childConceptId: sueldo.id, executionSequence: 10 },
      { parentConceptId: rootConcept.id, childConceptId: sso.id, executionSequence: 20 }
    ]
  });

  // 5. Update Group Root
  await prisma.payrollGroup.update({
    where: { id: obreros.id },
    data: { rootRegularConceptId: rootConcept.id }
  });

  console.log('Seed completed with 1 Master Concept binding 2 Children.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
