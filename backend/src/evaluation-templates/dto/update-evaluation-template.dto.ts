import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationTemplateDto } from './create-evaluation-template.dto';

export class UpdateEvaluationTemplateDto extends PartialType(CreateEvaluationTemplateDto) {}
