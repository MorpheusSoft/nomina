import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationInstanceDto } from './create-evaluation-instance.dto';

export class UpdateEvaluationInstanceDto extends PartialType(CreateEvaluationInstanceDto) {}
