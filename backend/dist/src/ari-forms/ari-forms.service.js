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
exports.AriFormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AriFormsService = class AriFormsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    simulateTaxMath(estimatedIncome, deductionType, detailedDeductionsAmount, familyLoadCount, taxUnitValue) {
        if (taxUnitValue <= 0)
            return { percentage: 0, taxUnitValue, estimatedUt: 0, deductionUt: 0, netEstimableUt: 0, taxToPayUt: 0, rebatesUt: 0, finalTaxUt: 0, taxInBs: 0 };
        const estimatedUt = estimatedIncome / taxUnitValue;
        let deductionUt = 0;
        if (deductionType === 'UNIQUE') {
            deductionUt = 774;
        }
        else {
            deductionUt = detailedDeductionsAmount / taxUnitValue;
        }
        const netEstimableUt = estimatedUt - deductionUt;
        if (netEstimableUt <= 0)
            return { percentage: 0, taxUnitValue, estimatedUt, deductionUt, netEstimableUt, taxToPayUt: 0, rebatesUt: 0, finalTaxUt: 0, taxInBs: 0 };
        let rate = 0;
        let subtrahend = 0;
        if (netEstimableUt <= 1000) {
            rate = 0.06;
            subtrahend = 0;
        }
        else if (netEstimableUt <= 1500) {
            rate = 0.09;
            subtrahend = 30;
        }
        else if (netEstimableUt <= 2000) {
            rate = 0.12;
            subtrahend = 75;
        }
        else if (netEstimableUt <= 2500) {
            rate = 0.16;
            subtrahend = 155;
        }
        else if (netEstimableUt <= 3000) {
            rate = 0.20;
            subtrahend = 255;
        }
        else if (netEstimableUt <= 4000) {
            rate = 0.24;
            subtrahend = 375;
        }
        else if (netEstimableUt <= 6000) {
            rate = 0.29;
            subtrahend = 575;
        }
        else {
            rate = 0.34;
            subtrahend = 875;
        }
        const taxToPayUt = (netEstimableUt * rate) - subtrahend;
        let rebatesUt = 10;
        rebatesUt += (familyLoadCount * 10);
        const finalTaxUt = taxToPayUt - rebatesUt;
        if (finalTaxUt <= 0)
            return { percentage: 0, taxUnitValue, estimatedUt, deductionUt, netEstimableUt, taxToPayUt, rebatesUt, finalTaxUt: 0, taxInBs: 0 };
        const taxInBs = finalTaxUt * taxUnitValue;
        const percentage = (taxInBs / estimatedIncome) * 100;
        return {
            percentage: parseFloat(percentage.toFixed(2)),
            taxUnitValue,
            estimatedUt,
            deductionUt,
            netEstimableUt,
            taxToPayUt,
            rebatesUt,
            finalTaxUt,
            taxInBs
        };
    }
    calculatePercentage(estimatedIncome, deductionType, detailedDeductionsAmount, familyLoadCount, taxUnitValue) {
        return this.simulateTaxMath(estimatedIncome, deductionType, detailedDeductionsAmount, familyLoadCount, taxUnitValue).percentage;
    }
    async getActiveTaxUnitValue(tenantId) {
        const variable = await this.prisma.globalVariable.findFirst({
            where: { tenantId, code: 'VALOR_UT' },
            orderBy: { validFrom: 'desc' }
        });
        return variable ? Number(variable.value) : 9.00;
    }
    async getProjectionFloor(employmentRecordId, tenantId) {
        const record = await this.prisma.employmentRecord.findFirst({
            where: { id: employmentRecordId, tenantId },
            include: {
                salaryHistories: { orderBy: { validFrom: 'desc' }, take: 1 },
                payrollGroup: { include: { payrollGroupVariables: true } }
            }
        });
        if (!record || !record.salaryHistories.length)
            return 0;
        const baseSalaryAmount = Number(record.salaryHistories[0].amount);
        const currency = record.salaryHistories[0].currency;
        let conversionRate = 1;
        if (currency === 'USD') {
            const bcv = await this.prisma.globalVariable.findFirst({ where: { tenantId, code: 'TASA_BCV' }, orderBy: { validFrom: 'desc' } });
            if (bcv)
                conversionRate = Number(bcv.value);
        }
        const baseSalary = baseSalaryAmount * conversionRate;
        const dailySalary = baseSalary / 30;
        let utilDays = 120;
        let vacDays = 15;
        if (record.payrollGroup) {
            const uVar = record.payrollGroup.payrollGroupVariables.find(v => v.code === 'DIAS_UTILIDADES');
            if (uVar && uVar.value)
                utilDays = Number(uVar.value);
            const vVar = record.payrollGroup.payrollGroupVariables.find(v => v.code === 'DIAS_BONO_VACACIONAL');
            if (vVar && vVar.value)
                vacDays = Number(vVar.value);
        }
        const estimated = (baseSalary * 12) + (dailySalary * utilDays) + (dailySalary * vacDays);
        return Math.round(estimated * 100) / 100;
    }
    async submitVoluntaryForm(tenantId, workerId, data) {
        const { fiscalYear, estimatedRemuneration, deductionType, detailedDeductionsAmount, eduDeductionAmount = 0, hcmDeductionAmount = 0, medDeductionAmount = 0, housingDeductionAmount = 0, familyLoadCount } = data;
        const record = await this.prisma.employmentRecord.findFirst({
            where: { workerId, tenantId, isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        if (!record)
            throw new common_1.NotFoundException('Empleado no tiene registro activo en nómina.');
        const taxUnitValue = await this.getActiveTaxUnitValue(tenantId);
        let loadCount = familyLoadCount;
        if (loadCount === undefined || loadCount === null) {
            const familyMembers = await this.prisma.familyMember.findMany({
                where: { workerId }
            });
            loadCount = familyMembers.length;
        }
        const floor = await this.getProjectionFloor(record.id, tenantId);
        if (estimatedRemuneration < floor) {
            throw new common_1.BadRequestException(`El ingreso anual estimado no puede ser inferior a la proyección legal base dictada por el departamento contable (Sueldo + Utilidades + Bono Vac.): ${floor.toLocaleString('es-ES')} Bs.`);
        }
        const currentMonth = new Date().getMonth() + 1;
        if (![1, 3, 6, 9, 12].includes(currentMonth)) {
            throw new common_1.BadRequestException('Solo se permiten variaciones en los meses de Enero, Marzo, Junio, Septiembre y Diciembre.');
        }
        const percentage = this.calculatePercentage(estimatedRemuneration, deductionType, detailedDeductionsAmount || 0, loadCount, taxUnitValue);
        const formData = {
            tenantId,
            employmentRecordId: record.id,
            fiscalYear: Number(fiscalYear),
            month: currentMonth,
            estimatedRemuneration,
            taxUnitsValue: taxUnitValue,
            deductionType,
            detailedDeductionsAmount: deductionType === 'UNIQUE' ? 0 : detailedDeductionsAmount,
            eduDeductionAmount: deductionType === 'UNIQUE' ? 0 : eduDeductionAmount,
            hcmDeductionAmount: deductionType === 'UNIQUE' ? 0 : hcmDeductionAmount,
            medDeductionAmount: deductionType === 'UNIQUE' ? 0 : medDeductionAmount,
            housingDeductionAmount: deductionType === 'UNIQUE' ? 0 : housingDeductionAmount,
            familyLoadCount: loadCount,
            withholdingPercentage: percentage,
            isSystemGenerated: false
        };
        return this.prisma.workerAriForm.upsert({
            where: { employmentRecordId_fiscalYear_month: { employmentRecordId: record.id, fiscalYear: Number(fiscalYear), month: currentMonth } },
            update: formData,
            create: formData
        });
    }
    async generateSystemForms(tenantId, fiscalYear) {
        const activeRecords = await this.prisma.employmentRecord.findMany({
            where: {
                tenantId,
                isActive: true,
                workerAriForms: { none: { fiscalYear } }
            }
        });
        let generated = 0;
        const taxUnitValue = await this.getActiveTaxUnitValue(tenantId);
        for (const record of activeRecords) {
            const floor = await this.getProjectionFloor(record.id, tenantId);
            if (floor <= 0)
                continue;
            const percentage = this.calculatePercentage(floor, 'UNIQUE', 0, 0, taxUnitValue);
            await this.prisma.workerAriForm.create({
                data: {
                    tenantId,
                    employmentRecordId: record.id,
                    fiscalYear,
                    month: new Date().getMonth() + 1,
                    estimatedRemuneration: floor,
                    taxUnitsValue: taxUnitValue,
                    deductionType: 'UNIQUE',
                    detailedDeductionsAmount: 0,
                    familyLoadCount: 0,
                    withholdingPercentage: percentage,
                    isSystemGenerated: true
                }
            });
            generated++;
        }
        return { processed: generated, message: `Se generaron ${generated} planillas De Oficio.` };
    }
    async getStatuses(tenantId, fiscalYear) {
        const records = await this.prisma.employmentRecord.findMany({
            where: { tenantId, isActive: true },
            include: {
                owner: true,
                workerAriForms: {
                    where: { fiscalYear }
                }
            }
        });
        return records.map(r => ({
            workerName: `${r.owner.firstName} ${r.owner.lastName}`,
            identity: r.owner.primaryIdentityNumber,
            hasForm: r.workerAriForms.length > 0,
            isSystemGenerated: r.workerAriForms[0]?.isSystemGenerated,
            percentage: r.workerAriForms[0]?.withholdingPercentage,
            recordId: r.id,
            formData: r.workerAriForms[0] || null
        }));
    }
    async getDetailForPrinting(tenantId, formId) {
        const form = await this.prisma.workerAriForm.findFirst({
            where: { id: formId, tenantId },
            include: {
                employmentRecord: {
                    include: {
                        owner: true,
                        worker: true
                    }
                }
            }
        });
        if (!form)
            throw new common_1.NotFoundException('AR-I Form not found');
        return {
            tenant: {
                name: form.employmentRecord.worker.name,
                documentId: form.employmentRecord.worker.taxId || ''
            },
            worker: {
                firstName: form.employmentRecord.owner.firstName,
                lastName: form.employmentRecord.owner.lastName,
                identity: form.employmentRecord.owner.primaryIdentityNumber
            },
            form: {
                fiscalYear: form.fiscalYear,
                estimatedRemuneration: Number(form.estimatedRemuneration),
                taxUnitsValue: Number(form.taxUnitsValue),
                deductionType: form.deductionType,
                detailedDeductionsAmount: Number(form.detailedDeductionsAmount),
                familyLoadCount: form.familyLoadCount,
                withholdingPercentage: Number(form.withholdingPercentage),
                isSystemGenerated: form.isSystemGenerated,
                createdAt: form.createdAt
            }
        };
    }
};
exports.AriFormsService = AriFormsService;
exports.AriFormsService = AriFormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AriFormsService);
//# sourceMappingURL=ari-forms.service.js.map