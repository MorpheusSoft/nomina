import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  costCenterId?: string;

  @IsNumber()
  @IsOptional()
  monthlyBudget?: number;
}
