import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerFixedConceptDto } from './create-worker-fixed-concept.dto';

export class UpdateWorkerFixedConceptDto extends PartialType(CreateWorkerFixedConceptDto) {}
