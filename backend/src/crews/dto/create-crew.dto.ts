import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateCrewDto {
  @IsString()
  name: string;

  @IsUUID()
  departmentId: string;

  @IsOptional()
  @IsUUID()
  shiftPatternId?: string;

  @IsOptional()
  @IsDateString()
  patternAnchor?: string;
}
