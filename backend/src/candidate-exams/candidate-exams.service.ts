import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

import { OracleService } from '../oracle/oracle.service';

@Injectable()
export class CandidateExamsService {
  constructor(private prisma: PrismaService, private oracle: OracleService) {}

  // Generar un link de examen (Uso por el analista)
  async createExamLink(tenantId: string, jobApplicationId: string, examTemplateId: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, recruitmentProcess: { tenantId } },
    });
    if (!application) throw new NotFoundException('Aplicación no encontrada');

    const template = await this.prisma.examTemplate.findFirst({
      where: { id: examTemplateId, tenantId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

    return this.prisma.candidateExam.create({
      data: {
        jobApplicationId,
        examTemplateId,
        token: randomUUID(),
      },
    });
  }

  // PÚBLICO: Obtener el examen dado un token (Sin login, modo Focus Mode)
  async getExamByToken(token: string) {
    const exam = await this.prisma.candidateExam.findUnique({
      where: { token },
      include: {
        jobApplication: {
          include: { candidate: true, recruitmentProcess: true },
        }
      }
    });

    if (!exam) throw new NotFoundException('Enlace de examen inválido');
    if (exam.status === 'COMPLETED') throw new BadRequestException('El examen ya fue completado.');
    if (exam.jobApplication.recruitmentProcess.status === 'CLOSED') {
      throw new BadRequestException('La vacante asociada a este examen ya fue cerrada. El examen ya no está disponible.');
    }

    const examTemplate = await this.prisma.examTemplate.findUnique({
      where: { id: exam.examTemplateId },
      include: {
        questions: {
          // No retornamos isCorrect al frontend por seguridad!
          select: {
            id: true,
            questionText: true,
            imageUrl: true,
            options: true,
          }
        }
      }
    });

    if (!examTemplate) throw new NotFoundException('Plantilla no encontrada');

    // Limpiar options para que no tengan la respuesta correcta en el frontend
    const cleanedQuestions = examTemplate.questions.map(q => {
      const parsedOptions = Array.isArray(q.options) ? q.options : [];
      return {
        ...q,
        options: parsedOptions.map((opt: any) => ({ text: opt.text })) // Quitamos isCorrect
      };
    });

    return {
      id: exam.id,
      status: exam.status,
      startedAt: exam.startedAt,
      candidateName: `${exam.jobApplication.candidate.firstName} ${exam.jobApplication.candidate.lastName}`,
      processTitle: exam.jobApplication.recruitmentProcess.title,
      templateName: examTemplate.name,
      timeLimitMinutes: examTemplate.timeLimitMinutes,
      questions: cleanedQuestions,
    };
  }

  // PÚBLICO: Iniciar examen (marca timestamp)
  async startExam(token: string) {
    const exam = await this.prisma.candidateExam.findUnique({ where: { token } });
    if (!exam || exam.status === 'COMPLETED') throw new BadRequestException('Examen inválido o terminado');

    if (!exam.startedAt) {
      await this.prisma.candidateExam.update({
        where: { id: exam.id },
        data: { startedAt: new Date() },
      });
    }
    return { success: true };
  }

  // PÚBLICO: Enviar respuestas y calificar
  async submitExam(token: string, answers: any[]) {
    const exam = await this.prisma.candidateExam.findUnique({ 
      where: { token },
      include: { 
        jobApplication: { include: { candidate: true, recruitmentProcess: true } }
      }
    });

    if (!exam) throw new NotFoundException('Examen no encontrado');
    if (exam.status === 'COMPLETED') throw new BadRequestException('Examen ya completado');
    if (exam.jobApplication.recruitmentProcess.status === 'CLOSED') {
      throw new BadRequestException('La vacante asociada a este examen ya fue cerrada. No se pueden enviar respuestas.');
    }

    const examTemplate = await this.prisma.examTemplate.findUnique({
      where: { id: exam.examTemplateId },
      include: { questions: true }
    });

    if (!examTemplate) throw new NotFoundException('Plantilla de examen no encontrada');

    let correctCount = 0;
    const totalCount = examTemplate.questions.length;

    for (const q of examTemplate.questions) {
      const userAnswer = answers.find(a => a.questionId === q.id);
      if (userAnswer) {
        const parsedOptions = Array.isArray(q.options) ? q.options : [];
        const correctOpt: any = parsedOptions.find((opt: any) => opt.isCorrect);
        if (correctOpt && correctOpt.text === userAnswer.selectedText) {
          correctCount++;
        }
      }
    }

    const score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // Phase 3: Gemini AI Feedback
    const candidateName = `${exam.jobApplication.candidate.firstName} ${exam.jobApplication.candidate.lastName}`;
    const aiFeedback = await this.oracle.evaluateExam(
      examTemplate.tenantId, 
      candidateName, 
      examTemplate.questions, 
      answers
    );
    
    await this.prisma.candidateExam.update({
      where: { id: exam.id },
      data: {
        status: 'COMPLETED',
        score,
        completedAt: new Date(),
        aiFeedback,
      }
    });

    // Actualizar estado del embudo a EXAMINED
    await this.prisma.jobApplication.update({
      where: { id: exam.jobApplicationId },
      data: { status: 'EXAMINED' }
    });

    return { score };
  }
}
