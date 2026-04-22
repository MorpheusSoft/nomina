"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PayrollEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mathjs = __importStar(require("mathjs"));
let PayrollEngineService = PayrollEngineService_1 = class PayrollEngineService {
    prisma;
    logger = new common_1.Logger(PayrollEngineService_1.name);
    math = mathjs.create(mathjs.all, {});
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateFullPeriod(periodId, specificWorkerId) {
        const period = await this.prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: {
                payrollGroup: {
                    include: {
                        payrollGroupVariables: true,
                    }
                },
                departments: true,
                specialConcepts: true,
                importedAttendancePeriods: true
            }
        });
        if (!period)
            throw new common_1.BadRequestException('Period not found.');
        const tenantId = period.tenantId;
        this.logger.log(`Starting Engine for Period: ${periodId} | Tenant: ${tenantId}`);
        if (period.status === 'CLOSED')
            throw new common_1.BadRequestException('Cannot recalculate a closed period.');
        const pGroup = period.payrollGroup;
        let rootConceptIds = [];
        if (period.type === 'REGULAR' && pGroup.rootRegularConceptId)
            rootConceptIds.push(pGroup.rootRegularConceptId);
        if (period.type === 'VACATION' && pGroup.rootVacationConceptId)
            rootConceptIds.push(pGroup.rootVacationConceptId);
        if (period.type === 'BONUS' && pGroup.rootBonusConceptId)
            rootConceptIds.push(pGroup.rootBonusConceptId);
        if (period.type === 'LIQUIDATION' && pGroup.rootLiquidationConceptId)
            rootConceptIds.push(pGroup.rootLiquidationConceptId);
        if (period.type === 'SPECIAL') {
            const specialConcepts = period.specialConcepts || [];
            rootConceptIds = specialConcepts.map((c) => c.id);
        }
        if (rootConceptIds.length === 0) {
            throw new common_1.BadRequestException(`No Execution Root Concepts defined for this period type (${period.type}) in the Payroll Group or Period.`);
        }
        let activeRecords = [];
        const includeOptions = {
            owner: { include: { familyMembers: true } },
            salaryHistories: {
                where: { validFrom: { lte: period.endDate } },
                orderBy: { validFrom: 'desc' },
                take: 1
            }
        };
        if (period.type === 'REGULAR') {
            const attendances = await this.prisma.attendanceSummary.findMany({
                where: { payrollPeriodId: periodId, tenantId },
                select: { workerId: true }
            });
            const workerIds = attendances.map(a => a.workerId);
            if (workerIds.length > 0) {
                const filters = {
                    tenantId,
                    workerId: specificWorkerId ? specificWorkerId : { in: workerIds },
                    endDate: null,
                    isActive: true,
                    status: { in: period.processStatuses && period.processStatuses.length > 0 ? period.processStatuses : ['ACTIVE'] }
                };
                if (period.costCenterId)
                    filters.costCenterId = period.costCenterId;
                if (period.departments && period.departments.length > 0) {
                    filters.departmentId = { in: period.departments.map((d) => d.id) };
                }
                activeRecords = await this.prisma.employmentRecord.findMany({
                    where: filters,
                    include: includeOptions
                });
            }
        }
        else {
            const filters = {
                tenantId,
                payrollGroupId: period.payrollGroupId,
                endDate: null,
                isActive: true,
                status: { in: period.processStatuses && period.processStatuses.length > 0 ? period.processStatuses : ['ACTIVE'] }
            };
            if (specificWorkerId)
                filters.workerId = specificWorkerId;
            if (period.costCenterId)
                filters.costCenterId = period.costCenterId;
            if (period.departments && period.departments.length > 0) {
                filters.departmentId = { in: period.departments.map((d) => d.id) };
            }
            activeRecords = await this.prisma.employmentRecord.findMany({
                where: filters,
                include: includeOptions
            });
        }
        this.logger.log(`Found ${activeRecords.length} workers to process.`);
        const deleteFilters = { payrollPeriodId: periodId, status: 'DRAFT' };
        if (specificWorkerId)
            deleteFilters.workerId = specificWorkerId;
        await this.prisma.payrollReceipt.deleteMany({
            where: deleteFilters
        });
        let executionList = [];
        for (const rootId of rootConceptIds) {
            const subList = await this.flattenAst(rootId);
            subList.forEach(item => {
                if (!executionList.find(c => c.id === item.id))
                    executionList.push(item);
            });
        }
        const { contextDict, sumVariables } = await this.buildGlobalContext(tenantId, period.payrollGroupId, period.endDate);
        const bonifiableConcepts = await this.prisma.concept.findMany({
            where: { tenantId, isBonifiable: true },
            select: { id: true }
        });
        const bonifiableConceptIds = bonifiableConcepts.map(c => c.id);
        for (const record of activeRecords) {
            if (!record.salaryHistories || record.salaryHistories.length === 0) {
                this.logger.warn(`Worker has no active salary history. Skipping.`);
                continue;
            }
            const resMetrics = await this.buildWorkerReceiptMetrics(tenantId, periodId, period, record, contextDict, bonifiableConceptIds, executionList);
            if (!resMetrics)
                continue;
            const { netPay, totalIncome, totalDeductions, receiptDetails } = resMetrics;
            await this.prisma.payrollReceipt.create({
                data: {
                    payrollPeriodId: periodId,
                    workerId: record.workerId,
                    totalEarnings: totalIncome,
                    totalDeductions,
                    netPay,
                    status: 'DRAFT',
                    details: {
                        create: receiptDetails.map(d => ({
                            conceptId: d.conceptId,
                            conceptNameSnapshot: d.conceptName,
                            typeSnapshot: d.type,
                            amount: d.amount,
                            factor: d.factor || 0,
                            rate: d.rate || 0
                        }))
                    }
                }
            });
        }
        await this.prisma.payrollPeriod.update({
            where: { id: periodId },
            data: { status: 'PRE_CALCULATED' }
        });
        this.logger.log(`Period ${periodId} successfully processed.`);
        return { success: true, count: activeRecords.length };
    }
    async dryRunWorker(tenantId, periodId, recordId, mockData) {
        const period = await this.prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: {
                departments: true,
                payrollGroup: true,
                specialConcepts: true,
                importedAttendancePeriods: true
            }
        });
        if (!period)
            throw new common_1.BadRequestException('Período inválido para prueba de escritorio');
        const pGroup = period.payrollGroup;
        if (!pGroup)
            throw new common_1.BadRequestException('El período no tiene un convenio asignado');
        let rootConceptIds = [];
        if (period.type === 'REGULAR' && pGroup.rootRegularConceptId)
            rootConceptIds.push(pGroup.rootRegularConceptId);
        if (period.type === 'VACATION' && pGroup.rootVacationConceptId)
            rootConceptIds.push(pGroup.rootVacationConceptId);
        if (period.type === 'BONUS' && pGroup.rootBonusConceptId)
            rootConceptIds.push(pGroup.rootBonusConceptId);
        if (period.type === 'LIQUIDATION' && pGroup.rootLiquidationConceptId)
            rootConceptIds.push(pGroup.rootLiquidationConceptId);
        if (period.type === 'SPECIAL') {
            const specialConcepts = period.specialConcepts || [];
            rootConceptIds = specialConcepts.map((c) => c.id);
        }
        if (rootConceptIds.length === 0) {
            throw new common_1.BadRequestException(`No Execution Root Concepts defined for this period type (${period.type}) in the Payroll Group or Period.`);
        }
        let executionList = [];
        for (const rootId of rootConceptIds) {
            const subList = await this.flattenAst(rootId);
            subList.forEach(item => {
                if (!executionList.find(c => c.id === item.id))
                    executionList.push(item);
            });
        }
        const { contextDict, sumVariables } = await this.buildGlobalContext(tenantId, period.payrollGroupId, period.endDate);
        const bonifiableConcepts = await this.prisma.concept.findMany({
            where: { tenantId, isBonifiable: true },
            select: { id: true }
        });
        const bonifiableConceptIds = bonifiableConcepts.map(c => c.id);
        const record = await this.prisma.employmentRecord.findUnique({
            where: { id: recordId },
            include: {
                worker: true,
                owner: { include: { familyMembers: true } },
                salaryHistories: { orderBy: { validFrom: 'desc' }, take: 1 }
            }
        });
        if (!record)
            throw new common_1.BadRequestException('Trabajador no encontrado para Sandbox');
        const resMetrics = await this.buildWorkerReceiptMetrics(tenantId, periodId, period, record, contextDict, bonifiableConceptIds, executionList, mockData);
        if (!resMetrics) {
            throw new common_1.BadRequestException('No se pudo levantar el AST ni la traza porque el trabajador carece de historial salarial activo.');
        }
        return resMetrics;
    }
    async evaluateFormulas(workerContext, executionList) {
        const mem = {};
        for (const [key, value] of Object.entries(workerContext)) {
            mem[key.toLowerCase()] = value;
        }
        mem['total_base_islr'] = 0;
        const receiptLines = [];
        for (const item of executionList) {
            const { code, name, type, formulaAmount, formulaFactor, formulaRate, isAuxiliary, condition } = item;
            try {
                let numResult = 0;
                let factor = 0;
                let rata = 0;
                let meetsCondition = true;
                const currentPeriodType = workerContext['_period_type'];
                if (currentPeriodType && item.executionPeriodTypes && item.executionPeriodTypes.length > 0) {
                    if (!item.executionPeriodTypes.includes(currentPeriodType)) {
                        meetsCondition = false;
                    }
                }
                if (meetsCondition && condition && condition.trim() !== '') {
                    try {
                        const safeCondition = condition.toLowerCase().replace(/===/g, '==').replace(/(?<![=<>!])=(?!=)/g, '==');
                        const isMatch = this.math.evaluate(safeCondition, mem);
                        meetsCondition = !!isMatch;
                    }
                    catch (e) {
                        this.logger.warn(`Condition failed to evaluate for ${code}: ${e.message}`);
                        meetsCondition = false;
                    }
                }
                if (!meetsCondition) {
                    numResult = 0;
                }
                else if (mem[`override_${code.toLowerCase()}`] !== undefined) {
                    numResult = mem[`override_${code.toLowerCase()}`];
                }
                else {
                    if (formulaFactor && formulaFactor.trim() !== '') {
                        factor = Number(this.math.evaluate(formulaFactor.toLowerCase(), mem)) || 0;
                    }
                    if (formulaRate && formulaRate.trim() !== '') {
                        rata = Number(this.math.evaluate(formulaRate.toLowerCase(), mem)) || 0;
                    }
                    mem['factor'] = factor;
                    mem['rata'] = rata;
                    mem['rate'] = rata;
                    try {
                        numResult = Number(this.math.evaluate(formulaAmount.toLowerCase(), mem));
                    }
                    catch (e) {
                        numResult = 0;
                    }
                }
                mem[code.toLowerCase()] = numResult;
                mem[`monto_${code.toLowerCase()}`] = numResult;
                mem[`factor_${code.toLowerCase()}`] = factor;
                mem[`rata_${code.toLowerCase()}`] = rata;
                if (item.isTaxable && numResult > 0) {
                    mem['total_base_islr'] += numResult;
                }
                if (!isAuxiliary && numResult > 0) {
                    receiptLines.push({
                        conceptId: item.id,
                        conceptCode: code,
                        conceptName: name,
                        type: type,
                        amount: numResult,
                        factor: factor,
                        rate: rata,
                        isAccountingOnly: false
                    });
                }
            }
            catch (error) {
                this.logger.error(`Error calculating Concept [${code}] for formula "${formulaAmount}": ${error.message}`);
                throw new common_1.BadRequestException(`Math Engine Error in concept ${code}: ${error.message}`);
            }
        }
        return { receiptDetails: receiptLines, memorySnapshot: mem };
    }
    async flattenAst(rootConceptId) {
        const list = [];
        const root = await this.prisma.concept.findUnique({ where: { id: rootConceptId } });
        if (root)
            list.push(root);
        await this.fetchDependencies(rootConceptId, list);
        return list;
    }
    async fetchDependencies(parentId, accumulator) {
        const relations = await this.prisma.conceptDependency.findMany({
            where: { parentConceptId: parentId },
            orderBy: { executionSequence: 'asc' },
            include: { childConcept: true }
        });
        for (const rel of relations) {
            if (!accumulator.find(c => c.id === rel.childConceptId)) {
                accumulator.push(rel.childConcept);
            }
            await this.fetchDependencies(rel.childConceptId, accumulator);
        }
    }
    async buildGlobalContext(tenantId, groupId, validDate) {
        const globals = await this.prisma.globalVariable.findMany({
            where: { tenantId, validFrom: { lte: validDate } },
            orderBy: { validFrom: 'desc' },
        });
        const groupVars = await this.prisma.payrollGroupVariable.findMany({
            where: { payrollGroupId: groupId, validFrom: { lte: validDate } },
            orderBy: { validFrom: 'desc' },
            include: { concepts: true }
        });
        const dict = {};
        const sumVariables = [];
        const allConcepts = await this.prisma.concept.findMany({ where: { tenantId } });
        allConcepts.forEach(c => {
            const lowerCode = c.code.toLowerCase();
            dict[`monto_${lowerCode}`] = 0;
            dict[`fact_${lowerCode}`] = 0;
            dict[`rata_${lowerCode}`] = 0;
        });
        globals.forEach(g => {
            const lowerCode = g.code.toLowerCase();
            if (!(lowerCode in dict))
                dict[lowerCode] = Number(g.value);
        });
        const groupDictSeen = {};
        groupVars.forEach(gv => {
            const lowerCode = gv.code.toLowerCase();
            if (gv.type === 'STATIC') {
                if (!groupDictSeen[lowerCode]) {
                    dict[lowerCode] = Number(gv.value);
                    groupDictSeen[lowerCode] = true;
                }
            }
            else if (gv.type === 'SUM_CONCEPTS') {
                if (!sumVariables.find(v => v.code.toLowerCase() === lowerCode)) {
                    sumVariables.push(gv);
                }
            }
        });
        return { contextDict: dict, sumVariables };
    }
    async getReceiptsForPeriod(periodId, canViewConfidential = false) {
        return this.prisma.payrollReceipt.findMany({
            where: {
                payrollPeriodId: periodId,
                ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } })
            },
            include: {
                worker: true,
                details: {
                    where: {
                        typeSnapshot: {
                            notIn: ['APORTE_PATRONAL', 'EMPLOYER_CONTRIBUTION']
                        }
                    },
                    orderBy: { concept: { code: 'asc' } },
                    include: { concept: { select: { code: true } } }
                }
            }
        });
    }
    async buildWorkerReceiptMetrics(tenantId, periodId, period, record, contextDict, bonifiableConceptIds, executionList, mockData) {
        if (!record.salaryHistories || record.salaryHistories.length === 0) {
            this.logger.warn(`Worker has no active salary history. Skipping.`);
            return null;
        }
        const rawSalary = Number(record.salaryHistories[0].amount);
        const salaryCurrency = record.salaryHistories[0].currency;
        const periodCurrency = period.currency || 'VES';
        const exchangeRate = period.exchangeRate ? Number(period.exchangeRate) : 1;
        let finalSalary = rawSalary;
        if (salaryCurrency === 'USD' && periodCurrency === 'VES') {
            finalSalary = rawSalary * exchangeRate;
        }
        else if (salaryCurrency === 'VES' && periodCurrency === 'USD') {
            finalSalary = rawSalary / exchangeRate;
        }
        let targetAttendancePeriodIds = [periodId];
        if (period.importedAttendancePeriods && period.importedAttendancePeriods.length > 0) {
            targetAttendancePeriodIds = period.importedAttendancePeriods.map((p) => p.id);
        }
        const attendances = await this.prisma.attendanceSummary.findMany({
            where: { payrollPeriodId: { in: targetAttendancePeriodIds }, workerId: record.workerId }
        });
        const attendance = attendances.length > 0 ? attendances.reduce((acc, curr) => ({
            ordinaryHours: Number(acc.ordinaryHours || 0) + Number(curr.ordinaryHours || 0),
            ordinaryDayHours: Number(acc.ordinaryDayHours || 0) + Number(curr.ordinaryDayHours || 0),
            ordinaryNightHours: Number(acc.ordinaryNightHours || 0) + Number(curr.ordinaryNightHours || 0),
            extraDayHours: Number(acc.extraDayHours || 0) + Number(curr.extraDayHours || 0),
            extraNightHours: Number(acc.extraNightHours || 0) + Number(curr.extraNightHours || 0),
            daysWorked: Number(acc.daysWorked || 0) + Number(curr.daysWorked || 0),
            restDays: Number(acc.restDays || 0) + Number(curr.restDays || 0),
            holidays: Number(acc.holidays || 0) + Number(curr.holidays || 0),
            workedHolidays: Number(acc.workedHolidays || 0) + Number(curr.workedHolidays || 0),
            workedRestDays: Number(acc.workedRestDays || 0) + Number(curr.workedRestDays || 0),
            justifiedAbsences: Number(acc.justifiedAbsences || 0) + Number(curr.justifiedAbsences || 0),
            unjustifiedAbsences: Number(acc.unjustifiedAbsences || 0) + Number(curr.unjustifiedAbsences || 0),
            saturdaysWorked: Number(acc.saturdaysWorked || 0) + Number(curr.saturdaysWorked || 0),
            sundaysWorked: Number(acc.sundaysWorked || 0) + Number(curr.sundaysWorked || 0),
            shiftBaseHours: curr.shiftBaseHours || acc.shiftBaseHours || null,
            shiftType: curr.shiftType || acc.shiftType || null,
            attendanceMode: curr.attendanceMode || acc.attendanceMode
        }), {}) : null;
        const sd = new Date(period.startDate);
        const ed = new Date(period.endDate);
        let lunes_en_periodo = 0;
        for (let d = new Date(sd); d <= ed; d.setUTCDate(d.getUTCDate() + 1)) {
            if (d.getUTCDay() === 1)
                lunes_en_periodo++;
        }
        let lunes_en_mes = 0;
        const startOfMonth = new Date(Date.UTC(ed.getUTCFullYear(), ed.getUTCMonth(), 1));
        const endOfMonth = new Date(Date.UTC(ed.getUTCFullYear(), ed.getUTCMonth() + 1, 0));
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setUTCDate(d.getUTCDate() + 1)) {
            if (d.getUTCDay() === 1)
                lunes_en_mes++;
        }
        const es_fin_de_mes = ed.getUTCDate() === endOfMonth.getUTCDate() ? 1 : 0;
        const workerContext = {
            _period_type: period.type,
            TASA_CAMBIO: exchangeRate,
            base_salary: finalSalary,
            ordinary_hours: attendance ? Number(attendance.ordinaryHours) : 0,
            ordinary_day_hours: attendance ? Number(attendance.ordinaryDayHours) : 0,
            ordinary_night_hours: attendance ? Number(attendance.ordinaryNightHours) : 0,
            extra_day_hours: attendance ? Number(attendance.extraDayHours) : 0,
            extra_night_hours: attendance ? Number(attendance.extraNightHours) : 0,
            worked_days: attendance ? Number(attendance.daysWorked) : 0,
            rest_days: attendance ? Number(attendance.restDays) : 0,
            holidays: attendance ? Number(attendance.holidays) : 0,
            worked_holidays: attendance ? Number(attendance.workedHolidays) : 0,
            worked_rest_days: attendance ? Number(attendance.workedRestDays) : 0,
            justified_absences: attendance ? Number(attendance.justifiedAbsences) : 0,
            unjustified_absences: attendance ? Number(attendance.unjustifiedAbsences) : 0,
            saturdays_worked: attendance ? Number(attendance.saturdaysWorked) : 0,
            sundays_worked: attendance ? Number(attendance.sundaysWorked) : 0,
            shift_base_hours: (attendance && attendance.shiftBaseHours) ? Number(attendance.shiftBaseHours) : (record.payrollGroup?.standardWorkHours ? Number(record.payrollGroup.standardWorkHours) : 8.0),
            shift_type: (attendance && attendance.shiftType) ? `'${attendance.shiftType}'` : `'DAY'`,
            attendance_mode: attendance ? `'${attendance.attendanceMode}'` : `'VIRTUAL'`,
            contract_start_day: record.startDate ? new Date(record.startDate).getUTCDate() : 1,
            contract_start_month: record.startDate ? new Date(record.startDate).getUTCMonth() + 1 : 1,
            contract_start_year: record.startDate ? new Date(record.startDate).getUTCFullYear() : new Date().getUTCFullYear(),
            contract_type: `'${record.contractType}'`,
            dependents_count: record.owner.familyMembers.length,
            lunes_en_periodo,
            lunes_en_mes,
            es_fin_de_mes,
        };
        for (const [k, v] of Object.entries(contextDict)) {
            workerContext[k] = v;
        }
        const accumulators = await this.prisma.payrollAccumulator.findMany({
            where: { tenantId },
            include: { concepts: true }
        });
        for (const accum of accumulators) {
            let conceptIds = [];
            if (accum.includeAllBonifiable) {
                conceptIds = [...bonifiableConceptIds];
            }
            else if (accum.concepts && accum.concepts.length > 0) {
                conceptIds = accum.concepts.map((c) => c.conceptId);
            }
            if (conceptIds.length === 0) {
                workerContext[accum.name] = 0;
                continue;
            }
            const calcSum = async (startDate) => {
                const res = await this.prisma.payrollReceiptDetail.aggregate({
                    _sum: { amount: true },
                    where: {
                        conceptId: { in: conceptIds },
                        payrollReceipt: {
                            workerId: record.workerId,
                            status: { in: ['FINAL', 'PAID'] },
                            payrollPeriod: {
                                endDate: { gte: startDate, lte: period.endDate }
                            }
                        }
                    }
                });
                return Number(res._sum.amount || 0);
            };
            if (accum.type === 'YEAR_TO_DATE') {
                const startOfYear = new Date(Date.UTC(period.endDate.getUTCFullYear(), 0, 1));
                workerContext[accum.name] = await calcSum(startOfYear);
            }
            else if (accum.type === 'EXACT_PERIOD') {
                const startOfPeriod = new Date(period.startDate);
                workerContext[accum.name] = await calcSum(startOfPeriod);
            }
            else {
                const weeksToSub = accum.weeksBack || 4;
                const targetDate = new Date(period.endDate);
                targetDate.setDate(targetDate.getDate() - (weeksToSub * 7));
                workerContext[accum.name] = await calcSum(targetDate);
            }
        }
        const trust = await this.prisma.contractTrust.findFirst({
            where: { employmentRecordId: record.id }
        });
        workerContext['saldo_fideicomiso_actual'] = trust ? Number(trust.availableBalance) : 0;
        const fixedConcepts = await this.prisma.workerFixedConcept.findMany({
            where: {
                employmentRecordId: record.id,
                validFrom: { lte: period.endDate },
                OR: [
                    { validTo: null },
                    { validTo: { gte: period.startDate } }
                ]
            },
            include: { concept: true }
        });
        const incidents = await this.prisma.workerNovelty.findMany({
            where: {
                employmentRecordId: record.id,
                OR: [
                    { payrollPeriodId: periodId },
                    {
                        tenantId: tenantId,
                        status: 'PENDING',
                        paymentDate: { gte: period.startDate, lte: period.endDate }
                    }
                ]
            },
            include: { concept: true }
        });
        const activeLoans = await this.prisma.workerLoan.findMany({
            where: {
                workerId: record.workerId,
                status: 'ACTIVE',
                outstandingBalance: { gt: 0 }
            }
        });
        let cuota_prestamo = 0;
        let saldo_prestamo = 0;
        for (const loan of activeLoans) {
            let apply = false;
            if (period.type === 'REGULAR' && loan.applyToRegular)
                apply = true;
            if (period.type === 'VACATION' && loan.applyToVacation)
                apply = true;
            if (period.type === 'SPECIAL' && loan.applyToSpecial)
                apply = true;
            if (period.type === 'BONUS' && loan.applyToBonus)
                apply = true;
            let loanInstallment = Number(loan.installmentAmount);
            const loanBalance = Number(loan.outstandingBalance);
            if (period.type === 'LIQUIDATION' && loan.applyToLiquidation) {
                apply = true;
                loanInstallment = loanBalance;
            }
            if (apply) {
                const loanCurrency = loan.currency || 'VES';
                const periodCurrency = period.currency || 'VES';
                let currentInstallment = loanInstallment;
                let currentBalance = loanBalance;
                if (loanCurrency === 'USD' && periodCurrency === 'VES') {
                    currentInstallment = currentInstallment * exchangeRate;
                    currentBalance = currentBalance * exchangeRate;
                }
                else if (loanCurrency === 'VES' && periodCurrency === 'USD') {
                    currentInstallment = currentInstallment / exchangeRate;
                    currentBalance = currentBalance / exchangeRate;
                }
                cuota_prestamo += currentInstallment;
                saldo_prestamo += currentBalance;
            }
        }
        workerContext['cuota_prestamo'] = cuota_prestamo;
        workerContext['saldo_prestamo'] = saldo_prestamo;
        for (const fc of fixedConcepts) {
            let finalAmount = Number(fc.amount);
            const fcCurrency = fc.currency || 'VES';
            const periodCurrency = period.currency || 'VES';
            if (fcCurrency === 'USD' && periodCurrency === 'VES') {
                const rate = workerContext['TASA_CAMBIO'] || workerContext['TASA_BCV'] || workerContext['TASA_USD'] || 1;
                finalAmount = finalAmount * Number(rate);
            }
            else if (fcCurrency === 'VES' && periodCurrency === 'USD') {
                const rate = workerContext['TASA_CAMBIO'] || workerContext['TASA_BCV'] || workerContext['TASA_USD'] || 1;
                finalAmount = finalAmount / Number(rate);
            }
            const safeCode = fc.concept.code.toLowerCase();
            workerContext[`override_${safeCode}`] = finalAmount;
            workerContext[`monto_${safeCode}`] = finalAmount;
        }
        for (const incident of incidents) {
            let finalAmount = Number(incident.amount);
            const safeCode = incident.concept.code.toLowerCase();
            workerContext[`override_${safeCode}`] = finalAmount;
            workerContext[`monto_${safeCode}`] = finalAmount;
        }
        if (mockData) {
            for (const [key, val] of Object.entries(mockData)) {
                if (val !== undefined && val !== null && val !== '') {
                    const safeVal = typeof val === 'string' ? `'${val}'` : Number(val);
                    workerContext[key.toLowerCase()] = safeVal;
                }
            }
        }
        const { receiptDetails, memorySnapshot } = await this.evaluateFormulas(workerContext, executionList);
        let totalIncome = 0;
        let totalDeductions = 0;
        let employerContributions = 0;
        receiptDetails.forEach(d => {
            if (!d.isAccountingOnly) {
                if (d.type === 'ASIGNACION' || d.type === 'EARNING')
                    totalIncome += d.amount;
                if (d.type === 'DEDUCCION' || d.type === 'DEDUCTION')
                    totalDeductions += d.amount;
                if (d.type === 'APORTE_PATRONAL' || d.type === 'EMPLOYER_CONTRIBUTION')
                    employerContributions += d.amount;
            }
        });
        const netPay = totalIncome - totalDeductions;
        return {
            netPay, totalIncome, totalDeductions, employerContributions,
            receiptDetails, memorySnapshot
        };
    }
};
exports.PayrollEngineService = PayrollEngineService;
exports.PayrollEngineService = PayrollEngineService = PayrollEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollEngineService);
//# sourceMappingURL=payroll-engine.service.js.map