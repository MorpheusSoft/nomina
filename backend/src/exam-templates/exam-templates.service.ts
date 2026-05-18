import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OracleService } from '../oracle/oracle.service';

@Injectable()
export class ExamTemplatesService {
  constructor(private prisma: PrismaService, private oracle: OracleService) {}

  async generateExamWithAI(tenantId: string, topic: string, numQuestions: number) {
    const questions = await this.oracle.generateExam(tenantId, topic, numQuestions);
    return questions;
  }

  async findAll(tenantId: string) {
    return this.prisma.examTemplate.findMany({
      where: { tenantId },
      include: {
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.examTemplate.findFirst({
      where: { id, tenantId },
      include: { questions: true },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    return template;
  }

  async create(tenantId: string, data: any) {
    const { questions, ...templateData } = data;
    return this.prisma.examTemplate.create({
      data: {
        ...templateData,
        tenantId,
        questions: {
          create: questions || [],
        },
      },
      include: { questions: true },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    const template = await this.prisma.examTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

    const { id: _id, tenantId: _tenantId, createdAt, updatedAt, tenant, recruitmentProcesses, questions, ...updateData } = data;

    const cleanQuestions = questions ? questions.map((q: any) => {
      const { id, examTemplateId, ...rest } = q;
      return rest;
    }) : undefined;

    // Actualización simple: borramos y recreamos las preguntas
    return this.prisma.examTemplate.update({
      where: { id },
      data: {
        ...updateData,
        questions: cleanQuestions ? {
          deleteMany: {},
          create: cleanQuestions,
        } : undefined,
      },
      include: { questions: true },
    });
  }

  async remove(tenantId: string, id: string) {
    const template = await this.prisma.examTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

    return this.prisma.examTemplate.delete({ where: { id } });
  }
}
