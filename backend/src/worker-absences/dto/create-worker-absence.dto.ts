import { IsNotEmpty, IsUUID, IsDateString, IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateWorkerAbsenceDto {
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isJustified?: boolean;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}
