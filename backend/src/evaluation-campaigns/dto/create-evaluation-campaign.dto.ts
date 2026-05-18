import { IsString, IsDateString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePerformanceReviewDto {
  @IsString()
  evaluateeId: string;

  @IsString()
  supervisorId: string;
}

export class CreateEvaluationCampaignDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetCostCenters?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetDepartments?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetJobPositions?: string[];

  @IsOptional()
  minSeniorityMonths?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePerformanceReviewDto)
  @IsOptional()
  reviews?: CreatePerformanceReviewDto[];
}
