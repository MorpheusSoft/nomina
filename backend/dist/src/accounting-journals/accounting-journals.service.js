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
exports.AccountingJournalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AccountingJournalsService = class AccountingJournalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateFromPayrollPeriod(tenantId, payrollPeriodId) {
        const period = await this.prisma.payrollPeriod.findFirst({
            where: { id: payrollPeriodId, tenantId },
            include: {
                payrollReceipts: {
                    include: {
                        details: {
                            include: { concept: true }
                        },
                        worker: {
                            include: {
                                employmentRecords: {
                                    where: { isActive: true },
                                    include: { costCenter: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!period)
            throw new common_1.NotFoundException('Periodo de nómina no encontrado');
        if (period.status !== 'CLOSED') {
        }
        const existing = await this.prisma.accountingJournal.findUnique({
            where: { payrollPeriodId: period.id }
        });
        if (existing) {
            if (existing.status !== 'DRAFT') {
                throw new common_1.BadRequestException('El asiento ya fue contabilizado o exportado');
            }
            await this.prisma.accountingJournal.delete({ where: { id: existing.id } });
        }
        const linesMap = new Map();
        let totalNetPay = new client_1.Prisma.Decimal(0);
        for (const receipt of period.payrollReceipts) {
            totalNetPay = totalNetPay.add(receipt.netPay);
            const empRecord = receipt.worker.employmentRecords[0];
            const costCenterCode = empRecord?.costCenter?.accountingCode || null;
            for (const det of receipt.details) {
                const concept = det.concept;
                if (!concept.accountingCode) {
                    throw new common_1.BadRequestException(`El concepto ${concept.code} no tiene cuenta contable configurada`);
                }
                const operation = concept.accountingOperation;
                const accountCode = concept.accountingCode;
                const mapKey = `${accountCode}|${costCenterCode || ''}`;
                if (!linesMap.has(mapKey)) {
                    linesMap.set(mapKey, { debit: new client_1.Prisma.Decimal(0), credit: new client_1.Prisma.Decimal(0), desc: concept.name });
                }
                const entry = linesMap.get(mapKey);
                if (operation === 'DEBIT') {
                    entry.debit = entry.debit.add(det.amount);
                }
                else if (operation === 'CREDIT') {
                    entry.credit = entry.credit.add(det.amount);
                }
                else {
                    if (concept.type === 'EARNING' || concept.type === 'NON_TAXABLE_EARNING') {
                        entry.debit = entry.debit.add(det.amount);
                    }
                    else {
                        entry.credit = entry.credit.add(det.amount);
                    }
                }
            }
        }
        const netPayAccount = '21030101';
        linesMap.set(`${netPayAccount}|`, { debit: new client_1.Prisma.Decimal(0), credit: totalNetPay, desc: 'Nómina por Pagar (Neto)' });
        let totalDebit = new client_1.Prisma.Decimal(0);
        let totalCredit = new client_1.Prisma.Decimal(0);
        const linesToInsert = [];
        for (const [key, val] of linesMap.entries()) {
            const [accCode, ccCode] = key.split('|');
            totalDebit = totalDebit.add(val.debit);
            totalCredit = totalCredit.add(val.credit);
            if (val.debit.isZero() && val.credit.isZero())
                continue;
            linesToInsert.push({
                accountingCode: accCode,
                costCenterCode: ccCode || null,
                debitAmount: val.debit,
                creditAmount: val.credit,
                description: val.desc
            });
        }
        return this.prisma.accountingJournal.create({
            data: {
                tenantId,
                payrollPeriodId: period.id,
                date: period.endDate,
                status: 'DRAFT',
                totalDebit,
                totalCredit,
                lines: {
                    create: linesToInsert
                }
            },
            include: {
                lines: true,
                payrollPeriod: true
            }
        });
    }
    async findAll(tenantId) {
        return this.prisma.accountingJournal.findMany({
            where: { tenantId },
            include: { payrollPeriod: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(tenantId, id) {
        return this.prisma.accountingJournal.findUnique({
            where: { id, tenantId },
            include: { lines: true, payrollPeriod: true }
        });
    }
    async exportCsv(tenantId, id) {
        const journal = await this.findOne(tenantId, id);
        if (!journal)
            throw new common_1.NotFoundException('Asiento no encontrado');
        const header = ['Cuenta Contable', 'Centro de Costo', 'Descripción', 'Débito', 'Crédito'];
        const rows = journal.lines.map((l) => [
            l.accountingCode,
            l.costCenterCode || '',
            l.description || '',
            l.debitAmount.toString(),
            l.creditAmount.toString()
        ]);
        const csvContent = [header, ...rows]
            .map(e => e.join(','))
            .join('\n');
        return csvContent;
    }
};
exports.AccountingJournalsService = AccountingJournalsService;
exports.AccountingJournalsService = AccountingJournalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountingJournalsService);
//# sourceMappingURL=accounting-journals.service.js.map