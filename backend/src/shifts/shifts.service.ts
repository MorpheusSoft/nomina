import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.shiftPattern.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.shiftPattern.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.shiftPattern.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.shiftPattern.delete({
      where: { id },
    });
  }
}
