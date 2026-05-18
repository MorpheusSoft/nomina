import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluationQuestionDto {
  @IsString()
  questionText: string;

  @IsString()
  @IsOptional()
  type?: string;
}

export class CreateEvaluationTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationQuestionDto)
  questions: EvaluationQuestionDto[];
}
