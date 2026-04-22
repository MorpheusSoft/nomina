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
exports.PayrollPeriodsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayrollPeriodsService = class PayrollPeriodsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkOverlaps(tenantId, currentId, data) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (endDate < startDate) {
            throw new common_1.BadRequestException('Discrepancia Temporal: La fecha final debe ser igual o posterior a la fecha inicial.');
        }
        const overlappingPeriods = await this.prisma.payrollPeriod.findMany({
            where: {
                tenantId,
                type: data.type,
                payrollGroupId: data.payrollGroupId,
                id: currentId ? { not: currentId } : undefined,
                OR: [
                    { startDate: { lte: endDate }, endDate: { gte: startDate } }
                ]
            },
            include: {
                departments: true
            }
        });
        if (overlappingPeriods.length === 0)
            return;
        for (const concurrent of overlappingPeriods) {
            const concurrentDepIds = concurrent.departments.map(d => d.id);
            const newDepIds = data.departmentIds || [];
            const isConcurrentGlobal = concurrentDepIds.length === 0;
            const isNewGlobal = newDepIds.length === 0;
            if (isNewGlobal && isConcurrentGlobal) {
                throw new common_1.BadRequestException(`Colisión: Ya existe una nómina Global (${concurrent.name}) que choca con estas fechas.`);
            }
            if (isNewGlobal && !isConcurrentGlobal) {
                throw new common_1.BadRequestException(`Colisión: Existe una nómina específica (${concurrent.name}) activa en estas fechas. No puede aperturar una Global.`);
            }
            if (!isNewGlobal && isConcurrentGlobal) {
                throw new common_1.BadRequestException(`Colisión: Ya existe una nómina Global (${concurrent.name}) en estas fechas. Abarca todos los departamentos, por lo que no puede crear una específica superpuesta.`);
            }
            const intersection = newDepIds.filter((id) => concurrentDepIds.includes(id));
            if (intersection.length > 0) {
                throw new common_1.BadRequestException(`Colisión Geográfica: Comparten departamentos con la nómina (${concurrent.name}) en las mismas fechas.`);
            }
        }
    }
    async create(tenantId, data) {
        await this.checkOverlaps(tenantId, null, data);
        return this.prisma.payrollPeriod.create({
            data: {
                tenantId,
                payrollGroupId: data.payrollGroupId,
                name: data.name,
                type: data.type,
                exchangeRate: data.exchangeRate || null,
                currency: data.currency || 'VES',
                costCenterId: data.costCenterId || null,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: data.status || 'DRAFT',
                processStatuses: data.processStatuses || ['ACTIVE'],
                departments: data.departmentIds && data.departmentIds.length > 0 ? {
                    connect: data.departmentIds.map((id) => ({ id }))
                } : undefined,
                specialConcepts: data.specialConceptIds && data.specialConceptIds.length > 0 ? {
                    connect: data.specialConceptIds.map((id) => ({ id }))
                } : undefined,
                importedAttendancePeriods: data.linkedAttendancePeriodIds && data.linkedAttendancePeriodIds.length > 0 ? {
                    connect: data.linkedAttendancePeriodIds.map((id) => ({ id }))
                } : undefined
            }
        });
    }
    async findAll(tenantId) {
        return this.prisma.payrollPeriod.findMany({
            where: { tenantId },
            orderBy: { startDate: 'asc' },
            include: {
                payrollGroup: {
                    select: { name: true }
                },
                importedAttendancePeriods: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { payrollReceipts: true }
                },
                costCenter: {
                    select: { name: true }
                },
                departments: {
                    select: { name: true }
                }
            }
        });
    }
    async findOne(tenantId, id) {
        const period = await this.prisma.payrollPeriod.findFirst({
            where: { id, tenantId },
            include: {
                payrollGroup: true,
                specialConcepts: true,
                importedAttendancePeriods: true,
                departments: true,
                tenant: true
            }
        });
        if (!period)
            throw new common_1.NotFoundException('Payroll Period not found');
        return period;
    }
    async getBudgetAnalysis(tenantId, periodId) {
        const period = await this.prisma.payrollPeriod.findFirst({ where: { id: periodId, tenantId }, include: { departments: true } });
        if (!period)
            throw new common_1.NotFoundException('Period not found');
        let baseDepartments = period.departments;
        if (baseDepartments.length === 0) {
            baseDepartments = await this.prisma.department.findMany({ where: { costCenter: { tenantId } } });
        }
        const receipts = await this.prisma.payrollReceipt.findMany({
            where: { payrollPeriodId: periodId },
            include: {
                worker: {
                    include: {
                        employmentRecords: { orderBy: { startDate: 'desc' }, include: { department: true } }
                    }
                }
            }
        });
        const startOfMonth = new Date(period.endDate.getFullYear(), period.endDate.getMonth(), 1);
        const endOfMonth = new Date(period.endDate.getFullYear(), period.endDate.getMonth() + 1, 0);
        const historicReceipts = await this.prisma.payrollReceipt.findMany({
            where: {
                payrollPeriod: {
                    tenantId,
                    status: { in: ['CLOSED', 'APPROVED'] },
                    endDate: { gte: startOfMonth, lte: endOfMonth },
                    id: { not: periodId }
                }
            },
            include: {
                payrollPeriod: true,
                worker: {
                    include: {
                        employmentRecords: { orderBy: { startDate: 'desc' }, include: { department: true } }
                    }
                }
            }
        });
        const results = baseDepartments.map(dep => {
            const monthlyBudgetUSD = Number(dep.monthlyBudget || 0);
            let mtdHistoricCostUSD = 0;
            historicReceipts.forEach(r => {
                const contract = r.worker.employmentRecords.find(c => c.departmentId === dep.id) || r.worker.employmentRecords[0];
                if (contract && contract.departmentId === dep.id) {
                    let cost = parseFloat(r.netPay?.toString() || '0');
                    if (r.payrollPeriod.currency !== 'USD' && r.payrollPeriod.exchangeRate) {
                        cost = cost / Number(r.payrollPeriod.exchangeRate);
                    }
                    mtdHistoricCostUSD += cost;
                }
            });
            let currentPeriodCostUSD = 0;
            receipts.forEach(r => {
                const contract = r.worker.employmentRecords.find(c => c.departmentId === dep.id) || r.worker.employmentRecords[0];
                if (contract && contract.departmentId === dep.id) {
                    let cost = parseFloat(r.netPay?.toString() || '0');
                    if (period.currency !== 'USD' && period.exchangeRate) {
                        cost = cost / Number(period.exchangeRate);
                    }
                    currentPeriodCostUSD += cost;
                }
            });
            const totalProjectedCostUSD = mtdHistoricCostUSD + currentPeriodCostUSD;
            const varianceUSD = monthlyBudgetUSD - totalProjectedCostUSD;
            return {
                departmentId: dep.id,
                departmentName: dep.name,
                monthlyBudgetUSD: monthlyBudgetUSD,
                mtdHistoricCostUSD: mtdHistoricCostUSD,
                currentPeriodCostUSD: currentPeriodCostUSD,
                totalProjectedCostUSD: totalProjectedCostUSD,
                varianceUSD: varianceUSD,
                isOverBudget: totalProjectedCostUSD > monthlyBudgetUSD && monthlyBudgetUSD > 0
            };
        });
        const workerStatusSummary = {
            ACTIVE: 0,
            ON_VACATION: 0,
            SUSPENDED: 0,
            LIQUIDATED: 0
        };
        receipts.forEach(r => {
            const contract = r.worker.employmentRecords[0];
            if (contract && contract.status) {
                workerStatusSummary[contract.status] =
                    (workerStatusSummary[contract.status] || 0) + 1;
            }
        });
        return {
            periodId: period.id,
            periodName: period.name,
            status: period.status,
            analysis: results,
            workerStatusSummary
        };
    }
    async update(user, id, data) {
        const tenantId = user.tenantId;
        const period = await this.prisma.payrollPeriod.findFirst({ where: { id, tenantId }, include: { departments: true } });
        if (!period)
            throw new common_1.NotFoundException('Period not found');
        if (period.status === 'CLOSED')
            throw new common_1.BadRequestException('No se puede modificar una nómina cerrada');
        const checkData = {
            type: period.type,
            payrollGroupId: period.payrollGroupId,
            startDate: data.startDate ? new Date(data.startDate) : period.startDate,
            endDate: data.endDate ? new Date(data.endDate) : period.endDate,
            departmentIds: data.departmentIds !== undefined ? data.departmentIds : period.departments.map(d => d.id)
        };
        if (data.startDate || data.endDate || data.departmentIds !== undefined) {
            await this.checkOverlaps(tenantId, id, checkData);
        }
        if (data.status && data.status !== period.status) {
            if (period.status === 'DRAFT' && data.status !== 'PENDING_APPROVAL' && data.status !== 'CLOSED') {
                throw new common_1.BadRequestException('Tránsito inválido desde DRAFT. Siguiente estado: PENDING_APPROVAL');
            }
            if (period.status === 'PENDING_APPROVAL' && data.status !== 'APPROVED' && data.status !== 'DRAFT') {
                throw new common_1.BadRequestException('Nómina Pendiente de Aprobación solo puede ser devuelta a Borrador o Aprobada');
            }
            if (data.status === 'APPROVED') {
                const hasPermission = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('PAYROLL_APPROVE');
                if (!hasPermission) {
                    throw new common_1.BadRequestException('No posees el permiso PAYROLL_APPROVE para autorizar nóminas');
                }
            }
            if (period.status === 'APPROVED' && data.status !== 'CLOSED' && data.status !== 'DRAFT') {
                throw new common_1.BadRequestException('Nómina Aprobada solo puede ser Cerrada o devuelta a DRAFT');
            }
        }
        const updateData = { ...data };
        delete updateData.departmentIds;
        if (data.exchangeRate !== undefined)
            updateData.exchangeRate = data.exchangeRate;
        if (data.currency !== undefined)
            updateData.currency = data.currency;
        if (data.costCenterId !== undefined)
            updateData.costCenterId = data.costCenterId || null;
        delete updateData.specialConceptIds;
        delete updateData.linkedAttendancePeriodIds;
        if (data.specialConceptIds !== undefined) {
            updateData.specialConcepts = { set: data.specialConceptIds.map((id) => ({ id })) };
        }
        if (data.linkedAttendancePeriodIds !== undefined) {
            updateData.importedAttendancePeriods = { set: data.linkedAttendancePeriodIds.map((id) => ({ id })) };
        }
        if (data.departmentIds !== undefined) {
            updateData.departments = {
                set: data.departmentIds.map((id) => ({ id }))
            };
        }
        if (data.processStatuses !== undefined)
            updateData.processStatuses = data.processStatuses;
        if (data.startDate)
            updateData.startDate = new Date(data.startDate);
        if (data.endDate)
            updateData.endDate = new Date(data.endDate);
        if (data.status === 'CLOSED' && period.status !== 'CLOSED') {
            await this.processLoanDeductions(tenantId, id);
            if (period.type === 'PRESTACIONES' || period.type === 'SOCIAL_BENEFITS') {
                await this.processSocialBenefitsDeposit(tenantId, id);
            }
            if (period.type === 'SETTLEMENT') {
                await this.processLiquidationClosing(tenantId, id);
            }
            await this.prisma.payrollReceipt.updateMany({
                where: { payrollPeriodId: id },
                data: { status: 'PAID' }
            });
            await this.publishReceipts(tenantId, id);
        }
        if (data.status !== undefined)
            updateData.status = data.status;
        return this.prisma.payrollPeriod.update({
            where: { id },
            data: updateData
        });
    }
    async publishReceipts(tenantId, periodId) {
        const crypto = require('crypto');
        const receipts = await this.prisma.payrollReceipt.findMany({
            where: { payrollPeriodId: periodId, status: 'DRAFT' }
        });
        for (const r of receipts) {
            const token = crypto.randomBytes(16).toString('hex');
            await this.prisma.payrollReceipt.update({
                where: { id: r.id },
                data: {
                    status: 'PAID',
                    signatureToken: token,
                    publishedAt: new Date()
                }
            });
            this.dispatchOmnichannelDelivery(tenantId, r.id, r.workerId, token);
        }
    }
    async dispatchOmnichannelDelivery(tenantId, receiptId, workerId, token) {
        const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker)
            return;
        const publicUrl = `http://localhost:3000/portal/receipt/sign/${token}`;
        console.log(`\n\n----------------- OMNICHANNEL DISPATCH -----------------`);
        console.log(`Worker: ${worker.firstName} ${worker.lastName}`);
        if (worker.email) {
            console.log(`[EMAIL DISPATCH] -> Enviando recibo a ${worker.email}...`);
            console.log(`[EMAIL DISPATCH] -> Body: "Estimado, tiene un nuevo recibo de pago listo para validación."`);
            console.log(`[EMAIL DISPATCH] -> URL Segura: ${publicUrl}`);
            await this.prisma.payrollReceipt.update({ where: { id: receiptId }, data: { emailDeliveryStatus: 'SENT' } });
        }
        else {
            console.log(`[EMAIL DISPATCH] -> Email no registrado. Descartado.`);
        }
        if (worker.phone) {
            console.log(`[WHATSAPP DISPATCH] -> Enviando mensaje a ${worker.phone}...`);
            console.log(`[WHATSAPP DISPATCH] -> "Hola ${worker.firstName}, nuevo pago de nómina generado. Haz clic aquí para firmar: ${publicUrl}"`);
            await this.prisma.payrollReceipt.update({ where: { id: receiptId }, data: { whatsappDeliveryStatus: 'SENT' } });
        }
        else {
            console.log(`[WHATSAPP DISPATCH] -> Teléfono no registrado. Descartado.`);
        }
        console.log(`--------------------------------------------------------\n\n`);
    }
    async processLoanDeductions(tenantId, periodId) {
        const period = await this.prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: { payrollGroup: true }
        });
        const loanConceptId = period?.payrollGroup?.loanDeductionConceptId;
        if (!loanConceptId)
            return;
        const deductions = await this.prisma.payrollReceiptDetail.findMany({
            where: {
                payrollReceipt: { payrollPeriodId: periodId },
                conceptId: loanConceptId
            },
            include: { payrollReceipt: true }
        });
        for (const d of deductions) {
            const amountDeducted = Math.abs(Number(d.amount));
            if (amountDeducted <= 0)
                continue;
            const loan = await this.prisma.workerLoan.findFirst({
                where: {
                    workerId: d.payrollReceipt.workerId,
                    status: 'ACTIVE'
                },
                orderBy: { createdAt: 'asc' }
            });
            if (loan) {
                let amortAmount = amountDeducted;
                const pRate = Number(period.exchangeRate) || 1;
                if (period.currency === 'VES' && loan.currency === 'USD') {
                    amortAmount /= pRate;
                }
                else if (period.currency === 'USD' && loan.currency === 'VES') {
                    amortAmount *= pRate;
                }
                let newBalance = Number(loan.outstandingBalance) - amortAmount;
                if (newBalance <= 0)
                    newBalance = 0;
                await this.prisma.workerLoan.update({
                    where: { id: loan.id },
                    data: {
                        outstandingBalance: newBalance,
                        status: newBalance <= 0 ? 'PAID' : 'ACTIVE'
                    }
                });
            }
        }
    }
    async remove(tenantId, id) {
        const period = await this.prisma.payrollPeriod.findFirst({ where: { id, tenantId } });
        if (!period)
            throw new common_1.NotFoundException('Period not found');
        if (period.status === 'CLOSED')
            throw new common_1.BadRequestException('No se puede eliminar una nómina cerrada');
        await this.prisma.payrollReceipt.deleteMany({ where: { payrollPeriodId: id } });
        return this.prisma.payrollPeriod.delete({
            where: { id }
        });
    }
    async processSocialBenefitsDeposit(tenantId, periodId) {
        const receipts = await this.prisma.payrollReceipt.findMany({
            where: { payrollPeriodId: periodId },
            include: {
                worker: {
                    include: {
                        employmentRecords: {
                            where: { isActive: true }
                        }
                    }
                },
                details: true
            }
        });
        for (const receipt of receipts) {
            const activeContract = receipt.worker.employmentRecords[0];
            if (!activeContract)
                continue;
            const totalEarned = receipt.details.filter(d => d.typeSnapshot === 'EARNING').reduce((acc, curr) => acc + Number(curr.amount), 0);
            const totalDeducted = receipt.details.filter(d => d.typeSnapshot === 'DEDUCTION').reduce((acc, curr) => acc + Number(curr.amount), 0);
            const netToPay = totalEarned - totalDeducted;
            if (netToPay <= 0)
                continue;
            let trust = await this.prisma.contractTrust.findUnique({
                where: { employmentRecordId: activeContract.id }
            });
            if (!trust) {
                trust = await this.prisma.contractTrust.create({
                    data: { tenantId, employmentRecordId: activeContract.id }
                });
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.trustTransaction.create({
                    data: {
                        tenantId,
                        contractTrustId: trust.id,
                        payrollReceiptId: receipt.id,
                        type: 'DEPOSIT',
                        amount: netToPay,
                        referenceDate: new Date(),
                        notes: 'Depósito Automático Nómina de Fideicomiso / Prestaciones'
                    }
                });
                const newAccumulated = Number(trust.totalAccumulated) + netToPay;
                await tx.contractTrust.update({
                    where: { id: trust.id },
                    data: {
                        totalAccumulated: newAccumulated,
                        availableBalance: newAccumulated - Number(trust.totalAdvances)
                    }
                });
            });
        }
    }
    async processLiquidationClosing(tenantId, periodId) {
        const receipts = await this.prisma.payrollReceipt.findMany({
            where: { payrollPeriodId: periodId },
            include: {
                worker: {
                    include: {
                        employmentRecords: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });
        for (const receipt of receipts) {
            const activeContract = receipt.worker.employmentRecords[0];
            if (!activeContract)
                continue;
            await this.prisma.$transaction(async (tx) => {
                await tx.employmentRecord.update({
                    where: { id: activeContract.id },
                    data: {
                        isActive: false,
                        status: 'LIQUIDATED',
                        endDate: new Date(),
                    }
                });
                const trust = await tx.contractTrust.findUnique({
                    where: { employmentRecordId: activeContract.id }
                });
                if (trust && Number(trust.availableBalance) > 0) {
                    const withdrawingAmount = Number(trust.availableBalance);
                    await tx.trustTransaction.create({
                        data: {
                            tenantId,
                            contractTrustId: trust.id,
                            payrollReceiptId: receipt.id,
                            type: 'WITHDRAWAL',
                            amount: withdrawingAmount,
                            referenceDate: new Date(),
                            notes: 'Retiro Total por Finiquito / Liquidación Laboral'
                        }
                    });
                    await tx.contractTrust.update({
                        where: { id: trust.id },
                        data: {
                            totalAdvances: Number(trust.totalAdvances) + withdrawingAmount,
                            availableBalance: 0
                        }
                    });
                }
            });
        }
    }
};
exports.PayrollPeriodsService = PayrollPeriodsService;
exports.PayrollPeriodsService = PayrollPeriodsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollPeriodsService);
//# sourceMappingURL=payroll-periods.service.js.map