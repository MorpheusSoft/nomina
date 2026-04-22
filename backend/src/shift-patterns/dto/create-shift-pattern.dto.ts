import { IsString, IsNotEmpty, IsArray, ValidateNested, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ShiftPatternSequenceItemDto {
  @IsString()
  @IsIn(['WORK', 'REST'])
  type: string;

  @IsString()
  @IsOptional()
  start?: string;

  @IsString()
  @IsOptional()
  end?: string;

  @IsString()
  @IsOptional()
  sourceMatrixId?: string;

  @IsOptional()
  blockIndex?: number;
}

export class CreateShiftPatternDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftPatternSequenceItemDto)
  sequence: ShiftPatternSequenceItemDto[];
}
