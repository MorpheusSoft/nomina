import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.bank.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, data: { name: string; code: string }) {
    return this.prisma.bank.create({
      data: { ...data, tenantId },
    });
  }

  async remove(id: string, tenantId: string) {
    const bank = await this.prisma.bank.findFirst({ where: { id, tenantId } });
    if (!bank) throw new NotFoundException('Banco no encontrado');
    return this.prisma.bank.delete({ where: { id } });
  }
}
