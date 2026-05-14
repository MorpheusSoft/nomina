import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecruitmentProcessesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.recruitmentProcess.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { jobApplications: true }
        },
        examTemplates: true
      }
    });
  }

  async create(tenantId: string, data: any) {
    const { examTemplateIds, ...rest } = data;
    return this.prisma.recruitmentProcess.create({
      data: {
        ...rest,
        tenantId,
        examTemplates: examTemplateIds && examTemplateIds.length > 0 ? {
          connect: examTemplateIds.map((id: string) => ({ id }))
        } : undefined
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    const process = await this.prisma.recruitmentProcess.findFirst({
      where: { id, tenantId },
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    const { examTemplateIds, ...rest } = data;
    return this.prisma.recruitmentProcess.update({
      where: { id },
      data: {
        ...rest,
        examTemplates: examTemplateIds ? {
          set: examTemplateIds.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async remove(tenantId: string, id: string) {
    const process = await this.prisma.recruitmentProcess.findFirst({
      where: { id, tenantId },
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    return this.prisma.recruitmentProcess.delete({ where: { id } });
  }

  async cancelProcess(tenantId: string, id: string, reason?: string) {
    const process = await this.prisma.recruitmentProcess.findFirst({
      where: { id, tenantId },
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    await this.prisma.recruitmentProcess.update({
      where: { id },
      data: { 
        status: 'CLOSED', 
        closedAt: new Date(),
        closedReason: reason || 'Vacante cancelada manualmente sin motivo especificado'
      }
    });

    await this.prisma.jobApplication.updateMany({
      where: { recruitmentProcessId: id, status: { in: ['APPLIED', 'SHORTLISTED'] } },
      data: { status: 'REJECTED' }
    });

    return { success: true };
  }

  async reopenProcess(tenantId: string, id: string) {
    const process = await this.prisma.recruitmentProcess.findFirst({
      where: { id, tenantId },
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    await this.prisma.recruitmentProcess.update({
      where: { id },
      data: { 
        status: 'OPEN', 
        closedAt: null,
        closedReason: null
      }
    });

    return { success: true };
  }
}
