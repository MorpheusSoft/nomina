import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerNoveltiesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    // La novedad se crea globalmente, ya no depende de DRAFT de una nómina
    return this.prisma.workerNovelty.create({
      data: {
        ...data,
        tenantId,
      },
      include: {
        concept: true,
        employmentRecord: {
          include: { owner: true }
        }
      }
    });
  }

  findAll(tenantId: string, payrollPeriodId?: string, workerId?: string) {
    const where: any = { tenantId };
    if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId;
    if (workerId) {
      where.employmentRecord = { workerId };
    }

    return this.prisma.workerNovelty.findMany({
      where,
      include: {
        concept: true,
        employmentRecord: {
          include: { owner: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.workerNovelty.findFirst({
      where: { id, tenantId },
      include: { concept: true }
    });
  }

  async update(tenantId: string, id: string, data: any) {
    const novelty = await this.findOne(tenantId, id);
    if (!novelty) throw new NotFoundException('Novedad no encontrada');
    
    // Si la novedad ya fue inyectada en una nómina que NO está en borrador, no se puede modificar
    if (novelty.payrollPeriodId) {
      const period = await this.prisma.payrollPeriod.findUnique({
        where: { id: novelty.payrollPeriodId }
      });
      if (period && period.status !== 'DRAFT') {
        throw new BadRequestException('No se puede modificar una Novedad que ya fue inyectada y cerrada en una nómina');
      }
    }

    return this.prisma.workerNovelty.update({
      where: { id },
      data
    });
  }

  async remove(tenantId: string, id: string) {
    const novelty = await this.findOne(tenantId, id);
    if (!novelty) throw new NotFoundException('Novedad no encontrada');
    
    if (novelty.payrollPeriodId) {
      const period = await this.prisma.payrollPeriod.findUnique({
        where: { id: novelty.payrollPeriodId }
      });
      if (period && period.status !== 'DRAFT') {
        throw new BadRequestException('No se puede eliminar una Novedad que ya fue inyectada y cerrada en una nómina');
      }
    }

    return this.prisma.workerNovelty.delete({
      where: { id }
    });
  }
}
