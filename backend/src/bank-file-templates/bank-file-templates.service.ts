import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankFileTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.bankFileTemplate.findMany({
      where: { tenantId },
      include: { bank: true },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.bankFileTemplate.create({
      data: {
        ...data,
        tenantId,
      },
      include: { bank: true },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const template = await this.prisma.bankFileTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

    return this.prisma.bankFileTemplate.update({
      where: { id },
      data,
      include: { bank: true },
    });
  }

  async remove(id: string, tenantId: string) {
    const template = await this.prisma.bankFileTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

    return this.prisma.bankFileTemplate.delete({ where: { id } });
  }
}
