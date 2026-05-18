import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EvaluationCampaignsService } from './evaluation-campaigns.service';
import { CreateEvaluationCampaignDto } from './dto/create-evaluation-campaign.dto';
import { UpdateEvaluationCampaignDto } from './dto/update-evaluation-campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('evaluation-campaigns')
@UseGuards(JwtAuthGuard)
export class EvaluationCampaignsController {
  constructor(private readonly evaluationCampaignsService: EvaluationCampaignsService) {}

  @Post()
  create(@Body() createEvaluationCampaignDto: CreateEvaluationCampaignDto, @CurrentUser() user: any) {
    return this.evaluationCampaignsService.create(user.tenantId, createEvaluationCampaignDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.evaluationCampaignsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluationCampaignsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvaluationCampaignDto: UpdateEvaluationCampaignDto, @CurrentUser() user: any) {
    return this.evaluationCampaignsService.update(id, user.tenantId, updateEvaluationCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluationCampaignsService.remove(id, user.tenantId);
  }

  @Patch(':id/reviews/:reviewId/close')
  closeReview(
    @Param('id') id: string, 
    @Param('reviewId') reviewId: string, 
    @Body() data: { interviewSummary: string, finalScore: number }, 
    @CurrentUser() user: any
  ) {
    return this.evaluationCampaignsService.closeReview(id, reviewId, user.tenantId, data);
  }

  @Get(':id/reviews/:reviewId')
  getReview(
    @Param('id') id: string, 
    @Param('reviewId') reviewId: string, 
    @CurrentUser() user: any
  ) {
    return this.evaluationCampaignsService.getReview(id, reviewId, user.tenantId);
  }
}
