"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenantId = '91be4f61-2483-4a1d-a3d8-5b128c706fe5';
    const worker = await prisma.worker.create({
        data: {
            tenantId,
            primaryIdentityNumber: 'V-12345678',
            firstName: 'Trabajador',
            lastName: 'Prueba ARI',
            birthDate: new Date('1990-01-01'),
            gender: 'MALE',
            nationality: 'V',
            maritalStatus: 'SINGLE',
            email: 'ari@test.com'
        }
    });
    const payrollGroup = await prisma.payrollGroup.findFirst({ where: { tenantId } });
    const record = await prisma.employmentRecord.create({
        data: {
            workerId: worker.id,
            tenantId,
            startDate: new Date('2025-01-01'),
            contractType: 'INDEFINITE',
            position: 'Analista de Sistemas',
            isActive: true,
            payrollGroupId: payrollGroup?.id
        }
    });
    await prisma.salaryHistory.create({
        data: {
            employmentRecordId: record.id,
            amount: 500,
            currency: 'USD',
            validFrom: new Date('2025-01-01')
        }
    });
    console.log(`Worker created: ${worker.id}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=seed_worker.js.map