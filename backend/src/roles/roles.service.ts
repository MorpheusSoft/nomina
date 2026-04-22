import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, data: any) {
    return this.prisma.role.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.role.findFirst({
      where: { id, tenantId },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    await this.prisma.role.updateMany({
      where: { id, tenantId },
      data,
    });
    return this.findOne(tenantId, id);
  }

  remove(tenantId: string, id: string) {
    return this.prisma.role.deleteMany({
      where: { id, tenantId },
    });
  }
}
