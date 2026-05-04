import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  taxId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  hasWorkerPortalAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  hasOracleAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  hasGeofencingAccess?: boolean;

  @IsString()
  @IsOptional()
  oraclePrompt?: string;
}
