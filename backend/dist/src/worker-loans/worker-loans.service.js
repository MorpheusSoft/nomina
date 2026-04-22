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
exports.WorkerLoansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkerLoansService = class WorkerLoansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        return this.prisma.workerLoan.create({
            data: {
                ...data,
                tenantId,
                outstandingBalance: data.totalAmount
            }
        });
    }
    async findAll(tenantId, workerId) {
        const where = { tenantId };
        if (workerId)
            where.workerId = workerId;
        const loans = await this.prisma.workerLoan.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                worker: {
                    include: {
                        employmentRecords: {
                            where: { isActive: true },
                            include: { payrollGroup: true }
                        }
                    }
                }
            }
        });
        if (loans.length === 0)
            return [];
        const loanConceptIds = new Set();
        loans.forEach(l => {
            const contract = l.worker.employmentRecords[0];
            if (contract?.payrollGroup?.loanDeductionConceptId) {
                loanConceptIds.add(contract.payrollGroup.loanDeductionConceptId);
            }
        });
        let historicalDeductions = [];
        if (loanConceptIds.size > 0 && workerId) {
            historicalDeductions = await this.prisma.payrollReceiptDetail.findMany({
                where: {
                    conceptId: { in: Array.from(loanConceptIds) },
                    payrollReceipt: {
                        workerId,
                        payrollPeriod: { status: { in: ['CLOSED', 'APPROVED', 'FINAL'] } }
                    }
                },
                include: {
                    payrollReceipt: { include: { payrollPeriod: true } }
                },
                orderBy: { payrollReceipt: { payrollPeriod: { endDate: 'desc' } } }
            });
        }
        else if (loanConceptIds.size > 0 && !workerId) {
            historicalDeductions = await this.prisma.payrollReceiptDetail.findMany({
                where: {
                    conceptId: { in: Array.from(loanConceptIds) },
                    payrollReceipt: {
                        worker: { tenantId },
                        payrollPeriod: { status: { in: ['CLOSED', 'APPROVED', 'FINAL'] } }
                    }
                },
                include: {
                    payrollReceipt: { include: { payrollPeriod: true } }
                },
                orderBy: { payrollReceipt: { payrollPeriod: { endDate: 'desc' } } }
            });
        }
        return loans.map(loan => {
            const loanDate = new Date(loan.createdAt);
            const amortizations = historicalDeductions
                .filter(d => d.payrollReceipt.workerId === loan.workerId &&
                new Date(d.payrollReceipt.payrollPeriod.endDate) >= loanDate)
                .map(ded => {
                const period = ded.payrollReceipt.payrollPeriod;
                return {
                    id: ded.id,
                    periodName: period.name,
                    periodDate: period.endDate,
                    amount: Number(ded.amount),
                    periodCurrency: period.currency,
                    periodExchangeRate: Number(period.exchangeRate) || 1
                };
            });
            return {
                ...loan,
                amortizations
            };
        });
    }
    async findOne(tenantId, id) {
        const loan = await this.prisma.workerLoan.findFirst({ where: { id, tenantId } });
        if (!loan)
            throw new common_1.NotFoundException('Loan not found');
        return loan;
    }
    async update(tenantId, id, data) {
        await this.findOne(tenantId, id);
        if (data.outstandingBalance !== undefined && Number(data.outstandingBalance) <= 0) {
            data.status = 'PAID';
        }
        return this.prisma.workerLoan.update({
            where: { id },
            data
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.workerLoan.delete({ where: { id } });
    }
};
exports.WorkerLoansService = WorkerLoansService;
exports.WorkerLoansService = WorkerLoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkerLoansService);
//# sourceMappingURL=worker-loans.service.js.map