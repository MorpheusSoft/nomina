import { IsString, IsOptional, IsArray, IsUUID, MaxLength } from 'class-validator';

export class CreatePayrollAccumulatorDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  conceptIds?: string[];

  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  weeksBack?: number;

  @IsOptional()
  includeAllBonifiable?: boolean;
}
