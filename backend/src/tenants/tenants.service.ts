import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        _count: {
          select: { workers: true }
        },
        users: { 
          take: 5, 
          select: { firstName: true, lastName: true, email: true, role: { select: { name: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { workers: true }
        },
        users: { 
          take: 5, 
          select: { firstName: true, lastName: true, email: true, role: { select: { name: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        maxActiveWorkers: data.maxActiveWorkers ? parseInt(data.maxActiveWorkers.toString(), 10) : undefined,
        isActive: data.isActive,
        hasWorkerPortalAccess: data.hasWorkerPortalAccess,
        hasOracleAccess: data.hasOracleAccess,
        hasGeofencingAccess: data.hasGeofencingAccess,
        oraclePrompt: data.oraclePrompt,
        logoUrl: data.logoUrl,
        contactPhone: data.contactPhone,
        serviceEndDate: data.serviceEndDate !== undefined ? (data.serviceEndDate ? new Date(data.serviceEndDate) : null) : undefined
      }
    });
  }

  async assignConsultant(targetTenantId: string, consultantUserId: string) {
    // 1. Verify target tenant
    const tenant = await this.prisma.tenant.findUnique({ where: { id: targetTenantId } });
    if (!tenant) throw new Error('Cliente no encontrado');

    // 2. Find or Create Support Role for this tenant
    let supportRole = await this.prisma.role.findFirst({
      where: { tenantId: targetTenantId, name: 'Consultor de Soporte' }
    });

    if (!supportRole) {
      supportRole = await this.prisma.role.create({
        data: {
          tenantId: targetTenantId,
          name: 'Consultor de Soporte',
          permissions: ['VIEW_CONCEPTS', 'MANAGE_CONCEPTS', 'VIEW_WORKERS', 'VIEW_PAYROLLS'] // Protected from deleting and core admin actions
        }
      });
    }

    // 3. Bind Consultant
    return this.prisma.userTenantAccess.upsert({
      where: { userId_tenantId: { userId: consultantUserId, tenantId: targetTenantId } },
      update: { roleId: supportRole.id },
      create: {
        userId: consultantUserId,
        tenantId: targetTenantId,
        roleId: supportRole.id
      }
    });
  }
}
