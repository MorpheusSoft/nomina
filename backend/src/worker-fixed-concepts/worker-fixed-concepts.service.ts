import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerFixedConceptDto } from './dto/create-worker-fixed-concept.dto';

@Injectable()
export class WorkerFixedConceptsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkerFixedConceptDto) {
    try {
      return await this.prisma.workerFixedConcept.create({
        data: {
          ...data,
          validFrom: new Date(data.validFrom),
          validTo: data.validTo ? new Date(data.validTo) : null,
        },
      });
    } catch (e) {
      throw new BadRequestException('Error creating Worker Fixed Concept: ' + (e.message || JSON.stringify(e)));
    }
  }

  async findAllByWorker(workerId: string) {
    return this.prisma.workerFixedConcept.findMany({
      where: { employmentRecord: { workerId } },
      include: { concept: true }
    });
  }

  async findAllByEmploymentRecord(employmentRecordId: string) {
    return this.prisma.workerFixedConcept.findMany({
      where: { employmentRecordId },
      include: { concept: true }
    });
  }

  async findOne(id: string) {
    return this.prisma.workerFixedConcept.findUnique({
      where: { id },
      include: { concept: true, employmentRecord: true }
    });
  }

  async update(id: string, data: any) {
    const updateData: any = { ...data };
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom);
    if (data.validTo !== undefined) updateData.validTo = data.validTo ? new Date(data.validTo) : null;

    return this.prisma.workerFixedConcept.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.workerFixedConcept.delete({
      where: { id },
    });
  }
}
