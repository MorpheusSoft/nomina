import { IsString, IsNumber, IsOptional, IsUUID, IsIn, IsDateString } from 'class-validator';

export class CreateWorkerFixedConceptDto {
  @IsUUID()
  employmentRecordId: string;

  @IsUUID()
  conceptId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsIn(['VES', 'USD'])
  currency: string;

  @IsDateString()
  validFrom: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;
}
