import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
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
}
