import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('oracle')
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  @Post('generate-concept')
  async generateConcept(@Body() body: { prompt: string, context?: any, history?: any[] }, @CurrentUser() user: any) {
    if (!body.prompt || body.prompt.trim() === '') {
      throw new HttpException('El prompt natural es requerido.', HttpStatus.BAD_REQUEST);
    }
    return this.oracleService.generateConcept(user.tenantId, body.prompt, body.context, body.history);
  }


  @Post('generate-evaluation')
  async generateEvaluation(@Body() body: { jobPositionId?: string, focus: string, count: number }, @CurrentUser() user: any) {
    return this.oracleService.generateEvaluationForJob(user.tenantId, body.jobPositionId, body.focus, body.count);
  }

  @Post('ask-data')
  async askData(@Body() body: { prompt: string, history?: any[] }, @CurrentUser() user: any) {
    if (!user.permissions?.includes('ALL_ACCESS') && !user.permissions?.includes('USE_ORACLE')) {
       throw new ForbiddenException('No tienes el permiso corporativo (USE_ORACLE) para interrogar a la Inteligencia Artificial.');
    }
    
    if (!body.prompt || body.prompt.trim() === '') {
      throw new HttpException('El prompt natural es requerido.', HttpStatus.BAD_REQUEST);
    }
    
    const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
    return this.oracleService.askDataOracle(user.tenantId, body.prompt, canViewConfidential, body.history);
  }

  @Post('generate-evaluation')
  async generateEvaluationFromPosition(@Body() body: { jobPositionId: string, focus?: string, count?: number }, @CurrentUser() user: any) {
    if (!body.jobPositionId) throw new HttpException('Se requiere el jobPositionId', HttpStatus.BAD_REQUEST);
    return this.oracleService.generateEvaluationFromPosition(user.tenantId, body.jobPositionId, body.focus, body.count);
  }

  @Post('consensus-feedback')
  async aiConsensusFeedback(@Body() body: { selfAnswers: any[], supervisorAnswers: any[], jobPositionName: string }, @CurrentUser() user: any) {
    if (!body.selfAnswers || !body.supervisorAnswers || !body.jobPositionName) {
      throw new HttpException('Faltan datos de evaluación', HttpStatus.BAD_REQUEST);
    }
    return this.oracleService.aiConsensusFeedback(user.tenantId, body.selfAnswers, body.supervisorAnswers, body.jobPositionName);
  }
}

