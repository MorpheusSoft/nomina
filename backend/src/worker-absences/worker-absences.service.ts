import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkerAbsenceDto } from './dto/create-worker-absence.dto';
import { UpdateWorkerAbsenceDto } from './dto/update-worker-absence.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkerAbsencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createWorkerAbsenceDto: CreateWorkerAbsenceDto) {
    return this.prisma.workerAbsence.create({
      data: {
        ...createWorkerAbsenceDto,
        tenantId,
        startDate: new Date(createWorkerAbsenceDto.startDate),
        endDate: new Date(createWorkerAbsenceDto.endDate),
      },
      include: {
        worker: true
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.workerAbsence.findMany({
      where: { tenantId },
      include: {
        worker: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const absence = await this.prisma.workerAbsence.findFirst({
      where: { id, tenantId },
      include: { worker: true }
    });
    if (!absence) throw new NotFoundException(`Ausencia no encontrada`);
    return absence;
  }

  async update(id: string, tenantId: string, updateWorkerAbsenceDto: UpdateWorkerAbsenceDto) {
    await this.findOne(id, tenantId); // Verificar existencia

    const dataToUpdate: any = { ...updateWorkerAbsenceDto };
    if (updateWorkerAbsenceDto.startDate) dataToUpdate.startDate = new Date(updateWorkerAbsenceDto.startDate);
    if (updateWorkerAbsenceDto.endDate) dataToUpdate.endDate = new Date(updateWorkerAbsenceDto.endDate);

    return this.prisma.workerAbsence.update({
      where: { id },
      data: dataToUpdate,
      include: { worker: true }
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.workerAbsence.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, tenantId: string, status: string, isJustified?: boolean, isPaid?: boolean) {
    await this.findOne(id, tenantId); // Verificar existencia
    
    const dataToUpdate: any = { status };
    if (isJustified !== undefined) dataToUpdate.isJustified = isJustified;
    if (isPaid !== undefined) dataToUpdate.isPaid = isPaid;

    return this.prisma.workerAbsence.update({
      where: { id },
      data: dataToUpdate,
      include: { worker: true }
    });
  }
}
