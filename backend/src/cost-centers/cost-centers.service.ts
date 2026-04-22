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
}
