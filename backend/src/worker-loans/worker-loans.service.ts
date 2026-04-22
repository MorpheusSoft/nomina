import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerLoansService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.workerLoan.create({
      data: {
        ...data,
        tenantId,
        outstandingBalance: data.totalAmount // Inicialmente se debe todo
      }
    });
  }

  async findAll(tenantId: string, workerId?: string) {
    const where: any = { tenantId };
    if (workerId) where.workerId = workerId;
    const loans = await this.prisma.workerLoan.findMany({ 
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        worker: {
          include: {
            employmentRecords: {
              where: { isActive: true },
              include: { payrollGroup: true }
            }
          }
        }
      }
    });

    if (loans.length === 0) return [];

    // Collect deduction concepts
    const loanConceptIds = new Set<string>();
    loans.forEach(l => {
      const contract = l.worker.employmentRecords[0];
      if (contract?.payrollGroup?.loanDeductionConceptId) {
         loanConceptIds.add(contract.payrollGroup.loanDeductionConceptId);
      }
    });

    let historicalDeductions: any[] = [];
    if (loanConceptIds.size > 0 && workerId) {
      historicalDeductions = await this.prisma.payrollReceiptDetail.findMany({
        where: {
          conceptId: { in: Array.from(loanConceptIds) },
          payrollReceipt: {
            workerId,
            payrollPeriod: { status: { in: ['CLOSED', 'APPROVED', 'FINAL'] } }
          }
        },
        include: {
          payrollReceipt: { include: { payrollPeriod: true } }
        },
        orderBy: { payrollReceipt: { payrollPeriod: { endDate: 'desc' } } }
      });
    } else if (loanConceptIds.size > 0 && !workerId) {
      historicalDeductions = await this.prisma.payrollReceiptDetail.findMany({
        where: {
          conceptId: { in: Array.from(loanConceptIds) },
          payrollReceipt: {
            worker: { tenantId },
            payrollPeriod: { status: { in: ['CLOSED', 'APPROVED', 'FINAL'] } }
          }
        },
        include: {
          payrollReceipt: { include: { payrollPeriod: true } }
        },
        orderBy: { payrollReceipt: { payrollPeriod: { endDate: 'desc' } } }
      });
    }

    return loans.map(loan => {
      const loanDate = new Date(loan.createdAt);
      const amortizations = historicalDeductions
         .filter(d => 
            d.payrollReceipt.workerId === loan.workerId && 
            new Date(d.payrollReceipt.payrollPeriod.endDate) >= loanDate
         )
         .map(ded => {
            const period = ded.payrollReceipt.payrollPeriod;
            return {
               id: ded.id,
               periodName: period.name,
               periodDate: period.endDate,
               amount: Number(ded.amount),
               periodCurrency: period.currency,
               periodExchangeRate: Number(period.exchangeRate) || 1
            };
         });

      return {
         ...loan,
         amortizations
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    const loan = await this.prisma.workerLoan.findFirst({ where: { id, tenantId } });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    if (data.outstandingBalance !== undefined && Number(data.outstandingBalance) <= 0) {
       data.status = 'PAID';
    }
    return this.prisma.workerLoan.update({
      where: { id },
      data
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.workerLoan.delete({ where: { id } });
  }
}

