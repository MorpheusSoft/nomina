import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShiftPatternDto } from './dto/create-shift-pattern.dto';
import { UpdateShiftPatternDto } from './dto/update-shift-pattern.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftPatternsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createShiftPatternDto: CreateShiftPatternDto) {
    return this.prisma.shiftPattern.create({
      data: {
        tenantId,
        name: createShiftPatternDto.name,
        sequence: createShiftPatternDto.sequence as any,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.shiftPattern.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { crews: true }
        }
      }
    });
  }

  async findOne(tenantId: string, id: string) {
    const pattern = await this.prisma.shiftPattern.findUnique({
      where: { id, tenantId },
      include: { crews: true }
    });
    if (!pattern) throw new NotFoundException('Shift Pattern not found');
    return pattern;
  }

  async update(tenantId: string, id: string, updateShiftPatternDto: UpdateShiftPatternDto) {
    const pattern = await this.findOne(tenantId, id);
    return this.prisma.shiftPattern.update({
      where: { id: pattern.id },
      data: {
        name: updateShiftPatternDto.name,
        sequence: updateShiftPatternDto.sequence !== undefined ? (updateShiftPatternDto.sequence as any) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const pattern = await this.findOne(tenantId, id);
    return this.prisma.shiftPattern.delete({
      where: { id: pattern.id },
    });
  }
}
