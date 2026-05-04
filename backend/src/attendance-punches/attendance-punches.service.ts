import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PunchSource, PunchType } from '@prisma/client';
import { GeoLocationService } from './geo-location.service';

@Injectable()
export class AttendancePunchesService {
  constructor(
    private prisma: PrismaService,
    private geoLocationService: GeoLocationService
  ) {}

  async create(data: Prisma.AttendancePunchUncheckedCreateInput) {
    // Verificar que el trabajador pertenece al tenant y obtener su WorkLocation
    const worker = await this.prisma.worker.findUnique({
      where: { id: data.workerId },
      include: {
        employmentRecords: {
          where: { isActive: true }, // assuming we only want active records, or just take the first one
          include: {
            costCenter: {
              include: {
                workLocation: true
              }
            }
          }
        }
      }
    });

    if (!worker || worker.tenantId !== data.tenantId) {
      throw new BadRequestException('Worker does not exist or does not belong to the tenant');
    }

    let isValid = true;
    let locationStatus = 'VALID';

    if (data.latitude && data.longitude) {
      // Find the first employment record's work location
      const workLocation = worker.employmentRecords[0]?.costCenter?.workLocation;

      if (workLocation && workLocation.latitude && workLocation.longitude) {
        const validation = this.geoLocationService.isWithinRadius(
          Number(data.latitude),
          Number(data.longitude),
          Number(workLocation.latitude),
          Number(workLocation.longitude),
          workLocation.allowedRadius
        );

        if (!validation.isValid) {
          isValid = false;
          locationStatus = 'REJECTED_OUT_OF_RANGE';
        }
      } else {
        locationStatus = 'NO_GEOFENCE_DEFINED';
      }
    } else {
      locationStatus = 'NO_COORDINATES_PROVIDED';
    }

    return this.prisma.attendancePunch.create({
      data: {
        ...data,
        isValid,
        locationStatus
      },
    });
  }

  async createBulk(tenantId: string, punches: any[]) {
    // punches es un array de { identityNumber, timestamp, type, source } (veniendo de un excel por ej)
    // necesitamos resolver el workerId a partir de la cédula (identityNumber)
    // Fetch all workers for the tenant to ensure robust matching despite subtle formatting
    const workers = await this.prisma.worker.findMany({
      where: {
        tenantId
      }
    });

    const workerMap = new Map(workers.map(w => [w.primaryIdentityNumber.trim().toUpperCase(), w.id]));
    
    const dataToInsert = punches.map(p => {
      const normId = p.identityNumber.trim().toUpperCase();
      const workerId = workerMap.get(normId);
      if (!workerId) {
        throw new BadRequestException(`Cédula no encontrada en el sistema: ${p.identityNumber}`);
      }
      const parsedDate = new Date(p.timestamp);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException(`Fecha u hora inválida en el registro de la cédula: ${p.identityNumber}`);
      }

      return {
        tenantId,
        workerId,
        timestamp: parsedDate,
        type: p.type as PunchType,
        source: p.source as PunchSource,
        deviceId: p.deviceId || null,
        isProcessed: false,
      };
    });

    const result = await this.prisma.attendancePunch.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    return { count: result.count };
  }

  async findAll(tenantId: string, workerId?: string) {
    return this.prisma.attendancePunch.findMany({
      where: {
        tenantId,
        ...(workerId ? { workerId } : {}),
      },
      orderBy: { timestamp: 'desc' },
      include: {
        worker: {
          select: { firstName: true, lastName: true, primaryIdentityNumber: true }
        },
        device: {
          select: { name: true }
        }
      },
      take: 1000 // limit to last 1000 for safety, could add pagination later
    });
  }

  async remove(id: string, tenantId: string) {
    const punch = await this.prisma.attendancePunch.findUnique({ where: { id } });
    if (!punch || punch.tenantId !== tenantId) {
      throw new BadRequestException('Punch not found');
    }
    return this.prisma.attendancePunch.delete({ where: { id } });
  }
}
