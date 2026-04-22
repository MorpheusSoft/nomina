import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollAccumulatorDto } from './dto/create-payroll-accumulator.dto';
import { UpdatePayrollAccumulatorDto } from './dto/update-payroll-accumulator.dto';

@Injectable()
export class PayrollAccumulatorsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createDto: CreatePayrollAccumulatorDto) {
    const { name, description, conceptIds, type, weeksBack, includeAllBonifiable } = createDto;

    const existing = await this.prisma.payrollAccumulator.findUnique({
      where: { tenantId_name: { tenantId, name } },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un Acumulador con el nombre ${name}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const accumulator = await tx.payrollAccumulator.create({
        data: {
          tenantId,
          name,
          description,
          type: type || 'WEEKS_BACK',
          weeksBack: weeksBack !== undefined ? weeksBack : 4,
          includeAllBonifiable: includeAllBonifiable !== undefined ? includeAllBonifiable : false,
        },
      });

      if (conceptIds && conceptIds.length > 0) {
        await tx.accumulatorConcept.createMany({
          data: conceptIds.map((conceptId) => ({
            accumulatorId: accumulator.id,
            conceptId,
          })),
        });
      }

      return tx.payrollAccumulator.findFirst({
        where: { id: accumulator.id, tenantId },
        include: { concepts: { include: { concept: { select: { id: true, code: true, name: true, type: true } } } } }
      });
    });
  }

  findAll(tenantId: string) {
    return this.prisma.payrollAccumulator.findMany({
      where: { tenantId },
      include: {
        concepts: {
          include: {
            concept: {
              select: { id: true, code: true, name: true, type: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const accumulator = await this.prisma.payrollAccumulator.findFirst({
      where: { id, tenantId },
      include: {
        concepts: {
          include: {
            concept: {
              select: { id: true, code: true, name: true, type: true },
            },
          },
        },
      },
    });

    if (!accumulator) {
      throw new NotFoundException(`Acumulador con ID ${id} no encontrado`);
    }

    return accumulator;
  }

  async update(tenantId: string, id: string, updateDto: UpdatePayrollAccumulatorDto) {
    await this.findOne(tenantId, id);

    const { name, description, conceptIds, type, weeksBack, includeAllBonifiable } = updateDto;

    return this.prisma.$transaction(async (tx) => {
      const accumulator = await tx.payrollAccumulator.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(type !== undefined && { type }),
          ...(weeksBack !== undefined && { weeksBack }),
          ...(includeAllBonifiable !== undefined && { includeAllBonifiable }),
        },
      });

      if (conceptIds !== undefined) {
        // Remove existing concepts
        await tx.accumulatorConcept.deleteMany({
          where: { accumulatorId: id },
        });

        // Insert new concepts
        if (conceptIds.length > 0) {
          await tx.accumulatorConcept.createMany({
            data: conceptIds.map((conceptId) => ({
              accumulatorId: id,
              conceptId,
            })),
          });
        }
      }

      return tx.payrollAccumulator.findFirst({
        where: { id: accumulator.id, tenantId },
        include: { concepts: { include: { concept: { select: { id: true, code: true, name: true, type: true } } } } }
      });
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.payrollAccumulator.delete({
      where: { id },
    });
    return { success: true };
  }
}
