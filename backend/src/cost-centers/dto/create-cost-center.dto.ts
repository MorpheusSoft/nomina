import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCostCenterDto {
  @IsString()
  name: string;

  @IsString()
  accountingCode: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsUUID()
  workLocationId?: string;
}
