import { IsOptional, IsString, IsBoolean, IsInt, IsDateString } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsInt()
  maxActiveWorkers?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWorkerPortalAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  hasOracleAccess?: boolean;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  oraclePrompt?: string | null;

  @IsOptional()
  @IsString()
  contactPhone?: string | null;

  @IsOptional()
  @IsDateString()
  serviceEndDate?: string | null;
}
