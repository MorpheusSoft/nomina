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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(tenantId, canViewConfidential = false) {
        const totalWorkers = await this.prisma.worker.count({
            where: {
                tenantId,
                deletedAt: null,
                employmentRecords: {
                    some: {
                        status: 'ACTIVE',
                        ...(canViewConfidential ? {} : { isConfidential: false })
                    }
                }
            }
        });
        const departments = await this.prisma.department.findMany({
            where: { costCenter: { tenantId } }
        });
        const budget = departments.reduce((sum, dept) => sum + (Number(dept.monthlyBudget) || 0), 0);
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const receipts = await this.prisma.payrollReceipt.findMany({
            where: {
                worker: {
                    tenantId,
                    ...(canViewConfidential ? {} : { employmentRecords: { none: { isConfidential: true } } })
                },
                payrollPeriod: {
                    startDate: { gte: firstDay },
                    endDate: { lte: lastDay }
                }
            },
            include: { payrollPeriod: true }
        });
        let executed = 0;
        receipts.forEach(r => {
            let receiptCost = Number(r.totalEarnings) + Number(r.employerContributions);
            if (r.payrollPeriod.currency !== 'USD' && r.payrollPeriod.exchangeRate) {
                receiptCost = receiptCost / Number(r.payrollPeriod.exchangeRate);
            }
            executed += receiptCost;
        });
        const budgetExecution = { budget, executed, percentage: budget > 0 ? (executed / budget) * 100 : 0 };
        const expiringDate = new Date();
        expiringDate.setDate(expiringDate.getDate() + 60);
        const expiringContracts = await this.prisma.employmentRecord.count({
            where: {
                tenantId,
                status: 'ACTIVE',
                ...(canViewConfidential ? {} : { isConfidential: false }),
                endDate: { not: null, lte: expiringDate, gte: now }
            }
        });
        const absences = await this.prisma.dailyAttendance.count({
            where: {
                tenantId,
                ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } }),
                date: { gte: firstDay, lte: lastDay },
                status: { notIn: ['PRESENT', 'REST_DAY', 'HOLIDAY'] }
            }
        });
        const totalExpectedAttendances = await this.prisma.dailyAttendance.count({
            where: {
                tenantId,
                ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } }),
                date: { gte: firstDay, lte: lastDay },
                status: { not: 'REST_DAY' }
            }
        });
        const absenteeismRate = totalExpectedAttendances > 0 ? (absences / totalExpectedAttendances) * 100 : 0;
        const trusts = await this.prisma.contractTrust.findMany({
            where: {
                tenantId,
                ...(canViewConfidential ? {} : { employmentRecord: { isConfidential: false } })
            }
        });
        const totalTrustDebt = trusts.reduce((sum, t) => sum + Number(t.totalAccumulated), 0);
        return {
            totalWorkers,
            budgetExecution,
            expiringContracts,
            absenteeism: { rate: absenteeismRate, absences, totalExpected: totalExpectedAttendances },
            totalTrustDebt
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map