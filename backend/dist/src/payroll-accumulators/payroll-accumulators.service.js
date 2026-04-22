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
exports.PayrollAccumulatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayrollAccumulatorsService = class PayrollAccumulatorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createDto) {
        const { name, description, conceptIds, type, weeksBack, includeAllBonifiable } = createDto;
        const existing = await this.prisma.payrollAccumulator.findUnique({
            where: { tenantId_name: { tenantId, name } },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ya existe un Acumulador con el nombre ${name}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const accumulator = await tx.payrollAccumulator.create({
                data: {
                    tenantId,
                    name,
                    description,
                    type: type || 'WEEKS_BACK',
                    weeksBack: weeksBack !== undefined ? weeksBack : 4,
                    includeAllBonifiable: includeAllBonifiable !== undefined ? includeAllBonifiable : false,
                },
            });
            if (conceptIds && conceptIds.length > 0) {
                await tx.accumulatorConcept.createMany({
                    data: conceptIds.map((conceptId) => ({
                        accumulatorId: accumulator.id,
                        conceptId,
                    })),
                });
            }
            return tx.payrollAccumulator.findFirst({
                where: { id: accumulator.id, tenantId },
                include: { concepts: { include: { concept: { select: { id: true, code: true, name: true, type: true } } } } }
            });
        });
    }
    findAll(tenantId) {
        return this.prisma.payrollAccumulator.findMany({
            where: { tenantId },
            include: {
                concepts: {
                    include: {
                        concept: {
                            select: { id: true, code: true, name: true, type: true },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(tenantId, id) {
        const accumulator = await this.prisma.payrollAccumulator.findFirst({
            where: { id, tenantId },
            include: {
                concepts: {
                    include: {
                        concept: {
                            select: { id: true, code: true, name: true, type: true },
                        },
                    },
                },
            },
        });
        if (!accumulator) {
            throw new common_1.NotFoundException(`Acumulador con ID ${id} no encontrado`);
        }
        return accumulator;
    }
    async update(tenantId, id, updateDto) {
        await this.findOne(tenantId, id);
        const { name, description, conceptIds, type, weeksBack, includeAllBonifiable } = updateDto;
        return this.prisma.$transaction(async (tx) => {
            const accumulator = await tx.payrollAccumulator.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(type !== undefined && { type }),
                    ...(weeksBack !== undefined && { weeksBack }),
                    ...(includeAllBonifiable !== undefined && { includeAllBonifiable }),
                },
            });
            if (conceptIds !== undefined) {
                await tx.accumulatorConcept.deleteMany({
                    where: { accumulatorId: id },
                });
                if (conceptIds.length > 0) {
                    await tx.accumulatorConcept.createMany({
                        data: conceptIds.map((conceptId) => ({
                            accumulatorId: id,
                            conceptId,
                        })),
                    });
                }
            }
            return tx.payrollAccumulator.findFirst({
                where: { id: accumulator.id, tenantId },
                include: { concepts: { include: { concept: { select: { id: true, code: true, name: true, type: true } } } } }
            });
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        await this.prisma.payrollAccumulator.delete({
            where: { id },
        });
        return { success: true };
    }
};
exports.PayrollAccumulatorsService = PayrollAccumulatorsService;
exports.PayrollAccumulatorsService = PayrollAccumulatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollAccumulatorsService);
//# sourceMappingURL=payroll-accumulators.service.js.map