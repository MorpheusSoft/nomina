import { Module } from '@nestjs/common';
import { EvaluationCampaignsService } from './evaluation-campaigns.service';
import { EvaluationCampaignsController } from './evaluation-campaigns.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluationCampaignsController],
  providers: [EvaluationCampaignsService],
})
export class EvaluationCampaignsModule {}
