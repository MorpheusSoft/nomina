import { IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateFamilyMemberDto {
  @IsUUID()
  @IsNotEmpty()
  workerId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  identityNumber?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  relationship: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;
}
