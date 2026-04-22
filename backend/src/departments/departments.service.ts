import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    // Check if CostCenter belongs to this tenant
    const cc = await this.prisma.costCenter.findFirst({ where: { id: data.costCenterId, tenantId } });
    if (!cc) throw new NotFoundException('Centro de Costo no encontrado o no autorizado');

    return this.prisma.department.create({
      data: {
        name: data.name,
        costCenterId: data.costCenterId,
        monthlyBudget: data.monthlyBudget || null
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.department.findMany({
      where: { costCenter: { tenantId } },
      include: { crews: true, costCenter: true }
    });
  }

  async findOne(tenantId: string, id: string) {
    const dept = await this.prisma.department.findFirst({
      where: { id, costCenter: { tenantId } },
      include: { crews: true, costCenter: true }
    });
    if (!dept) throw new NotFoundException('Departamento no encontrado');
    return dept;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        monthlyBudget: data.monthlyBudget || null
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.department.delete({
      where: { id },
    });
  }

  async getBudgetMetrics(tenantId: string) {
    const departments = await this.prisma.department.findMany({
      where: { costCenter: { tenantId } },
      include: {
        employmentRecords: {
          where: { isActive: true },
          include: {
            owner: {
              include: {
                payrollReceipts: {
                  where: {
                    payrollPeriod: {
                      startDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                      status: { in: ['CALCULATED', 'PRE_CALCULATED', 'APPROVED', 'CLOSED'] }
                    }
                  },
                  include: {
                    payrollPeriod: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const latestPeriod = await this.prisma.payrollPeriod.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    const currentExchangeRate = latestPeriod?.exchangeRate ? Number(latestPeriod.exchangeRate) : 1;

    const metrics = departments.map((d: any) => {
      const budgetUSD = d.monthlyBudget ? parseFloat(d.monthlyBudget.toString()) : 0;
      let spentUSD = 0;
      
      d.employmentRecords.forEach((er: any) => {
        er.owner?.payrollReceipts?.forEach((pr: any) => {
          let cost = parseFloat(pr.netPay?.toString() || '0');
          if (pr.payrollPeriod.currency !== 'USD' && pr.payrollPeriod.exchangeRate) {
            cost = cost / Number(pr.payrollPeriod.exchangeRate);
          }
           // Add to MTD USD total
          spentUSD += cost;
        });
      });
      return {
        id: d.id,
        name: d.name,
        budget: budgetUSD,
        spent: spentUSD,
        percentage: budgetUSD > 0 ? (spentUSD / budgetUSD) * 100 : 0
      };
    });

    return {
       currentExchangeRate,
       metrics
    };
  }
}
