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
var PayrollService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mathjs_1 = require("mathjs");
const crypto_1 = require("crypto");
let PayrollService = PayrollService_1 = class PayrollService {
    prisma;
    logger = new common_1.Logger(PayrollService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculatePeriod(tenantId, periodId) {
        const period = await this.prisma.payrollPeriod.findUnique({
            where: { id: periodId, tenantId },
            include: {
                payrollGroup: {
                    include: {
                        payrollGroupConcepts: {
                            include: {
                                concept: true
                            }
                        }
                    }
                },
                specialConcepts: true
            }
        });
        if (!period)
            throw new common_1.BadRequestException('Period not found');
        if (period.status === 'CLOSED')
            throw new common_1.BadRequestException('Locked period cannot be recalculated');
        const globalVars = await this.prisma.globalVariable.findMany({
            where: {
                tenantId,
                validFrom: { lte: period.endDate },
                OR: [
                    { validTo: null },
                    { validTo: { gte: period.startDate } }
                ]
            }
        });
        const globalContext = {};
        for (const v of globalVars) {
            globalContext[v.code] = v.value.toNumber();
        }
        const employments = await this.prisma.employmentRecord.findMany({
            where: {
                tenantId,
                payrollGroupId: period.payrollGroupId,
                isActive: true,
                startDate: { lte: period.endDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: period.startDate } }
                ]
            },
            include: {
                owner: {
                    include: { familyMembers: true }
                },
                salaryHistories: {
                    where: {
                        validFrom: { lte: period.endDate },
                        OR: [
                            { validTo: null },
                            { validTo: { gte: period.startDate } }
                        ]
                    },
                    orderBy: { validFrom: 'desc' }
                }
            }
        });
        let conceptsToRun = [];
        if (period.type === 'SPECIAL_BONUS' && period.specialConcepts && period.specialConcepts.length > 0) {
            conceptsToRun = period.specialConcepts;
        }
        else {
            conceptsToRun = period.payrollGroup.payrollGroupConcepts
                .map(pgc => pgc.concept)
                .sort((a, b) => a.executionSequence - b.executionSequence);
        }
        const allReceipts = [];
        const allReceiptDetails = [];
        const periodDays = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        for (const emp of employments) {
            const activeSalary = emp.salaryHistories[0]?.amount.toNumber() || 0;
            const workerContext = {
                ...globalContext,
                base_salary: activeSalary,
                worked_days: periodDays,
                dependents_count: emp.owner.familyMembers.length
            };
            let totalSalaryEarnings = 0;
            let totalNonSalaryEarnings = 0;
            let totalDeductions = 0;
            let employerContributions = 0;
            const receiptId = (0, crypto_1.randomUUID)();
            const currentWorkerDetails = [];
            for (const concept of conceptsToRun) {
                if (concept.condition) {
                    try {
                        const isMatch = (0, mathjs_1.evaluate)(concept.condition, workerContext);
                        if (!isMatch)
                            continue;
                    }
                    catch (e) {
                        this.logger.error(`Error evaluating condition [${concept.condition}]:`, e.message);
                        continue;
                    }
                }
                let factorVal = 0, rateVal = 0, amountVal = 0;
                try {
                    factorVal = concept.formulaFactor ? (0, mathjs_1.evaluate)(concept.formulaFactor, workerContext) : 0;
                    rateVal = concept.formulaRate ? (0, mathjs_1.evaluate)(concept.formulaRate, workerContext) : 0;
                    if (concept.formulaAmount) {
                        amountVal = (0, mathjs_1.evaluate)(concept.formulaAmount, workerContext);
                    }
                    else {
                        amountVal = factorVal * rateVal;
                    }
                }
                catch (e) {
                    this.logger.error(`Error executing formulas for concept [${concept.code}]:`, e.message);
                    continue;
                }
                workerContext[concept.code] = amountVal;
                if (!concept.isAuxiliary) {
                    currentWorkerDetails.push({
                        id: (0, crypto_1.randomUUID)(),
                        payrollReceiptId: receiptId,
                        conceptId: concept.id,
                        conceptNameSnapshot: concept.name,
                        typeSnapshot: concept.type,
                        factor: factorVal,
                        rate: rateVal,
                        amount: amountVal
                    });
                    if (concept.type === 'EARNING') {
                        if (concept.isSalaryIncidence)
                            totalSalaryEarnings += amountVal;
                        else
                            totalNonSalaryEarnings += amountVal;
                    }
                    else if (concept.type === 'DEDUCTION') {
                        totalDeductions += amountVal;
                    }
                    else if (concept.type === 'EMPLOYER_CONTRIBUTION') {
                        employerContributions += amountVal;
                    }
                }
            }
            const totalEarnings = totalSalaryEarnings + totalNonSalaryEarnings;
            const netPay = totalEarnings - totalDeductions;
            allReceiptDetails.push(...currentWorkerDetails);
            allReceipts.push({
                id: receiptId,
                payrollPeriodId: period.id,
                workerId: emp.owner.id,
                totalSalaryEarnings,
                totalNonSalaryEarnings,
                totalEarnings,
                totalDeductions,
                netPay,
                employerContributions
            });
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.payrollReceiptDetail.deleteMany({
                where: { payrollReceipt: { payrollPeriodId: periodId } }
            });
            await tx.payrollReceipt.deleteMany({
                where: { payrollPeriodId: periodId }
            });
            if (allReceipts.length > 0) {
                await tx.payrollReceipt.createMany({ data: allReceipts });
            }
            if (allReceiptDetails.length > 0) {
                await tx.payrollReceiptDetail.createMany({ data: allReceiptDetails });
            }
            await tx.payrollPeriod.update({
                where: { id: periodId },
                data: { status: 'PRE_CALCULATED' }
            });
        });
        return { success: true, receiptsGenerated: allReceipts.length };
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = PayrollService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map