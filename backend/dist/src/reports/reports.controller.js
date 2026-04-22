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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const reports_service_1 = require("./reports.service");
let ReportsController = class ReportsController {
    prisma;
    reportsService;
    constructor(prisma, reportsService) {
        this.prisma = prisma;
        this.reportsService = reportsService;
    }
    async getConceptsDistribution(user, startDateString, endDateString, currencyView = 'VES', consolidated = 'false', conceptIdsString) {
        if (!startDateString || !endDateString) {
            throw new common_1.BadRequestException('Fechas requeridas');
        }
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);
        const isConsolidated = consolidated === 'true';
        const conceptIds = conceptIdsString ? conceptIdsString.split(',') : [];
        const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
        const filters = {
            payrollReceipt: {
                payrollPeriod: {
                    tenantId: user.tenantId,
                    status: { in: ['PRE_CALCULATED', 'PENDING_APPROVAL', 'APPROVED', 'CLOSED', 'FINAL'] },
                    endDate: { gte: startDate, lte: endDate }
                },
                ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } })
            }
        };
        if (conceptIds.length > 0) {
            filters.conceptId = { in: conceptIds };
        }
        const details = await this.prisma.payrollReceiptDetail.findMany({
            where: filters,
            include: {
                payrollReceipt: {
                    include: {
                        payrollPeriod: true,
                        worker: true
                    }
                },
                concept: true
            }
        });
        const reportData = [];
        for (const d of details) {
            const periodCurrency = d.payrollReceipt.payrollPeriod.currency || 'VES';
            const exchangeRate = d.payrollReceipt.payrollPeriod.exchangeRate ? Number(d.payrollReceipt.payrollPeriod.exchangeRate) : 1;
            let rawAmount = Number(d.amount);
            let convertedAmount = rawAmount;
            if (periodCurrency === 'USD' && currencyView === 'VES') {
                convertedAmount = rawAmount * exchangeRate;
            }
            else if (periodCurrency === 'VES' && currencyView === 'USD') {
                convertedAmount = rawAmount / exchangeRate;
            }
            if (isConsolidated) {
                const existing = reportData.find(x => x.periodName === d.payrollReceipt.payrollPeriod.name && x.conceptCode === d.concept.code);
                if (existing) {
                    existing.amount += convertedAmount;
                }
                else {
                    reportData.push({
                        periodName: d.payrollReceipt.payrollPeriod.name,
                        periodDate: d.payrollReceipt.payrollPeriod.endDate,
                        conceptCode: d.concept.code,
                        conceptName: d.conceptNameSnapshot,
                        amount: convertedAmount,
                        currency: currencyView,
                        type: d.typeSnapshot
                    });
                }
            }
            else {
                reportData.push({
                    workerRef: `${d.payrollReceipt.worker.primaryIdentityNumber} - ${d.payrollReceipt.worker.firstName} ${d.payrollReceipt.worker.lastName}`,
                    periodName: d.payrollReceipt.payrollPeriod.name,
                    periodDate: d.payrollReceipt.payrollPeriod.endDate,
                    conceptCode: d.concept.code,
                    conceptName: d.conceptNameSnapshot,
                    amount: convertedAmount,
                    currency: currencyView,
                    type: d.typeSnapshot
                });
            }
        }
        return reportData;
    }
    async getLoansAccount(user, viewType = 'SUMMARIZED', currencyView = 'VES', exchangeRateString = '1') {
        const currentGlobalExchangeRate = Number(exchangeRateString) || 1;
        const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
        const loans = await this.prisma.workerLoan.findMany({
            where: {
                tenantId: user.tenantId,
                ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } })
            },
            include: {
                worker: {
                    include: {
                        employmentRecords: {
                            where: { isActive: true },
                            include: { department: true, payrollGroup: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const reportData = [];
        const loanConceptIds = new Set();
        loans.forEach(l => {
            const contract = l.worker.employmentRecords[0];
            if (contract?.payrollGroup?.loanDeductionConceptId) {
                loanConceptIds.add(contract.payrollGroup.loanDeductionConceptId);
            }
        });
        let historicalDeductions = [];
        if (loanConceptIds.size > 0) {
            historicalDeductions = await this.prisma.payrollReceiptDetail.findMany({
                where: {
                    conceptId: { in: Array.from(loanConceptIds) },
                    payrollReceipt: {
                        payrollPeriod: { tenantId: user.tenantId, status: { in: ['CLOSED', 'APPROVED', 'FINAL'] } }
                    }
                },
                include: {
                    payrollReceipt: {
                        include: { payrollPeriod: true }
                    }
                },
                orderBy: { payrollReceipt: { payrollPeriod: { endDate: 'desc' } } }
            });
        }
        for (const loan of loans) {
            const contract = loan.worker.employmentRecords[0];
            const depName = contract?.department?.name || 'Sin Departamento';
            const loanCurrency = loan.currency || 'VES';
            const amortizations = [];
            let totalPaidAtHistoricalRates = 0;
            const myDeds = historicalDeductions.filter(d => d.payrollReceipt.workerId === loan.workerId);
            for (const ded of myDeds) {
                const period = ded.payrollReceipt.payrollPeriod;
                const periodCurrency = period.currency || 'VES';
                const histExchangeRate = Number(period.exchangeRate) || 1;
                let amortAmount = Number(ded.amount);
                if (periodCurrency === 'USD' && currencyView === 'VES') {
                    amortAmount *= histExchangeRate;
                }
                else if (periodCurrency === 'VES' && currencyView === 'USD') {
                    amortAmount /= histExchangeRate;
                }
                totalPaidAtHistoricalRates += amortAmount;
                if (viewType === 'DETAILED') {
                    amortizations.push({
                        id: ded.id,
                        periodName: period.name,
                        periodDate: period.endDate,
                        amount: amortAmount,
                        historicalRate: histExchangeRate
                    });
                }
            }
            let totalAmountConverted = Number(loan.totalAmount);
            if (loanCurrency === 'USD' && currencyView === 'VES') {
                totalAmountConverted *= currentGlobalExchangeRate;
            }
            else if (loanCurrency === 'VES' && currencyView === 'USD') {
                totalAmountConverted /= currentGlobalExchangeRate;
            }
            const balanceConverted = totalAmountConverted - totalPaidAtHistoricalRates;
            reportData.push({
                workerId: loan.workerId,
                workerName: `${loan.worker.firstName} ${loan.worker.lastName}`,
                identityNumber: loan.worker.primaryIdentityNumber,
                departmentName: depName,
                loanId: loan.id,
                status: loan.status,
                issueDate: loan.createdAt,
                originalCurrency: loan.currency,
                totalAmount: totalAmountConverted,
                balance: balanceConverted < 0 ? 0 : balanceConverted,
                amortizations
            });
        }
        return reportData;
    }
    async getWorkerARC(user, yearString, workerId) {
        if (!yearString)
            throw new common_1.BadRequestException('El año es requerido (year)');
        const year = parseInt(yearString, 10);
        return this.reportsService.getWorkerARC(user.tenantId, workerId, year);
    }
    async getISLRXml(user, monthString, yearString, res) {
        if (!monthString || !yearString)
            throw new common_1.BadRequestException('Se requiere month y year');
        const month = parseInt(monthString, 10);
        const year = parseInt(yearString, 10);
        const xml = await this.reportsService.generateISLRXml(user.tenantId, month, year);
        res.set({
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="ISLR_${year}_${month.toString().padStart(2, '0')}.xml"`,
        });
        res.send(xml);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('concepts-distribution'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('currencyView')),
    __param(4, (0, common_1.Query)('consolidated')),
    __param(5, (0, common_1.Query)('conceptIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getConceptsDistribution", null);
__decorate([
    (0, common_1.Get)('loans-account'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('viewType')),
    __param(2, (0, common_1.Query)('currencyView')),
    __param(3, (0, common_1.Query)('exchangeRate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getLoansAccount", null);
__decorate([
    (0, common_1.Get)('worker-arc/:workerId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWorkerARC", null);
__decorate([
    (0, common_1.Get)('islr-xml'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getISLRXml", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map