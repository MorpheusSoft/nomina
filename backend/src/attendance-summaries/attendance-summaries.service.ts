import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceEngineService } from '../attendance-engine/attendance-engine.service';

@Injectable()
export class AttendanceSummariesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engineService: AttendanceEngineService
  ) {}

  async findByPeriod(payrollPeriodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: payrollPeriodId } });
    if (!period) return [];
    const tenantId = period.tenantId;

    return this.prisma.attendanceSummary.findMany({
      where: { payrollPeriodId, tenantId },
      include: {
        worker: { select: { firstName: true, lastName: true, primaryIdentityNumber: true } }
      }
    });
  }

  async upsertSummary(data: any) {
    try {
      const { payrollPeriodId, workerId, ...rest } = data;
      const period = await this.prisma.payrollPeriod.findUnique({ where: { id: payrollPeriodId } });
      if (!period) throw new NotFoundException('Period not found');
      
      const tenantId = period.tenantId;
      return await this.prisma.attendanceSummary.upsert({
        where: {
          payrollPeriodId_workerId: { payrollPeriodId, workerId }
        },
        update: rest,
        create: { tenantId, payrollPeriodId, workerId, ...rest }
      });
    } catch (e) {
      console.error("UPSERT ERROR:", e);
      throw e;
    }
  }

  private getAbsencesForWorker(workerId: string, absences: any[], startPeriod: Date, endPeriod: Date) {
     let justified = 0;
     let unjustified = 0;

     const workerAbs = absences.filter(a => a.workerId === workerId);
     const msPerDay = 1000 * 60 * 60 * 24;

     for (const abs of workerAbs) {
        const start = abs.startDate > startPeriod ? abs.startDate : startPeriod;
        const end = abs.endDate < endPeriod ? abs.endDate : endPeriod;
        if (start <= end) {
           const days = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
           if (abs.isJustified) justified += days;
           else unjustified += days;
        }
     }
     return { justified, unjustified };
  }

  async upsertBulk(records: any[]) {
    if (!records || records.length === 0) return [];
    const periodId = records[0].payrollPeriodId;
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Period not found');
    const tenantId = period.tenantId;

    const operations = records.map((data) => {
      const { payrollPeriodId, workerId, ...rest } = data;
      return this.prisma.attendanceSummary.upsert({
        where: {
          payrollPeriodId_workerId: { payrollPeriodId, workerId }
        },
        update: rest,
        create: { tenantId, payrollPeriodId, workerId, ...rest }
      });
    });

    try {
      return await this.prisma.$transaction(operations);
    } catch (e) {
      console.error("UPSERT BULK ERROR:", e);
      throw e;
    }
  }

  async generateFromDailyAttendance(payrollPeriodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ 
       where: { id: payrollPeriodId },
       include: { departments: true, payrollGroup: true }
    });
    if (!period) throw new NotFoundException('Period not found');
    const tenantId = period.tenantId;

    // 0. Autogenerar Feriados del Año actual (por el tenant)
    const currentYear = new Date().getUTCFullYear();
    // Resolving internally through module injection, OR we can fetch it. 
    // Wait, AttendanceSummariesModule doesn't have HolidaysService injected. 
    // I will inject it or just let AttendanceEngine handle it!
    await this.engineService.processPeriodPunches(tenantId, period.startDate, period.endDate);

    // X. Obtener solo trabajadores del Grupo de Nomina de este Periodo, aplicando el estatus de procesamiento
    const whereClause: any = { 
      payrollGroupId: period.payrollGroupId, 
      isActive: true,
      status: { in: period.processStatuses && period.processStatuses.length > 0 ? period.processStatuses : ['ACTIVE'] }
    };
    if (period.costCenterId) whereClause.costCenterId = period.costCenterId;
    if (period.departments && period.departments.length > 0) {
       whereClause.departmentId = { in: period.departments.map((d: any) => d.id) };
    }

    const targetEmployments = await this.prisma.employmentRecord.findMany({
      where: whereClause,
      include: {
         crew: { include: { shiftPattern: true } }
      }
    });
    const targetWorkerIds = new Set(targetEmployments.map(e => e.workerId));

    // 2. Obtener los consolidados diarios del periodo
    const dailyRecords = await this.prisma.dailyAttendance.findMany({
      where: {
        tenantId,
        date: {
          gte: period.startDate,
          lte: period.endDate,
        }
      }
    });

    const periodAbsences = await this.prisma.workerAbsence.findMany({
      where: {
        tenantId,
        startDate: { lte: period.endDate },
        endDate: { gte: period.startDate },
        status: 'APPROVED'
      }
    });

    const vacations = await this.prisma.vacationHistory.findMany({
      where: {
        tenantId,
        startDate: { lte: period.endDate },
        endDate: { gte: period.startDate }
      }
    });

    const holidays = await this.prisma.holiday.findMany({ where: { tenantId } });

    // Agrupar por trabajador
    const workerMap = new Map<string, any>();
    for (const record of dailyRecords) {
      // Ignorar trabajadores que no pertenezcan al Grupo de Nomina de este periodo
      if (!targetWorkerIds.has(record.workerId)) continue;
      
      const emp = targetEmployments.find(e => e.workerId === record.workerId);
      if (emp) {
         const rDateMs = new Date(record.date).getTime();
         const startMs = Math.max(period.startDate.getTime(), emp.startDate.getTime());
         const empEndDateMs = emp.endDate ? emp.endDate.getTime() : Infinity;
         const endMs = Math.min(period.endDate.getTime(), empEndDateMs);
         if (rDateMs < startMs || rDateMs > endMs) continue; // Fuera de vigencia de contrato
         
         const isVacation = vacations.some(v => v.employmentRecordId === emp.id && rDateMs >= v.startDate.getTime() && rDateMs <= v.endDate.getTime());
         if (isVacation) continue; // No consolidar marcas hechas en periodo de vacacion
      }
      
      if (!workerMap.has(record.workerId)) {
        workerMap.set(record.workerId, {
          tenantId,
          payrollPeriodId,
          workerId: record.workerId,
          attendanceMode: 'PHYSICAL',
          shiftBaseHours: 8, // fallback default
          shiftType: 'DIURNO',
          daysWorked: 0,
          workedDaysDay: 0,
          workedDaysNight: 0,
          workedDaysMixed: 0,
          ordinaryHours: 0,
          ordinaryDayHours: 0,
          ordinaryNightHours: 0,
          extraDayHours: 0,
          extraNightHours: 0,
          restDays: 0,
          holidays: 0,
          workedHolidays: 0,
          workedRestDays: 0,
          saturdaysWorked: 0,
          sundaysWorked: 0,
          justifiedAbsences: 0,
          unjustifiedAbsences: 0,
          punchedDates: new Set<string>(), // Added for missing-punch inference
        });

        const counts = this.getAbsencesForWorker(record.workerId, periodAbsences, period.startDate, period.endDate);
        workerMap.get(record.workerId).justifiedAbsences = counts.justified;
        workerMap.get(record.workerId).unjustifiedAbsences = counts.unjustified;
      }

      const calc = workerMap.get(record.workerId);
      
      // Track the date to know what was punched
      if (record.date) calc.punchedDates.add(new Date(record.date).toISOString().split('T')[0]);

      if (record.status === 'PRESENT' || record.status === 'WORKED_HOLIDAY') {
        calc.daysWorked += 1;
        if (record.status === 'WORKED_HOLIDAY') {
            calc.workedHolidays += 1;
        }
        
        calc.ordinaryHours += Number(record.regularHours);
        calc.ordinaryDayHours += Number(record.ordinaryDayHours);
        calc.ordinaryNightHours += Number(record.ordinaryNightHours);
        calc.extraDayHours += Number(record.extraDayHours);
        calc.extraNightHours += Number(record.extraNightHours);

        // CLASIFICACIÓN DE LA JORNADA
        const nightHrs = Number(record.ordinaryNightHours);
        const maxNight = Number(period.payrollGroup?.mixedShiftMaxNightHours || 4.0);
        
        if (nightHrs === 0) {
            calc.workedDaysDay += 1;
        } else if (nightHrs <= maxNight) {
            calc.workedDaysMixed += 1;
        } else {
            calc.workedDaysNight += 1;
        }
      } else if (record.status === 'REST') {
        calc.restDays += 1;
      } else if (record.status === 'HOLIDAY') {
        calc.holidays += 1;
      }

      // Check for weekends worked
      if (['PRESENT', 'WORKED_HOLIDAY', 'WORKED_RESTDAY'].includes(record.status)) {
         const jsDate = new Date(record.date);
         if (jsDate.getUTCDay() === 0) calc.sundaysWorked += 1;
         if (jsDate.getUTCDay() === 6) calc.saturdaysWorked += 1;
      }
    }
    // --- NEW LOGIC: INFER MISSING PUNCHES ---
    const msPerDay = 1000 * 60 * 60 * 24;
    for (const emp of targetEmployments) {
       if (!workerMap.has(emp.workerId)) continue;
       const calc = workerMap.get(emp.workerId);
       
       let startMs = Math.max(period.startDate.getTime(), emp.startDate.getTime());
       let empEndDateMs = emp.endDate ? emp.endDate.getTime() : Infinity;
       let endMs = Math.min(period.endDate.getTime(), empEndDateMs);
       if (startMs > endMs) continue;

       const numDays = Math.round((endMs - startMs) / msPerDay) + 1; 
       let hasValidShift = emp.crew && emp.crew.shiftPattern && emp.crew.patternAnchor;

       for (let i = 0; i < numDays; i++) {
          const currentDate = new Date(startMs + (i * msPerDay));
          const dateStr = currentDate.toISOString().split('T')[0];
          
          if (!calc.punchedDates.has(dateStr)) {
             // Check HR absence
             const dateStrTrim = currentDate.toISOString().split('T')[0];
             const isCoveredByAbsence = periodAbsences.some(a => {
                 const sStr = a.startDate.toISOString().split('T')[0];
                 const eStr = a.endDate.toISOString().split('T')[0];
                 return a.workerId === emp.workerId && dateStrTrim >= sStr && dateStrTrim <= eStr;
             });

             const isCoveredByVacation = vacations.some(v => {
                 const sStr = v.startDate.toISOString().split('T')[0];
                 const eStr = v.endDate.toISOString().split('T')[0];
                 return v.employmentRecordId === emp.id && dateStrTrim >= sStr && dateStrTrim <= eStr;
             });

             const [year, month, day] = dateStr.split('-').map(Number);
             const isHoliday = holidays.some(h => {
                if (h.isAnnual) {
                  return (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
                } else {
                  return h.date.getUTCFullYear() === year && (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
                }
             });

             if (isHoliday) {
                 calc.holidays++;
             } else if (!isCoveredByAbsence && !isCoveredByVacation && hasValidShift) {
                 const anchorDate = new Date(emp.crew!.patternAnchor!);
                 const utcAnchor = Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate());
                 const utcTarget = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
                 const diffDays = Math.floor((utcTarget - utcAnchor) / msPerDay);
                 if (diffDays >= 0) {
                   const sequence = emp.crew!.shiftPattern!.sequence as any[];
                   const sft = sequence[diffDays % sequence.length];
                   if (sft && sft.type === 'WORK') {
                       calc.unjustifiedAbsences++;
                   } else {
                       calc.restDays++;
                   }
                 }
             }
          }
       }

       // REMOVED: Commercial Month limitation is now delegated to the Payroll Concept Engine Formula
       
       delete calc.punchedDates; // remove temp set
    }

    const recordsToUpsert = Array.from(workerMap.values());
    if (recordsToUpsert.length === 0) return { count: 0 };

    await this.upsertBulk(recordsToUpsert);
    
    // --- BARRIDO DE NOVEDADES GLOBALES ---
    await this.sweepWorkerNovelties(period, Array.from(targetWorkerIds));

    return { count: recordsToUpsert.length };
  }

  async generateVirtualAttendance(payrollPeriodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ 
       where: { id: payrollPeriodId },
       include: { departments: true, payrollGroup: true }
    });
    if (!period) throw new NotFoundException('Period not found');
    const tenantId = period.tenantId;

    const whereClause: any = { 
      payrollGroupId: period.payrollGroupId, 
      isActive: true,
      status: { in: period.processStatuses && period.processStatuses.length > 0 ? period.processStatuses : ['ACTIVE'] }
    };
    if (period.costCenterId) whereClause.costCenterId = period.costCenterId;
    if ((period as any).departments && (period as any).departments.length > 0) {
       whereClause.departmentId = { in: (period as any).departments.map((d: any) => d.id) };
    }

    const employments = await this.prisma.employmentRecord.findMany({
      where: whereClause,
      include: {
         crew: { include: { shiftPattern: true } }
      }
    });

    const periodAbsences = await this.prisma.workerAbsence.findMany({
      where: {
        tenantId,
        startDate: { lte: period.endDate },
        endDate: { gte: period.startDate },
        status: 'APPROVED'
      }
    });

    const vacations = await this.prisma.vacationHistory.findMany({
      where: {
        tenantId,
        startDate: { lte: period.endDate },
        endDate: { gte: period.startDate }
      }
    });

    const holidays = await this.prisma.holiday.findMany({ where: { tenantId } });

    const msPerDay = 1000 * 60 * 60 * 24;
    const summariesToUpsert: any[] = [];
    let skippedWorkers = 0;

    for (const emp of employments) {
      if (!emp.crew || !emp.crew.shiftPattern || !emp.crew.patternAnchor) {
        skippedWorkers++;
        continue;
      }

      let daysWorked = 0;
      let workedDaysDay = 0;
      let workedDaysNight = 0;
      let workedDaysMixed = 0;
      let restDays = 0;
      let ordinaryHours = 0;
      let ordinaryDayHours = 0;
      let ordinaryNightHours = 0;
      
      const pg = period.payrollGroup;
      const nightStartStr = pg?.nightShiftStartTime || '19:00';
      const nightEndStr = pg?.nightShiftEndTime || '05:00';

      const sequence = emp.crew.shiftPattern.sequence as any[];
      const cycleLength = sequence.length;
      const anchorDate = new Date(emp.crew.patternAnchor);
      const utcAnchor = Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate());

      // Dynamic Floor / Ceiling based on Employment Record Start/End dates
      let startMs = Math.max(period.startDate.getTime(), emp.startDate.getTime());
      
      let empEndDateMs = emp.endDate ? emp.endDate.getTime() : Infinity;
      let endMs = Math.min(period.endDate.getTime(), empEndDateMs);

      if (startMs > endMs) continue; // Out of bounds completely
      
      const numDays = Math.round((endMs - startMs) / msPerDay) + 1; 

      let holidaysCount = 0;

      for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(startMs + (i * msPerDay));
        const utcTarget = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
        const diffDays = Math.floor((utcTarget - utcAnchor) / msPerDay);
        
        if (diffDays >= 0) {
           const idx = diffDays % cycleLength;
           const sft = sequence[idx];
           if (sft && sft.type === 'WORK') {
               const dateStr = currentDate.toISOString().split('T')[0];
               const [year, month, day] = dateStr.split('-').map(Number);
               
               const dateStrTrim2 = currentDate.toISOString().split('T')[0];
               const isCoveredByAbsence = periodAbsences.some(a => {
                   const sStr = a.startDate.toISOString().split('T')[0];
                   const eStr = a.endDate.toISOString().split('T')[0];
                   return a.workerId === emp.workerId && dateStrTrim2 >= sStr && dateStrTrim2 <= eStr;
               });

               const isCoveredByVacation = vacations.some(v => {
                   const sStr = v.startDate.toISOString().split('T')[0];
                   const eStr = v.endDate.toISOString().split('T')[0];
                   return v.employmentRecordId === emp.id && dateStrTrim2 >= sStr && dateStrTrim2 <= eStr;
               });

               if (isCoveredByAbsence || isCoveredByVacation) {
                   continue;
               }

               const isHoliday = holidays.some(h => {
                  if (h.isAnnual) {
                    return (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
                  } else {
                    return h.date.getUTCFullYear() === year && (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
                  }
               });

               if (isHoliday) {
                   holidaysCount++;
                   continue;
               }

               daysWorked++;
               const [sH, sM] = sft.start.split(':').map(Number);
               const [eH, eM] = sft.end.split(':').map(Number);
               let durationMins = ((eH * 60 + eM) - (sH * 60 + sM));
               if (durationMins < 0) durationMins += 24 * 60; 
               const totalValidMins = durationMins; // NO DEDUCTION for virtual shift span!
               ordinaryHours += totalValidMins / 60;

               const idealIn = new Date(currentDate);
               idealIn.setUTCHours(sH + 4, sM, 0, 0);
               const slices = this.engineService.calculateTimeSlices(idealIn, totalValidMins, nightStartStr, nightEndStr);
               ordinaryDayHours += slices.dayMins / 60;
               ordinaryNightHours += slices.nightMins / 60;

               const nightHrs = slices.nightMins / 60;
               const maxNight = Number(pg?.mixedShiftMaxNightHours || 4.0);
               if (nightHrs === 0) {
                   workedDaysDay++;
               } else if (nightHrs <= maxNight) {
                   workedDaysMixed++;
               } else {
                   workedDaysNight++;
               }
           } else {
               restDays++;
           }
        }
      }

      ordinaryHours = parseFloat(ordinaryHours.toFixed(2));
      ordinaryDayHours = parseFloat(ordinaryDayHours.toFixed(2));
      ordinaryNightHours = parseFloat(ordinaryNightHours.toFixed(2));
      const absCounts = this.getAbsencesForWorker(emp.workerId, periodAbsences, period.startDate, period.endDate);

      // REMOVED: Commercial Month limitation is now delegated to the Payroll Concept Engine Formula

      summariesToUpsert.push({
        tenantId,
        payrollPeriodId,
        workerId: emp.workerId,
        attendanceMode: 'VIRTUAL',
        daysWorked,
        workedDaysDay,
        workedDaysNight,
        workedDaysMixed,
        restDays,
        ordinaryHours,
        ordinaryDayHours,
        ordinaryNightHours,
        shiftType: 'DIURNA',
        shiftBaseHours: parseFloat((ordinaryHours / (daysWorked || 1)).toFixed(2)),
        extraDayHours: 0,
        extraNightHours: 0,
        holidays: holidaysCount,
        workedHolidays: 0,
        workedRestDays: 0,
        saturdaysWorked: 0,
        sundaysWorked: 0,
        justifiedAbsences: absCounts.justified,
        unjustifiedAbsences: absCounts.unjustified
      });
    }

    if (summariesToUpsert.length > 0) {
       await this.upsertBulk(summariesToUpsert);
    }
    
    // --- BARRIDO DE NOVEDADES GLOBALES ---
    const workerIds = employments.map((e: any) => e.workerId);
    await this.sweepWorkerNovelties(period, workerIds);
    
    return { success: true, count: summariesToUpsert.length, skippedWorkers };
  }

  async remove(id: string) {
    return this.prisma.attendanceSummary.delete({ where: { id } });
  }

  private async sweepWorkerNovelties(period: any, workerIds: string[]) {
    // 1. Liberar inyecciones anteriores (Idempotencia)
    await this.prisma.workerNovelty.updateMany({
      where: { payrollPeriodId: period.id },
      data: { payrollPeriodId: null, status: 'PENDING' }
    });

    // 2. Buscar las pendientes en este rango
    const targetRecords = await this.prisma.employmentRecord.findMany({
      where: { workerId: { in: workerIds }, tenantId: period.tenantId },
      select: { id: true }
    });
    const employmentIds = targetRecords.map(r => r.id);

    const pendingNovelties = await this.prisma.workerNovelty.findMany({
      where: {
         tenantId: period.tenantId,
         employmentRecordId: { in: employmentIds },
         status: 'PENDING',
         paymentDate: {
           gte: period.startDate,
           lte: period.endDate
         }
      }
    });

    if (pendingNovelties.length > 0) {
      // 3. Amarrar a la nómina actual
      const noveltyIds = pendingNovelties.map(n => n.id);
      await this.prisma.workerNovelty.updateMany({
        where: { id: { in: noveltyIds } },
        data: { payrollPeriodId: period.id, status: 'INJECTED' }
      });
    }
  }

  async generateAuditTrail(tenantId: string, workerId: string, payrollPeriodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: payrollPeriodId },
      include: { payrollGroup: true }
    });
    
    if (!period) throw new Error('Payroll period not found');

    const emp = await this.prisma.employmentRecord.findFirst({
      where: { workerId, tenantId, isActive: true },
      include: { crew: { include: { shiftPattern: true } } }
    });

    if (!emp) throw new Error('No active employment found for this worker');
    
    // Si tiene marcas crudas, podríamos analizarlas. Pero si es VIRTUAL:
    // (Por simplicidad en este audit, simularemos el Virtual, y buscaremos DailyAttendance para físico)
    const dailyRecords = await this.prisma.dailyAttendance.findMany({
      where: { workerId, tenantId, date: { gte: period.startDate, lte: period.endDate } },
      orderBy: { date: 'asc' }
    });

    // Si tiene records guardados en DailyAttendance, retornamos eso como prioridad (Biométrico/Físico)
    if (dailyRecords.length > 0 && emp.crew?.shiftPattern === null) {
       return dailyRecords.map(r => ({
          date: r.date.toISOString().split('T')[0],
          shift: `${r.firstIn ? r.firstIn.toISOString().split('T')[1].substring(0,5) : '--:--'} a ${r.lastOut ? r.lastOut.toISOString().split('T')[1].substring(0,5) : '--:--'}`,
          dayHrs: Number(r.ordinaryDayHours),
          nightHrs: Number(r.ordinaryNightHours),
          status: r.status,
          source: 'FÍSICO'
       }));
    }

    if (!emp.crew || !emp.crew.shiftPattern || !emp.crew.patternAnchor) {
      return [];
    }

    const sequence = emp.crew.shiftPattern.sequence as any[];
    const cycleLength = sequence.length;
    const anchorDate = new Date(emp.crew.patternAnchor);
    const utcAnchor = Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate());

    let startMs = Math.max(period.startDate.getTime(), emp.startDate.getTime());
    let empEndDateMs = emp.endDate ? emp.endDate.getTime() : Infinity;
    let endMs = Math.min(period.endDate.getTime(), empEndDateMs);
    const msPerDay = 1000 * 60 * 60 * 24;
    const numDays = Math.floor((endMs - startMs) / msPerDay) + 1;

    const pg = period.payrollGroup;
    const nightStartStr = pg?.nightShiftStartTime || '19:00';
    const nightEndStr = pg?.nightShiftEndTime || '05:00';
    
    const auditArray = [];

    const holidays = await this.prisma.holiday.findMany({ where: { tenantId } });

    for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(startMs + (i * msPerDay));
        const utcTarget = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
        const diffDays = Math.floor((utcTarget - utcAnchor) / msPerDay);
        
        let shiftStr = '--';
        let dayHrs = 0;
        let nightHrs = 0;
        let status = 'REST';

        if (diffDays >= 0) {
           const idx = diffDays % cycleLength;
           const sft = sequence[idx];
           
           if (sft && sft.type === 'WORK') {
               shiftStr = `${sft.start} a ${sft.end}`;
               status = 'WORK';

               const dateStr = currentDate.toISOString().split('T')[0];
               const [year, month, day] = dateStr.split('-').map(Number);
               const isHoliday = holidays.some(h => {
                  if (h.isAnnual) return (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
                  return h.date.getUTCFullYear() === year && (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
               });

               if (isHoliday) {
                  status = 'HOLIDAY';
               } else {
                 const [sH, sM] = sft.start.split(':').map(Number);
                 const [eH, eM] = sft.end.split(':').map(Number);
                 let durationMins = ((eH * 60 + eM) - (sH * 60 + sM));
                 if (durationMins < 0) durationMins += 24 * 60; 
                 
                 const idealIn = new Date(currentDate);
                 idealIn.setUTCHours(sH + 4, sM, 0, 0);
                 const slices = this.engineService.calculateTimeSlices(idealIn, durationMins, nightStartStr, nightEndStr);
                 dayHrs = parseFloat((slices.dayMins / 60).toFixed(2));
                 nightHrs = parseFloat((slices.nightMins / 60).toFixed(2));
               }
           }
        }
        
        // Find if they manually physically punched that day (Override)
        const dateStr = currentDate.toISOString().split('T')[0];
        const physical = dailyRecords.find(r => r.date.toISOString().split('T')[0] === dateStr);
        if (physical && physical.status === 'PRESENT') {
            dayHrs = Number(physical.ordinaryDayHours);
            nightHrs = Number(physical.ordinaryNightHours);
            shiftStr = `${physical.firstIn ? physical.firstIn.toISOString().split('T')[1].substring(0,5) : '--:--'} a ${physical.lastOut ? physical.lastOut.toISOString().split('T')[1].substring(0,5) : '--:--'}`;
            status = 'FÍSICO';
        }

        auditArray.push({
           date: dateStr,
           shift: shiftStr,
           dayHrs,
           nightHrs,
           status,
           source: physical ? 'FÍSICO' : 'VIRTUAL'
        });
    }

    return auditArray;
  }
}
