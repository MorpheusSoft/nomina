import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollGroupVariablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const isSum = data.type === 'SUM_CONCEPTS';
    return this.prisma.payrollGroupVariable.create({
      data: {
        payrollGroupId: data.payrollGroupId,
        code: data.code,
        name: data.name,
        type: data.type || 'STATIC',
        value: isSum ? 0 : Number(data.value),
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validTo: data.validTo ? new Date(data.validTo) : null,
        concepts: isSum && data.conceptIds?.length > 0 
          ? { connect: data.conceptIds.map((id: string) => ({ id })) } 
          : undefined
      }
    });
  }

  async findAll(payrollGroupId: string) {
    return this.prisma.payrollGroupVariable.findMany({
      where: { payrollGroupId },
      orderBy: { code: 'asc' },
      include: {
        concepts: {
          select: { id: true, code: true, name: true }
        }
      }
    });
  }

  async findAllByTenant(tenantId: string) {
    // Return all distinct codes for the magic dictionary
    const vars = await this.prisma.payrollGroupVariable.findMany({
      where: { payrollGroup: { tenantId } },
      orderBy: { code: 'asc' }
    });

    // Deduplicate by code
    const uniqueCodes: Record<string, any> = {};
    for (const v of vars) {
      if (!uniqueCodes[v.code]) {
        uniqueCodes[v.code] = v;
      }
    }
    return Object.values(uniqueCodes);
  }

  async update(id: string, data: any) {
    const isSum = data.type === 'SUM_CONCEPTS';
    return this.prisma.payrollGroupVariable.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        type: data.type || 'STATIC',
        value: isSum ? 0 : Number(data.value),
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validTo: data.validTo ? new Date(data.validTo) : null,
        concepts: {
          set: isSum && data.conceptIds?.length > 0 
            ? data.conceptIds.map((cId: string) => ({ id: cId }))
            : []
        }
      }
    });
  }

  async remove(id: string) {
    return this.prisma.payrollGroupVariable.delete({
      where: { id }
    });
  }
}
