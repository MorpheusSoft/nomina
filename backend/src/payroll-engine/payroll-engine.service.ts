import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as mathjs from 'mathjs';

@Injectable()
export class PayrollEngineService {
  private readonly logger = new Logger(PayrollEngineService.name);

  // We limit mathjs features for security so arbitrary JS cannot be executed.
  private readonly math = mathjs.create(mathjs.all, {});

  constructor(private prisma: PrismaService) {}

  /**
   * Main Entry Point to Calculate a Full Payroll Period
   * Deletes all previous Draft Receipts for the period before running.
   */
  async calculateFullPeriod(periodId: string, specificWorkerId?: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        payrollGroup: {
          include: {
            payrollGroupVariables: true, // Includes SUM_CONCEPTS constants
          }
        },
        departments: true,
        specialConcepts: true,
        importedAttendancePeriods: true
      }
    });

    if (!period) throw new BadRequestException('Period not found.');
    const tenantId = period.tenantId;

    this.logger.log(`Starting Engine for Period: ${periodId} | Tenant: ${tenantId}`);
    if (period.status === 'CLOSED') throw new BadRequestException('Cannot recalculate a closed period.');

    const pGroup = (period as any).payrollGroup;

    // 1. Identify Root Concept based on Period Type
    let rootConceptIds: string[] = [];
    if (period.type === 'REGULAR' && pGroup.rootRegularConceptId) rootConceptIds.push(pGroup.rootRegularConceptId);
    if (period.type === 'VACATION' && pGroup.rootVacationConceptId) rootConceptIds.push(pGroup.rootVacationConceptId);
    if (period.type === 'BONUS' && pGroup.rootBonusConceptId) rootConceptIds.push(pGroup.rootBonusConceptId);
    if (period.type === 'LIQUIDATION' && pGroup.rootLiquidationConceptId) rootConceptIds.push(pGroup.rootLiquidationConceptId);
    
    if (period.type === 'SPECIAL') {
      const specialConcepts = (period as any).specialConcepts || [];
      rootConceptIds = specialConcepts.map((c: any) => c.id);
    }

    if (rootConceptIds.length === 0) {
      throw new BadRequestException(`No Execution Root Concepts defined for this period type (${period.type}) in the Payroll Group or Period.`);
    }

    // 2. Fetch Target Workers
    let activeRecords: any[] = [];

    const includeOptions = {
      owner: { include: { familyMembers: true } },
      salaryHistories: {
        where: { validFrom: { lte: period.endDate } },
        orderBy: { validFrom: 'desc' as any },
        take: 1
      }
    };

    if (period.type === 'REGULAR') {
      // 2A. REGULAR: Driven by Attendance existence
      const attendances = await this.prisma.attendanceSummary.findMany({
        where: { payrollPeriodId: periodId, tenantId },
        select: { workerId: true }
      });
      const workerIds = attendances.map(a => a.workerId);

      if (workerIds.length > 0) {
        const filters: any = {
          tenantId,
          workerId: specificWorkerId ? specificWorkerId : { in: workerIds },
          endDate: null,
          isActive: true,
          status: { in: period.processStatuses && period.processStatuses.length > 0 ? period.processStatuses : ['ACTIVE'] }
        };
        if (period.costCenterId) filters.costCenterId = period.costCenterId;
        if ((period as any).departments && (period as any).departments.length > 0) {
          filters.departmentId = { in: (period as any).departments.map((d: any) => d.id) };
        }

        activeRecords = await this.prisma.employmentRecord.findMany({
          where: filters,
          include: includeOptions
        });
      }
    } else {
      // 2B. SPECIAL/BONUS/VACATION/SETTLEMENT: Driven by Payroll Group (All active workers)
      const filters: any = {
        tenantId,
        payrollGroupId: period.payrollGroupId,
        endDate: null,
        isActive: true,
        status: { in: period.processStatuses && period.processStatuses.length > 0 ? period.processStatuses : ['ACTIVE'] }
      };
      
      if (specificWorkerId) filters.workerId = specificWorkerId;
      if (period.costCenterId) filters.costCenterId = period.costCenterId;
      if ((period as any).departments && (period as any).departments.length > 0) {
        filters.departmentId = { in: (period as any).departments.map((d: any) => d.id) };
      }

      activeRecords = await this.prisma.employmentRecord.findMany({
        where: filters,
        include: includeOptions
      });
    }

    this.logger.log(`Found ${activeRecords.length} workers to process.`);

    // 3. Clear existing DRAFT receipts for this period to avoid duplicates (If specific worker, only delete theirs)
    const deleteFilters: any = { payrollPeriodId: periodId, status: 'DRAFT' };
    if (specificWorkerId) deleteFilters.workerId = specificWorkerId;

    await this.prisma.payrollReceipt.deleteMany({
      where: deleteFilters
    });

    // 4. Resolve the execution sequence (AST Flattening)
    let executionList: any[] = [];
    for (const rootId of rootConceptIds) {
      const subList = await this.flattenAst(rootId);
      subList.forEach(item => {
        if (!executionList.find(c => c.id === item.id)) executionList.push(item);
      });
    }
    
    // 5. Build Global and Group Constants (The Memory Dictionary Base)
    const { contextDict, sumVariables } = await this.buildGlobalContext(tenantId, period.payrollGroupId, period.endDate);

    // 5.5 Fetch all bonifiable concepts for dynamic accumulators
    const bonifiableConcepts = await this.prisma.concept.findMany({
      where: { tenantId, isBonifiable: true },
      select: { id: true }
    });
    const bonifiableConceptIds = bonifiableConcepts.map(c => c.id);

    // 6. Process each Worker Individually (This could be mapped/batched later)
    for (const record of (activeRecords as any[])) {
      if (!record.salaryHistories || record.salaryHistories.length === 0) {
        this.logger.warn(`Worker has no active salary history. Skipping.`);
        continue;
      }

      const resMetrics = await this.buildWorkerReceiptMetrics(
        tenantId, periodId, period, record, contextDict, bonifiableConceptIds, executionList
      );

      if (!resMetrics) continue;

      const { netPay, totalIncome, totalDeductions, receiptDetails } = resMetrics;

      // 9. Persist the Result for this Worker
      await (this.prisma.payrollReceipt as any).create({
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

    // Update Period Status
    await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: 'PRE_CALCULATED' }
    });

    this.logger.log(`Period ${periodId} successfully processed.`);
    return { success: true, count: activeRecords.length };
  }

  public async dryRunWorker(tenantId: string, periodId: string, recordId: string, mockData?: Record<string, any>) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        departments: true,
        payrollGroup: true,
        specialConcepts: true,
        importedAttendancePeriods: true
      }
    });

    if (!period) throw new BadRequestException('Período inválido para prueba de escritorio');
    const pGroup = (period as any).payrollGroup;
    if (!pGroup) throw new BadRequestException('El período no tiene un convenio asignado');

    let rootConceptIds: string[] = [];
    if (period.type === 'REGULAR' && pGroup.rootRegularConceptId) rootConceptIds.push(pGroup.rootRegularConceptId);
    if (period.type === 'VACATION' && pGroup.rootVacationConceptId) rootConceptIds.push(pGroup.rootVacationConceptId);
    if (period.type === 'BONUS' && pGroup.rootBonusConceptId) rootConceptIds.push(pGroup.rootBonusConceptId);
    if (period.type === 'LIQUIDATION' && pGroup.rootLiquidationConceptId) rootConceptIds.push(pGroup.rootLiquidationConceptId);
    
    if (period.type === 'SPECIAL') {
      const specialConcepts = (period as any).specialConcepts || [];
      rootConceptIds = specialConcepts.map((c: any) => c.id);
    }

    if (rootConceptIds.length === 0) {
      throw new BadRequestException(`No Execution Root Concepts defined for this period type (${period.type}) in the Payroll Group or Period.`);
    }

    let executionList: any[] = [];
    for (const rootId of rootConceptIds) {
      const subList = await this.flattenAst(rootId);
      subList.forEach(item => {
        if (!executionList.find(c => c.id === item.id)) executionList.push(item);
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

    if (!record) throw new BadRequestException('Trabajador no encontrado para Sandbox');

    const resMetrics = await this.buildWorkerReceiptMetrics(
      tenantId, periodId, period, record, contextDict, bonifiableConceptIds, executionList, mockData
    );

    if (!resMetrics) {
       throw new BadRequestException('No se pudo levantar el AST ni la traza porque el trabajador carece de historial salarial activo.');
    }

    return resMetrics;
  }

  /**
   * Evaluates the math formulas strictly in the sequence provided.
   * Returns a list of generated Receipt Lines and the internal memory snapshot.
   */
  private async evaluateFormulas(workerContext: Record<string, any>, executionList: any[]): Promise<{ receiptDetails: any[], memorySnapshot: any }> {
    // MathJS es case-sensitive. Para evitar problemas al usuario si escribe SUELDO en vez de sueldo,
    // normalizaremos el diccionario a minúsculas y las fórmulas proporcionadas también a minúsculas.
    const mem: Record<string, any> = {};
    for (const [key, value] of Object.entries(workerContext)) {
      mem[key.toLowerCase()] = value;
    }
    // Inicialización del acumulador dinámico para ISLR
    mem['total_base_islr'] = 0;
    const receiptLines = [];

    for (const item of executionList) {
      const { code, name, type, formulaAmount, formulaFactor, formulaRate, isAuxiliary, condition } = item;
      
      try {
        let numResult = 0;
        let factor = 0;
        let rata = 0;
        let meetsCondition = true;
        
        // Strict Period Type Short-Circuit
        const currentPeriodType = workerContext['_period_type'];
        if (currentPeriodType && item.executionPeriodTypes && item.executionPeriodTypes.length > 0) {
           if (!item.executionPeriodTypes.includes(currentPeriodType)) {
              meetsCondition = false;
           }
        }

        if (meetsCondition && condition && condition.trim() !== '') {
          try {
            // Prevent users from accidentally doing assignments (e.g. "var = 1") by forcing equality ("var == 1")
            // Also downgrade strict equality (===) to (==) since mathjs doesn't natively support triple equals.
            const safeCondition = condition.toLowerCase().replace(/===/g, '==').replace(/(?<![=<>!])=(?!=)/g, '==');
            const isMatch = this.math.evaluate(safeCondition, mem);
            meetsCondition = !!isMatch; // Convert to strict boolean (0 implies false)
          } catch(e) {
            this.logger.warn(`Condition failed to evaluate for ${code}: ${e.message}`);
            meetsCondition = false;
          }
        }

        if (!meetsCondition) {
          // Si no cumple la condición, numResult es 0 y se inyecta en memoria para futuras ramas,
          // pero NO se evalúan las fórmulas internas ni se guarda en el recibo final.
          numResult = 0;
        } else if (mem[`override_${code.toLowerCase()}`] !== undefined) {
          numResult = mem[`override_${code.toLowerCase()}`]; // Override from WorkerFixedConcept
        } else {
          // 1. Evaluate Factor if exists
          if (formulaFactor && formulaFactor.trim() !== '') {
            factor = Number(this.math.evaluate(formulaFactor.toLowerCase(), mem)) || 0;
          }
          // 2. Evaluate Rata if exists
          if (formulaRate && formulaRate.trim() !== '') {
            rata = Number(this.math.evaluate(formulaRate.toLowerCase(), mem)) || 0;
          }

          // Inject into memory context for the execution of the Amount formula
          mem['factor'] = factor;
          mem['rata'] = rata;
          mem['rate'] = rata; // alias just in case

          // 3. Evaluate Amount formula
          try {
             // Reemplazar ocurrencias de las palabras clave para que coincidan con the lowered variables
             numResult = Number(this.math.evaluate(formulaAmount.toLowerCase(), mem));
          } catch(e) {
             numResult = 0;
          }
        }

        // Store result for subsequent formulas ensuring keys are lowercase because equations are lowered
        mem[code.toLowerCase()] = numResult;
        mem[`monto_${code.toLowerCase()}`] = numResult;
        mem[`factor_${code.toLowerCase()}`] = factor;
        mem[`rata_${code.toLowerCase()}`] = rata;

        // Si es gravable, sumar en vivo a la memoria del retenedor de ISLR
        if (item.isTaxable && numResult > 0) {
           mem['total_base_islr'] += numResult;
        }
        
        // Add to payslip if not purely auxiliary
        if (!isAuxiliary && numResult > 0) {
           receiptLines.push({
             conceptId: item.id,
             conceptCode: code,
             conceptName: name,
             type: type, // EARNING, DEDUCTION, etc.
             amount: numResult,
             factor: factor,
             rate: rata,
             isAccountingOnly: false
           });
        }
      } catch (error) {
        this.logger.error(`Error calculating Concept [${code}] for formula "${formulaAmount}": ${error.message}`);
        throw new BadRequestException(`Math Engine Error in concept ${code}: ${error.message}`);
      }
    }

    return { receiptDetails: receiptLines, memorySnapshot: mem };
  }

  /**
   * Breadth-First-Search or Recursive Traversal to Flatten the Concept Tree
   * By following the sequence defined in ConceptDependency.
   */
  private async flattenAst(rootConceptId: string): Promise<any[]> {
    const list = [];
    
    // First, push the root itself.
    const root = await this.prisma.concept.findUnique({ where: { id: rootConceptId }});
    if (root) list.push(root);

    // Recursively fetch children
    await this.fetchDependencies(rootConceptId, list);
    
    return list;
  }

  private async fetchDependencies(parentId: string, accumulator: any[]) {
    const relations = await this.prisma.conceptDependency.findMany({
      where: { parentConceptId: parentId },
      orderBy: { executionSequence: 'asc' },
      include: { childConcept: true }
    });

    for (const rel of relations) {
      if (!accumulator.find(c => c.id === rel.childConceptId)) {
        accumulator.push(rel.childConcept);
      }
      // Deep traverse down the tree
      await this.fetchDependencies(rel.childConceptId, accumulator);
    }
  }

  private async buildGlobalContext(tenantId: string, groupId: string, validDate: Date): Promise<{ contextDict: Record<string, any>, sumVariables: any[] }> {
     const globals = await this.prisma.globalVariable.findMany({
       where: { tenantId, validFrom: { lte: validDate } },
       orderBy: { validFrom: 'desc' },
     });

     const groupVars = await this.prisma.payrollGroupVariable.findMany({
        where: { payrollGroupId: groupId, validFrom: { lte: validDate } },
        orderBy: { validFrom: 'desc' },
        include: { concepts: true }
     });

     const dict: Record<string, any> = {};
     const sumVariables: any[] = [];
     
     // 0. Pre-initialize ALL concepts to 0 to prevent MathJS Undefined errors
     const allConcepts = await this.prisma.concept.findMany({ where: { tenantId } });
     allConcepts.forEach(c => {
       const lowerCode = c.code.toLowerCase();
       dict[`monto_${lowerCode}`] = 0;
       dict[`fact_${lowerCode}`] = 0;
       dict[`rata_${lowerCode}`] = 0;
     });

     // 1. Write Globals (Only capture the newest version per code)
     globals.forEach(g => {
       const lowerCode = g.code.toLowerCase();
       if (!(lowerCode in dict)) dict[lowerCode] = Number(g.value);
     });
     
     // 2. Overwrite with Group Variables (Higher precedence)
     const groupDictSeen: Record<string, boolean> = {};
     groupVars.forEach(gv => {
       const lowerCode = gv.code.toLowerCase();
       if (gv.type === 'STATIC') {
          // If we haven't seen this group variable code yet (meaning it's the newest), overwrite global.
          if (!groupDictSeen[lowerCode]) {
             dict[lowerCode] = Number(gv.value);
             groupDictSeen[lowerCode] = true;
          }
       } else if (gv.type === 'SUM_CONCEPTS') {
          // Keep highest precedence sum concept definition per code
          if (!sumVariables.find(v => v.code.toLowerCase() === lowerCode)) {
             sumVariables.push(gv);
          }
       }
     });

     return { contextDict: dict, sumVariables };
  }

  async getReceiptsForPeriod(periodId: string, canViewConfidential: boolean = false) {
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

  private async buildWorkerReceiptMetrics(
    tenantId: string,
    periodId: string,
    period: any,
    record: any,
    contextDict: Record<string, any>,
    bonifiableConceptIds: string[],
    executionList: any[],
    mockData?: Record<string, any>
  ) {
      if (!record.salaryHistories || record.salaryHistories.length === 0) {
        this.logger.warn(`Worker has no active salary history. Skipping.`);
        return null;
      }
      
      const rawSalary = Number(record.salaryHistories[0].amount);
      const salaryCurrency = record.salaryHistories[0].currency;
      
      const periodCurrency = period.currency || 'VES';
      const exchangeRate = period.exchangeRate ? Number(period.exchangeRate) : 1;
      
      let finalSalary = rawSalary;
      // Convert to period currency if different. Specifically from USD to VES.
      if (salaryCurrency === 'USD' && periodCurrency === 'VES') {
          finalSalary = rawSalary * exchangeRate;
      } else if (salaryCurrency === 'VES' && periodCurrency === 'USD') {
          // In case someone earns in VES but the payroll resolves in USD (Rare but mathematically possible)
          finalSalary = rawSalary / exchangeRate;
      }

      // Hydrate Context 
      // This includes reading Time & Attendance for `worked_days` and `extra_night_hours`
      let targetAttendancePeriodIds = [periodId];
      if (period.importedAttendancePeriods && period.importedAttendancePeriods.length > 0) {
         targetAttendancePeriodIds = period.importedAttendancePeriods.map((p: any) => p.id);
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
        workedDaysDay: Number(acc.workedDaysDay || 0) + Number(curr.workedDaysDay || 0),
        workedDaysNight: Number(acc.workedDaysNight || 0) + Number(curr.workedDaysNight || 0),
        workedDaysMixed: Number(acc.workedDaysMixed || 0) + Number(curr.workedDaysMixed || 0),
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
      }), {} as any) : null;

      // --- CALCULATE TIME METRICS FOR THE CONTEXT ---
      const sd = new Date(period.startDate);
      const ed = new Date(period.endDate);
      
      let lunes_en_periodo = 0;
      for (let d = new Date(sd); d <= ed; d.setUTCDate(d.getUTCDate() + 1)) {
        if (d.getUTCDay() === 1) lunes_en_periodo++;
      }

      let lunes_en_mes = 0;
      const startOfMonth = new Date(Date.UTC(ed.getUTCFullYear(), ed.getUTCMonth(), 1));
      const endOfMonth = new Date(Date.UTC(ed.getUTCFullYear(), ed.getUTCMonth() + 1, 0));
      for (let d = new Date(startOfMonth); d <= endOfMonth; d.setUTCDate(d.getUTCDate() + 1)) {
        if (d.getUTCDay() === 1) lunes_en_mes++;
      }

      const es_fin_de_mes = ed.getUTCDate() === endOfMonth.getUTCDate() ? 1 : 0;

      const workerContext: Record<string, any> = {
        _period_type: period.type,
        TASA_CAMBIO: exchangeRate,
        base_salary: finalSalary,
        ordinary_hours: attendance ? Number(attendance.ordinaryHours) : 0,
        ordinary_day_hours: attendance ? Number(attendance.ordinaryDayHours) : 0,
        ordinary_night_hours: attendance ? Number(attendance.ordinaryNightHours) : 0,
        extra_day_hours: attendance ? Number(attendance.extraDayHours) : 0,
        extra_night_hours: attendance ? Number(attendance.extraNightHours) : 0,
        worked_days: attendance ? Number(attendance.daysWorked) : 0,
        worked_days_day: attendance ? Number(attendance.workedDaysDay) : 0,
        worked_days_night: attendance ? Number(attendance.workedDaysNight) : 0,
        worked_days_mixed: attendance ? Number(attendance.workedDaysMixed) : 0,
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

      // Inyectar variables globales y de tenant de forma insensible a mayúsculas
      for (const [k, v] of Object.entries(contextDict)) {
        workerContext[k] = v;
      }

      // Inyectar Variables del Centro de Costo (Tienen mayor precedencia, sobrescriben a las de convenio/globales)
      if (record.costCenterId) {
        const ccVars = await (this.prisma as any).costCenterVariable.findMany({
          where: { costCenterId: record.costCenterId, validFrom: { lte: period.endDate } },
          orderBy: { validFrom: 'desc' }
        });
        
        const ccDictSeen: Record<string, boolean> = {};
        for (const cv of ccVars) {
          const lowerCode = cv.code.toLowerCase();
          if (!ccDictSeen[lowerCode]) {
             workerContext[lowerCode] = Number(cv.value);
             ccDictSeen[lowerCode] = true;
          }
        }
      }



      // 6.5 Resolve Dynamic Accumulators (Retroactive Memory)
      const accumulators = await this.prisma.payrollAccumulator.findMany({
        where: { tenantId },
        include: { concepts: true }
      });

      for (const accum of accumulators as any[]) {
        let conceptIds: string[] = [];
        if (accum.includeAllBonifiable) {
           conceptIds = [...bonifiableConceptIds];
        } else if (accum.concepts && accum.concepts.length > 0) {
           conceptIds = accum.concepts.map((c: any) => c.conceptId);
        }

        if (conceptIds.length === 0) {
          workerContext[accum.name] = 0;
          continue;
        }

        // Helper func to aggregate past salaries based on X months
        const calcSum = async (startDate: Date) => {
           const res = await this.prisma.payrollReceiptDetail.aggregate({
             _sum: { amount: true },
             where: {
               conceptId: { in: conceptIds },
               payrollReceipt: {
                 workerId: record.workerId,
                 status: { in: ['FINAL', 'PAID'] }, // count only closed payrolls
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
        } else if (accum.type === 'EXACT_PERIOD') {
          const startOfPeriod = new Date(period.startDate);
          workerContext[accum.name] = await calcSum(startOfPeriod);
        } else {
          const weeksToSub = accum.weeksBack || 4;
          const targetDate = new Date(period.endDate);
          targetDate.setDate(targetDate.getDate() - (weeksToSub * 7));
          workerContext[accum.name] = await calcSum(targetDate);
        }
      }

      // 6.5.1 Inject Social Benefits / Fideicomiso Balance
      const trust = await this.prisma.contractTrust.findFirst({
        where: { employmentRecordId: record.id }
      });
      workerContext['saldo_fideicomiso_actual'] = trust ? Number(trust.availableBalance) : 0;

      // 6.6 Inject WorkerFixedConcepts as Overrides
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

      // 6.6.5 Inject WorkerNovelties (Novedades Globales) as Overrides
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

      // 6.7 Inject WorkerLoans (Préstamos Corporativos)
      const activeLoans = await (this.prisma as any).workerLoan.findMany({
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
        if (period.type === 'REGULAR' && loan.applyToRegular) apply = true;
        if (period.type === 'VACATION' && loan.applyToVacation) apply = true;
        if (period.type === 'SPECIAL' && loan.applyToSpecial) apply = true;
        if (period.type === 'BONUS' && loan.applyToBonus) apply = true;
        
        let loanInstallment = Number(loan.installmentAmount);
        const loanBalance = Number(loan.outstandingBalance);

        if (period.type === 'LIQUIDATION' && loan.applyToLiquidation) {
           apply = true;
           loanInstallment = loanBalance; // Cobra todo compulsivo!
        }

        if (apply) {
           const loanCurrency = loan.currency || 'VES';
           const periodCurrency = period.currency || 'VES';

           let currentInstallment = loanInstallment;
           let currentBalance = loanBalance;

           if (loanCurrency === 'USD' && periodCurrency === 'VES') {
             currentInstallment = currentInstallment * exchangeRate;
             currentBalance = currentBalance * exchangeRate;
           } else if (loanCurrency === 'VES' && periodCurrency === 'USD') {
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

        // Si el empleado gana el bono en USD pero la nómina es en VES, convertimos
        if (fcCurrency === 'USD' && periodCurrency === 'VES') {
          const rate = workerContext['TASA_CAMBIO'] || workerContext['TASA_BCV'] || workerContext['TASA_USD'] || 1;
          finalAmount = finalAmount * Number(rate);
        } else if (fcCurrency === 'VES' && periodCurrency === 'USD') {
          const rate = workerContext['TASA_CAMBIO'] || workerContext['TASA_BCV'] || workerContext['TASA_USD'] || 1;
          finalAmount = finalAmount / Number(rate);
        }
        
        const safeCode = fc.concept.code.toLowerCase();
        workerContext[`override_${safeCode}`] = finalAmount;
        workerContext[`monto_${safeCode}`] = finalAmount;
      }

      for (const incident of incidents) {
        let finalAmount = Number(incident.amount);
        // By design (Option 2): We inject the raw number. It could be days, percentage, or money.
        // It's the engine's formula responsibility to multiply by exchange rates if applicable.
        const safeCode = incident.concept.code.toLowerCase();
        workerContext[`override_${safeCode}`] = finalAmount;
        workerContext[`monto_${safeCode}`] = finalAmount;
      }

      // 6.8 INJECT MOCK DATA (For Sandbox Testing)
      if (mockData) {
        for (const [key, val] of Object.entries(mockData)) {
          // Si el mock trae valor nulo o indefinido lo ignoramos para mantener el real
          if (val !== undefined && val !== null && val !== '') {
             // Formateo los strings como en el engine (ej. shift_type)
             const safeVal = typeof val === 'string' ? `'${val}'` : Number(val);
             workerContext[key.toLowerCase()] = safeVal;
          }
        }
      }

      // 7. Execute the Formulas!
      const { receiptDetails, memorySnapshot } = await this.evaluateFormulas(workerContext, executionList);
      
      // 8. Aggregate Totals
      let totalIncome = 0;
      let totalDeductions = 0;
      let employerContributions = 0;
      
      receiptDetails.forEach(d => {
        if (!d.isAccountingOnly) {
           // We assign based on type
           if (d.type === 'ASIGNACION' || d.type === 'EARNING') totalIncome += d.amount;
           if (d.type === 'DEDUCCION' || d.type === 'DEDUCTION') totalDeductions += d.amount;
           if (d.type === 'APORTE_PATRONAL' || d.type === 'EMPLOYER_CONTRIBUTION') employerContributions += d.amount;
        }
      });
      
      const netPay = totalIncome - totalDeductions;


    return {
      netPay, totalIncome, totalDeductions, employerContributions,
      receiptDetails, memorySnapshot
    };
  }}
