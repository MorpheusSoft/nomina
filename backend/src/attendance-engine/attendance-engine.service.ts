import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HolidaysService } from '../holidays/holidays.service';
import { differenceInMinutes } from 'date-fns';

@Injectable()
export class AttendanceEngineService {
  constructor(
    private prisma: PrismaService,
    private holidaysService: HolidaysService
  ) {}

  async processDailyAttendance(tenantId: string, workerId: string, baseDate: string, preloadedHolidays: any[] | null = null) {
    // baseDate is YYYY-MM-DD
    // Configurar límites LOCALES para VET (UTC-4)
    const startOfDay = new Date(`${baseDate}T00:00:00.000Z`);
    startOfDay.setUTCHours(4); // VET 00:00 = 04:00 UTC
    
    let holidays = preloadedHolidays;
    if (!holidays) {
       holidays = await this.prisma.holiday.findMany({ where: { tenantId } });
    }
    
    // Check if baseDate is holiday
    const [year, month, day] = baseDate.split('-').map(Number);
    const isHoliday = holidays.some(h => {
       if (h.isAnnual) {
         // month is 0-indexed in JS dates when using getMonth, but here we split 'YYYY-MM-DD' so month is 1-indexed.
         // h.date is UTC Date.
         return (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
       } else {
         return h.date.getUTCFullYear() === year && (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
       }
    });
    const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);

    // 1. Obtener las marcas crudas del día
    const punches = await this.prisma.attendancePunch.findMany({
      where: {
        tenantId,
        workerId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // 2. Buscar configuración de Convenio y Cuadrilla
    const activeEmployment = await this.prisma.employmentRecord.findFirst({
        where: { workerId, isActive: true },
        include: { 
          payrollGroup: true,
          owner: { include: { shiftTemplate: true } },
          crew: { include: { shiftPattern: true } }
        }
    });

    const pg = activeEmployment?.payrollGroup;
    const crew = activeEmployment?.crew;
    const workerData = activeEmployment?.owner;
    const stdWorkMins = pg?.standardWorkHours ? Number(pg.standardWorkHours) * 60 : 480;

    // Configurar umbral nocturno
    const [nT_H, nT_M] = (pg?.nightShiftStartTime || '19:00').split(':').map(Number);
    const nightThreshold = new Date(startOfDay);
    nightThreshold.setUTCHours(nT_H + 4, nT_M, 0, 0); 

    let firstIn: Date | null = null;
    let lastOut: Date | null = null;
    
    // Si hay marcas, tomamos la primera y última basándonos en el tiempo
    if (punches.length > 0) {
      firstIn = punches[0].timestamp;
      lastOut = punches[punches.length - 1].timestamp;
    } else {
      const finalStatus = isHoliday ? 'HOLIDAY' : 'ABSENT';
      return this.saveDaily(tenantId, workerId, startOfDay, null, null, 0, 0, 0, 0, 0, 0, 0, finalStatus);
    }

    if (punches.length === 1) {
      return this.saveDaily(tenantId, workerId, startOfDay, firstIn, null, 0, 0, 0, 0, 0, 0, 0, 'INCOMPLETE_PUNCH');
    }

    // Total tiempo real en la empresa calculado por pares (Estricto temporal)
    let workMinsCalculated = 0;
    const totalMinutesPresent = differenceInMinutes(lastOut, firstIn);

    if (punches.length === 2) {
      workMinsCalculated = totalMinutesPresent;
    } else if (punches.length % 2 === 0) {
      for (let i = 0; i < punches.length; i += 2) {
         workMinsCalculated += differenceInMinutes(punches[i+1].timestamp, punches[i].timestamp);
      }
    } else {
      workMinsCalculated = totalMinutesPresent;
    }

    // 3. Cálculos contra la Matriz Matemática del Turno (Si existe)
    let regularHours = 0;
    let extraDayHours = 0;
    let extraNightHours = 0;
    let lateMinutes = 0;
    let earlyLeaveMins = 0;
    let status = isHoliday ? 'WORKED_HOLIDAY' : 'PRESENT';

    let expectedWorkMinutes = stdWorkMins;
    let hasStrictShift = false;

    if (crew?.shiftPattern && crew?.patternAnchor) {
      const anchorDate = new Date(crew.patternAnchor);
      const targetDate = new Date(startOfDay); 
      
      const msPerDay = 1000 * 60 * 60 * 24;
      const utcAnchor = Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate());
      const utcTarget = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
      
      const diffDays = Math.floor((utcTarget - utcAnchor) / msPerDay);
      
      if (diffDays >= 0) {
         const sequence = crew.shiftPattern.sequence as any[];
         const cycleLength = sequence.length;
         const index = diffDays % cycleLength;
         const todaysShift = sequence[index];
         
         if (todaysShift && todaysShift.type === 'WORK') {
            hasStrictShift = true;
            const [shStartH, shStartM] = todaysShift.start.split(':').map(Number);
            const [shEndH, shEndM] = todaysShift.end.split(':').map(Number);

            const idealIn = new Date(startOfDay);
            idealIn.setUTCHours(shStartH + 4, shStartM, 0, 0); // Ajuste UTC-4 VET

            const idealOut = new Date(startOfDay);
            idealOut.setUTCHours(shEndH + 4, shEndM, 0, 0);
            
            // Corrige trasnocho de guardias (ej. sale al dia siguiente a las 5am)
            if (idealOut < idealIn) {
               idealOut.setUTCDate(idealOut.getUTCDate() + 1);
            }

            expectedWorkMinutes = differenceInMinutes(idealOut, idealIn);

            // Retardos e Inconsistencias (Auditoría Pasiva)
            if (firstIn > idealIn) {
              const diffIn = differenceInMinutes(firstIn, idealIn);
              if (diffIn > 15) { // 15 minutos de gracia standard
                lateMinutes = diffIn;
              }
            }

            if (lastOut < idealOut) {
              earlyLeaveMins = differenceInMinutes(idealOut, lastOut);
            }
         } else if (todaysShift && todaysShift.type === 'REST') {
            // Trabajó en su día de descanso predeterminado!
            status = 'WORKED_REST_DAY';
         }
      }
    } else if (workerData?.shiftTemplate) {
      hasStrictShift = true;
      const tpl = workerData.shiftTemplate;
      const [shStartH, shStartM] = tpl.startTime.split(':').map(Number);
      const [shEndH, shEndM] = tpl.endTime.split(':').map(Number);

      const idealIn = new Date(startOfDay);
      idealIn.setUTCHours(shStartH + 4, shStartM, 0, 0);

      const idealOut = new Date(startOfDay);
      idealOut.setUTCHours(shEndH + 4, shEndM, 0, 0);
      
      if (idealOut < idealIn) {
         idealOut.setUTCDate(idealOut.getUTCDate() + 1);
      }

      const currentMealDeduction = tpl.mealMinutes ?? 0;
      expectedWorkMinutes = differenceInMinutes(idealOut, idealIn) - currentMealDeduction;

      if (firstIn > idealIn) {
         const diffIn = differenceInMinutes(firstIn, idealIn);
         if (diffIn > (tpl.graceMinutesIn || 15)) lateMinutes = diffIn;
      }
      if (lastOut < idealOut) {
         earlyLeaveMins = differenceInMinutes(idealOut, lastOut);
      }
    }

    // 4. Evaluación de pago y sobretiempo (Desvinculada, basada en el Convenio o expectedWorkMins max)
    const baselineMins = hasStrictShift ? expectedWorkMinutes : stdWorkMins;

    if (workMinsCalculated > baselineMins) {
        regularHours = baselineMins / 60;
        const extraMins = workMinsCalculated - baselineMins;
        
        let nightMins = 0;
        if (lastOut > nightThreshold) {
            nightMins = differenceInMinutes(lastOut, nightThreshold);
            if (nightMins > extraMins) nightMins = extraMins;
        }
        const dayMins = extraMins - nightMins;
        extraDayHours = parseFloat((dayMins / 60).toFixed(2));
        extraNightHours = parseFloat((nightMins / 60).toFixed(2));
    } else {
        regularHours = parseFloat((Math.max(0, workMinsCalculated) / 60).toFixed(2));
    }

    // 5. Slice those regularHours into Day and Night buckets dynamically!
    let ordinaryDayHours = regularHours;
    let ordinaryNightHours = 0;
    
    if (regularHours > 0) {
       const nightStartStr = pg?.nightShiftStartTime || '19:00';
       const nightEndStr = pg?.nightShiftEndTime || '05:00';
       // We slice from the expected start or first punch
       const shiftStart = (hasStrictShift && crew?.shiftPattern) ? firstIn : (firstIn || startOfDay);
       
       if (shiftStart) {
          const slices = this.calculateTimeSlices(shiftStart, Math.round(regularHours * 60), nightStartStr, nightEndStr);
          ordinaryDayHours = parseFloat((slices.dayMins / 60).toFixed(2));
          ordinaryNightHours = parseFloat((slices.nightMins / 60).toFixed(2));
       }
    }

    // Marcar los punches como procesados
    await this.prisma.attendancePunch.updateMany({
      where: { id: { in: punches.map(p => p.id) } },
      data: { isProcessed: true },
    });

    return this.saveDaily(tenantId, workerId, startOfDay, firstIn, lastOut, regularHours, ordinaryDayHours, ordinaryNightHours, extraDayHours, extraNightHours, lateMinutes, earlyLeaveMins, status);
  }

  async processPeriodPunches(tenantId: string, startDate: Date, endDate: Date) {
    // 0. Autogenerar feriados antes de correr
    const targetYear = startDate.getUTCFullYear();
    await this.holidaysService.generateDynamicHolidaysForYear(tenantId, targetYear);
    const holidays = await this.prisma.holiday.findMany({ where: { tenantId } });

    // 1. Encontrar todos los punches no procesados en este período
    const unprocPunches = await this.prisma.attendancePunch.findMany({
      where: {
        tenantId,
        isProcessed: false,
        timestamp: { gte: startDate, lte: endDate }
      },
      select: {
        workerId: true,
        timestamp: true
      }
    });

    // 2. Extraer los pares únicos (workerId, Fecha (YYYY-MM-DD)) adaptados al huso VET
    const pairsToProcess = new Set<string>();
    for (const p of unprocPunches) {
      // Restamos 4 horas al UTC para que un fichaje a las 08PM (00:00Z del día siguiente) caiga en el día correcto local
      const localDate = new Date(p.timestamp.getTime() - (4 * 60 * 60 * 1000));
      const baseDate = localDate.toISOString().split('T')[0];
      pairsToProcess.add(`${p.workerId}|${baseDate}`);
    }

    // 3. Mandarlos a procesar uno por uno a processDailyAttendance
    const processedDailyRecords = [];
    for (const pair of Array.from(pairsToProcess)) {
       const [workerId, baseDate] = pair.split('|');
       const daily = await this.processDailyAttendance(tenantId, workerId, baseDate, holidays);
       processedDailyRecords.push(daily);
    }

    return { processedWorkerDaysCount: processedDailyRecords.length };
  }

  private async saveDaily(
    tenantId: string, workerId: string, date: Date, 
    firstIn: Date | null, lastOut: Date | null, 
    regularHours: number, ordinaryDayHours: number, ordinaryNightHours: number,
    extraDayHours: number, extraNightHours: number, 
    lateMinutes: number, earlyLeaveMins: number, status: string
  ) {
    return this.prisma.dailyAttendance.upsert({
      where: {
        workerId_date: { workerId, date },
      },
      update: {
        firstIn, lastOut, regularHours, ordinaryDayHours, ordinaryNightHours, extraDayHours, extraNightHours, lateMinutes, earlyLeaveMins, status
      },
      create: {
        tenantId, workerId, date, firstIn, lastOut, regularHours, ordinaryDayHours, ordinaryNightHours, extraDayHours, extraNightHours, lateMinutes, earlyLeaveMins, status
      }
    });
  }

  public calculateTimeSlices(startTime: Date, totalMinutes: number, nightStartStr: string, nightEndStr: string): { dayMins: number, nightMins: number } {
    let dayMins = 0;
    let nightMins = 0;

    const [nsH, nsM] = nightStartStr.split(':').map(Number);
    const [neH, neM] = nightEndStr.split(':').map(Number);
    const startTotalMins = nsH * 60 + nsM;
    const endTotalMins = neH * 60 + neM;

    for (let i = 0; i < totalMinutes; i++) {
       const currentMinTime = new Date(startTime.getTime() + (i * 60000));
       const localHours = (currentMinTime.getUTCHours() - 4 + 24) % 24;
       const localMins = currentMinTime.getUTCMinutes();
       const currentTotalMins = localHours * 60 + localMins;
       
       let isNight = false;
       if (startTotalMins >= endTotalMins) {
           if (currentTotalMins >= startTotalMins || currentTotalMins < endTotalMins) isNight = true;
       } else {
           if (currentTotalMins >= startTotalMins && currentTotalMins < endTotalMins) isNight = true;
       }

       if (isNight) nightMins++;
       else dayMins++;
    }

    return { dayMins, nightMins };
  }
}
