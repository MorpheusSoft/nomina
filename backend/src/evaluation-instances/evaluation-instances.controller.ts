import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EvaluationInstancesService } from './evaluation-instances.service';

@Controller('evaluation-instances')
export class EvaluationInstancesController {
  constructor(private readonly evaluationInstancesService: EvaluationInstancesService) {}

  @Get('token/:token')
  getByToken(@Param('token') token: string) {
    return this.evaluationInstancesService.getByToken(token);
  }

  @Post('token/:token')
  submitAnswers(@Param('token') token: string, @Body() body: { answers: any[] }) {
    return this.evaluationInstancesService.submitAnswers(token, body.answers);
  }
}
