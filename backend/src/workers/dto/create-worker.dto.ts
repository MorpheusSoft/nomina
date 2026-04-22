import { IsNotEmpty, IsString, IsUUID, IsDateString, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreateWorkerDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  primaryIdentityNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  gender: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nationality: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  maritalStatus: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(150)
  email?: string;
}
