import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async importBiometric(payrollPeriodId: string, records: { identity: string; datetimeIn: string; datetimeOut: string }[]) {
    const tenantId = '11111111-1111-1111-1111-111111111111'; // TODO: Auth

    // 1. Fetch all workers to map identity -> workerId
    const workers = await this.prisma.worker.findMany({ where: { tenantId } });
    const identityMap = new Map(workers.map(w => [w.primaryIdentityNumber, w.id]));

    const aggregations = new Map<string, { daysWorked: Set<string>; totalHours: number }>();

    // 2. Process records mathematically
    for (const rec of records) {
      const workerId = identityMap.get(String(rec.identity).trim());
      if (!workerId) continue;

      const dIn = new Date(rec.datetimeIn);
      const dOut = new Date(rec.datetimeOut);
      const hoursDiff = (dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60);

      if (hoursDiff <= 0 || isNaN(hoursDiff)) continue;

      if (!aggregations.has(workerId)) {
        aggregations.set(workerId, { daysWorked: new Set(), totalHours: 0 });
      }

      const agg = aggregations.get(workerId)!;
      const dayKey = dIn.toISOString().split('T')[0]; // Count unique days
      agg.daysWorked.add(dayKey);
      agg.totalHours += hoursDiff;
    }

    // 3. Upsert Summaries
    const upsertOps = [];
    for (const [workerId, agg] of aggregations.entries()) {
      const shiftBaseHours = 8;
      const daysWorked = agg.daysWorked.size;
      const ordinaryHours = daysWorked * shiftBaseHours;
      const extraDayHours = Math.max(0, agg.totalHours - ordinaryHours);

      upsertOps.push(this.prisma.attendanceSummary.upsert({
        where: { payrollPeriodId_workerId: { payrollPeriodId, workerId } },
        create: {
          tenantId, payrollPeriodId, workerId,
          shiftBaseHours, shiftType: 'DIURNA',
          daysWorked, ordinaryHours, extraDayHours, extraNightHours: 0
        },
        update: {
          daysWorked, ordinaryHours, extraDayHours
        }
      }));
    }

    await this.prisma.$transaction(upsertOps);

    return { message: "Biometric Data Processed Successfully", processedWorkers: aggregations.size };
  }
}
