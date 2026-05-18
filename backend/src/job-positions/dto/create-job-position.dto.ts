import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateJobPositionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  externalCode?: string;

  @IsString()
  @IsOptional()
  evaluationTemplateId?: string;
}
