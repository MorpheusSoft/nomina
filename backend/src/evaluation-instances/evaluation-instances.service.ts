import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OracleService } from '../oracle/oracle.service';

@Injectable()
export class EvaluationInstancesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly oracle: OracleService
  ) {}

  async getByToken(token: string) {
    const instance = await this.prisma.evaluationInstance.findUnique({
      where: { token },
      include: {
        performanceReview: {
          include: {
            evaluatee: true,
            supervisor: true,
            campaign: {
              include: {
                tenant: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!instance) throw new NotFoundException('Evaluación no encontrada o token inválido');
    
    // Si ya está completada, no devolver preguntas para responder
    if (instance.status === 'COMPLETED') {
      return { status: 'COMPLETED', instance };
    }

    // Traemos la plantilla
    const campaign = await this.prisma.evaluationCampaign.findUnique({
      where: { id: instance.performanceReview.campaignId },
      include: { tenant: { select: { name: true } } }
    });
    
    const performanceReview = await this.prisma.performanceReview.findUnique({
      where: { id: instance.performanceReviewId },
      include: {
         supervisor: true,
         evaluatee: {
            include: { employmentRecords: { where: { isActive: true }, include: { jobPosition: true } } }
         }
      }
    });
    
    const template = await this.prisma.evaluationTemplate.findUnique({
      where: { id: performanceReview!.templateId },
      include: { questions: true }
    });

    return {
       instance,
       campaign,
       performanceReview,
       template
    };
  }

  async submitAnswers(token: string, answers: any[]) {
     return this.prisma.$transaction(async (tx) => {
       const instance = await tx.evaluationInstance.findUnique({
         where: { token },
         include: { performanceReview: true }
       });
       if (!instance) throw new NotFoundException('Evaluación no encontrada');
       if (instance.status === 'COMPLETED') throw new BadRequestException('Esta evaluación ya fue completada.');

       // Save responses
       await tx.evaluationResponse.createMany({
         data: answers.map(a => ({
           instanceId: instance.id,
           questionId: a.questionId,
           answerValue: String(a.answerValue)
         }))
       });

       // Mark instance as completed
       await tx.evaluationInstance.update({
         where: { id: instance.id },
         data: { status: 'COMPLETED' }
       });

       // Check if both instances are completed
       const allInstances = await tx.evaluationInstance.findMany({
         where: { performanceReviewId: instance.performanceReviewId }
       });

       const allCompleted = allInstances.every(i => i.status === 'COMPLETED');
       if (allCompleted) {
         await tx.performanceReview.update({
           where: { id: instance.performanceReviewId },
           data: { status: 'PARTIAL' }
         });

         // Fetch data for Oracle
         const selfInstance = allInstances.find(i => i.evaluatorType === 'SELF');
         const supInstance = allInstances.find(i => i.evaluatorType === 'SUPERVISOR');
         
         const [selfResps, supResps] = await Promise.all([
           tx.evaluationResponse.findMany({ where: { instanceId: selfInstance?.id } }),
           tx.evaluationResponse.findMany({ where: { instanceId: supInstance?.id } })
         ]);

         const pr = await tx.performanceReview.findUnique({
           where: { id: instance.performanceReviewId },
           include: {
             evaluatee: {
               include: { employmentRecords: { where: { isActive: true }, include: { jobPosition: true } } }
             }
           }
         });

         const jobPositionName = pr?.evaluatee?.employmentRecords[0]?.jobPosition?.name || 'Cargo No Especificado';
         
         // Trigger Oracle asynchronously
         this.oracle.aiConsensusFeedback(pr!.tenantId, selfResps, supResps, jobPositionName)
           .then(async (feedbackJson) => {
             // Save consensus feedback
             await this.prisma.performanceReview.update({
               where: { id: pr!.id },
               data: { aiConsensusFeedback: feedbackJson }
             });
           })
           .catch(err => console.error("Error trigger AI Consensus:", err));
       }

       return { success: true, allCompleted };
     });
  }
}
