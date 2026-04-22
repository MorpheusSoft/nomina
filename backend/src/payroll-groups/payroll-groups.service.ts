import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.payrollGroup.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.payrollGroup.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const pg = await this.prisma.payrollGroup.findFirst({
      where: { id, tenantId },
      include: {
        payrollGroupConcepts: { include: { concept: true } }
      }
    });
    if (!pg) throw new NotFoundException('Payroll Group not found or unauthorized');
    return pg;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.payrollGroup.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.payrollGroup.deleteMany({ where: { id, tenantId } });
  }
}
