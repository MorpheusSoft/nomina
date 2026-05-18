import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationCampaignDto } from './create-evaluation-campaign.dto';

export class UpdateEvaluationCampaignDto extends PartialType(CreateEvaluationCampaignDto) {}
