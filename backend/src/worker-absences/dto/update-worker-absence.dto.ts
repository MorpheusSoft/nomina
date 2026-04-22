import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerAbsenceDto } from './create-worker-absence.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkerAbsenceDto extends PartialType(CreateWorkerAbsenceDto) {
  @IsString()
  @IsOptional()
  status?: string;
}
