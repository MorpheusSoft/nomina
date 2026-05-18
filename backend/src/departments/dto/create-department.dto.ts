import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsUUID()
  @IsOptional()
  costCenterId?: string;

  @IsUUID()
  @IsOptional()
  supervisorId?: string;

  @IsNumber()
  @IsOptional()
  monthlyBudget?: number;
}

