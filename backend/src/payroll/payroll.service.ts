import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { evaluate } from 'mathjs';
import { randomUUID } from 'crypto';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculatePeriod(tenantId: string, periodId: string) {
    // 1. Validate Period definition & Fetch the Concepts mapped to its Group
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId, tenantId },
      include: {
        payrollGroup: {
          include: {
            payrollGroupConcepts: {
              include: {
                concept: true
              }
            }
          }
        },
        specialConcepts: true
      }
    });

    if (!period) throw new BadRequestException('Period not found');
    if (period.status === 'CLOSED') throw new BadRequestException('Locked period cannot be recalculated');

    // 2. Hydrate Base Context variables from Global configs
    const globalVars = await this.prisma.globalVariable.findMany({
      where: { 
        tenantId,
        validFrom: { lte: period.endDate },
        OR: [
          { validTo: null },
          { validTo: { gte: period.startDate } }
        ]
      }
    });

    const globalContext: Record<string, number> = {};
    for (const v of globalVars) {
      globalContext[v.code] = v.value.toNumber();
    }

    // 3. Collect active Employments filtering by this period's dates
    const employments = await this.prisma.employmentRecord.findMany({
      where: {
        tenantId,
        payrollGroupId: period.payrollGroupId,
        isActive: true,
        startDate: { lte: period.endDate },
        OR: [
          { endDate: null },
          { endDate: { gte: period.startDate } }
        ]
      },
      include: {
        owner: {
          include: { familyMembers: true }
        },
        salaryHistories: {
          where: {
            validFrom: { lte: period.endDate },
            OR: [
              { validTo: null },
              { validTo: { gte: period.startDate } }
            ]
          },
          orderBy: { validFrom: 'desc' }
        }
      }
    });

    // Strategy 4. Filter targeted AST Sequence
    let conceptsToRun = [];
    if (period.type === 'SPECIAL_BONUS' && (period as any).specialConcepts && (period as any).specialConcepts.length > 0) {
      conceptsToRun = (period as any).specialConcepts;
    } else {
      conceptsToRun = period.payrollGroup.payrollGroupConcepts
        .map(pgc => pgc.concept)
        .sort((a, b) => a.executionSequence - b.executionSequence);
    }

    // Mathematical loop tracking 
    const allReceipts: any[] = [];
    const allReceiptDetails: any[] = [];

    // Crude fallback: 1 period day length base logic 
    const periodDays = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 3600 * 24)) + 1;

    for (const emp of employments) {
      const activeSalary = emp.salaryHistories[0]?.amount.toNumber() || 0;
      
      const workerContext: Record<string, any> = {
        ...globalContext,
        base_salary: activeSalary,
        worked_days: periodDays,
        dependents_count: emp.owner.familyMembers.length
      };

      let totalSalaryEarnings = 0;
      let totalNonSalaryEarnings = 0;
      let totalDeductions = 0;
      let employerContributions = 0;

      const receiptId = randomUUID();
      const currentWorkerDetails = [];

      for (const concept of conceptsToRun) {
        // Safe evaluation barrier 
        if (concept.condition) {
          try {
            const isMatch = evaluate(concept.condition, workerContext);
            if (!isMatch) continue; 
          } catch(e) {
            this.logger.error(`Error evaluating condition [${concept.condition}]:`, e.message);
            continue;
          }
        }

        let factorVal = 0, rateVal = 0, amountVal = 0;
        try {
          factorVal = concept.formulaFactor ? evaluate(concept.formulaFactor, workerContext) : 0;
          rateVal = concept.formulaRate ? evaluate(concept.formulaRate, workerContext) : 0;
          
          if (concept.formulaAmount) {
             amountVal = evaluate(concept.formulaAmount, workerContext);
          } else {
             // Legal transparency mapping fallbacks Tri-field 
             amountVal = factorVal * rateVal;
          }
        } catch(e) {
           this.logger.error(`Error executing formulas for concept [${concept.code}]:`, e.message);
           continue; 
        }

        // Cache the result up inside AST memory dynamically
        workerContext[concept.code] = amountVal;

        // Strip Auxiliary components off the print receipt
        if (!concept.isAuxiliary) {
           currentWorkerDetails.push({
             id: randomUUID(),
             payrollReceiptId: receiptId,
             conceptId: concept.id,
             conceptNameSnapshot: concept.name,
             typeSnapshot: concept.type,
             factor: factorVal,
             rate: rateVal,
             amount: amountVal
           });

           // Tri-Fold Header Mappings 
           if (concept.type === 'EARNING') {
              if (concept.isSalaryIncidence) totalSalaryEarnings += amountVal;
              else totalNonSalaryEarnings += amountVal;
           } else if (concept.type === 'DEDUCTION') {
              totalDeductions += amountVal;
           } else if (concept.type === 'EMPLOYER_CONTRIBUTION') {
              employerContributions += amountVal;
           }
        }
      }

      const totalEarnings = totalSalaryEarnings + totalNonSalaryEarnings;
      const netPay = totalEarnings - totalDeductions;

      allReceiptDetails.push(...currentWorkerDetails);
      allReceipts.push({
        id: receiptId,
        payrollPeriodId: period.id,
        workerId: emp.owner.id,
        totalSalaryEarnings,
        totalNonSalaryEarnings,
        totalEarnings,
        totalDeductions,
        netPay,
        employerContributions
      });
    }

    // Atomicity ACID Storage Flush 
    await this.prisma.$transaction(async (tx) => {
      await tx.payrollReceiptDetail.deleteMany({
        where: { payrollReceipt: { payrollPeriodId: periodId } }
      });
      await tx.payrollReceipt.deleteMany({
        where: { payrollPeriodId: periodId }
      });

      if (allReceipts.length > 0) {
        await tx.payrollReceipt.createMany({ data: allReceipts });
      }
      if (allReceiptDetails.length > 0) {
         await tx.payrollReceiptDetail.createMany({ data: allReceiptDetails });
      }

      await tx.payrollPeriod.update({
        where: { id: periodId },
        data: { status: 'PRE_CALCULATED' }
      });
    });

    return { success: true, receiptsGenerated: allReceipts.length };
  }
}
