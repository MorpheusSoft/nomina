import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    const dept = await this.prisma.department.findFirst({
      where: { id: data.departmentId, costCenter: { tenantId } }
    });
    if (!dept) throw new NotFoundException('Departamento no encontrado o no autorizado');

    return this.prisma.crew.create({
      data: {
        name: data.name,
        departmentId: data.departmentId,
        shiftPatternId: data.shiftPatternId || null,
        patternAnchor: data.patternAnchor ? new Date(data.patternAnchor) : null,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.crew.findMany({
      where: { department: { costCenter: { tenantId } } },
      include: { 
        department: { include: { costCenter: true } },
        shiftPattern: true
      }
    });
  }

  async findOne(tenantId: string, id: string) {
    const crew = await this.prisma.crew.findFirst({
      where: { id, department: { costCenter: { tenantId } } },
      include: { 
        department: { include: { costCenter: true } },
        shiftPattern: true
      }
    });
    if (!crew) throw new NotFoundException('Cuadrilla no encontrada o no autorizada');
    return crew;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.crew.update({
      where: { id },
      data: {
        name: data.name,
        shiftPatternId: data.shiftPatternId || null,
        patternAnchor: data.patternAnchor ? new Date(data.patternAnchor) : null,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.crew.delete({
      where: { id },
    });
  }
}
