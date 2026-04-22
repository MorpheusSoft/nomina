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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DepartmentsService = class DepartmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        const cc = await this.prisma.costCenter.findFirst({ where: { id: data.costCenterId, tenantId } });
        if (!cc)
            throw new common_1.NotFoundException('Centro de Costo no encontrado o no autorizado');
        return this.prisma.department.create({
            data: {
                name: data.name,
                costCenterId: data.costCenterId,
                monthlyBudget: data.monthlyBudget || null
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.department.findMany({
            where: { costCenter: { tenantId } },
            include: { crews: true, costCenter: true }
        });
    }
    async findOne(tenantId, id) {
        const dept = await this.prisma.department.findFirst({
            where: { id, costCenter: { tenantId } },
            include: { crews: true, costCenter: true }
        });
        if (!dept)
            throw new common_1.NotFoundException('Departamento no encontrado');
        return dept;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id);
        return this.prisma.department.update({
            where: { id },
            data: {
                name: data.name,
                monthlyBudget: data.monthlyBudget || null
            },
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.department.delete({
            where: { id },
        });
    }
    async getBudgetMetrics(tenantId) {
        const departments = await this.prisma.department.findMany({
            where: { costCenter: { tenantId } },
            include: {
                employmentRecords: {
                    where: { isActive: true },
                    include: {
                        owner: {
                            include: {
                                payrollReceipts: {
                                    where: {
                                        payrollPeriod: {
                                            startDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                                            status: { in: ['CALCULATED', 'PRE_CALCULATED', 'APPROVED', 'CLOSED'] }
                                        }
                                    },
                                    include: {
                                        payrollPeriod: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const latestPeriod = await this.prisma.payrollPeriod.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        const currentExchangeRate = latestPeriod?.exchangeRate ? Number(latestPeriod.exchangeRate) : 1;
        const metrics = departments.map((d) => {
            const budgetUSD = d.monthlyBudget ? parseFloat(d.monthlyBudget.toString()) : 0;
            let spentUSD = 0;
            d.employmentRecords.forEach((er) => {
                er.owner?.payrollReceipts?.forEach((pr) => {
                    let cost = parseFloat(pr.netPay?.toString() || '0');
                    if (pr.payrollPeriod.currency !== 'USD' && pr.payrollPeriod.exchangeRate) {
                        cost = cost / Number(pr.payrollPeriod.exchangeRate);
                    }
                    spentUSD += cost;
                });
            });
            return {
                id: d.id,
                name: d.name,
                budget: budgetUSD,
                spent: spentUSD,
                percentage: budgetUSD > 0 ? (spentUSD / budgetUSD) * 100 : 0
            };
        });
        return {
            currentExchangeRate,
            metrics
        };
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map