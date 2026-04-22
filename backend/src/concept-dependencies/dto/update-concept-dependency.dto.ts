import { PartialType } from '@nestjs/mapped-types';
import { CreateConceptDependencyDto } from './create-concept-dependency.dto';

export class UpdateConceptDependencyDto extends PartialType(CreateConceptDependencyDto) {}
