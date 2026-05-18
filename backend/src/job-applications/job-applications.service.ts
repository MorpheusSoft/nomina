import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { OracleService } from '../oracle/oracle.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class JobApplicationsService {
  constructor(
    private prisma: PrismaService,
    private oracle: OracleService,
    private emailService: EmailService
  ) {}

  // Buscar aplicaciones para un proceso específico
  async findAllByProcess(tenantId: string, processId: string) {
    // Validar que el proceso pertenece al tenant
    const process = await this.prisma.recruitmentProcess.findFirst({
      where: { id: processId, tenantId }
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    return this.prisma.jobApplication.findMany({
      where: { recruitmentProcessId: processId },
      include: {
        candidate: true,
        candidateExams: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Toggle Star (Estrellita)
  async toggleStar(tenantId: string, id: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id },
      include: { recruitmentProcess: true }
    });

    if (!application || application.recruitmentProcess.tenantId !== tenantId) {
      throw new NotFoundException('Aplicación no encontrada');
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data: { isStarred: !application.isStarred },
      include: { 
        candidate: true,
        candidateExams: true,
        recruitmentProcess: true
      },
    });
  }

  async setShortlisted(tenantId: string, id: string, isShortlisted: boolean) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id },
      include: { recruitmentProcess: true }
    });

    if (!application || application.recruitmentProcess.tenantId !== tenantId) {
      throw new NotFoundException('Aplicación no encontrada');
    }

    return this.prisma.jobApplication.update({
      where: { id },
      data: { status: isShortlisted ? 'SHORTLISTED' : 'APPLIED' },
      include: { 
        candidate: true,
        candidateExams: true,
        recruitmentProcess: true
      },
    });
  }

  async assignExamsToElegibles(tenantId: string, processId: string) {
    const process = await this.prisma.recruitmentProcess.findFirst({
      where: { id: processId, tenantId },
      include: { examTemplates: true }
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    const applications = await this.prisma.jobApplication.findMany({
      where: { recruitmentProcessId: processId, status: 'SHORTLISTED' },
      include: { candidateExams: true, candidate: true }
    });

    let assignedCount = 0;
    const crypto = require('crypto');

    for (const app of applications) {
      let portalToken = app.portalToken;
      // Ensure it has a portal token
      if (!portalToken) {
        portalToken = crypto.randomUUID();
        await this.prisma.jobApplication.update({
          where: { id: app.id },
          data: { portalToken }
        });
      }

      let newExamsForThisCandidate = 0;
      for (const template of process.examTemplates) {
        const alreadyAssigned = app.candidateExams.find(ce => ce.examTemplateId === template.id);
        if (!alreadyAssigned) {
          await this.prisma.candidateExam.create({
            data: {
              jobApplicationId: app.id,
              examTemplateId: template.id,
              token: crypto.randomUUID(),
            }
          });
          assignedCount++;
          newExamsForThisCandidate++;
        }
      }

      // Si se le asignaron nuevos exámenes, enviar el correo
      if (newExamsForThisCandidate > 0 && app.candidate.email && portalToken) {
        await this.emailService.sendPortalLink(
          app.candidate.email, 
          app.candidate.firstName, 
          process.title, 
          portalToken,
          'Nebula ATS',
          process.tenantId
        );
      }
    }

    return { success: true, assignedExamsCount: assignedCount };
  }

  async autoScreenCandidates(tenantId: string, processId: string) {
    const process = await this.prisma.recruitmentProcess.findFirst({
      where: { id: processId, tenantId },
    });
    if (!process) throw new NotFoundException('Proceso no encontrado');

    const applications = await this.prisma.jobApplication.findMany({
      where: { recruitmentProcessId: processId, status: 'APPLIED' },
      include: { candidate: true }
    });

    if (applications.length === 0) return { success: true, count: 0 };

    // Formatear datos para la IA
    const candidatesData = applications.map(app => ({
      id: app.id,
      firstName: app.candidate.firstName,
      lastName: app.candidate.lastName,
      experienceYears: app.candidate.experienceYears,
      skills: app.candidate.skills,
      summary: app.candidate.professionalSummary
    }));

    const prompt = `Actúa como un reclutador experto. Tienes la vacante: "${process.title}"
Requisitos y descripción de la vacante: 
${process.description || 'No especificado. Basate en el título de la vacante.'}

A continuación tienes una lista de candidatos en formato JSON:
${JSON.stringify(candidatesData)}

Tu tarea es identificar a los 5 candidatos que mejor se ajusten al perfil de la vacante (o menos si hay menos de 5).
Devuelve ÚNICAMENTE un arreglo JSON con los IDs de las aplicaciones seleccionadas. Ejemplo: ["id1", "id2"]`;

    try {
      // Inicia GoogleGenAI si no está
      if (!this.oracle.ai) {
          const { GoogleGenAI } = require('@google/genai');
          this.oracle.ai = new GoogleGenAI({ apiKey: global.process.env.GEMINI_API_KEY });
      }

      const response = await this.oracle.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const selectedIds = JSON.parse(response.text || '[]');

      if (Array.isArray(selectedIds) && selectedIds.length > 0) {
        await this.prisma.jobApplication.updateMany({
          where: { id: { in: selectedIds } },
          data: { status: 'SHORTLISTED', isStarred: true }
        });
      }

      return { success: true, count: selectedIds.length, selectedIds };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Falla al comunicarse con Oráculo' };
    }
  }

  async generateHolisticSummary(tenantId: string, applicationId: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, recruitmentProcess: { tenantId } },
      include: {
        candidate: true,
        recruitmentProcess: true,
        candidateExams: true,
        interviews: true
      }
    });

    if (!application) throw new NotFoundException('Aplicación no encontrada');

    if (application.aiHolisticSummary && Object.keys(application.aiHolisticSummary).length > 0) {
      return { success: true, data: application.aiHolisticSummary };
    }

    const { candidate, recruitmentProcess, candidateExams, interviews } = application;

    // Check if there's any completed exam
    const completedExams = candidateExams.filter((ce: any) => ce.status === 'COMPLETED');
    if (completedExams.length === 0 && (!interviews || interviews.length === 0)) {
      return { error: 'El candidato aún no ha completado ninguna evaluación ni tiene entrevistas registradas.' };
    }

    const templateIds = completedExams.map((ce: any) => ce.examTemplateId);
    const templates = await this.prisma.examTemplate.findMany({ where: { id: { in: templateIds } } });

    const examsInfo = completedExams.map((ex: any) => {
      const tpl = templates.find((t: any) => t.id === ex.examTemplateId);
      return {
        examen: tpl ? tpl.name : 'Examen',
        puntuacion: ex.score,
        retroalimentacionIA: ex.aiFeedback || 'Sin retroalimentación individual.'
      };
    });

    const prompt = `Actúa como Oráculo, un Asistente Analista de RRHH de primer nivel.
Tu objetivo es entregar un resumen ejecutivo integral, claro y nada técnico sobre un candidato, dirigido al Gerente o Analista de Contratación.

Toma en cuenta estos 3 pilares:
1. DESCRIPCIÓN DE LA VACANTE:
   - Cargo: ${recruitmentProcess.title}
   - Detalles/Requisitos: ${recruitmentProcess.description || 'No detallado'}

2. PERFIL DEL CANDIDATO:
   - Nombre: ${candidate.firstName} ${candidate.lastName}
   - Experiencia: ${candidate.experienceYears} años
   - Habilidades principales: ${Array.isArray(candidate.skills) ? candidate.skills.join(', ') : 'No especificadas'}
   - Resumen del CV: ${candidate.professionalSummary || 'No extraído'}

3. RESULTADOS DE EVALUACIONES TÉCNICAS/PSICOTÉCNICAS:
   ${JSON.stringify(examsInfo, null, 2)}

4. RESULTADOS DE ENTREVISTAS (Si las hay):
   ${interviews && interviews.length > 0 ? JSON.stringify(interviews.map((i: any) => ({
      tipo: i.type,
      calificacion: i.rating,
      notas_entrevistador: i.feedback || 'Sin notas'
   })), null, 2) : 'No hay entrevistas registradas'}

Tu respuesta DEBE estar en formato JSON con la siguiente estructura estricta:
{
  "porcentajeCumplimiento": <número entre 0 y 100>,
  "resumenParaAnalista": "<un párrafo contundente resumiendo si el candidato es apto o no para el cargo, destacando el cruce entre su perfil y sus notas de examen>",
  "puntosFuertes": ["<punto 1>", "<punto 2>"],
  "puntosDeMejora": ["<punto 1>"],
  "recomendacionFinal": "<Avanzar a Entrevista, Mantener en Reserva, o Descartar>"
}`;

    try {
      if (!this.oracle.ai) {
          const { GoogleGenAI } = require('@google/genai');
          this.oracle.ai = new GoogleGenAI({ apiKey: global.process.env.GEMINI_API_KEY });
      }

      const response = await this.oracle.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const analysis = JSON.parse(response.text || '{}');

      await this.prisma.jobApplication.update({
        where: { id: applicationId },
        data: { aiHolisticSummary: analysis }
      });

      return {
        success: true,
        data: analysis
      };
    } catch (e) {
      console.error('Error generando resumen holístico:', e);
      return { success: false, error: 'Falla al procesar el resumen con IA.' };
    }
  }

  async hireCandidate(tenantId: string, applicationId: string, closeVacancy: boolean) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, recruitmentProcess: { tenantId } },
      include: { candidate: true, recruitmentProcess: true }
    });

    if (!application) throw new NotFoundException('Aplicación no encontrada');

    // 1. Marcar la aplicación como HIRED
    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'HIRED' }
    });

    // 2. Validar si ya existe el trabajador para no duplicarlo
    const crypto = require('crypto');
    const personal = (application.candidate.personalDetails as any) || {};
    
    let identityNumber = personal.primaryIdentityNumber && personal.primaryIdentityNumber !== 'N/A' 
      ? personal.primaryIdentityNumber 
      : null;

    let parsedBirthDate = new Date('1990-01-01');
    if (personal.birthDate && personal.birthDate !== '1990-01-01' && !isNaN(Date.parse(personal.birthDate))) {
      parsedBirthDate = new Date(personal.birthDate);
    }

    let existingWorker = null;
    
    if (identityNumber) {
      existingWorker = await this.prisma.worker.findFirst({
        where: { tenantId, primaryIdentityNumber: identityNumber }
      });
    }

    if (!existingWorker && application.candidate.email) {
      existingWorker = await this.prisma.worker.findFirst({
        where: { tenantId, email: application.candidate.email }
      });
    }

    // Solo lo creamos si no existe previamente en la base de datos de trabajadores
    if (!existingWorker) {
      await this.prisma.worker.create({
        data: {
          tenantId,
          primaryIdentityNumber: identityNumber || `PENDING-${crypto.randomUUID().substring(0, 8)}`,
          firstName: application.candidate.firstName,
          lastName: application.candidate.lastName,
          email: application.candidate.email,
          phone: application.candidate.phone,
          birthDate: parsedBirthDate,
          gender: personal.gender && personal.gender !== 'N/A' ? personal.gender : 'N/A',
          nationality: personal.nationality && personal.nationality !== 'N/A' ? personal.nationality : 'N/A',
          maritalStatus: personal.maritalStatus && personal.maritalStatus !== 'N/A' ? personal.maritalStatus : 'N/A'
        }
      });
    }

    // 3. Cerrar vacante y rechazar demás si es solicitado
    if (closeVacancy) {
      await this.prisma.recruitmentProcess.update({
        where: { id: application.recruitmentProcessId },
        data: { 
          status: 'CLOSED', 
          closedAt: new Date(),
          closedReason: `Vacante cubierta exitosamente por ${application.candidate.firstName} ${application.candidate.lastName}`
        }
      });

      await this.prisma.jobApplication.updateMany({
        where: {
          recruitmentProcessId: application.recruitmentProcessId,
          id: { not: applicationId },
          status: { in: ['APPLIED', 'SHORTLISTED'] }
        },
        data: { status: 'REJECTED' }
      });
    }

    return { success: true };
  }


  async rejectCandidate(tenantId: string, applicationId: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, recruitmentProcess: { tenantId } }
    });
    if (!application) throw new NotFoundException('Aplicación no encontrada');

    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' }
    });

    return { success: true };
  }

  async restoreCandidate(tenantId: string, applicationId: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, recruitmentProcess: { tenantId } }
    });
    if (!application) throw new NotFoundException('Aplicación no encontrada');

    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'APPLIED' }
    });

    return { success: true };
  }

  async addInterview(tenantId: string, applicationId: string, data: any) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, recruitmentProcess: { tenantId } }
    });
    if (!application) throw new NotFoundException('Aplicación no encontrada');

    // Limpiar el caché del resumen holístico ya que ahora hay nueva información
    if (application.aiHolisticSummary) {
      await this.prisma.jobApplication.update({
        where: { id: applicationId },
        data: { aiHolisticSummary: Prisma.DbNull }
      });
    }

    const interview = await this.prisma.interview.create({
      data: {
        jobApplicationId: applicationId,
        type: data.type || 'HR',
        status: data.status || 'COMPLETED',
        rating: data.rating,
        feedback: data.feedback,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
        interviewerId: data.interviewerId || null
      }
    });

    return { success: true, interview };
  }
}
