import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  // PÚBLICO: Permite registrar un candidato y aplicarlo a un proceso de reclutamiento (Vacante).
  async applyToProcess(processId: string, data: any) {
    const { firstName, lastName, email, phone, resumeUrl, experienceYears, skills } = data;

    // Verificar que el proceso exista
    const process = await this.prisma.recruitmentProcess.findUnique({
      where: { id: processId }
    });

    if (!process) {
      throw new NotFoundException('El proceso de reclutamiento no existe.');
    }

    if (process.status === 'CLOSED') {
      throw new BadRequestException('Esta vacante ya se encuentra cerrada y no acepta nuevas postulaciones.');
    }

    // 1. Crear o Actualizar el Candidato (Global)
    const candidate = await this.prisma.candidate.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        phone,
        resumeUrl,
        rawResumeText: data.rawResumeText,
        professionalSummary: data.professionalSummary,
        personalDetails: data.personalDetails || undefined,
        experienceYears,
        skills,
      },
      create: {
        firstName,
        lastName,
        email,
        phone,
        resumeUrl,
        rawResumeText: data.rawResumeText,
        professionalSummary: data.professionalSummary,
        personalDetails: data.personalDetails || undefined,
        experienceYears,
        skills,
      },
    });

    // 2. Crear o Actualizar la aplicación (JobApplication)
    const application = await this.prisma.jobApplication.upsert({
      where: {
        candidateId_recruitmentProcessId: {
          candidateId: candidate.id,
          recruitmentProcessId: processId,
        },
      },
      update: {
        status: 'APPLIED',
        isStarred: false,
      },
      create: {
        candidateId: candidate.id,
        recruitmentProcessId: processId,
        status: 'APPLIED',
        portalToken: require('crypto').randomUUID(),
      },
    });

    return { candidate, application };
  }

  async getPortalData(portalToken: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { portalToken },
      include: {
        candidate: true,
        recruitmentProcess: {
          include: { examTemplates: true }
        },
        candidateExams: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Portal no encontrado o expirado.');
    }

    if (application.recruitmentProcess?.status === 'CLOSED') {
      throw new BadRequestException('Esta vacante ya ha sido cerrada. El portal del candidato ya no está disponible.');
    }

    // Auto-assign missing exams based on the recruitment process
    let updatedCandidateExams = [...application.candidateExams];
    
    if (application.recruitmentProcess?.status !== 'CLOSED') {
      const processTemplates = application.recruitmentProcess?.examTemplates || [];
      const crypto = require('crypto');

      for (const tpl of processTemplates) {
        const alreadyAssigned = updatedCandidateExams.find(ce => ce.examTemplateId === tpl.id);
        if (!alreadyAssigned) {
          const newExam = await this.prisma.candidateExam.create({
            data: {
              jobApplicationId: application.id,
              examTemplateId: tpl.id,
              token: crypto.randomUUID(),
            }
          });
          updatedCandidateExams.push(newExam);
        }
      }
    }

    const templateIds = updatedCandidateExams.map(ce => ce.examTemplateId);
    const templates = await this.prisma.examTemplate.findMany({ where: { id: { in: templateIds } } });
    
    // Inject templates manually
    const examsWithTemplates = updatedCandidateExams.map(ex => {
      const tpl = templates.find(t => t.id === ex.examTemplateId);
      return { ...ex, examTemplate: tpl };
    });

    return { ...application, candidateExams: examsWithTemplates };
  }

  // PÚBLICO: Permite registrar un candidato directo a la base global sin vacante
  async applyToGlobalPool(data: any) {
    const { firstName, lastName, email, phone, resumeUrl, experienceYears, skills } = data;

    const candidate = await this.prisma.candidate.upsert({
      where: { email },
      update: {
        firstName, lastName, phone, resumeUrl,
        rawResumeText: data.rawResumeText,
        professionalSummary: data.professionalSummary,
        personalDetails: data.personalDetails || undefined,
        experienceYears, skills,
      },
      create: {
        firstName, lastName, email, phone, resumeUrl,
        rawResumeText: data.rawResumeText,
        professionalSummary: data.professionalSummary,
        personalDetails: data.personalDetails || undefined,
        experienceYears, skills,
      },
    });

    return { candidate };
  }

  // Endpoint para búsquedas globales
  async findAll() {
    return this.prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        jobApplications: {
          include: { recruitmentProcess: true }
        }
      }
    });
  }

  async assignToVacancy(candidateId: string, processId: string) {
    const process = await this.prisma.recruitmentProcess.findUnique({ where: { id: processId } });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    const crypto = require('crypto');
    const portalToken = crypto.randomBytes(32).toString('hex');

    const app = await this.prisma.jobApplication.upsert({
      where: {
        candidateId_recruitmentProcessId: {
          candidateId,
          recruitmentProcessId: processId
        }
      },
      update: {},
      create: {
        candidateId,
        recruitmentProcessId: processId,
        portalToken
      }
    });
    return app;
  }

  async oracleMatch(processId: string, oracleService: any) {
    const process = await this.prisma.recruitmentProcess.findUnique({ where: { id: processId } });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    const candidates = await this.prisma.candidate.findMany({
      where: {
        jobApplications: {
          none: { recruitmentProcessId: processId }
        }
      }
    });

    if (!candidates.length) return [];
    
    return oracleService.matchCandidates(process.title, process.description, candidates);
  }
}
