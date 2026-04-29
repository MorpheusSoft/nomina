import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: CreateCostCenterDto) {
    try {
      return await this.prisma.costCenter.create({
        data: { ...data, tenantId },
      });
    } catch (e: any) {
      throw new BadRequestException('Error creating Cost Center: ' + (e.message || JSON.stringify(e)));
    }
  }

  async findAllVariablesGroupedByCode(tenantId: string) {
    // Buscar la última variable de cada código a través de todos los centros de costo del tenant
    const vars = await (this.prisma as any).costCenterVariable.findMany({
      where: { costCenter: { tenantId } },
      orderBy: { validFrom: 'desc' },
      include: { costCenter: { select: { name: true } } }
    });
    
    // Group them uniquely by code to show in dictionaries
    const unique = [];
    const seen = new Set();
    for (const v of vars) {
      const lower = v.code.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push({
          id: v.id,
          code: v.code,
          name: v.name,
          value: Number(v.value),
          costCenterName: v.costCenter.name
        });
      }
    }
    return unique;
  }

  async findAll(tenantId: string) {
    return this.prisma.costCenter.findMany({
      where: { tenantId },
      include: { 
        departments: { 
          include: { 
            crews: { include: { shiftPattern: true } } 
          } 
        } 
      }
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.costCenter.findFirst({
      where: { id, tenantId },
      include: { 
        departments: { 
          include: { 
            crews: { include: { shiftPattern: true } } 
          } 
        } 
      }
    });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.costCenter.updateMany({
      where: { id, tenantId },
      data: {
        name: data.name,
        accountingCode: data.accountingCode,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.costCenter.deleteMany({
      where: { id, tenantId },
    });
  }

  // --- VARIABLES CRUD ---
  async findVariablesByCostCenter(tenantId: string, costCenterId: string) {
    return (this.prisma as any).costCenterVariable.findMany({
      where: { costCenterId, costCenter: { tenantId } },
      orderBy: { validFrom: 'desc' }
    });
  }

  async createVariable(tenantId: string, costCenterId: string, data: any) {
    return (this.prisma as any).costCenterVariable.create({
      data: {
        costCenterId,
        code: data.code,
        name: data.name,
        value: data.value,
        validFrom: new Date(data.validFrom),
        validTo: data.validTo ? new Date(data.validTo) : null
      }
    });
  }

  async updateVariable(tenantId: string, costCenterId: string, varId: string, data: any) {
    return (this.prisma as any).costCenterVariable.update({
      where: { id: varId, costCenterId },
      data: {
        code: data.code,
        name: data.name,
        value: data.value,
        validFrom: new Date(data.validFrom),
        validTo: data.validTo ? new Date(data.validTo) : null
      }
    });
  }

  async removeVariable(tenantId: string, costCenterId: string, varId: string) {
    return (this.prisma as any).costCenterVariable.delete({
      where: { id: varId, costCenterId }
    });
  }
}
