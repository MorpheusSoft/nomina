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
exports.CostCentersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CostCentersService = class CostCentersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        try {
            return await this.prisma.costCenter.create({
                data: { ...data, tenantId },
            });
        }
        catch (e) {
            throw new common_1.BadRequestException('Error creating Cost Center: ' + (e.message || JSON.stringify(e)));
        }
    }
    async findAllVariablesGroupedByCode(tenantId) {
        const vars = await this.prisma.costCenterVariable.findMany({
            where: { costCenter: { tenantId } },
            orderBy: { validFrom: 'desc' },
            include: { costCenter: { select: { name: true } } }
        });
        const unique = [];
        const seen = new Set();
        for (const v of vars) {
            const lower = v.code.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                unique.push({
                    id: v.id,
                    code: v.code,
                    name: v.name,
                    value: Number(v.value),
                    costCenterName: v.costCenter.name
                });
            }
        }
        return unique;
    }
    async findAll(tenantId) {
        return this.prisma.costCenter.findMany({
            where: { tenantId },
            include: {
                departments: {
                    include: {
                        crews: { include: { shiftPattern: true } }
                    }
                }
            }
        });
    }
    async findOne(tenantId, id) {
        return this.prisma.costCenter.findFirst({
            where: { id, tenantId },
            include: {
                departments: {
                    include: {
                        crews: { include: { shiftPattern: true } }
                    }
                }
            }
        });
    }
    async update(tenantId, id, data) {
        return this.prisma.costCenter.updateMany({
            where: { id, tenantId },
            data: {
                name: data.name,
                accountingCode: data.accountingCode,
            },
        });
    }
    async remove(tenantId, id) {
        return this.prisma.costCenter.deleteMany({
            where: { id, tenantId },
        });
    }
    async findVariablesByCostCenter(tenantId, costCenterId) {
        return this.prisma.costCenterVariable.findMany({
            where: { costCenterId, costCenter: { tenantId } },
            orderBy: { validFrom: 'desc' }
        });
    }
    async createVariable(tenantId, costCenterId, data) {
        return this.prisma.costCenterVariable.create({
            data: {
                costCenterId,
                code: data.code,
                name: data.name,
                value: data.value,
                validFrom: new Date(data.validFrom),
                validTo: data.validTo ? new Date(data.validTo) : null
            }
        });
    }
    async updateVariable(tenantId, costCenterId, varId, data) {
        return this.prisma.costCenterVariable.update({
            where: { id: varId, costCenterId },
            data: {
                code: data.code,
                name: data.name,
                value: data.value,
                validFrom: new Date(data.validFrom),
                validTo: data.validTo ? new Date(data.validTo) : null
            }
        });
    }
    async removeVariable(tenantId, costCenterId, varId) {
        return this.prisma.costCenterVariable.delete({
            where: { id: varId, costCenterId }
        });
    }
};
exports.CostCentersService = CostCentersService;
exports.CostCentersService = CostCentersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CostCentersService);
//# sourceMappingURL=cost-centers.service.js.map