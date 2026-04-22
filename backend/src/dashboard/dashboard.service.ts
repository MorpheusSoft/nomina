import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string, canViewConfidential: boolean = false) {
    // 1. Trabajadores Activos
    const totalWorkers = await this.prisma.worker.count({
      where: {
        tenantId,
        deletedAt: null,
        employmentRecords: {
          some: { 
            status: 'ACTIVE',
            ...(canViewConfidential ? {} : { isConfidential: false })
          }
        }
      }
    });

    // 2. Ejecución Presupuestaria
    const departments = await this.prisma.department.findMany({
      where: { costCenter: { tenantId } }
    });
    const budget = departments.reduce((sum, dept) => sum + (Number(dept.monthlyBudget) || 0), 0);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const receipts = await this.prisma.payrollReceipt.findMany({
      where: {
        worker: { 
          tenantId,
          ...(canViewConfidential ? {} : { employmentRecords: { none: { isConfidential: true } } })
        },
        payrollPeriod: {
          startDate: { gte: firstDay },
          endDate: { lte: lastDay }
        }
      },
      include: { payrollPeriod: true }
    });
    
    let executed = 0;
    receipts.forEach(r => {
      let receiptCost = Number(r.totalEarnings) + Number(r.employerContributions);
      if (r.payrollPeriod.currency !== 'USD' && r.payrollPeriod.exchangeRate) {
        receiptCost = receiptCost / Number(r.payrollPeriod.exchangeRate);
      }
      executed += receiptCost;
    });

    const budgetExecution = { budget, executed, percentage: budget > 0 ? (executed / budget) * 100 : 0 };

    // 3. Contratos por Vencer
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 60);
    const expiringContracts = await this.prisma.employmentRecord.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(canViewConfidential ? {} : { isConfidential: false }),
        endDate: { not: null, lte: expiringDate, gte: now }
      }
    });

    // 4. Índice de Ausentismo
    const absences = await this.prisma.dailyAttendance.count({
      where: {
        tenantId,
        ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } }),
        date: { gte: firstDay, lte: lastDay },
        status: { notIn: ['PRESENT', 'REST_DAY', 'HOLIDAY'] }
      }
    });
    const totalExpectedAttendances = await this.prisma.dailyAttendance.count({
      where: {
        tenantId,
        ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } }),
        date: { gte: firstDay, lte: lastDay },
        status: { not: 'REST_DAY' }
      }
    });
    const absenteeismRate = totalExpectedAttendances > 0 ? (absences / totalExpectedAttendances) * 100 : 0;

    // 5. Deuda Pasivos (Fideicomiso)
    const trusts = await this.prisma.contractTrust.findMany({
      where: { 
        tenantId,
        ...(canViewConfidential ? {} : { employmentRecord: { isConfidential: false } })
      }
    });
    const totalTrustDebt = trusts.reduce((sum, t) => sum + Number(t.totalAccumulated), 0);

    return {
      totalWorkers,
      budgetExecution,
      expiringContracts,
      absenteeism: { rate: absenteeismRate, absences, totalExpected: totalExpectedAttendances },
      totalTrustDebt
    };
  }
}
