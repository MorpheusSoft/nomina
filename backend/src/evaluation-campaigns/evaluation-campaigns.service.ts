import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEvaluationCampaignDto } from './dto/create-evaluation-campaign.dto';
import { UpdateEvaluationCampaignDto } from './dto/update-evaluation-campaign.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EvaluationCampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createEvaluationCampaignDto: CreateEvaluationCampaignDto) {
    const { reviews, ...data } = createEvaluationCampaignDto;
    
    return this.prisma.$transaction(async (tx) => {
      const campaign = await tx.evaluationCampaign.create({
        data: {
          ...data,
          tenantId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: data.status || 'DRAFT'
        }
      });

      if (reviews && reviews.length > 0) {
        const evaluateeIds = reviews.map(r => r.evaluateeId);
        const employmentRecords = await tx.employmentRecord.findMany({
          where: {
            workerId: { in: evaluateeIds },
            isActive: true,
            tenantId
          },
          include: { jobPosition: true }
        });

        const prsToCreate = [];
        for (const r of reviews) {
          const record = employmentRecords.find(er => er.workerId === r.evaluateeId);
          if (!record || !record.jobPosition?.evaluationTemplateId) continue;

          prsToCreate.push({
            campaignId: campaign.id,
            tenantId,
            evaluateeId: r.evaluateeId,
            supervisorId: r.supervisorId,
            templateId: record.jobPosition.evaluationTemplateId,
            status: 'PENDING'
          });
        }

        if (prsToCreate.length > 0) {
          await tx.performanceReview.createMany({ data: prsToCreate });
        }
        
        // If created directly as ACTIVE, we must generate the instances right away
        if (campaign.status === 'ACTIVE') {
          const prs = await tx.performanceReview.findMany({ where: { campaignId: campaign.id } });
          const instancesToCreate = [];
          for (const pr of prs) {
            instancesToCreate.push({
              performanceReviewId: pr.id,
              evaluatorType: 'SELF',
              token: uuidv4()
            });
            instancesToCreate.push({
              performanceReviewId: pr.id,
              evaluatorType: 'SUPERVISOR',
              token: uuidv4()
            });
          }
          if (instancesToCreate.length > 0) {
            await tx.evaluationInstance.createMany({ data: instancesToCreate });
          }
        }
      }

      return campaign;
    });
  }

  findAll(tenantId: string) {
    return this.prisma.evaluationCampaign.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { performanceReviews: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const campaign = await this.prisma.evaluationCampaign.findUnique({
      where: { id, tenantId },
      include: {
        performanceReviews: {
          include: {
            evaluatee: true,
            supervisor: true,
            instances: true
          }
        }
      }
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(id: string, tenantId: string, updateEvaluationCampaignDto: UpdateEvaluationCampaignDto) {
    const { reviews, status, ...data } = updateEvaluationCampaignDto;
    
    return this.prisma.$transaction(async (tx) => {
      const campaign = await tx.evaluationCampaign.findUnique({ where: { id, tenantId } });
      if (!campaign) throw new NotFoundException('Campaign not found');

      if (campaign.status !== 'DRAFT' && status !== campaign.status) {
        // Can only transition from DRAFT to ACTIVE
      }

      const updated = await tx.evaluationCampaign.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          status: status
        }
      });

      if (reviews) {
        // Simple approach: delete existing drafts and recreate
        await tx.performanceReview.deleteMany({
          where: { campaignId: id, status: 'PENDING' }
        });
        
        const evaluateeIds = reviews.map(r => r.evaluateeId);
        const employmentRecords = await tx.employmentRecord.findMany({
          where: {
            workerId: { in: evaluateeIds },
            isActive: true,
            tenantId
          },
          include: { jobPosition: true }
        });

        const prsToCreate = [];
        for (const r of reviews) {
          const record = employmentRecords.find(er => er.workerId === r.evaluateeId);
          if (!record || !record.jobPosition?.evaluationTemplateId) continue;

          prsToCreate.push({
            campaignId: id,
            tenantId,
            evaluateeId: r.evaluateeId,
            supervisorId: r.supervisorId,
            templateId: record.jobPosition.evaluationTemplateId,
            status: 'PENDING'
          });
        }

        if (prsToCreate.length > 0) {
          await tx.performanceReview.createMany({ data: prsToCreate });
        }
      }

      // If transitioning to ACTIVE, generate tokens
      if (status === 'ACTIVE' && campaign.status === 'DRAFT') {
        const prs = await tx.performanceReview.findMany({ where: { campaignId: id } });
        const instancesToCreate = [];
        for (const pr of prs) {
          instancesToCreate.push({
            performanceReviewId: pr.id,
            evaluatorType: 'SELF',
            token: uuidv4()
          });
          instancesToCreate.push({
            performanceReviewId: pr.id,
            evaluatorType: 'SUPERVISOR',
            token: uuidv4()
          });
        }
        if (instancesToCreate.length > 0) {
          await tx.evaluationInstance.createMany({ data: instancesToCreate });
        }
      }

      return updated;
    });
  }

  async remove(id: string, tenantId: string) {
    const campaign = await this.prisma.evaluationCampaign.findUnique({
      where: { id, tenantId },
      include: {
        _count: {
          select: { performanceReviews: true }
        }
      }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === 'COMPLETED') {
      throw new BadRequestException('Cannot delete a completed campaign');
    }

    if (campaign._count.performanceReviews > 0) {
      throw new BadRequestException('Cannot delete a campaign with assigned participants');
    }

    return this.prisma.evaluationCampaign.delete({
      where: { id }
    });
  }

  async closeReview(campaignId: string, reviewId: string, tenantId: string, data: { interviewSummary: string, finalScore: number }) {
    return this.prisma.performanceReview.update({
      where: { id: reviewId, campaignId, tenantId },
      data: {
        status: 'COMPLETED',
        interviewSummary: data.interviewSummary,
        finalScore: data.finalScore
      }
    });
  }

  async getReview(campaignId: string, reviewId: string, tenantId: string) {
    return this.prisma.performanceReview.findUnique({
      where: { id: reviewId, campaignId, tenantId },
      include: {
        evaluatee: true,
        supervisor: true,
        campaign: true,
      }
    });
  }
}
