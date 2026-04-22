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
exports.PayrollGroupVariablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayrollGroupVariablesService = class PayrollGroupVariablesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const isSum = data.type === 'SUM_CONCEPTS';
        return this.prisma.payrollGroupVariable.create({
            data: {
                payrollGroupId: data.payrollGroupId,
                code: data.code,
                name: data.name,
                type: data.type || 'STATIC',
                value: isSum ? 0 : Number(data.value),
                validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
                validTo: data.validTo ? new Date(data.validTo) : null,
                concepts: isSum && data.conceptIds?.length > 0
                    ? { connect: data.conceptIds.map((id) => ({ id })) }
                    : undefined
            }
        });
    }
    async findAll(payrollGroupId) {
        return this.prisma.payrollGroupVariable.findMany({
            where: { payrollGroupId },
            orderBy: { code: 'asc' },
            include: {
                concepts: {
                    select: { id: true, code: true, name: true }
                }
            }
        });
    }
    async findAllByTenant(tenantId) {
        const vars = await this.prisma.payrollGroupVariable.findMany({
            where: { payrollGroup: { tenantId } },
            orderBy: { code: 'asc' }
        });
        const uniqueCodes = {};
        for (const v of vars) {
            if (!uniqueCodes[v.code]) {
                uniqueCodes[v.code] = v;
            }
        }
        return Object.values(uniqueCodes);
    }
    async update(id, data) {
        const isSum = data.type === 'SUM_CONCEPTS';
        return this.prisma.payrollGroupVariable.update({
            where: { id },
            data: {
                code: data.code,
                name: data.name,
                type: data.type || 'STATIC',
                value: isSum ? 0 : Number(data.value),
                validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
                validTo: data.validTo ? new Date(data.validTo) : null,
                concepts: {
                    set: isSum && data.conceptIds?.length > 0
                        ? data.conceptIds.map((cId) => ({ id: cId }))
                        : []
                }
            }
        });
    }
    async remove(id) {
        return this.prisma.payrollGroupVariable.delete({
            where: { id }
        });
    }
};
exports.PayrollGroupVariablesService = PayrollGroupVariablesService;
exports.PayrollGroupVariablesService = PayrollGroupVariablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollGroupVariablesService);
//# sourceMappingURL=payroll-group-variables.service.js.map