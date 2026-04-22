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
exports.PayrollGroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayrollGroupsService = class PayrollGroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        return this.prisma.payrollGroup.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.payrollGroup.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(tenantId, id) {
        const pg = await this.prisma.payrollGroup.findFirst({
            where: { id, tenantId },
            include: {
                payrollGroupConcepts: { include: { concept: true } }
            }
        });
        if (!pg)
            throw new common_1.NotFoundException('Payroll Group not found or unauthorized');
        return pg;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id);
        return this.prisma.payrollGroup.updateMany({
            where: { id, tenantId },
            data,
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.payrollGroup.deleteMany({ where: { id, tenantId } });
    }
};
exports.PayrollGroupsService = PayrollGroupsService;
exports.PayrollGroupsService = PayrollGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollGroupsService);
//# sourceMappingURL=payroll-groups.service.js.map