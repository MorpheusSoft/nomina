"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmploymentRecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmploymentRecordsService = class EmploymentRecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto) {
        const { initialSalary, currency, ...recordData } = createDto;
        if (recordData.tenantId) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: recordData.tenantId },
                select: { maxActiveWorkers: true }
            });
            if (tenant) {
                const activeContractsCount = await this.prisma.employmentRecord.count({
                    where: { tenantId: recordData.tenantId, isActive: true }
                });
                if (activeContractsCount >= tenant.maxActiveWorkers) {
                    throw new common_1.ForbiddenException(`Límite alcanzado: El plan actual de la empresa permite un máximo de ${tenant.maxActiveWorkers} trabajadores activos.`);
                }
            }
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.employmentRecord.updateMany({
                where: { workerId: recordData.workerId, isActive: true },
                data: { isActive: false, endDate: recordData.startDate }
            });
            const record = await tx.employmentRecord.create({
                data: {
                    ...recordData,
                    startDate: new Date(recordData.startDate),
                    isActive: true
                }
            });
            if (initialSalary) {
                await tx.salaryHistory.create({
                    data: {
                        employmentRecordId: record.id,
                        amount: initialSalary,
                        currency: currency || 'USD',
                        validFrom: new Date(recordData.startDate)
                    }
                });
            }
            return record;
        });
    }
    findAllByWorker(workerId) {
        return this.prisma.employmentRecord.findMany({
            where: { workerId },
            include: {
                salaryHistories: {
                    orderBy: { validFrom: 'desc' }
                },
                payrollGroup: true,
                costCenter: true,
                department: true,
                crew: true
            },
            orderBy: { startDate: 'desc' }
        });
    }
    async updateSalary(recordId, amount, currency, validFrom) {
        return this.prisma.$transaction(async (tx) => {
            const lastSalary = await tx.salaryHistory.findFirst({
                where: { employmentRecordId: recordId, validTo: null },
                orderBy: { validFrom: 'desc' }
            });
            if (lastSalary) {
                await tx.salaryHistory.update({
                    where: { id: lastSalary.id },
                    data: { validTo: new Date(validFrom) }
                });
            }
            return tx.salaryHistory.create({
                data: {
                    employmentRecordId: recordId,
                    amount,
                    validFrom: new Date(validFrom),
                    currency: currency
                }
            });
        });
    }
    async transferWorker(recordId, data) {
        return this.prisma.employmentRecord.update({
            where: { id: recordId },
            data: {
                position: data.position,
                costCenterId: data.costCenterId,
                departmentId: data.departmentId,
                crewId: data.crewId
            }
        });
    }
    async toggleConfidentiality(recordId, isConfidential) {
        return this.prisma.employmentRecord.update({
            where: { id: recordId },
            data: { isConfidential }
        });
    }
};
exports.EmploymentRecordsService = EmploymentRecordsService;
exports.EmploymentRecordsService = EmploymentRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmploymentRecordsService);
//# sourceMappingURL=employment-records.service.js.map