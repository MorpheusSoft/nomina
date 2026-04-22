import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando inyección de datos de prueba...');

  const passwordHash = bcrypt.hashSync('123456', 10);

  // 1. Crear o buscar Tenant
  let tenant = await prisma.tenant.findFirst({
    where: { taxId: 'J-12345678-9' }
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Empresa Demo CA',
        taxId: 'J-12345678-9',
        isActive: true,
        maxActiveWorkers: 50,
      }
    });
  }

  // 2. Crear Role para este tenant
  let role = await prisma.role.findFirst({
    where: { tenantId: tenant.id, name: 'Administrador' }
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Administrador',
        permissions: ['ALL']
      }
    });
  }

  // 3. Crear Usuario
  const email = 'demo-admin@empresa.com';
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Admin',
        lastName: 'Demo',
        tenantId: tenant.id,
        roleId: role.id,
        isActive: true,
      }
    });
  } else {
    // Asegurarse de que el hash sea 123456 si el usuario ya existía
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
  }

  // 4. Crear UserTenantAccess
  const access = await prisma.userTenantAccess.findFirst({
    where: { userId: user.id, tenantId: tenant.id }
  });

  if (!access) {
    await prisma.userTenantAccess.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        roleId: role.id,
      }
    });
  }

  // 5. Crear Trabajador de prueba (útil para AR-I)
  let worker = await prisma.worker.findFirst({
    where: { tenantId: tenant.id, primaryIdentityNumber: 'V-12345678' }
  });

  if (!worker) {
    worker = await prisma.worker.create({
      data: {
        tenantId: tenant.id,
        primaryIdentityNumber: 'V-12345678',
        firstName: 'Juan',
        lastName: 'Pérez',
        birthDate: new Date('1990-01-01'),
        gender: 'MALE',
        nationality: 'V',
        maritalStatus: 'SINGLE',
      }
    });

    await prisma.employmentRecord.create({
      data: {
        workerId: worker.id,
        tenantId: tenant.id,
        startDate: new Date('2020-01-01'),
        contractType: 'INDEFINITE',
        position: 'Analista de Sistemas',
        isActive: true,
        isConfidential: false,
      }
    });
  }

  console.log('--- Datos Inyectados con Éxito ---');
  console.log(`URL de Acceso: http://localhost:3000/`);
  console.log(`Usuario: demo-admin@empresa.com`);
  console.log(`Contraseña: 123456`);
  console.log(`Trabajador de prueba creado: Juan Pérez (V-12345678)`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
