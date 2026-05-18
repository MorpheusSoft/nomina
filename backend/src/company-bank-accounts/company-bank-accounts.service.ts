import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyBankAccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.companyBankAccount.findMany({
      where: { tenantId },
      include: { bank: true },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.companyBankAccount.create({
      data: {
        ...data,
        tenantId,
      },
      include: { bank: true },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const account = await this.prisma.companyBankAccount.findFirst({
      where: { id, tenantId },
    });
    if (!account) throw new NotFoundException('Cuenta no encontrada');

    return this.prisma.companyBankAccount.update({
      where: { id },
      data,
      include: { bank: true },
    });
  }

  async remove(id: string, tenantId: string) {
    const account = await this.prisma.companyBankAccount.findFirst({
      where: { id, tenantId },
    });
    if (!account) throw new NotFoundException('Cuenta no encontrada');

    return this.prisma.companyBankAccount.delete({ where: { id } });
  }
}
