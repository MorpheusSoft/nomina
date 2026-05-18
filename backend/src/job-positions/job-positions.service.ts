import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobPositionDto } from './dto/create-job-position.dto';
import { UpdateJobPositionDto } from './dto/update-job-position.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobPositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobPositionDto: CreateJobPositionDto, tenantId: string) {
    return this.prisma.jobPosition.create({
      data: {
        ...createJobPositionDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.jobPosition.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: { evaluationTemplate: true }
    });
  }

  async findOne(id: string, tenantId: string) {
    const jobPosition = await this.prisma.jobPosition.findUnique({
      where: { id, tenantId },
    });
    if (!jobPosition) {
      throw new NotFoundException(`Job Position with ID ${id} not found`);
    }
    return jobPosition;
  }

  async update(id: string, updateJobPositionDto: UpdateJobPositionDto, tenantId: string) {
    await this.findOne(id, tenantId); // Validates existence
    return this.prisma.jobPosition.update({
      where: { id },
      data: updateJobPositionDto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Validates existence
    return this.prisma.jobPosition.delete({
      where: { id },
    });
  }
}
