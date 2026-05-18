import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CandidateExamsService } from './candidate-exams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('candidate-exams')
export class CandidateExamsController {
  constructor(private readonly service: CandidateExamsService) {}

  // PÚBLICO: Obtener examen para rendir
  @Get('take/:token')
  getExamByToken(@Param('token') token: string) {
    return this.service.getExamByToken(token);
  }

  // PÚBLICO: Iniciar examen
  @Post('take/:token/start')
  startExam(@Param('token') token: string) {
    return this.service.startExam(token);
  }

  // PÚBLICO: Enviar respuestas
  @Post('take/:token/submit')
  submitExam(@Param('token') token: string, @Body('answers') answers: any[]) {
    return this.service.submitExam(token, answers);
  }

  // PRIVADO (Analista HR): Generar link
  @UseGuards(JwtAuthGuard)
  @Post('generate-link')
  createExamLink(@Request() req: any, @Body() data: { jobApplicationId: string, examTemplateId: string }) {
    return this.service.createExamLink(req.user.tenantId, data.jobApplicationId, data.examTemplateId);
  }
}
