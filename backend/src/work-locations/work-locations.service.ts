import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkLocationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.WorkLocationUncheckedCreateInput) {
    return this.prisma.workLocation.create({
      data,
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.workLocation.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async getSyncData(id: string, tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { hasGeofencingAccess: true }
    });

    if (!tenant?.hasGeofencingAccess) {
      throw new UnauthorizedException('Su empresa no tiene habilitado el módulo premium de Asistencia Geolocalizada.');
    }

    const location = await this.findOne(id, tenantId);

    const costCenters = await this.prisma.costCenter.findMany({
      where: { workLocationId: id, tenantId },
      include: {
        departments: {
          include: {
            crews: {
              include: {
                employmentRecords: {
                  where: { isActive: true },
                  include: {
                    owner: {
                      select: { id: true, firstName: true, lastName: true, primaryIdentityNumber: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const mappedCrews: any[] = [];
    costCenters.forEach(cc => {
      cc.departments.forEach(dept => {
        dept.crews.forEach(crew => {
          if (crew.employmentRecords.length > 0) {
            mappedCrews.push({
              id: crew.id,
              costCenterId: cc.id,
              costCenterName: `${cc.name} - ${crew.name}`,
              workers: crew.employmentRecords.map(er => ({
                id: er.owner.id,
                name: `${er.owner.firstName} ${er.owner.lastName}`,
                identity: er.owner.primaryIdentityNumber,
                status: 'PENDING'
              }))
            });
          }
        });
      });
    });

    return {
      location: {
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        allowedRadius: location.allowedRadius
      },
      crews: mappedCrews
    };
  }

  async findOne(id: string, tenantId: string) {
    const workLocation = await this.prisma.workLocation.findFirst({
      where: { id, tenantId },
    });
    if (!workLocation) {
      throw new BadRequestException('WorkLocation not found or access denied');
    }
    return workLocation;
  }

  async update(id: string, tenantId: string, data: Prisma.WorkLocationUncheckedUpdateInput) {
    await this.findOne(id, tenantId); // ensure it exists and belongs to tenant
    return this.prisma.workLocation.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    
    // Check if it's being used by any cost center
    const costCenters = await this.prisma.costCenter.count({
      where: { workLocationId: id }
    });

    if (costCenters > 0) {
      throw new BadRequestException('No se puede eliminar la locación porque está asignada a uno o más Centros de Costo.');
    }

    return this.prisma.workLocation.delete({
      where: { id },
    });
  }
}
