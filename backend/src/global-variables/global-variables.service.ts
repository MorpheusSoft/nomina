import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GlobalVariablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.globalVariable.create({
      data: { ...data, tenantId },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.globalVariable.findMany({
      where: { tenantId },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const v = await this.prisma.globalVariable.findFirst({ where: { id, tenantId } });
    if (!v) throw new NotFoundException('Variable not found or unauthorized');
    return v;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.globalVariable.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.globalVariable.deleteMany({ where: { id, tenantId } });
  }

  async importFromRoot(targetTenantId: string) {
    // 1. Resolve Root Node ID
    const adminUser = await this.prisma.user.findUnique({ where: { email: 'admin@nebulapayrolls.com' } });
    if (!adminUser) throw new NotFoundException('Nodo maestro inaccesible.');
    if (adminUser.tenantId === targetTenantId) throw new Error('Ya estás en el nodo maestro.');

    // 2. Fetch all generic variables from the root library
    const rootVars = await this.prisma.globalVariable.findMany({ where: { tenantId: adminUser.tenantId } });
    let importedCount = 0;

    // 3. Replicate safely
    for (const v of rootVars) {
      const exists = await this.prisma.globalVariable.findFirst({ 
        where: { tenantId: targetTenantId, code: v.code } 
      });

      if (!exists) {
        const { id, tenantId, ...cleanVar } = v;
        await this.prisma.globalVariable.create({
          data: {
            ...cleanVar,
            tenantId: targetTenantId
          }
        });
        importedCount++;
      }
    }
    
    return { importedCount };
  }
}
