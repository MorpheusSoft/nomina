import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvaluationTemplateDto } from './dto/create-evaluation-template.dto';
import { UpdateEvaluationTemplateDto } from './dto/update-evaluation-template.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OracleService } from '../oracle/oracle.service';

@Injectable()
export class EvaluationTemplatesService {
  constructor(private readonly prisma: PrismaService, private readonly oracle: OracleService) {}

  async create(tenantId: string, createEvaluationTemplateDto: CreateEvaluationTemplateDto) {
    const { questions, ...data } = createEvaluationTemplateDto;
    return this.prisma.evaluationTemplate.create({
      data: {
        ...data,
        tenantId,
        questions: {
          create: questions
        }
      },
      include: {
        questions: true
      }
    });
  }

  findAll(tenantId: string) {
    return this.prisma.evaluationTemplate.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { questions: { where: { type: { not: 'SECTION' } } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const template = await this.prisma.evaluationTemplate.findUnique({
      where: { id, tenantId },
      include: {
        questions: true
      }
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, tenantId: string, updateEvaluationTemplateDto: UpdateEvaluationTemplateDto) {
    const { questions, ...data } = updateEvaluationTemplateDto;
    
    return this.prisma.$transaction(async (tx) => {
      const template = await tx.evaluationTemplate.update({
        where: { id, tenantId },
        data
      });

      if (questions) {
        // Delete old questions
        await tx.evaluationQuestion.deleteMany({
          where: { templateId: id }
        });
        
        // Create new ones
        await tx.evaluationTemplate.update({
          where: { id },
          data: {
            questions: {
              create: questions
            }
          }
        });
      }

      return tx.evaluationTemplate.findUnique({
        where: { id },
        include: { questions: true }
      });
    });
  }

  remove(id: string, tenantId: string) {
    return this.prisma.evaluationTemplate.delete({
      where: { id, tenantId }
    });
  }

  async duplicate(id: string, tenantId: string) {
    const original = await this.findOne(id, tenantId);
    
    return this.prisma.evaluationTemplate.create({
      data: {
        tenantId,
        name: `${original.name} (Copia)`,
        description: original.description,
        questions: {
          create: original.questions.map(q => ({
            questionText: q.questionText,
            type: q.type
          }))
        }
      },
      include: { questions: true }
    });
  }

  async generateAi(tenantId: string, data: { name: string, description: string, prompt: string }) {
    return this.oracle.generateEvaluationQuestions(tenantId, data.name, data.description, data.prompt);
  }
}
