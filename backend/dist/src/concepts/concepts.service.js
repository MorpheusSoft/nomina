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
exports.ConceptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConceptsService = class ConceptsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        const { payrollGroupIds, executionSequence, ...conceptData } = data;
        try {
            return await this.prisma.concept.create({
                data: {
                    ...conceptData,
                    executionSequence: executionSequence ? parseInt(executionSequence.toString(), 10) : 10,
                    tenantId,
                    payrollGroupConcepts: payrollGroupIds?.length ? {
                        create: payrollGroupIds.map((pgId) => ({ payrollGroupId: pgId }))
                    } : undefined
                },
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException('Ya existe un concepto con este código o nombre en la empresa. Utiliza otro código único.');
            }
            throw e;
        }
    }
    async findAll(tenantId) {
        return this.prisma.concept.findMany({
            where: { tenantId },
            include: {
                payrollGroupConcepts: { include: { payrollGroup: true } }
            },
            orderBy: { executionSequence: 'asc' },
        });
    }
    async findOne(tenantId, id) {
        const v = await this.prisma.concept.findFirst({
            where: { id, tenantId },
            include: {
                payrollGroupConcepts: true
            }
        });
        if (!v)
            throw new common_1.NotFoundException('Concept not found or unauthorized');
        return v;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id);
        const { code, name, description, type, accountingCode, accountingOperation, isSalaryIncidence, isTaxable, isAuxiliary, formulaFactor, formulaRate, formulaAmount, condition, executionSequence, executionPeriodTypes, payrollGroupIds } = data;
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.concept.updateMany({
                where: { id, tenantId },
                data: {
                    name, description, type, accountingCode, accountingOperation,
                    isSalaryIncidence, isTaxable, isAuxiliary,
                    formulaFactor, formulaRate, formulaAmount, condition,
                    executionPeriodTypes: executionPeriodTypes || ['REGULAR'],
                    executionSequence: executionSequence ? parseInt(executionSequence.toString(), 10) : 10
                },
            });
            if (payrollGroupIds !== undefined) {
                await tx.payrollGroupConcept.deleteMany({ where: { conceptId: id } });
                if (payrollGroupIds.length > 0) {
                    await tx.payrollGroupConcept.createMany({
                        data: payrollGroupIds.map((pgId) => ({
                            conceptId: id,
                            payrollGroupId: pgId
                        }))
                    });
                }
            }
            return updated;
        });
    }
    async remove(tenantId, id) {
        const usedInReceipts = await this.prisma.payrollReceiptDetail.findFirst({ where: { conceptId: id } });
        if (usedInReceipts) {
            throw new common_1.ConflictException('Este concepto está en uso en recibos de nómina históricos. Para proteger la contabilidad no puede borrarse, por favor desmarque "Es Activo" para ocultarlo.');
        }
        const usedInWorkers = await this.prisma.workerFixedConcept.findFirst({ where: { conceptId: id } });
        if (usedInWorkers) {
            throw new common_1.ConflictException('Este concepto está asignado de forma fija a uno o más trabajadores. Retire la asignación a trabajadores antes de eliminarlo.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.payrollGroupConcept.deleteMany({ where: { conceptId: id } });
            await tx.conceptDependency.deleteMany({ where: { parentConceptId: id } });
            await tx.conceptDependency.deleteMany({ where: { childConceptId: id } });
            return tx.concept.delete({ where: { id } });
        });
    }
    async importFromRootNode(targetTenantId) {
        const adminUser = await this.prisma.user.findUnique({ where: { email: 'admin@nebulapayrolls.com' } });
        if (!adminUser)
            throw new common_1.NotFoundException('Nodo maestro inaccesible.');
        if (adminUser.tenantId === targetTenantId)
            throw new common_1.ConflictException('Ya estás en el nodo maestro.');
        const rootConcepts = await this.prisma.concept.findMany({ where: { tenantId: adminUser.tenantId } });
        let importedCount = 0;
        for (const concept of rootConcepts) {
            const exists = await this.prisma.concept.findFirst({
                where: { tenantId: targetTenantId, code: concept.code }
            });
            if (!exists) {
                const { id, createdAt, updatedAt, tenantId, ...cleanConcept } = concept;
                await this.prisma.concept.create({
                    data: {
                        ...cleanConcept,
                        tenantId: targetTenantId
                    }
                });
                importedCount++;
            }
        }
        return { importedCount };
    }
};
exports.ConceptsService = ConceptsService;
exports.ConceptsService = ConceptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConceptsService);
//# sourceMappingURL=concepts.service.js.map